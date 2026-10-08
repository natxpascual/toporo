output "acr_login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "Azure Container Registry Login Server"
}

output "frontend_app_url" {
  value       = "https://${azurerm_linux_web_app.frontend_app.default_hostname}"
  description = "Public URL of Azure Cloud Topology Engine UI"
}

output "api_function_url" {
  value       = "https://${azurerm_linux_function_app.api_function.default_hostname}"
  description = "API Endpoint of Azure Functions Microservice"
}
