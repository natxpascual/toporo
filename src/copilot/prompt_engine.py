"""AI Architecture Copilot (GPT-4o) for Azure Cloud Topology Engine."""

from __future__ import annotations
import json
import os
from typing import Any, Dict, Optional
from src.schema.ir_models import (
    CanonicalTopology,
    AzureResource,
    TopologyEdge,
    TopologyMetadata,
    ContainerLevel,
    RelationType,
    NodePosition,
)
from src.graph.layout import TopologyAutoLayout
from src.security.checkov_runner import CheckovPolicyEngine
from src.finops.infracost_client import InfracostClient


class ArchitectureCopilot:
    """Synthesizes complete multi-tier Azure cloud architectures from natural language."""

    SYSTEM_PROMPT = """You are an expert Azure Cloud Architect & Terraform Specialist.
Convert the user's natural language architecture request into a valid JSON representation conforming to the CanonicalAzureTopology schema.
Rules:
1. Always include a top-level azurerm_resource_group.
2. Group networking resources properly: azurerm_subnet must have parent_id set to azurerm_virtual_network.
3. Virtual Machines, Web Apps, or Databases must reference their containing subnet or resource group via parent_id.
4. Ensure default properties enforce Azure CIS benchmarks (HTTPS only, TLS 1.2+, purge protection enabled, public access disabled).
5. Output ONLY a valid JSON object matching the CanonicalTopology schema.
"""

    @classmethod
    def generate_topology_from_prompt(
        cls, prompt: str, current_topology: Optional[CanonicalTopology] = None
    ) -> CanonicalTopology:
        """Generate or enhance architecture topology using Azure OpenAI (gpt-4o-mini default) or blueprint templates."""
        api_key = os.getenv("AZURE_OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")

        if api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model=os.getenv("AZURE_OPENAI_MODEL", "gpt-4o-mini"),
                    messages=[
                        {"role": "system", "content": cls.SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )
                raw_json = response.choices[0].message.content or "{}"
                data = json.loads(raw_json)
                topology = CanonicalTopology(**data)
                return cls._post_process_topology(topology)
            except Exception as e:
                # Graceful fallback to deterministic synthesis engine
                pass

        # Deterministic Semantic Blueprint Synthesis Engine
        return cls._synthesize_semantic_blueprint(prompt, current_topology)

    @classmethod
    def _synthesize_semantic_blueprint(
        cls, prompt: str, current_topology: Optional[CanonicalTopology]
    ) -> CanonicalTopology:
        p_lower = prompt.lower()
        topology = CanonicalTopology(
            metadata=TopologyMetadata(
                project_name=f"Copilot: {prompt[:30]}...",
                target_cloud="Azure",
                iac_format="Terraform",
                default_location="eastus",
            )
        )

        resources = []
        edges = []

        # 1. Base Resource Group
        rg_id = "rg_copilot_main"
        resources.append(
            AzureResource(
                id=rg_id,
                type="azurerm_resource_group",
                name="rg-ai-synthesized",
                location="eastus",
                container_level=ContainerLevel.RESOURCE_GROUP,
            )
        )

        # 2. VNet & Subnets
        vnet_id = "vnet_copilot_core"
        resources.append(
            AzureResource(
                id=vnet_id,
                type="azurerm_virtual_network",
                name="vnet-ai-core",
                location="eastus",
                parent_id=rg_id,
                container_level=ContainerLevel.VIRTUAL_NETWORK,
                properties={"address_space": ["10.100.0.0/16"]},
            )
        )
        edges.append(
            TopologyEdge(id="e_rg_vnet", source=rg_id, target=vnet_id, relation_type=RelationType.CONTAINMENT)
        )

        snet_app_id = "snet_copilot_app"
        resources.append(
            AzureResource(
                id=snet_app_id,
                type="azurerm_subnet",
                name="snet-workload",
                location="eastus",
                parent_id=vnet_id,
                container_level=ContainerLevel.SUBNET,
                properties={"address_prefixes": ["10.100.1.0/24"]},
            )
        )
        edges.append(
            TopologyEdge(id="e_vnet_snet", source=vnet_id, target=snet_app_id, relation_type=RelationType.CONTAINMENT)
        )

        # 3. Workload based on prompt keywords
        if "aks" in p_lower or "kubernetes" in p_lower or "container" in p_lower:
            aks_id = "aks_cluster_01"
            resources.append(
                AzureResource(
                    id=aks_id,
                    type="azurerm_kubernetes_cluster",
                    name="aks-production-cluster",
                    location="eastus",
                    parent_id=rg_id,
                    properties={
                        "dns_prefix": "aks-cluster",
                        "default_node_pool": {"node_count": 3, "vm_size": "Standard_D2s_v3"},
                    },
                )
            )
            edges.append(
                TopologyEdge(id="e_snet_aks", source=snet_app_id, target=aks_id, relation_type=RelationType.SUBNET_ASSOCIATION)
            )

        if "app service" in p_lower or "web" in p_lower or "3-tier" in p_lower:
            app_id = "app_frontend_01"
            resources.append(
                AzureResource(
                    id=app_id,
                    type="azurerm_linux_web_app",
                    name="app-web-frontend",
                    location="eastus",
                    parent_id=rg_id,
                    properties={"service_plan_sku": "P1v3", "https_only": True},
                )
            )
            edges.append(
                TopologyEdge(id="e_snet_app", source=snet_app_id, target=app_id, relation_type=RelationType.SUBNET_ASSOCIATION)
            )

        if "sql" in p_lower or "database" in p_lower or "3-tier" in p_lower:
            srv_id = "sql_server_01"
            db_id = "sql_db_01"
            resources.append(
                AzureResource(
                    id=srv_id,
                    type="azurerm_mssql_server",
                    name="sql-srv-primary",
                    location="eastus",
                    parent_id=rg_id,
                    properties={"administrator_login": "sqladmin", "public_network_access_enabled": False},
                )
            )
            resources.append(
                AzureResource(
                    id=db_id,
                    type="azurerm_mssql_database",
                    name="sqldb-production",
                    location="eastus",
                    parent_id=srv_id,
                    properties={"sku_name": "S1", "max_size_gb": 50},
                )
            )
            edges.append(
                TopologyEdge(id="e_srv_db", source=srv_id, target=db_id, relation_type=RelationType.CONTAINMENT)
            )

        if "key vault" in p_lower or "secret" in p_lower or "security" in p_lower or "3-tier" in p_lower:
            kv_id = "kv_secure_01"
            resources.append(
                AzureResource(
                    id=kv_id,
                    type="azurerm_key_vault",
                    name="kv-secrets-prod",
                    location="eastus",
                    parent_id=rg_id,
                    properties={
                        "sku_name": "standard",
                        "purge_protection_enabled": True,
                        "enable_rbac_authorization": True,
                    },
                )
            )
            edges.append(
                TopologyEdge(id="e_rg_kv", source=rg_id, target=kv_id, relation_type=RelationType.CONTAINMENT)
            )

        if "storage" in p_lower or "blob" in p_lower:
            st_id = "st_secure_01"
            resources.append(
                AzureResource(
                    id=st_id,
                    type="azurerm_storage_account",
                    name="stprodblobs01",
                    location="eastus",
                    parent_id=rg_id,
                    properties={
                        "account_tier": "Standard",
                        "account_replication_type": "LRS",
                        "enable_https_traffic_only": True,
                        "min_tls_version": "TLS1_2",
                        "allow_nested_items_to_be_public": False,
                    },
                )
            )
            edges.append(
                TopologyEdge(id="e_rg_st", source=rg_id, target=st_id, relation_type=RelationType.CONTAINMENT)
            )

        topology.resources = resources
        topology.edges = edges
        return cls._post_process_topology(topology)

    @classmethod
    def _post_process_topology(cls, topology: CanonicalTopology) -> CanonicalTopology:
        topology = CheckovPolicyEngine.scan_topology(topology)
        infracost = InfracostClient()
        topology = infracost.estimate_topology_costs(topology)
        topology = TopologyAutoLayout.apply_layout(topology)
        return topology
