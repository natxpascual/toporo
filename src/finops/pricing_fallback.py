"""Azure Retail Prices API Client & Cost Model for Azure Cloud Topology Engine."""

from __future__ import annotations
import httpx
from typing import Any, Dict, Optional
from src.schema.ir_models import FinOpsCost, AzureResource


# Standard curated Azure US East retail rates ($/month, 730 hrs)
AZURE_RETAIL_PRICE_TABLE: Dict[str, Dict[str, float]] = {
    "azurerm_linux_virtual_machine": {
        "Standard_B1s": 7.59,
        "Standard_B2s": 30.37,
        "Standard_D2s_v3": 70.08,
        "Standard_D4s_v3": 140.16,
        "Standard_E2s_v3": 91.98,
        "default": 30.37,
    },
    "azurerm_windows_virtual_machine": {
        "Standard_B2s": 58.40,
        "Standard_D2s_v3": 137.24,
        "default": 137.24,
    },
    "azurerm_linux_web_app": {
        "F1": 0.0,
        "B1": 12.41,
        "P1v3": 80.30,
        "P2v3": 160.60,
        "default": 80.30,
    },
    "azurerm_linux_function_app": {
        "Y1": 0.0,  # Consumption tier (first 1M free)
        "EP1": 160.60,
        "default": 0.0,
    },
    "azurerm_kubernetes_cluster": {
        "cluster_management": 73.00,  # standard SLA
        "node_rate_Standard_D2s_v3": 70.08,
        "default": 283.24,  # management + 3 worker nodes
    },
    "azurerm_storage_account": {
        "Standard_LRS": 2.08,  # ~100GB hot blob base
        "Standard_GRS": 4.16,
        "Premium_LRS": 15.00,
        "default": 2.08,
    },
    "azurerm_mssql_server": {
        "default": 0.0,  # Logical server container
    },
    "azurerm_mssql_database": {
        "Basic": 4.99,
        "S0": 14.72,
        "S1": 29.43,
        "S2": 73.58,
        "GP_Gen5_2": 248.20,
        "default": 29.43,
    },
    "azurerm_cosmosdb_account": {
        "Standard": 24.00,  # 400 RU/s base
        "default": 24.00,
    },
    "azurerm_key_vault": {
        "standard": 0.03,  # per 10k operations
        "premium": 3.00,
        "default": 0.03,
    },
    "azurerm_application_gateway": {
        "WAF_v2": 248.20,  # Base gateway + 2 capacity units
        "Standard_v2": 175.20,
        "default": 248.20,
    },
    "azurerm_firewall": {
        "AZFW_VNet": 912.50,
        "default": 912.50,
    },
    "azurerm_redis_cache": {
        "Basic": 16.06,
        "Standard": 54.75,
        "Premium": 204.40,
        "default": 54.75,
    },
    "azurerm_container_registry": {
        "Basic": 5.00,
        "Standard": 20.00,
        "Premium": 50.00,
        "default": 50.00,
    },
    "azurerm_bastion_host": {
        "Basic": 138.70,
        "Standard": 211.70,
        "default": 211.70,
    },
    "azurerm_nat_gateway": {
        "default": 32.85,
    },
    "azurerm_public_ip": {
        "default": 3.65,
    },
    "azurerm_postgresql_flexible_server": {
        "B_Standard_B1ms": 14.60,
        "B_Standard_B2s": 29.20,
        "default": 29.20,
    },
    "azurerm_mysql_flexible_server": {
        "B_Standard_B1ms": 14.60,
        "B_Standard_B2s": 29.20,
        "default": 29.20,
    },
    "azurerm_log_analytics_workspace": {
        "default": 6.90,
    },
    "azurerm_application_insights": {
        "default": 5.00,
    },
    "azurerm_cognitive_account": {
        "S0": 20.00,
        "default": 20.00,
    },
    "azurerm_servicebus_namespace": {
        "Basic": 0.05,
        "Standard": 10.00,
        "Premium": 677.00,
        "default": 10.00,
    },
    "azurerm_eventhub_namespace": {
        "Basic": 11.00,
        "Standard": 22.00,
        "default": 22.00,
    },
    "azurerm_api_management": {
        "Developer_1": 48.00,
        "Standard_1": 680.00,
        "default": 48.00,
    },
    "azurerm_resource_group": {"default": 0.0},
    "azurerm_virtual_network": {"default": 0.0},
    "azurerm_subnet": {"default": 0.0},
    "azurerm_network_security_group": {"default": 0.0},
    "azurerm_route_table": {"default": 0.0},
    "azurerm_private_dns_zone": {"default": 0.50},
    "azurerm_dns_zone": {"default": 0.50},
    "azurerm_private_endpoint": {"default": 7.30},
}


class AzurePricingFallback:
    """Calculates granular monthly & hourly costs for Azure resources."""

    @classmethod
    def calculate_resource_cost(cls, res: AzureResource) -> FinOpsCost:
        res_type = res.type
        props = res.properties or {}
        rates = AZURE_RETAIL_PRICE_TABLE.get(res_type, {"default": 0.0})

        monthly = 0.0
        breakdown: Dict[str, float] = {}

        if res_type == "azurerm_linux_virtual_machine":
            sku = props.get("size", "Standard_B2s")
            vm_cost = rates.get(sku, rates["default"])
            disk_cost = 4.80  # Managed OS disk
            monthly = vm_cost + disk_cost
            breakdown["compute"] = vm_cost
            breakdown["os_disk"] = disk_cost

        elif res_type == "azurerm_windows_virtual_machine":
            sku = props.get("size", "Standard_D2s_v3")
            vm_cost = rates.get(sku, rates["default"])
            disk_cost = 4.80
            monthly = vm_cost + disk_cost
            breakdown["compute"] = vm_cost
            breakdown["os_disk"] = disk_cost

        elif res_type == "azurerm_kubernetes_cluster":
            node_pool = props.get("default_node_pool", {})
            node_count = int(node_pool.get("node_count", 3))
            vm_size = node_pool.get("vm_size", "Standard_D2s_v3")
            per_node = AZURE_RETAIL_PRICE_TABLE["azurerm_linux_virtual_machine"].get(vm_size, 70.08)
            mgmt = 73.00
            nodes_total = per_node * node_count
            monthly = mgmt + nodes_total
            breakdown["control_plane"] = mgmt
            breakdown[f"nodes_{node_count}x"] = nodes_total

        elif res_type == "azurerm_mssql_database":
            sku = props.get("sku_name", "S1")
            monthly = rates.get(sku, rates["default"])
            breakdown["database_dtu"] = monthly

        elif res_type == "azurerm_linux_web_app":
            sku = props.get("service_plan_sku", "P1v3")
            monthly = rates.get(sku, rates["default"])
            breakdown["app_service_plan"] = monthly

        else:
            monthly = rates.get("default", 0.0)
            if monthly > 0:
                breakdown["base_rate"] = monthly

        hourly = round(monthly / 730.0, 4)
        return FinOpsCost(
            monthly_cost_usd=round(monthly, 2),
            hourly_cost_usd=hourly,
            currency="USD",
            breakdown=breakdown,
        )
