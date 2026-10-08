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
