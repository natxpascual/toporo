# Azure Backend Infrastructure for Azure Cloud Topology Engine
# (Frontend is hosted separately on Cloudflare Pages)
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 1. Resource Group
resource "azurerm_resource_group" "rg_platform" {
  name     = "${var.prefix}-platform-rg"
  location = var.location
  tags     = var.tags
}

# 2. Log Analytics & Application Insights
resource "azurerm_log_analytics_workspace" "logs" {
  name                = "${var.prefix}-logs"
  location            = azurerm_resource_group.rg_platform.location
  resource_group_name = azurerm_resource_group.rg_platform.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

resource "azurerm_application_insights" "appinsights" {
  name                = "${var.prefix}-appinsights"
  location            = azurerm_resource_group.rg_platform.location
  resource_group_name = azurerm_resource_group.rg_platform.name
  workspace_id        = azurerm_log_analytics_workspace.logs.id
  application_type    = "web"
  tags                = var.tags
}

# 3. Azure Container Registry (ACR)
resource "azurerm_container_registry" "acr" {
  name                = replace("${var.prefix}acr01", "-", "")
  resource_group_name = azurerm_resource_group.rg_platform.name
  location            = azurerm_resource_group.rg_platform.location
  sku                 = var.acr_sku
  admin_enabled       = true
  tags                = var.tags
}

# 4. Storage Account for Azure Table Storage (ToporoUsers & Audit Logs)
resource "azurerm_storage_account" "fn_storage" {
  name                     = replace("${var.prefix}fnstorage01", "-", "")
  resource_group_name      = azurerm_resource_group.rg_platform.name
  location                 = azurerm_resource_group.rg_platform.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  tags                     = var.tags
}

# 5. Azure Container Apps Environment (Consumption, Scale-to-Zero)
resource "azurerm_container_app_environment" "aca_env" {
  name                       = "${var.prefix}-aca-env"
  location                   = azurerm_resource_group.rg_platform.location
  resource_group_name        = azurerm_resource_group.rg_platform.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs.id
  tags                       = var.tags
}

# 6. Azure Container App (FastAPI Python 3.14 Backend)
resource "azurerm_container_app" "api_app" {
  name                         = "${var.prefix}-api"
  container_app_environment_id = azurerm_container_app_environment.aca_env.id
  resource_group_name          = azurerm_resource_group.rg_platform.name
  revision_mode                = "Single"
  tags                         = var.tags

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }

  secret {
    name  = "azure-storage-connection-string"
    value = azurerm_storage_account.fn_storage.primary_connection_string
  }

  secret {
    name  = "jwt-secret-key"
    value = var.jwt_secret_key
  }

  ingress {
    external_enabled = true
    target_port      = 8000
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 0
    max_replicas = 3

    container {
      name   = "api"
      image  = "${azurerm_container_registry.acr.login_server}/azure-topology-engine-api:${var.api_image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "AZURE_STORAGE_CONNECTION_STRING"
        secret_name = "azure-storage-connection-string"
      }

      env {
        name  = "AZURE_USERS_TABLE_NAME"
        value = "ToporoUsers"
      }

      env {
        name        = "JWT_SECRET_KEY"
        secret_name = "jwt-secret-key"
      }

      env {
        name  = "FRONTEND_BASE_URL"
        value = var.frontend_base_url
      }

      env {
        name  = "AZURE_OPENAI_MODEL"
        value = "gpt-4o-mini"
      }

      env {
        name  = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        value = azurerm_application_insights.appinsights.connection_string
      }
    }
  }
}
