"""Azure Resource Catalog & Metadata Registry for Azure Cloud Topology Engine."""

from typing import Any, Dict, List, Optional
from src.schema.ir_models import ContainerLevel


class AzureResourceDefinition:
    def __init__(
        self,
        resource_type: str,
        display_name: str,
        category: str,
        container_level: ContainerLevel = ContainerLevel.NONE,
        icon: str = "azure",
        default_properties: Optional[Dict[str, Any]] = None,
        allowed_parents: Optional[List[str]] = None,
        description: str = "",
    ):
        self.resource_type = resource_type
        self.display_name = display_name
        self.category = category
        self.container_level = container_level
        self.icon = icon
        self.default_properties = default_properties or {}
        self.allowed_parents = allowed_parents or []
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resourceType": self.resource_type,
            "displayName": self.display_name,
            "category": self.category,
            "containerLevel": self.container_level.value,
            "icon": self.icon,
            "defaultProperties": self.default_properties,
            "allowedParents": self.allowed_parents,
            "description": self.description,
        }


AZURE_CATALOG: Dict[str, AzureResourceDefinition] = {
    # Containers & Hierarchy
    "azurerm_resource_group": AzureResourceDefinition(
        resource_type="azurerm_resource_group",
        display_name="Resource Group",
        category="Management",
        container_level=ContainerLevel.RESOURCE_GROUP,
        icon="folder-lock",
        default_properties={"location": "eastus"},
        allowed_parents=[],
        description="Logical container for grouping Azure resources.",
    ),
    "azurerm_virtual_network": AzureResourceDefinition(
        resource_type="azurerm_virtual_network",
        display_name="Virtual Network",
        category="Networking",
        container_level=ContainerLevel.VIRTUAL_NETWORK,
        icon="network",
        default_properties={"address_space": ["10.0.0.0/16"]},
        allowed_parents=["azurerm_resource_group"],
        description="Azure Virtual Network (VNet) enabling secure communication.",
    ),
    "azurerm_subnet": AzureResourceDefinition(
        resource_type="azurerm_subnet",
        display_name="Subnet",
        category="Networking",
        container_level=ContainerLevel.SUBNET,
        icon="git-fork",
        default_properties={"address_prefixes": ["10.0.1.0/24"]},
        allowed_parents=["azurerm_virtual_network"],
        description="Subnet subdivision inside an Azure Virtual Network.",
    ),

    # Compute
    "azurerm_linux_virtual_machine": AzureResourceDefinition(
        resource_type="azurerm_linux_virtual_machine",
        display_name="Linux Virtual Machine",
        category="Compute",
        icon="server",
        default_properties={
            "size": "Standard_B2s",
            "admin_username": "azureuser",
            "disable_password_authentication": True,
            "os_disk_type": "Standard_LRS",
        },
        allowed_parents=["azurerm_subnet"],
        description="General-purpose scalable Linux Virtual Machine.",
    ),
    "azurerm_windows_virtual_machine": AzureResourceDefinition(
        resource_type="azurerm_windows_virtual_machine",
        display_name="Windows Virtual Machine",
        category="Compute",
        icon="monitor",
        default_properties={
            "size": "Standard_D2s_v3",
            "admin_username": "azureadmin",
        },
        allowed_parents=["azurerm_subnet"],
        description="Scalable Windows Server Virtual Machine.",
    ),
    "azurerm_linux_web_app": AzureResourceDefinition(
        resource_type="azurerm_linux_web_app",
        display_name="App Service (Linux Web App)",
        category="Compute",
        icon="globe",
        default_properties={
            "https_only": True,
            "service_plan_sku": "P1v3",
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Managed Web Application hosting for containers and code.",
    ),
    "azurerm_linux_function_app": AzureResourceDefinition(
        resource_type="azurerm_linux_function_app",
        display_name="Azure Function App (Serverless)",
        category="Compute",
        icon="zap",
        default_properties={
            "https_only": True,
            "storage_account_access_key_required": True,
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Serverless event-driven compute microservice.",
    ),
    "azurerm_kubernetes_cluster": AzureResourceDefinition(
        resource_type="azurerm_kubernetes_cluster",
        display_name="Azure Kubernetes Service (AKS)",
        category="Compute",
        icon="boxes",
        default_properties={
            "dns_prefix": "aks-cluster",
            "default_node_pool": {
                "name": "default",
                "node_count": 3,
                "vm_size": "Standard_D2s_v3",
            },
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Managed Kubernetes container orchestration cluster.",
    ),

    # Storage
    "azurerm_storage_account": AzureResourceDefinition(
        resource_type="azurerm_storage_account",
        display_name="Storage Account",
        category="Storage",
        icon="hard-drive",
        default_properties={
            "account_tier": "Standard",
            "account_replication_type": "LRS",
            "enable_https_traffic_only": True,
            "min_tls_version": "TLS1_2",
            "allow_nested_items_to_be_public": False,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Scalable blob, file, table, and queue storage account.",
    ),

    # Databases
    "azurerm_mssql_server": AzureResourceDefinition(
        resource_type="azurerm_mssql_server",
        display_name="Azure SQL Server",
        category="Databases",
        icon="database",
        default_properties={
            "version": "12.0",
            "administrator_login": "sqladmin",
            "minimum_tls_version": "1.2",
            "public_network_access_enabled": False,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Fully managed relational SQL database server.",
    ),
    "azurerm_mssql_database": AzureResourceDefinition(
        resource_type="azurerm_mssql_database",
        display_name="Azure SQL Database",
        category="Databases",
        icon="table",
        default_properties={
            "sku_name": "S1",
            "max_size_gb": 50,
        },
        allowed_parents=["azurerm_mssql_server"],
        description="Managed SQL database instance.",
    ),
    "azurerm_cosmosdb_account": AzureResourceDefinition(
        resource_type="azurerm_cosmosdb_account",
        display_name="Azure Cosmos DB",
        category="Databases",
        icon="atom",
        default_properties={
            "offer_type": "Standard",
            "kind": "GlobalDocumentDB",
            "enable_automatic_failover": True,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Globally distributed, multi-model NoSQL database service.",
    ),

    # Security & Networking
    "azurerm_key_vault": AzureResourceDefinition(
        resource_type="azurerm_key_vault",
        display_name="Azure Key Vault",
        category="Security",
        icon="key",
        default_properties={
            "sku_name": "standard",
            "soft_delete_retention_days": 90,
            "purge_protection_enabled": True,
            "enable_rbac_authorization": True,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Secure secrets, encryption keys, and certificates repository.",
    ),
    "azurerm_network_security_group": AzureResourceDefinition(
        resource_type="azurerm_network_security_group",
        display_name="Network Security Group (NSG)",
        category="Security",
        icon="shield",
        default_properties={
            "security_rules": [],
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Stateful packet inspection firewall and security rule filter.",
    ),
    "azurerm_application_gateway": AzureResourceDefinition(
        resource_type="azurerm_application_gateway",
        display_name="Application Gateway (WAF)",
        category="Networking",
        icon="cpu",
        default_properties={
            "sku": {
                "name": "WAF_v2",
                "tier": "WAF_v2",
                "capacity": 2,
            },
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Layer 7 web traffic load balancer and Web Application Firewall.",
    ),
}


def get_catalog_list() -> List[Dict[str, Any]]:
    return [item.to_dict() for item in AZURE_CATALOG.values()]


def get_catalog_entry(resource_type: str) -> Optional[AzureResourceDefinition]:
    return AZURE_CATALOG.get(resource_type)
