"""Topology-aware Blast Radius Analyzer for Azure Cloud Topology Engine."""

from typing import Any, Dict, List, Set
from src.schema.ir_models import CanonicalTopology, AzureResource
from src.graph.builder import TopologyGraphBuilder


class BlastRadiusAnalyzer:
    """Analyzes security exposure propagation across interconnected cloud network topology."""

    @classmethod
    def calculate_blast_radius(cls, topology: CanonicalTopology) -> Dict[str, Any]:
        graph_builder = TopologyGraphBuilder(topology)
        impact_analysis: Dict[str, Any] = {}

        for res in topology.resources:
            findings = res.security_findings
            if not findings:
                continue

            # Severity multiplier
            max_sev_weight = 1
            for f in findings:
                if f.severity == "CRITICAL":
                    max_sev_weight = max(max_sev_weight, 10)
                elif f.severity == "HIGH":
                    max_sev_weight = max(max_sev_weight, 5)
                elif f.severity == "MEDIUM":
                    max_sev_weight = max(max_sev_weight, 2)

            # Find blast radius: reachable connected nodes
            connected_nodes = graph_builder.get_connected_subgraph(res.id, depth=2)
            impacted_resources = [
                r.name for r in topology.resources if r.id in connected_nodes and r.id != res.id
            ]

            blast_score = len(connected_nodes) * max_sev_weight
            impact_analysis[res.id] = {
                "resourceName": res.name,
                "resourceType": res.type,
                "severityMultiplier": max_sev_weight,
                "impactedNodeCount": len(impacted_resources),
                "impactedNodes": impacted_resources,
                "blastScore": blast_score,
                "riskLevel": "CRITICAL" if blast_score > 30 else ("HIGH" if blast_score > 15 else "MEDIUM"),
            }

        return impact_analysis
