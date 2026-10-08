"""Checkov Policy-as-Code Engine for Azure Cloud Topology Engine."""

from __future__ import annotations
import json
import shutil
import subprocess
import tempfile
from typing import Any, Dict, List, Optional
from src.schema.ir_models import CanonicalTopology, AzureResource, SecurityFinding


# Built-in Azure CIS Benchmark policy registry for sub-millisecond local evaluation
BUILTIN_CIS_POLICIES = [
    {
        "id": "CKV_AZURE_35",
        "name": "Ensure Storage Account enables HTTPS-only traffic",
        "resource_types": ["azurerm_storage_account"],
        "severity": "HIGH",
        "check": lambda p: p.get("enable_https_traffic_only") is True,
        "description": "Storage accounts should enforce secure HTTPS transmission to protect sensitive data in transit.",
        "fix_suggestion": "Set enable_https_traffic_only = true in storage account properties.",
        "remediation_patch": {"enable_https_traffic_only": True},
    },
    {
        "id": "CKV_AZURE_44",
        "name": "Ensure Storage Account uses minimum TLS version 1.2",
        "resource_types": ["azurerm_storage_account"],
        "severity": "MEDIUM",
        "check": lambda p: p.get("min_tls_version") in ["TLS1_2", "1.2"],
        "description": "TLS 1.0 and 1.1 have known cryptographic vulnerabilities. Azure CIS recommends TLS 1.2+.",
        "fix_suggestion": 'Set min_tls_version = "TLS1_2".',
        "remediation_patch": {"min_tls_version": "TLS1_2"},
    },
    {
        "id": "CKV_AZURE_59",
        "name": "Ensure Storage Account disallows public nested item access",
        "resource_types": ["azurerm_storage_account"],
        "severity": "HIGH",
        "check": lambda p: p.get("allow_nested_items_to_be_public") is False,
        "description": "Preventing anonymous or public blob access mitigates data leakage risks.",
        "fix_suggestion": "Set allow_nested_items_to_be_public = false.",
        "remediation_patch": {"allow_nested_items_to_be_public": False},
    },
    {
        "id": "CKV_AZURE_109",
        "name": "Ensure Key Vault purge protection is enabled",
        "resource_types": ["azurerm_key_vault"],
        "severity": "HIGH",
        "check": lambda p: p.get("purge_protection_enabled") is True,
        "description": "Purge protection prevents malicious or accidental permanent destruction of Key Vault secrets.",
        "fix_suggestion": "Set purge_protection_enabled = true.",
        "remediation_patch": {"purge_protection_enabled": True},
    },
    {
        "id": "CKV_AZURE_110",
        "name": "Ensure Key Vault RBAC authorization is enabled",
        "resource_types": ["azurerm_key_vault"],
        "severity": "MEDIUM",
        "check": lambda p: p.get("enable_rbac_authorization") is True,
        "description": "Azure RBAC provides granular role-based identity management over Key Vault access.",
        "fix_suggestion": "Set enable_rbac_authorization = true.",
        "remediation_patch": {"enable_rbac_authorization": True},
    },
    {
        "id": "CKV_AZURE_17",
        "name": "Ensure App Service disables insecure HTTP and forces HTTPS redirection",
        "resource_types": ["azurerm_linux_web_app", "azurerm_windows_web_app"],
        "severity": "HIGH",
        "check": lambda p: p.get("https_only") is True,
        "description": "Enforcing HTTPS redirection ensures encrypted traffic communication for end-users.",
        "fix_suggestion": "Set https_only = true in Web App configuration.",
        "remediation_patch": {"https_only": True},
    },
    {
        "id": "CKV_AZURE_24",
        "name": "Ensure SQL Server disables public network access",
        "resource_types": ["azurerm_mssql_server"],
        "severity": "CRITICAL",
        "check": lambda p: p.get("public_network_access_enabled") is False,
        "description": "Disabling public internet ingress on Azure SQL protects databases from external brute-force attacks.",
        "fix_suggestion": "Set public_network_access_enabled = false and configure Private Endpoints.",
        "remediation_patch": {"public_network_access_enabled": False},
    },
]


class CheckovPolicyEngine:
    """Evaluates security guardrails and Azure CIS benchmarks on topology and HCL."""

    @classmethod
    def scan_topology(cls, topology: CanonicalTopology) -> CanonicalTopology:
        """Scan each resource against policy rules and annotate with SecurityFindings."""
        for res in topology.resources:
            findings: List[SecurityFinding] = []
            props = res.properties or {}

            for rule in BUILTIN_CIS_POLICIES:
                if res.type in rule["resource_types"]:
                    passed = False
                    try:
                        passed = rule["check"](props)
                    except Exception:
                        passed = False

                    if not passed:
                        findings.append(
                            SecurityFinding(
                                rule_id=rule["id"],
                                rule_name=rule["name"],
                                severity=rule["severity"],
                                description=rule["description"],
                                fix_suggestion=rule["fix_suggestion"],
                                applied_fix=False,
                            )
                        )

            res.security_findings = findings

        return topology

    @classmethod
    def get_summary_metrics(cls, topology: CanonicalTopology) -> Dict[str, Any]:
        """Aggregate security risk score and counts."""
        critical = 0
        high = 0
        medium = 0
        low = 0
        total_violations = 0

        for res in topology.resources:
            for f in res.security_findings:
                total_violations += 1
                if f.severity == "CRITICAL":
                    critical += 1
                elif f.severity == "HIGH":
                    high += 1
                elif f.severity == "MEDIUM":
                    medium += 1
                else:
                    low += 1

        # Health score: 100 max, deducted by severity
        score = max(0, 100 - (critical * 25 + high * 15 + medium * 5 + low * 2))
        grade = "A" if score >= 90 else ("B" if score >= 75 else ("C" if score >= 60 else "F"))

        return {
            "score": score,
            "grade": grade,
            "totalViolations": total_violations,
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        }
