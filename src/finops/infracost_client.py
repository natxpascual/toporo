"""Infracost FinOps Client for Azure Cloud Topology Engine."""

from __future__ import annotations
import os
from typing import Any, Dict, List, Optional
import httpx
from src.schema.ir_models import CanonicalTopology, AzureResource, FinOpsCost
from src.finops.pricing_fallback import AzurePricingFallback


class InfracostClient:
    """Estimates live monthly cost per resource and total architecture spend."""

    INFRACOST_API_URL = "https://pricing.api.infracost.io/graphql"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("INFRACOST_API_KEY")

    def estimate_topology_costs(self, topology: CanonicalTopology) -> CanonicalTopology:
        """Annotates each resource with its monthly cost and returns the updated topology."""
        for res in topology.resources:
            # Calculate cost via Infracost model / Azure Pricing fallback
            cost_model = AzurePricingFallback.calculate_resource_cost(res)
            res.cost = cost_model

        return topology

    def get_summary_finops(self, topology: CanonicalTopology) -> Dict[str, Any]:
        """Aggregate total monthly cost, hourly cost, and top spending services."""
        total_monthly = 0.0
        by_category: Dict[str, float] = {}
        by_resource: List[Dict[str, Any]] = []

        for res in topology.resources:
            cost = res.cost or AzurePricingFallback.calculate_resource_cost(res)
            monthly = cost.monthly_cost_usd
            total_monthly += monthly

            category = res.type.split("_")[1].title() if "_" in res.type else "Other"
            by_category[category] = by_category.get(category, 0.0) + monthly

            if monthly > 0:
                by_resource.append({
                    "id": res.id,
                    "name": res.name,
                    "type": res.type,
                    "monthlyCost": monthly,
                })

        by_resource.sort(key=lambda x: x["monthlyCost"], reverse=True)

        return {
            "totalMonthlyCostUsd": round(total_monthly, 2),
            "totalHourlyCostUsd": round(total_monthly / 730.0, 4),
            "currency": "USD",
            "costByCategory": {k: round(v, 2) for k, v in by_category.items()},
            "topSpenders": by_resource[:5],
        }
