"""Azure Resource Graph (ARG) Importer for Azure Cloud Topology Engine."""

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
)
from src.graph.layout import TopologyAutoLayout

# Mapping from Azure ARM resource types to Terraform azurerm resource types
ARM_TO_AZURERM_TYPE_MAP = {
    "microsoft.resources/resourcegroups": "azurerm_resource_group",
    "microsoft.network/virtualnetworks": "azurerm_virtual_network",
    "microsoft.network/virtualnetworks/subnets": "azurerm_subnet",
    "microsoft.compute/virtualmachines": "azurerm_linux_virtual_machine",
    "microsoft.web/sites": "azurerm_linux_web_app",
    "microsoft.storage/storageaccounts": "azurerm_storage_account",
    "microsoft.sql/servers": "azurerm_mssql_server",
    "microsoft.sql/servers/databases": "azurerm_mssql_database",
    "microsoft.keyvault/vaults": "azurerm_key_vault",
    "microsoft.containerservice/managedclusters": "azurerm_kubernetes_cluster",
}


class AzureResourceGraphImporter:
    """Imports running Azure subscriptions from Azure Resource Graph query results."""

    @classmethod
    def import_arg_query_results(
        cls, query_results_json: str, subscription_id: str = "Live Azure Subscription"
    ) -> CanonicalTopology:
        data = json.loads(query_results_json)
        raw_items = data if isinstance(data, list) else data.get("data", [])

        topology = CanonicalTopology(
            metadata=TopologyMetadata(
                project_name=f"ARG Import: {subscription_id}", target_cloud="Azure", iac_format="Terraform"
            )
        )

        resources: List[AzureResource] = []
        edges: List[TopologyEdge] = []

        for item in raw_items:
            arm_type = item.get("type", "").lower()
            tf_type = ARM_TO_AZURERM_TYPE_MAP.get(arm_type, f"azurerm_{arm_type.replace('/', '_')}")
            name = item.get("name", "unnamed")
            res_id = f"{tf_type}_{name}".replace("-", "_")
            location = item.get("location", "eastus")
            rg_name = item.get("resourceGroup", "")

            container_lvl = (
                ContainerLevel.RESOURCE_GROUP
                if tf_type == "azurerm_resource_group"
                else (
                    ContainerLevel.VIRTUAL_NETWORK
                    if tf_type == "azurerm_virtual_network"
                    else (ContainerLevel.SUBNET if tf_type == "azurerm_subnet" else ContainerLevel.NONE)
                )
            )

            resource = AzureResource(
                id=res_id,
                type=tf_type,
                name=name,
                location=location,
                container_level=container_lvl,
                properties=item.get("properties", {}) or {},
                tags=item.get("tags", {}) or {},
            )
            resources.append(resource)

        topology.resources = resources
        topology.edges = edges
        return TopologyAutoLayout.apply_layout(topology)
