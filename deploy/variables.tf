variable "prefix" {
  type        = string
  description = "Resource prefix for all Azure platform resources"
  default     = "cloudtopology"
}

variable "location" {
  type        = string
  description = "Azure region for deployment"
  default     = "eastus"
}

variable "app_service_sku" {
  type        = string
  description = "App Service Plan SKU for frontend web app hosting (B1 is cost-optimized for small teams)"
  default     = "B1"
}

variable "acr_sku" {
  type        = string
  description = "Azure Container Registry SKU (Basic is cost-optimized for small teams)"
  default     = "Basic"
}

variable "tags" {
  type        = map(string)
  description = "Platform resource tags"
  default = {
    Project     = "AzureCloudTopologyEngine"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
