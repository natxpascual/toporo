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
                vnet_name_raw = str(res.properties.get("virtual_network_name", ""))
                vnet_norm = re.sub(r"[^a-zA-Z0-9_]", "_", vnet_name_raw).lower()
                for vnet in vnet_resources:
                    vnet_clean = re.sub(r"[^a-zA-Z0-9_]", "_", vnet.name).lower()
                    vnet_id_clean = re.sub(r"[^a-zA-Z0-9_]", "_", vnet.id).lower()
                    vnet_instance = vnet_id_clean.replace("azurerm_virtual_network_", "")
                    if (
                        vnet.name in vnet_name_raw
                        or vnet.id in vnet_name_raw
                        or vnet_clean in vnet_norm
                        or vnet_id_clean in vnet_norm
                        or (vnet_instance and vnet_instance in vnet_norm)
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
                rg_name_raw = str(res.properties.get("resource_group_name", ""))
                rg_norm = re.sub(r"[^a-zA-Z0-9_]", "_", rg_name_raw).lower()
                for rg in rg_resources:
                    rg_clean = re.sub(r"[^a-zA-Z0-9_]", "_", rg.name).lower()
                    rg_id_clean = re.sub(r"[^a-zA-Z0-9_]", "_", rg.id).lower()
                    rg_instance = rg_id_clean.replace("azurerm_resource_group_", "")
                    if (
                        rg.name in rg_name_raw
                        or rg.id in rg_name_raw
                        or rg_clean in rg_norm
                        or rg_id_clean in rg_norm
                        or (rg_instance and rg_instance in rg_norm)
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
                props_clean = re.sub(r"[^a-zA-Z0-9_]", "_", props_str).lower()
                for sub in subnet_resources:
                    sub_clean = re.sub(r"[^a-zA-Z0-9_]", "_", sub.name).lower()
                    sub_id_clean = re.sub(r"[^a-zA-Z0-9_]", "_", sub.id).lower()
                    sub_instance = sub_id_clean.replace("azurerm_subnet_", "")
                    if (
                        sub.name in props_str
                        or sub.id in props_str
                        or sub_clean in props_clean
                        or (sub_instance and sub_instance in props_clean)
                    ):
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
                server_ref = str(res.properties.get("server_id", ""))
                server_norm = re.sub(r"[^a-zA-Z0-9_]", "_", server_ref).lower()
                for srv in extracted_resources:
                    if srv.type == "azurerm_mssql_server":
                        srv_clean = re.sub(r"[^a-zA-Z0-9_]", "_", srv.name).lower()
                        srv_id_clean = re.sub(r"[^a-zA-Z0-9_]", "_", srv.id).lower()
                        srv_instance = srv_id_clean.replace("azurerm_mssql_server_", "")
                        if (
                            srv.name in server_ref
                            or srv.id in server_ref
                            or srv_clean in server_norm
                            or (srv_instance and srv_instance in server_norm)
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
