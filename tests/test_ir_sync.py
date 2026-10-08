"""Roundtrip Lossless Sync Tests: Canonical IR -> HCL -> Canonical IR."""

import pytest
from src.schema.ir_models import (
    CanonicalTopology,
    AzureResource,
    ContainerLevel,
    TopologyMetadata,
)
from src.codegen.emitter import TerraformEmitter
from src.parsers.hcl_parser import HCLParser


def test_roundtrip_sync_rg_vnet_subnet():
    # 1. Create original IR
    original_ir = CanonicalTopology(
        metadata=TopologyMetadata(project_name="Roundtrip Test"),
        resources=[
            AzureResource(
                id="rg_test",
                type="azurerm_resource_group",
                name="rg_roundtrip",
                location="eastus",
                container_level=ContainerLevel.RESOURCE_GROUP,
            ),
            AzureResource(
                id="vnet_test",
                type="azurerm_virtual_network",
                name="vnet_roundtrip",
                location="eastus",
                parent_id="rg_test",
                container_level=ContainerLevel.VIRTUAL_NETWORK,
                properties={"address_space": ["10.10.0.0/16"]},
            ),
            AzureResource(
                id="subnet_test",
                type="azurerm_subnet",
                name="snet_roundtrip",
                parent_id="vnet_test",
                container_level=ContainerLevel.SUBNET,
                properties={"address_prefixes": ["10.10.1.0/24"]},
            ),
            AzureResource(
                id="kv_test",
                type="azurerm_key_vault",
                name="kvroundtrip",
                parent_id="rg_test",
                properties={"sku_name": "standard"},
            ),
        ],
    )

    # 2. Emit HCL
    emitter = TerraformEmitter(original_ir)
    generated_hcl = emitter.generate_main_tf()

    # 3. Parse HCL back to Canonical IR
    parsed_ir = HCLParser.parse_hcl_string(generated_hcl)

    # 4. Assert all resources are present and mapped
    parsed_types = {r.type for r in parsed_ir.resources}
    assert "azurerm_resource_group" in parsed_types
    assert "azurerm_virtual_network" in parsed_types
    assert "azurerm_subnet" in parsed_types
    assert "azurerm_key_vault" in parsed_types

    # Assert parent-child containment was reconstructed
    subnets = [r for r in parsed_ir.resources if r.type == "azurerm_subnet"]
    vnets = [r for r in parsed_ir.resources if r.type == "azurerm_virtual_network"]
    assert len(subnets) == 1
    assert len(vnets) == 1
    assert subnets[0].parent_id == vnets[0].id
