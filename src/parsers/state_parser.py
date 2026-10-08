"""Terraform State (.tfstate) & Plan (tfplan.json) Ingestion Parser."""

from __future__ import annotations
import json
from typing import Any, Dict, List, Optional
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
from src.graph.layout import TopologyAutoLayout


class TerraformStateParser:
    """Reconstructs Canonical Topology IR from terraform.tfstate or tfplan.json files."""

    @classmethod
    def parse_state_json(cls, state_json_str: str, project_name: str = "Imported State") -> CanonicalTopology:
        data = json.loads(state_json_str)
        topology = CanonicalTopology(
            metadata=TopologyMetadata(project_name=project_name, target_cloud="Azure", iac_format="Terraform")
        )

        resources: List[AzureResource] = []
        edges: List[TopologyEdge] = []

        # Handle standard tfstate (version 4)
        raw_resources = data.get("resources", [])
        for res_entry in raw_resources:
            res_type = res_entry.get("type", "")
            instances = res_entry.get("instances", [])
            for inst in instances:
                attributes = inst.get("attributes", {})
                res_name = attributes.get("name", res_entry.get("name", "unnamed"))
                res_id = f"{res_type}_{res_name}".replace("-", "_")
                location = attributes.get("location", "eastus")

                cat_entry = AZURE_CATALOG.get(res_type)
                container_lvl = cat_entry.container_level if cat_entry else ContainerLevel.NONE

                resource = AzureResource(
                    id=res_id,
                    type=res_type,
                    name=str(res_name),
                    location=str(location),
                    container_level=container_lvl,
                    properties=attributes,
                    tags=attributes.get("tags", {}) or {},
                )
                resources.append(resource)

        # Build containment hierarchy
        rg_list = [r for r in resources if r.type == "azurerm_resource_group"]
        vnet_list = [r for r in resources if r.type == "azurerm_virtual_network"]

        for res in resources:
            if res.type == "azurerm_subnet":
                vnet_name = res.properties.get("virtual_network_name", "")
                for vnet in vnet_list:
                    if vnet.name == vnet_name or vnet.name in str(vnet_name):
                        res.parent_id = vnet.id
                        edges.append(
                            TopologyEdge(
                                id=f"e_{vnet.id}_{res.id}",
                                source=vnet.id,
                                target=res.id,
                                relation_type=RelationType.CONTAINMENT,
                            )
                        )
                        break

            elif res.type != "azurerm_resource_group":
                rg_name = res.properties.get("resource_group_name", "")
                for rg in rg_list:
                    if rg.name == rg_name or rg.name in str(rg_name):
                        if not res.parent_id:
                            res.parent_id = rg.id
                            edges.append(
                                TopologyEdge(
                                    id=f"e_{rg.id}_{res.id}",
                                    source=rg.id,
                                    target=res.id,
                                    relation_type=RelationType.CONTAINMENT,
                                )
                            )
                        break

        topology.resources = resources
        topology.edges = edges
        return TopologyAutoLayout.apply_layout(topology)
