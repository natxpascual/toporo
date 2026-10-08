# Azure Hosting Infrastructure for Azure Cloud Topology Engine
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
  sku                 = "Standard"
  admin_enabled       = true
  tags                = var.tags
}

# 4. Storage Account for Azure Functions
resource "azurerm_storage_account" "fn_storage" {
  name                     = replace("${var.prefix}fnstorage01", "-", "")
  resource_group_name      = azurerm_resource_group.rg_platform.name
  location                 = azurerm_resource_group.rg_platform.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  tags                     = var.tags
}

# 5. Linux App Service Plan (Frontend UI & API Hosting)
resource "azurerm_service_plan" "asp_frontend" {
  name                = "${var.prefix}-ui-asp"
  resource_group_name = azurerm_resource_group.rg_platform.name
  location            = azurerm_resource_group.rg_platform.location
  os_type             = "Linux"
  sku_name            = "P1v3"
  tags                = var.tags
}

# 6. Azure App Service (Frontend Containerized React Flow UI)
resource "azurerm_linux_web_app" "frontend_app" {
  name                = "${var.prefix}-topology-ui"
  resource_group_name = azurerm_resource_group.rg_platform.name
  location            = azurerm_resource_group.rg_platform.location
  service_plan_id     = azurerm_service_plan.asp_frontend.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on        = true
    ftps_state       = "Disabled"
    minimum_tls_version = "1.2"

    application_stack {
      docker_image_name   = "azure-topology-engine-ui:latest"
      docker_registry_url = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }

  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.appinsights.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.appinsights.connection_string
    "VITE_API_BASE_URL"                     = "https://${var.prefix}-api-functions.azurewebsites.net"
  }

  tags = var.tags
}

# 7. Azure Function App (Serverless Python 3.14 API Microservice)
resource "azurerm_service_plan" "asp_functions" {
  name                = "${var.prefix}-fn-asp"
  resource_group_name = azurerm_resource_group.rg_platform.name
  location            = azurerm_resource_group.rg_platform.location
  os_type             = "Linux"
  sku_name            = "Y1"
  tags                = var.tags
}

resource "azurerm_linux_function_app" "api_function" {
  name                       = "${var.prefix}-api-functions"
  resource_group_name        = azurerm_resource_group.rg_platform.name
  location                   = azurerm_resource_group.rg_platform.location
  service_plan_id            = azurerm_service_plan.asp_functions.id
  storage_account_name       = azurerm_storage_account.fn_storage.name
  storage_account_access_key = azurerm_storage_account.fn_storage.primary_access_key
  https_only                 = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      python_version = "3.11"
    }
    cors {
      allowed_origins     = ["https://${azurerm_linux_web_app.frontend_app.default_hostname}"]
      support_credentials = true
    }
  }

  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"              = "python"
    "AzureWebJobsFeatureFlags"              = "EnableWorkerIndexing"
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.appinsights.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.appinsights.connection_string
  }

  tags = var.tags
}
