"""Tests for FinOps Cost Estimation Engine (Infracost / Azure Pricing)."""

import pytest
from src.schema.ir_models import CanonicalTopology, AzureResource
from src.finops.infracost_client import InfracostClient
from src.finops.pricing_fallback import AzurePricingFallback


def test_finops_resource_cost_calculations():
    # 1. Virtual Machine with Standard_B2s
    vm = AzureResource(
        id="vm1",
        type="azurerm_linux_virtual_machine",
        name="vm-app",
        properties={"size": "Standard_B2s"},
    )
    cost_vm = AzurePricingFallback.calculate_resource_cost(vm)
    assert cost_vm.monthly_cost_usd > 30.0
    assert "compute" in cost_vm.breakdown
    assert "os_disk" in cost_vm.breakdown

    # 2. Azure SQL Database S1
    sql_db = AzureResource(
        id="db1",
        type="azurerm_mssql_database",
        name="db-prod",
        properties={"sku_name": "S1"},
    )
    cost_db = AzurePricingFallback.calculate_resource_cost(sql_db)
    assert cost_db.monthly_cost_usd == 29.43

    # 3. AKS Cluster with 3 nodes
    aks = AzureResource(
        id="aks1",
        type="azurerm_kubernetes_cluster",
        name="aks-cluster",
        properties={
            "default_node_pool": {"node_count": 3, "vm_size": "Standard_D2s_v3"}
        },
    )
    cost_aks = AzurePricingFallback.calculate_resource_cost(aks)
    assert cost_aks.monthly_cost_usd > 250.0


def test_finops_topology_total_and_summary():
    topology = CanonicalTopology(
        resources=[
            AzureResource(
                id="vm1",
                type="azurerm_linux_virtual_machine",
                name="vm-worker",
                properties={"size": "Standard_B2s"},
            ),
            AzureResource(
                id="db1",
                type="azurerm_mssql_database",
                name="db-main",
                properties={"sku_name": "S1"},
            ),
            AzureResource(
                id="st1",
                type="azurerm_storage_account",
                name="stblob",
            ),
        ]
    )

    infracost = InfracostClient()
    annotated = infracost.estimate_topology_costs(topology)
    summary = infracost.get_summary_finops(annotated)

    assert summary["totalMonthlyCostUsd"] > 60.0
    assert summary["totalHourlyCostUsd"] > 0.0
    assert len(summary["topSpenders"]) >= 2
    assert "Linux" in summary["costByCategory"] or "Mssql" in summary["costByCategory"]
