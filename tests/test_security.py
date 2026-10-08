"""Tests for Policy-as-Code (Checkov) & Blast Radius Analyzer."""

import pytest
from src.schema.ir_models import (
    CanonicalTopology,
    AzureResource,
    TopologyEdge,
    RelationType,
    ContainerLevel,
)
from src.security.checkov_runner import CheckovPolicyEngine
from src.security.blast_radius import BlastRadiusAnalyzer


def test_checkov_scans_insecure_storage_and_sql():
    # Construct topology with deliberate security misconfigurations
    topology = CanonicalTopology(
        resources=[
            AzureResource(
                id="st_insecure",
                type="azurerm_storage_account",
                name="stinsecure123",
                properties={
                    "enable_https_traffic_only": False,  # Violation: CKV_AZURE_35
                    "min_tls_version": "TLS1_0",         # Violation: CKV_AZURE_44
                    "allow_nested_items_to_be_public": True, # Violation: CKV_AZURE_59
                },
            ),
            AzureResource(
                id="sql_insecure",
                type="azurerm_mssql_server",
                name="sqlinsecure123",
                properties={
                    "public_network_access_enabled": True,  # Violation: CKV_AZURE_24 (CRITICAL)
                },
            ),
            AzureResource(
                id="kv_secure",
                type="azurerm_key_vault",
                name="kvsecure123",
                properties={
                    "purge_protection_enabled": True,
                    "enable_rbac_authorization": True,
                },
            ),
        ]
    )

    scanned = CheckovPolicyEngine.scan_topology(topology)

    st_findings = scanned.get_resource_by_id("st_insecure").security_findings
    sql_findings = scanned.get_resource_by_id("sql_insecure").security_findings
    kv_findings = scanned.get_resource_by_id("kv_secure").security_findings

    assert len(st_findings) == 3
    assert any(f.rule_id == "CKV_AZURE_35" for f in st_findings)
    assert any(f.rule_id == "CKV_AZURE_44" for f in st_findings)
    assert any(f.rule_id == "CKV_AZURE_59" for f in st_findings)

    assert len(sql_findings) == 1
    assert sql_findings[0].rule_id == "CKV_AZURE_24"
    assert sql_findings[0].severity == "CRITICAL"

    assert len(kv_findings) == 0

    # Test summary metrics
    summary = CheckovPolicyEngine.get_summary_metrics(scanned)
    assert summary["critical"] == 1
    assert summary["high"] == 2
    assert summary["totalViolations"] == 4


def test_blast_radius_impact_analysis():
    topology = CanonicalTopology(
        resources=[
            AzureResource(
                id="sql_vuln",
                type="azurerm_mssql_server",
                name="sql-exposed",
                properties={"public_network_access_enabled": True},
            ),
            AzureResource(
                id="app_web",
                type="azurerm_linux_web_app",
                name="app-frontend",
            ),
            AzureResource(
                id="st_data",
                type="azurerm_storage_account",
                name="stbackend",
            ),
        ],
        edges=[
            TopologyEdge(id="e1", source="app_web", target="sql_vuln", relation_type=RelationType.DEPENDENCY),
            TopologyEdge(id="e2", source="app_web", target="st_data", relation_type=RelationType.DEPENDENCY),
        ],
    )

    scanned = CheckovPolicyEngine.scan_topology(topology)
    blast = BlastRadiusAnalyzer.calculate_blast_radius(scanned)

    assert "sql_vuln" in blast
    assert blast["sql_vuln"]["riskLevel"] in ["HIGH", "CRITICAL"]
    assert blast["sql_vuln"]["impactedNodeCount"] >= 1
