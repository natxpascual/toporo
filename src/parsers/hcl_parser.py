"""Terraform HCL Parser for Azure Cloud Topology Engine."""

from __future__ import annotations
import re
from typing import Any, Dict, List, Optional
import hcl2
from src.schema.ir_models import (
    CanonicalTopology,
    AzureResource,
    TopologyEdge,
    TopologyMetadata,
    ContainerLevel,
    RelationType,
    NodePosition,
)
from src.schema.azure_catalog import AZURE_CATALOG


class HCLParser:
    """Ingests Terraform HCL (.tf) code and transforms it into Canonical IR."""

    @classmethod
    def parse_hcl_string(cls, hcl_code: str, project_name: str = "Imported Topology") -> CanonicalTopology:
        try:
            parsed_data = hcl2.loads(hcl_code)
        except Exception as e:
            # If standard hcl2 fails on complex interpolation, use resilient regex block extractor
            parsed_data = cls._resilient_hcl_parse(hcl_code)

        topology = CanonicalTopology(
            metadata=TopologyMetadata(project_name=project_name, target_cloud="Azure", iac_format="Terraform")
        )

        resources_dict = parsed_data.get("resource", [])
        extracted_resources: List[AzureResource] = []
        name_to_res: Dict[str, AzureResource] = {}
        type_name_to_id: Dict[str, str] = {}

        # First pass: Extract resources
        for item in resources_dict:
            for raw_res_type, instances in item.items():
                res_type = raw_res_type.strip('"').strip("'")
                if not isinstance(instances, dict):
                    continue
                for raw_instance_name, config in instances.items():
                    instance_name = raw_instance_name.strip('"').strip("'")
                    res_id = f"{res_type}_{instance_name}"
                    res_name = config.get("name", instance_name)
                    if isinstance(res_name, str):
                        res_name = res_name.strip('"').strip("'")
                    location = config.get("location", "eastus")
                    if isinstance(location, str):
                        location = location.strip('"').strip("'")
                    tags = config.get("tags", {})
                    if not isinstance(tags, dict):
                        tags = {}

                    # Determine container level
                    cat_entry = AZURE_CATALOG.get(res_type)
                    container_lvl = cat_entry.container_level if cat_entry else ContainerLevel.NONE

                    resource = AzureResource(
                        id=res_id,
                        type=res_type,
                        name=str(res_name),
                        location=str(location),
                        container_level=container_lvl,
                        properties=config,
                        tags={str(k): str(v) for k, v in tags.items()},
                    )
                    extracted_resources.append(resource)
                    name_to_res[res_id] = resource
                    type_name_to_id[f"{res_type}.{instance_name}"] = res_id
                    type_name_to_id[f"{res_type}.{instance_name}.id"] = res_id
                    type_name_to_id[f"{res_type}.{instance_name}.name"] = res_id

        # Second pass: Build parent-child relationships and topology edges
        edges: List[TopologyEdge] = []
        rg_resources = [r for r in extracted_resources if r.type == "azurerm_resource_group"]
        vnet_resources = [r for r in extracted_resources if r.type == "azurerm_virtual_network"]
        subnet_resources = [r for r in extracted_resources if r.type == "azurerm_subnet"]

        for res in extracted_resources:
            props_str = str(res.properties)

            # 1. Subnet -> VNet containment
            if res.type == "azurerm_subnet":
                vnet_name = res.properties.get("virtual_network_name", "")
                for vnet in vnet_resources:
                    if (
                        vnet.name in str(vnet_name)
                        or vnet.id in str(vnet_name)
                        or vnet.id.split("_", 1)[1] in str(vnet_name)
                    ):
                        res.parent_id = vnet.id
                        edges.append(
                            TopologyEdge(
                                id=f"edge_{vnet.id}_{res.id}",
                                source=vnet.id,
                                target=res.id,
                                relation_type=RelationType.CONTAINMENT,
                            )
                        )
                        break

            # 2. VNet / Resources -> Resource Group containment
            elif res.type != "azurerm_resource_group":
                rg_name = res.properties.get("resource_group_name", "")
                for rg in rg_resources:
                    if (
                        rg.name in str(rg_name)
                        or rg.id in str(rg_name)
                        or rg.id.split("_", 1)[1] in str(rg_name)
                    ):
                        if not res.parent_id:  # only assign if not already inside a subnet/vnet
                            res.parent_id = rg.id
                            edges.append(
                                TopologyEdge(
                                    id=f"edge_{rg.id}_{res.id}",
                                    source=rg.id,
                                    target=res.id,
                                    relation_type=RelationType.CONTAINMENT,
                                )
                            )
                        break

            # 3. NIC/VM -> Subnet association
            if res.type in ["azurerm_linux_virtual_machine", "azurerm_windows_virtual_machine"]:
                for sub in subnet_resources:
                    if sub.name in props_str or sub.id in props_str:
                        res.parent_id = sub.id
                        edges.append(
                            TopologyEdge(
                                id=f"edge_{sub.id}_{res.id}",
                                source=sub.id,
                                target=res.id,
                                relation_type=RelationType.SUBNET_ASSOCIATION,
                            )
                        )
                        break

            # 4. SQL Database -> SQL Server
            if res.type == "azurerm_mssql_database":
                server_ref = res.properties.get("server_id", "")
                for srv in extracted_resources:
                    if srv.type == "azurerm_mssql_server" and (
                        srv.name in str(server_ref) or srv.id in str(server_ref)
                    ):
                        res.parent_id = srv.id
                        edges.append(
                            TopologyEdge(
                                id=f"edge_{srv.id}_{res.id}",
                                source=srv.id,
                                target=res.id,
                                relation_type=RelationType.CONTAINMENT,
                            )
                        )
                        break

        # Calculate default grid layout positions
        for idx, res in enumerate(extracted_resources):
            row = idx // 3
            col = idx % 3
            res.position = NodePosition(x=col * 320.0 + 40.0, y=row * 240.0 + 40.0)

        topology.resources = extracted_resources
        topology.edges = edges
        return topology

    @classmethod
    def _resilient_hcl_parse(cls, hcl_code: str) -> Dict[str, Any]:
        """Regex-based fallback parser for HCL code."""
        resources: List[Dict[str, Any]] = []
        pattern = re.compile(r'resource\s+"([^"]+)"\s+"([^"]+)"\s*\{(.*?)\n\}', re.DOTALL)
        for match in pattern.finditer(hcl_code):
            res_type = match.group(1)
            instance_name = match.group(2)
            body = match.group(3)

            props: Dict[str, Any] = {}
            for line in body.splitlines():
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"')
                    props[k] = v

            resources.append({res_type: {instance_name: props}})
        return {"resource": resources}
