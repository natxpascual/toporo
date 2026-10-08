"""Tests for State Parser, ARG Importer, Copilot Prompt Engine & Remediation."""

import json
import pytest
from src.parsers.state_parser import TerraformStateParser
from src.parsers.azure_importer import AzureResourceGraphImporter
from src.copilot.prompt_engine import ArchitectureCopilot
from src.copilot.remediator import SecurityRemediator
from src.security.checkov_runner import CheckovPolicyEngine
from src.schema.ir_models import CanonicalTopology, AzureResource


def test_terraform_state_parser():
    with open("samples/sample_tfstate.json", "r") as f:
        state_str = f.read()

    topology = TerraformStateParser.parse_state_json(state_str, "Test State Project")

    assert len(topology.resources) == 3
    types = {r.type for r in topology.resources}
    assert "azurerm_resource_group" in types
    assert "azurerm_virtual_network" in types
    assert "azurerm_subnet" in types

    # Verify subnet parent is VNet
    vnet = next(r for r in topology.resources if r.type == "azurerm_virtual_network")
    subnet = next(r for r in topology.resources if r.type == "azurerm_subnet")
    assert subnet.parent_id == vnet.id


def test_azure_resource_graph_importer():
    arg_sample = json.dumps([
        {
            "id": "/subscriptions/sub-1/resourceGroups/rg-live/providers/Microsoft.Compute/virtualMachines/vm-live",
            "name": "vm-live",
            "type": "microsoft.compute/virtualmachines",
            "location": "eastus",
            "resourceGroup": "rg-live",
            "properties": {"hardwareProfile": {"vmSize": "Standard_B2s"}},
        },
        {
            "id": "/subscriptions/sub-1/resourceGroups/rg-live/providers/Microsoft.Storage/storageAccounts/stlive",
            "name": "stlive",
            "type": "microsoft.storage/storageaccounts",
            "location": "eastus",
            "resourceGroup": "rg-live",
            "properties": {"accountType": "Standard_LRS"},
        },
    ])

    topology = AzureResourceGraphImporter.import_arg_query_results(arg_sample)
    assert len(topology.resources) == 2
    types = {r.type for r in topology.resources}
    assert "azurerm_linux_virtual_machine" in types
    assert "azurerm_storage_account" in types


def test_copilot_prompt_synthesis():
    prompt = "Create a 3-tier web app with Azure App Service, Azure SQL Server, and Key Vault"
    topology = ArchitectureCopilot.generate_topology_from_prompt(prompt)

    assert len(topology.resources) >= 4
    types = {r.type for r in topology.resources}
    assert "azurerm_resource_group" in types
    assert "azurerm_virtual_network" in types
    assert "azurerm_linux_web_app" in types
    assert "azurerm_mssql_server" in types
    assert "azurerm_key_vault" in types


def test_security_remediation():
    # Insecure storage account with HTTP and TLS 1.0
    topology = CanonicalTopology(
        resources=[
            AzureResource(
                id="st_test",
                type="azurerm_storage_account",
                name="sttest",
                properties={
                    "enable_https_traffic_only": False,
                    "min_tls_version": "TLS1_0",
                },
            )
        ]
    )

    scanned = CheckovPolicyEngine.scan_topology(topology)
    assert len(scanned.resources[0].security_findings) >= 2

    # Remediate CKV_AZURE_35 (HTTPS)
    remediated = SecurityRemediator.remediate_finding(scanned, "st_test", "CKV_AZURE_35")
    assert remediated.resources[0].properties["enable_https_traffic_only"] is True

    # Remediate CKV_AZURE_44 (TLS 1.2)
    remediated = SecurityRemediator.remediate_finding(remediated, "st_test", "CKV_AZURE_44")
    assert remediated.resources[0].properties["min_tls_version"] == "TLS1_2"

    # Re-scan to verify findings are cleared
    rescanned = CheckovPolicyEngine.scan_topology(remediated)
    st_findings = rescanned.resources[0].security_findings
    assert not any(f.rule_id == "CKV_AZURE_35" for f in st_findings)
    assert not any(f.rule_id == "CKV_AZURE_44" for f in st_findings)
