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

variable "acr_sku" {
  type        = string
  description = "Azure Container Registry SKU (Basic is cost-optimized for small teams)"
  default     = "Basic"
}

variable "api_image_tag" {
  type        = string
  description = "Docker image tag for the FastAPI backend in ACR"
  default     = "latest"
}

variable "frontend_base_url" {
  type        = string
  description = "Cloudflare Pages URL for OAuth callback redirects"
  default     = "http://localhost:3000"
}

variable "jwt_secret_key" {
  type        = string
  description = "Production JWT signing secret (64+ char random hex)"
  sensitive   = true
  default     = "replace-with-strong-64-char-random-hex-before-production"
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
