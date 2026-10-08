"""1-Click Security Remediation Engine for Azure Cloud Topology Engine."""

from typing import Any, Dict
from src.schema.ir_models import CanonicalTopology, AzureResource
from src.security.checkov_runner import BUILTIN_CIS_POLICIES


class SecurityRemediator:
    """Applies automatic remediation patches to resolve Checkov security violations."""

    @classmethod
    def remediate_finding(cls, topology: CanonicalTopology, resource_id: str, rule_id: str) -> CanonicalTopology:
        res = topology.get_resource_by_id(resource_id)
        if not res:
            return topology

        matching_rule = next((r for r in BUILTIN_CIS_POLICIES if r["id"] == rule_id), None)
        if not matching_rule:
            return topology

        patch = matching_rule.get("remediation_patch", {})
        if res.properties is None:
            res.properties = {}

        # Apply patch to resource properties
        for k, v in patch.items():
            res.properties[k] = v

        # Mark finding as resolved/applied
        res.security_findings = [f for f in res.security_findings if f.rule_id != rule_id]

        return topology
