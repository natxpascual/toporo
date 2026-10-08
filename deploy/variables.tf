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

variable "tags" {
  type        = map(string)
  description = "Platform resource tags"
  default = {
    Project     = "AzureCloudTopologyEngine"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
