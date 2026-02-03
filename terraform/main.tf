# Terraform Configuration for Azure Deployment
# This is an Infrastructure as Code (IaC) approach to deploy the app

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Variables
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "potato-disease"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# App Service Plan for Backend
resource "azurerm_service_plan" "backend" {
  name                = "${var.project_name}-backend-plan"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  os_type            = "Linux"
  sku_name           = "B1"

  tags = {
    Environment = var.environment
    Component   = "backend"
  }
}

# App Service for Backend
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  service_plan_id    = azurerm_service_plan.backend.id

  site_config {
    application_stack {
      python_version = "3.9"
    }
    
    always_on = true
  }

  app_settings = {
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    "PORT"                           = "8000"
    "CORS_ORIGINS"                   = "https://${var.project_name}-frontend-${random_string.unique.result}.azurewebsites.net"
  }

  tags = {
    Environment = var.environment
    Component   = "backend"
  }
}

# App Service Plan for Frontend
resource "azurerm_service_plan" "frontend" {
  name                = "${var.project_name}-frontend-plan"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  os_type            = "Linux"
  sku_name           = "B1"

  tags = {
    Environment = var.environment
    Component   = "frontend"
  }
}

# App Service for Frontend
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  service_plan_id    = azurerm_service_plan.frontend.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
    
    always_on = true
  }

  app_settings = {
    "REACT_APP_API_URL" = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }

  tags = {
    Environment = var.environment
    Component   = "frontend"
  }
}

# Random string for unique names
resource "random_string" "unique" {
  length  = 8
  special = false
  upper   = false
}

# Application Insights for monitoring
resource "azurerm_application_insights" "main" {
  name                = "${var.project_name}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"

  tags = {
    Environment = var.environment
  }
}

# Outputs
output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "The name of the resource group"
}

output "backend_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "The URL of the backend API"
}

output "frontend_url" {
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
  description = "The URL of the frontend application"
}

output "application_insights_instrumentation_key" {
  value       = azurerm_application_insights.main.instrumentation_key
  description = "Application Insights instrumentation key"
  sensitive   = true
}

output "deployment_instructions" {
  value = <<-EOT
    Deployment Complete! 🎉
    
    Backend URL:  https://${azurerm_linux_web_app.backend.default_hostname}
    Frontend URL: https://${azurerm_linux_web_app.frontend.default_hostname}
    
    Next steps:
    1. Deploy your backend code:
       cd API && az webapp up --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_linux_web_app.backend.name}
    
    2. Deploy your frontend code:
       cd frontend && npm run build && az webapp up --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_linux_web_app.frontend.name}
    
    3. Test your deployment:
       curl https://${azurerm_linux_web_app.backend.default_hostname}/ping
  EOT
  description = "Instructions for completing the deployment"
}
