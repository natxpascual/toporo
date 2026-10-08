"""Canonical Intermediate Representation (IR) Data Models for Azure Cloud Topology Engine."""

from __future__ import annotations
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class ContainerLevel(str, Enum):
    NONE = "none"
    RESOURCE_GROUP = "rg"
    VIRTUAL_NETWORK = "vnet"
    SUBNET = "subnet"


class RelationType(str, Enum):
    CONTAINMENT = "containment"
    NETWORK_PEERING = "network_peering"
    VIRTUAL_NETWORK_PEERING = "virtual_network_peering"
    VNET_PEERING = "vnet_peering"
    PEERING = "peering"
    PRIVATE_ENDPOINT = "private_endpoint"
    PRIVATE_LINK = "private_link"
    DATA = "data"
    SUBNET_ASSOCIATION = "subnet_association"
    IDENTITY = "identity"
    IAM = "iam"
    RBAC = "rbac"
    DEPENDENCY = "dependency"
    SECURITY_BINDING = "security_binding"
    NSG_ASSOCIATION = "nsg_association"
    ROUTE_TABLE = "route_table"
    NETWORK = "network"
    NETWORK_TRAFFIC = "network_traffic"


class NodePosition(BaseModel):
    x: float = 0.0
    y: float = 0.0


class NodeDimensions(BaseModel):
    width: Optional[float] = None
    height: Optional[float] = None


class SecurityFinding(BaseModel):
    rule_id: str
    rule_name: str
    severity: str = "MEDIUM"  # CRITICAL, HIGH, MEDIUM, LOW
    description: str
    fix_suggestion: Optional[str] = None
    applied_fix: bool = False


class FinOpsCost(BaseModel):
    monthly_cost_usd: float = 0.0
    hourly_cost_usd: float = 0.0
    currency: str = "USD"
    breakdown: Dict[str, float] = Field(default_factory=dict)


class AzureResource(BaseModel):
    id: str
    type: str  # e.g., azurerm_resource_group, azurerm_virtual_network, azurerm_linux_virtual_machine
    name: str
    location: str = "eastus"
    parent_id: Optional[str] = None
    container_level: Optional[Union[ContainerLevel, str]] = ContainerLevel.NONE
    properties: Dict[str, Any] = Field(default_factory=dict)
    tags: Dict[str, str] = Field(default_factory=dict)
    position: NodePosition = Field(default_factory=NodePosition)
    dimensions: Optional[NodeDimensions] = None
    security_findings: List[SecurityFinding] = Field(default_factory=list)
    cost: Optional[FinOpsCost] = None


class TopologyEdge(BaseModel):
    id: str
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None
    relation_type: Union[RelationType, str] = RelationType.DEPENDENCY
    properties: Dict[str, Any] = Field(default_factory=dict)


class TopologyMetadata(BaseModel):
    project_name: str = "Azure Architecture"
    target_cloud: str = "Azure"
    iac_format: str = "Terraform"
    default_location: str = "eastus"
    version: str = "1.0.0"


class CanonicalTopology(BaseModel):
    version: str = "1.0.0"
    metadata: TopologyMetadata = Field(default_factory=TopologyMetadata)
    resources: List[AzureResource] = Field(default_factory=list)
    edges: List[TopologyEdge] = Field(default_factory=list)

    def get_resource_by_id(self, resource_id: str) -> Optional[AzureResource]:
        for res in self.resources:
            if res.id == resource_id:
                return res
        return None

    def get_children(self, parent_id: str) -> List[AzureResource]:
        return [res for res in self.resources if res.parent_id == parent_id]
