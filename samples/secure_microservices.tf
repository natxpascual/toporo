# Sample Architecture: Secure Microservices Architecture with App Service, SQL & Key Vault
resource "azurerm_resource_group" "rg_microservices" {
  name     = "rg-secure-services"
  location = "eastus"
}

resource "azurerm_key_vault" "kv_secrets" {
  name                       = "kvsecureservices01"
  location                   = azurerm_resource_group.rg_microservices.location
  resource_group_name        = azurerm_resource_group.rg_microservices.name
  sku_name                   = "standard"
  soft_delete_retention_days = 90
  purge_protection_enabled   = true
  enable_rbac_authorization  = true
}

resource "azurerm_storage_account" "st_secure" {
  name                             = "stsecureservices01"
  resource_group_name              = azurerm_resource_group.rg_microservices.name
  location                         = azurerm_resource_group.rg_microservices.location
  account_tier                     = "Standard"
  account_replication_type         = "LRS"
  enable_https_traffic_only        = true
  min_tls_version                  = "TLS1_2"
  allow_nested_items_to_be_public  = false
}

resource "azurerm_mssql_server" "sql_primary" {
  name                          = "sql-srv-microservices"
  resource_group_name           = azurerm_resource_group.rg_microservices.name
  location                      = azurerm_resource_group.rg_microservices.location
  administrator_login           = "sqladmin"
  public_network_access_enabled = false
}

resource "azurerm_mssql_database" "db_orders" {
  name         = "sqldb-orders"
  server_id    = azurerm_mssql_server.sql_primary.id
  sku_name     = "S1"
  max_size_gb  = 50
}
