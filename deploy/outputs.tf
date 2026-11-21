output "resource_group_name" {
  value       = azurerm_resource_group.rg_platform.name
  description = "Azure Resource Group hosting the backend platform"
}

output "acr_name" {
  value       = azurerm_container_registry.acr.name
  description = "Azure Container Registry name"
}

output "acr_login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "Azure Container Registry Login Server"
}

output "api_container_app_name" {
  value       = azurerm_container_app.api_app.name
  description = "Azure Container App name for the FastAPI backend"
}

output "api_app_url" {
  value       = "https://${azurerm_container_app.api_app.ingress[0].fqdn}"
  description = "Public HTTPS URL of the FastAPI Container App"
}
