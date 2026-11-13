"""Tests for Terraform HCL Code Generator Emitter."""

import pytest
from src.schema.ir_models import (
    CanonicalTopology,
    AzureResource,
    ContainerLevel,
    TopologyMetadata,
)
from src.codegen.emitter import TerraformEmitter


def test_emitter_generates_valid_structure():
    topology = CanonicalTopology(
        metadata=TopologyMetadata(project_name="Test Enterprise Architecture"),
        resources=[
            AzureResource(
                id="rg_main",
                type="azurerm_resource_group",
                name="rg-enterprise-prod",
                location="eastus2",
                container_level=ContainerLevel.RESOURCE_GROUP,
            ),
            AzureResource(
                id="vnet_main",
                type="azurerm_virtual_network",
                name="vnet-core",
                location="eastus2",
                parent_id="rg_main",
                container_level=ContainerLevel.VIRTUAL_NETWORK,
                properties={"address_space": ["10.0.0.0/16"]},
            ),
            AzureResource(
                id="sub_app",
                type="azurerm_subnet",
                name="snet-app",
                parent_id="vnet_main",
                container_level=ContainerLevel.SUBNET,
                properties={"address_prefixes": ["10.0.1.0/24"]},
            ),
            AzureResource(
                id="st_logs",
                type="azurerm_storage_account",
                name="stenterpriselogs",
                parent_id="rg_main",
                properties={"account_tier": "Standard", "account_replication_type": "GRS"},
            ),
        ],
    )

    emitter = TerraformEmitter(topology)
    all_files = emitter.generate_all()

    assert "main.tf" in all_files
    assert "variables.tf" in all_files
    assert "outputs.tf" in all_files

    main_tf = all_files["main.tf"]
    assert 'resource "azurerm_resource_group" "rg_enterprise_prod"' in main_tf
    assert 'resource "azurerm_virtual_network" "vnet_core"' in main_tf
    assert 'resource "azurerm_subnet" "snet_app"' in main_tf
    assert 'resource "azurerm_storage_account" "stenterpriselogs"' in main_tf
    assert "required_providers" in main_tf


def test_emitter_generates_firewall_redis_and_acr():
    topology = CanonicalTopology(
        metadata=TopologyMetadata(project_name="Test Enterprise Security"),
        resources=[
            AzureResource(
                id="rg_sec",
                type="azurerm_resource_group",
                name="rg-security",
                location="eastus",
                container_level=ContainerLevel.RESOURCE_GROUP,
            ),
            AzureResource(
                id="vnet_sec",
                type="azurerm_virtual_network",
                name="vnet-security",
                location="eastus",
                parent_id="rg_sec",
                container_level=ContainerLevel.VIRTUAL_NETWORK,
                properties={"address_space": ["10.0.0.0/16"]},
            ),
            AzureResource(
                id="sub_fw",
                type="azurerm_subnet",
                name="AzureFirewallSubnet",
                parent_id="vnet_sec",
                container_level=ContainerLevel.SUBNET,
                properties={"address_prefixes": ["10.0.1.0/24"]},
            ),
            AzureResource(
                id="fw_main",
                type="azurerm_firewall",
                name="afw-hub",
                parent_id="sub_fw",
                properties={"sku_name": "AZFW_VNet", "sku_tier": "Standard"},
            ),
            AzureResource(
                id="redis_cache",
                type="azurerm_redis_cache",
                name="redis-cache-prod",
                parent_id="rg_sec",
                properties={"sku_name": "Standard", "capacity": 1},
            ),
            AzureResource(
                id="acr_main",
                type="azurerm_container_registry",
                name="acrhubprod",
                parent_id="rg_sec",
                properties={"sku": "Premium", "admin_enabled": False},
            ),
        ],
    )

    emitter = TerraformEmitter(topology)
    all_files = emitter.generate_all()
    main_tf = all_files["main.tf"]

    assert 'resource "azurerm_firewall" "afw_hub"' in main_tf
    assert 'resource "azurerm_public_ip" "afw_hub_pip"' in main_tf
    assert 'resource "azurerm_redis_cache" "redis_cache_prod"' in main_tf
    assert 'resource "azurerm_container_registry" "acrhubprod"' in main_tf


def test_azure_catalog_contains_rich_resources():
    from src.schema.azure_catalog import AZURE_CATALOG, get_catalog_list
    catalog_list = get_catalog_list()
    assert len(catalog_list) >= 40
    resource_types = [item["resourceType"] for item in catalog_list]
    assert "azurerm_firewall" in resource_types
    assert "azurerm_redis_cache" in resource_types
    assert "azurerm_container_registry" in resource_types
    assert "azurerm_bastion_host" in resource_types
    assert "azurerm_cognitive_account" in resource_types
    assert "azurerm_log_analytics_workspace" in resource_types

