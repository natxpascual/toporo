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
    # ─── Containers & Hierarchy ───────────────────────────────────────────
    "azurerm_resource_group": AzureResourceDefinition(
        resource_type="azurerm_resource_group",
        display_name="Resource Group",
        category="Containers",
        container_level=ContainerLevel.RESOURCE_GROUP,
        icon="folder-lock",
        default_properties={"location": "eastus"},
        allowed_parents=[],
        description="Logical container for grouping Azure resources.",
    ),
    "azurerm_virtual_network": AzureResourceDefinition(
        resource_type="azurerm_virtual_network",
        display_name="Virtual Network",
        category="Containers",
        container_level=ContainerLevel.VIRTUAL_NETWORK,
        icon="network",
        default_properties={"address_space": ["10.0.0.0/16"]},
        allowed_parents=["azurerm_resource_group"],
        description="Isolated network boundary enabling secure cloud connectivity.",
    ),
    "azurerm_subnet": AzureResourceDefinition(
        resource_type="azurerm_subnet",
        display_name="Subnet",
        category="Containers",
        container_level=ContainerLevel.SUBNET,
        icon="git-fork",
        default_properties={"address_prefixes": ["10.0.1.0/24"]},
        allowed_parents=["azurerm_virtual_network"],
        description="Subnet subdivision inside an Azure Virtual Network.",
    ),

    # ─── Compute ──────────────────────────────────────────────────────────
    "azurerm_linux_virtual_machine": AzureResourceDefinition(
        resource_type="azurerm_linux_virtual_machine",
        display_name="Linux Virtual Machine",
        category="Compute",
        icon="cpu",
        default_properties={
            "size": "Standard_B2s",
            "admin_username": "azureuser",
            "disable_password_authentication": True,
            "os_disk_type": "Standard_LRS",
        },
        allowed_parents=["azurerm_subnet"],
        description="General-purpose scalable Ubuntu/Debian Linux Virtual Machine.",
    ),
    "azurerm_windows_virtual_machine": AzureResourceDefinition(
        resource_type="azurerm_windows_virtual_machine",
        display_name="Windows Virtual Machine",
        category="Compute",
        icon="cpu",
        default_properties={
            "size": "Standard_D2s_v3",
            "admin_username": "azureadmin",
        },
        allowed_parents=["azurerm_subnet"],
        description="Scalable Windows Server Virtual Machine.",
    ),
    "azurerm_linux_virtual_machine_scale_set": AzureResourceDefinition(
        resource_type="azurerm_linux_virtual_machine_scale_set",
        display_name="Linux VM Scale Set (VMSS)",
        category="Compute",
        icon="cpu",
        default_properties={
            "sku": "Standard_B2s",
            "instances": 2,
            "admin_username": "azureuser",
        },
        allowed_parents=["azurerm_subnet"],
        description="Auto-scaling group of identical Linux virtual machines.",
    ),
    "azurerm_service_plan": AzureResourceDefinition(
        resource_type="azurerm_service_plan",
        display_name="App Service Plan",
        category="Compute",
        icon="layers",
        default_properties={
            "os_type": "Linux",
            "sku_name": "P1v3",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Hosting plan defining compute resources and scaling for web apps.",
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
    "azurerm_windows_web_app": AzureResourceDefinition(
        resource_type="azurerm_windows_web_app",
        display_name="App Service (Windows Web App)",
        category="Compute",
        icon="globe",
        default_properties={
            "https_only": True,
            "service_plan_sku": "P1v3",
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Managed Windows Web Application hosting IIS and .NET apps.",
    ),
    "azurerm_linux_function_app": AzureResourceDefinition(
        resource_type="azurerm_linux_function_app",
        display_name="Function App (Serverless)",
        category="Compute",
        icon="zap",
        default_properties={
            "https_only": True,
            "storage_account_access_key_required": True,
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Serverless event-driven compute microservice on Linux.",
    ),
    "azurerm_windows_function_app": AzureResourceDefinition(
        resource_type="azurerm_windows_function_app",
        display_name="Function App (Windows)",
        category="Compute",
        icon="zap",
        default_properties={
            "https_only": True,
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Serverless event-driven compute microservice on Windows.",
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
        description="Managed production Kubernetes container orchestration cluster.",
    ),
    "azurerm_container_app": AzureResourceDefinition(
        resource_type="azurerm_container_app",
        display_name="Container App",
        category="Compute",
        icon="layers",
        default_properties={
            "revision_mode": "Single",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Fully managed serverless container runtime built on Kubernetes & KEDA.",
    ),
    "azurerm_container_app_environment": AzureResourceDefinition(
        resource_type="azurerm_container_app_environment",
        display_name="Container App Environment",
        category="Compute",
        icon="layers",
        default_properties={},
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Secure perimeter and shared network for Azure Container Apps.",
    ),
    "azurerm_container_group": AzureResourceDefinition(
        resource_type="azurerm_container_group",
        display_name="Container Instance (ACI)",
        category="Compute",
        icon="boxes",
        default_properties={
            "os_type": "Linux",
            "ip_address_type": "Public",
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Fast on-demand serverless container deployment without VM management.",
    ),
    "azurerm_batch_account": AzureResourceDefinition(
        resource_type="azurerm_batch_account",
        display_name="Batch Account",
        category="Compute",
        icon="cpu",
        default_properties={
            "pool_allocation_mode": "BatchService",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Large-scale parallel and high-performance computing batch job scheduler.",
    ),

    # ─── Networking ───────────────────────────────────────────────────────
    "azurerm_firewall": AzureResourceDefinition(
        resource_type="azurerm_firewall",
        display_name="Azure Firewall",
        category="Networking",
        icon="shield",
        default_properties={
            "sku_name": "AZFW_VNet",
            "sku_tier": "Standard",
            "threat_intel_mode": "Alert",
        },
        allowed_parents=["azurerm_subnet"],
        description="Cloud-native, intelligent stateful firewall with built-in high availability.",
    ),
    "azurerm_firewall_policy": AzureResourceDefinition(
        resource_type="azurerm_firewall_policy",
        display_name="Azure Firewall Policy",
        category="Networking",
        icon="shield",
        default_properties={
            "sku": "Standard",
            "threat_intelligence_mode": "Alert",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Centralized rule and threat intelligence management policy for Azure Firewall.",
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
        description="Layer 7 web traffic load balancer with Web Application Firewall.",
    ),
    "azurerm_lb": AzureResourceDefinition(
        resource_type="azurerm_lb",
        display_name="Load Balancer (L4)",
        category="Networking",
        icon="cpu",
        default_properties={
            "sku": "Standard",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Ultra high-throughput Layer 4 TCP/UDP load balancer.",
    ),
    "azurerm_public_ip": AzureResourceDefinition(
        resource_type="azurerm_public_ip",
        display_name="Public IP Address",
        category="Networking",
        icon="globe",
        default_properties={
            "allocation_method": "Static",
            "sku": "Standard",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Static or dynamic public IPv4/IPv6 internet address.",
    ),
    "azurerm_nat_gateway": AzureResourceDefinition(
        resource_type="azurerm_nat_gateway",
        display_name="NAT Gateway",
        category="Networking",
        icon="network",
        default_properties={
            "sku_name": "Standard",
            "idle_timeout_in_minutes": 4,
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Highly resilient outbound SNAT internet connectivity gateway.",
    ),
    "azurerm_network_security_group": AzureResourceDefinition(
        resource_type="azurerm_network_security_group",
        display_name="Network Security Group (NSG)",
        category="Networking",
        icon="shield",
        default_properties={
            "security_rules": [],
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Stateful packet inspection firewall and security rule filter.",
    ),
    "azurerm_route_table": AzureResourceDefinition(
        resource_type="azurerm_route_table",
        display_name="Route Table (UDR)",
        category="Networking",
        icon="network",
        default_properties={
            "disable_bgp_route_propagation": False,
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Custom user-defined routing table directing traffic flow.",
    ),
    "azurerm_virtual_network_peering": AzureResourceDefinition(
        resource_type="azurerm_virtual_network_peering",
        display_name="VNet Peering",
        category="Networking",
        icon="network",
        default_properties={
            "allow_virtual_network_access": True,
            "allow_forwarded_traffic": True,
        },
        allowed_parents=["azurerm_virtual_network"],
        description="High-speed private connection linking two Azure Virtual Networks.",
    ),
    "azurerm_private_endpoint": AzureResourceDefinition(
        resource_type="azurerm_private_endpoint",
        display_name="Private Endpoint",
        category="Networking",
        icon="network",
        default_properties={},
        allowed_parents=["azurerm_subnet"],
        description="Private IP network interface connecting securely to Azure PaaS services.",
    ),
    "azurerm_private_dns_zone": AzureResourceDefinition(
        resource_type="azurerm_private_dns_zone",
        display_name="Private DNS Zone",
        category="Networking",
        icon="network",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Private name resolution service within virtual networks without custom DNS.",
    ),
    "azurerm_dns_zone": AzureResourceDefinition(
        resource_type="azurerm_dns_zone",
        display_name="Azure DNS Zone",
        category="Networking",
        icon="globe",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Public domain name hosting service backed by Microsoft Anycast network.",
    ),
    "azurerm_virtual_network_gateway": AzureResourceDefinition(
        resource_type="azurerm_virtual_network_gateway",
        display_name="VPN / ExpressRoute Gateway",
        category="Networking",
        icon="network",
        default_properties={
            "type": "Vpn",
            "vpn_type": "RouteBased",
            "sku": "VpnGw1",
        },
        allowed_parents=["azurerm_subnet"],
        description="Cross-premises site-to-site VPN and ExpressRoute hybrid connectivity gateway.",
    ),
    "azurerm_bastion_host": AzureResourceDefinition(
        resource_type="azurerm_bastion_host",
        display_name="Azure Bastion Host",
        category="Networking",
        icon="shield",
        default_properties={
            "sku": "Standard",
        },
        allowed_parents=["azurerm_subnet"],
        description="Fully managed RDP/SSH jump-box proxy over SSL without public VM IPs.",
    ),
    "azurerm_frontdoor": AzureResourceDefinition(
        resource_type="azurerm_frontdoor",
        display_name="Azure Front Door",
        category="Networking",
        icon="globe",
        default_properties={
            "sku_name": "Standard_AzureFrontDoor",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Global edge modern cloud content delivery network and application accelerator.",
    ),
    "azurerm_traffic_manager_profile": AzureResourceDefinition(
        resource_type="azurerm_traffic_manager_profile",
        display_name="Traffic Manager",
        category="Networking",
        icon="globe",
        default_properties={
            "traffic_routing_method": "Performance",
        },
        allowed_parents=["azurerm_resource_group"],
        description="DNS-based traffic load balancer distributing global user requests.",
    ),

    # ─── Storage ──────────────────────────────────────────────────────────
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
    "azurerm_storage_container": AzureResourceDefinition(
        resource_type="azurerm_storage_container",
        display_name="Blob Container",
        category="Storage",
        icon="hard-drive",
        default_properties={
            "container_access_type": "private",
        },
        allowed_parents=["azurerm_storage_account"],
        description="Object storage container holding unstructured binary data and blobs.",
    ),
    "azurerm_storage_share": AzureResourceDefinition(
        resource_type="azurerm_storage_share",
        display_name="Azure File Share",
        category="Storage",
        icon="hard-drive",
        default_properties={
            "quota": 50,
        },
        allowed_parents=["azurerm_storage_account"],
        description="Fully managed SMB and NFS cloud file share.",
    ),
    "azurerm_backup_vault": AzureResourceDefinition(
        resource_type="azurerm_backup_vault",
        display_name="Backup Vault",
        category="Storage",
        icon="hard-drive",
        default_properties={
            "datastore_type": "VaultStore",
            "redundancy": "LocallyRedundant",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Unified storage repository protecting Azure workloads and disks.",
    ),
    "azurerm_recovery_services_vault": AzureResourceDefinition(
        resource_type="azurerm_recovery_services_vault",
        display_name="Recovery Services Vault",
        category="Storage",
        icon="hard-drive",
        default_properties={
            "sku": "Standard",
            "soft_delete_enabled": True,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Storage entity housing data backups and Azure Site Recovery policies.",
    ),
    "azurerm_netapp_account": AzureResourceDefinition(
        resource_type="azurerm_netapp_account",
        display_name="Azure NetApp Files",
        category="Storage",
        icon="hard-drive",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Ultra-high performance enterprise NFS/SMB file storage.",
    ),

    # ─── Databases & Caching ──────────────────────────────────────────────
    "azurerm_redis_cache": AzureResourceDefinition(
        resource_type="azurerm_redis_cache",
        display_name="Azure Cache for Redis",
        category="Databases",
        icon="zap",
        default_properties={
            "sku_name": "Standard",
            "family": "C",
            "capacity": 1,
            "enable_non_ssl_port": False,
            "minimum_tls_version": "1.2",
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Ultra-fast, fully managed in-memory data store and distributed cache.",
    ),
    "azurerm_redis_enterprise_cluster": AzureResourceDefinition(
        resource_type="azurerm_redis_enterprise_cluster",
        display_name="Redis Enterprise Cache",
        category="Databases",
        icon="zap",
        default_properties={
            "sku_name": "Enterprise_E10-2",
        },
        allowed_parents=["azurerm_resource_group"],
        description="High-availability Redis cache powered by Redis Enterprise software.",
    ),
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
        icon="database",
        default_properties={
            "sku_name": "S1",
            "max_size_gb": 50,
        },
        allowed_parents=["azurerm_mssql_server", "azurerm_resource_group"],
        description="Intelligent managed SQL relational database instance.",
    ),
    "azurerm_cosmosdb_account": AzureResourceDefinition(
        resource_type="azurerm_cosmosdb_account",
        display_name="Azure Cosmos DB",
        category="Databases",
        icon="database",
        default_properties={
            "offer_type": "Standard",
            "kind": "GlobalDocumentDB",
            "enable_automatic_failover": True,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Globally distributed, multi-model NoSQL database service.",
    ),
    "azurerm_postgresql_flexible_server": AzureResourceDefinition(
        resource_type="azurerm_postgresql_flexible_server",
        display_name="PostgreSQL Flexible Server",
        category="Databases",
        icon="database",
        default_properties={
            "sku_name": "B_Standard_B2s",
            "version": "15",
            "storage_mb": 32768,
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Fully managed Postgres database with granular maintenance controls.",
    ),
    "azurerm_mysql_flexible_server": AzureResourceDefinition(
        resource_type="azurerm_mysql_flexible_server",
        display_name="MySQL Flexible Server",
        category="Databases",
        icon="database",
        default_properties={
            "sku_name": "B_Standard_B2s",
            "version": "8.0.21",
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Fully managed MySQL Community edition database service.",
    ),
    "azurerm_synapse_workspace": AzureResourceDefinition(
        resource_type="azurerm_synapse_workspace",
        display_name="Azure Synapse Analytics",
        category="Databases",
        icon="database",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Enterprise analytics service bringing together data integration and big data.",
    ),
    "azurerm_kusto_cluster": AzureResourceDefinition(
        resource_type="azurerm_kusto_cluster",
        display_name="Azure Data Explorer (Kusto)",
        category="Databases",
        icon="database",
        default_properties={
            "sku": {
                "name": "Dev(No SLA)_Standard_E2a_v4",
                "capacity": 1,
            },
        },
        allowed_parents=["azurerm_resource_group"],
        description="Fast and highly scalable data exploration service for log and telemetry data.",
    ),

    # ─── Security & Identity ──────────────────────────────────────────────
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
    "azurerm_key_vault_secret": AzureResourceDefinition(
        resource_type="azurerm_key_vault_secret",
        display_name="Key Vault Secret",
        category="Security",
        icon="key",
        default_properties={},
        allowed_parents=["azurerm_key_vault"],
        description="Confidential secret value stored securely inside Azure Key Vault.",
    ),
    "azurerm_user_assigned_identity": AzureResourceDefinition(
        resource_type="azurerm_user_assigned_identity",
        display_name="Managed Identity",
        category="Security",
        icon="shield",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Standalone Azure AD managed identity assigned to cloud resources.",
    ),
    "azurerm_role_assignment": AzureResourceDefinition(
        resource_type="azurerm_role_assignment",
        display_name="RBAC Role Assignment",
        category="Security",
        icon="shield",
        default_properties={
            "role_definition_name": "Contributor",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Granular Role-Based Access Control authorization assignment.",
    ),
    "azurerm_sentinel_log_analytics_workspace_onboarding": AzureResourceDefinition(
        resource_type="azurerm_sentinel_log_analytics_workspace_onboarding",
        display_name="Microsoft Sentinel",
        category="Security",
        icon="shield",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Cloud-native SIEM and SOAR solution for intelligent security analytics.",
    ),
    "azurerm_web_application_firewall_policy": AzureResourceDefinition(
        resource_type="azurerm_web_application_firewall_policy",
        display_name="WAF Policy",
        category="Security",
        icon="shield",
        default_properties={
            "policy_settings": {
                "enabled": True,
                "mode": "Prevention",
            },
        },
        allowed_parents=["azurerm_resource_group"],
        description="Centralized Web Application Firewall protection policy.",
    ),

    # ─── AI & Machine Learning ────────────────────────────────────────────
    "azurerm_cognitive_account": AzureResourceDefinition(
        resource_type="azurerm_cognitive_account",
        display_name="Azure OpenAI / AI Services",
        category="AI",
        icon="brain",
        default_properties={
            "kind": "OpenAI",
            "sku_name": "S0",
            "public_network_access_enabled": False,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Enterprise multimodal generative AI models including GPT-4o.",
    ),
    "azurerm_machine_learning_workspace": AzureResourceDefinition(
        resource_type="azurerm_machine_learning_workspace",
        display_name="Machine Learning Workspace",
        category="AI",
        icon="brain",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Integrated platform for training, deploying, and tracking ML models.",
    ),
    "azurerm_search_service": AzureResourceDefinition(
        resource_type="azurerm_search_service",
        display_name="Azure AI Search",
        category="AI",
        icon="brain",
        default_properties={
            "sku": "standard",
            "replica_count": 1,
            "partition_count": 1,
        },
        allowed_parents=["azurerm_resource_group"],
        description="AI-powered vector search, full-text retrieval, and RAG search engine.",
    ),
    "azurerm_bot_channels_registration": AzureResourceDefinition(
        resource_type="azurerm_bot_channels_registration",
        display_name="Azure Bot Service",
        category="AI",
        icon="brain",
        default_properties={
            "sku": "F0",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Integrated environment for developing intelligent conversational bots.",
    ),

    # ─── Integration & Messaging ──────────────────────────────────────────
    "azurerm_servicebus_namespace": AzureResourceDefinition(
        resource_type="azurerm_servicebus_namespace",
        display_name="Azure Service Bus",
        category="Integration",
        icon="workflow",
        default_properties={
            "sku": "Standard",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Reliable enterprise message broker with queues and publish-subscribe topics.",
    ),
    "azurerm_servicebus_queue": AzureResourceDefinition(
        resource_type="azurerm_servicebus_queue",
        display_name="Service Bus Queue",
        category="Integration",
        icon="workflow",
        default_properties={
            "max_size_in_megabytes": 1024,
        },
        allowed_parents=["azurerm_servicebus_namespace"],
        description="First-In-First-Out point-to-point messaging queue.",
    ),
    "azurerm_servicebus_topic": AzureResourceDefinition(
        resource_type="azurerm_servicebus_topic",
        display_name="Service Bus Topic",
        category="Integration",
        icon="workflow",
        default_properties={},
        allowed_parents=["azurerm_servicebus_namespace"],
        description="One-to-many publish/subscribe enterprise messaging topic.",
    ),
    "azurerm_eventhub_namespace": AzureResourceDefinition(
        resource_type="azurerm_eventhub_namespace",
        display_name="Azure Event Hubs",
        category="Integration",
        icon="chart",
        default_properties={
            "sku": "Standard",
            "capacity": 1,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Massively scalable real-time event streaming and data ingestion platform.",
    ),
    "azurerm_eventgrid_topic": AzureResourceDefinition(
        resource_type="azurerm_eventgrid_topic",
        display_name="Azure Event Grid",
        category="Integration",
        icon="workflow",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Fully managed pub-sub event routing service for reactive applications.",
    ),
    "azurerm_logic_app_workflow": AzureResourceDefinition(
        resource_type="azurerm_logic_app_workflow",
        display_name="Azure Logic App",
        category="Integration",
        icon="workflow",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Low-code visual business process automation and integration workflows.",
    ),
    "azurerm_api_management": AzureResourceDefinition(
        resource_type="azurerm_api_management",
        display_name="API Management (APIM)",
        category="Integration",
        icon="workflow",
        default_properties={
            "sku_name": "Developer_1",
            "publisher_name": "Contoso Enterprise",
            "publisher_email": "admin@contoso.com",
        },
        allowed_parents=["azurerm_resource_group", "azurerm_subnet"],
        description="Hybrid API gateway, developer portal, and lifecycle management platform.",
    ),
    "azurerm_signalr_service": AzureResourceDefinition(
        resource_type="azurerm_signalr_service",
        display_name="Azure SignalR Service",
        category="Integration",
        icon="workflow",
        default_properties={
            "sku": {
                "name": "Standard_S1",
                "capacity": 1,
            },
        },
        allowed_parents=["azurerm_resource_group"],
        description="Real-time web communication service delivering instant updates via WebSockets.",
    ),

    # ─── Containers & Registry ────────────────────────────────────────────
    "azurerm_container_registry": AzureResourceDefinition(
        resource_type="azurerm_container_registry",
        display_name="Container Registry (ACR)",
        category="Containers",
        icon="boxes",
        default_properties={
            "sku": "Premium",
            "admin_enabled": False,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Private OCI-compliant registry managing container images and OCI artifacts.",
    ),

    # ─── Observability & Analytics ────────────────────────────────────────
    "azurerm_log_analytics_workspace": AzureResourceDefinition(
        resource_type="azurerm_log_analytics_workspace",
        display_name="Log Analytics Workspace",
        category="Observability",
        icon="chart",
        default_properties={
            "sku": "PerGB2018",
            "retention_in_days": 30,
        },
        allowed_parents=["azurerm_resource_group"],
        description="Centralized telemetry datastore and KQL analytics engine for Azure Monitor.",
    ),
    "azurerm_application_insights": AzureResourceDefinition(
        resource_type="azurerm_application_insights",
        display_name="Application Insights",
        category="Observability",
        icon="chart",
        default_properties={
            "application_type": "web",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Application Performance Management (APM) and live user diagnostics.",
    ),
    "azurerm_monitor_action_group": AzureResourceDefinition(
        resource_type="azurerm_monitor_action_group",
        display_name="Monitor Action Group",
        category="Observability",
        icon="shield",
        default_properties={
            "short_name": "opsalert",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Notification preferences and automated alert receivers collection.",
    ),
    "azurerm_data_factory": AzureResourceDefinition(
        resource_type="azurerm_data_factory",
        display_name="Azure Data Factory",
        category="Analytics",
        icon="workflow",
        default_properties={},
        allowed_parents=["azurerm_resource_group"],
        description="Cloud ETL and data integration service for automated data pipelines.",
    ),
    "azurerm_databricks_workspace": AzureResourceDefinition(
        resource_type="azurerm_databricks_workspace",
        display_name="Azure Databricks",
        category="Analytics",
        icon="cpu",
        default_properties={
            "sku": "premium",
        },
        allowed_parents=["azurerm_resource_group"],
        description="Unified Apache Spark analytics and data engineering platform.",
    ),
}


def get_catalog_list() -> List[Dict[str, Any]]:
    return [item.to_dict() for item in AZURE_CATALOG.values()]


def get_catalog_entry(resource_type: str) -> Optional[AzureResourceDefinition]:
    return AZURE_CATALOG.get(resource_type)
