# Terraform Azure Deployment

This directory contains Terraform configuration for deploying the Potato Disease Classification app to Azure using Infrastructure as Code (IaC).

## Prerequisites

1. Install [Terraform](https://www.terraform.io/downloads.html)
2. Install [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. Login to Azure: `az login`

## Quick Start

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy infrastructure
terraform apply

# View outputs
terraform output

# Get backend URL
terraform output backend_url

# Destroy infrastructure (cleanup)
terraform destroy
```

## What Gets Created

This Terraform configuration creates:

- **Resource Group**: Container for all resources
- **App Service Plans**: One for backend (Python), one for frontend (Node.js)
- **App Services**: Backend API and Frontend web app
- **Application Insights**: Monitoring and logging
- **Random String**: For unique naming

## Configuration

You can customize the deployment by modifying variables:

```bash
# Use different Azure region
terraform apply -var="location=westus2"

# Use different environment
terraform apply -var="environment=staging"

# Use custom project name
terraform apply -var="project_name=my-potato-app"
```

Or create a `terraform.tfvars` file:

```hcl
project_name = "my-potato-app"
location     = "westus2"
environment  = "production"
```

## Cost Estimation

Before applying, you can estimate costs:

```bash
terraform plan -out=tfplan
terraform show -json tfplan | curl -s -X POST -H "Content-Type: application/json" -d @- https://cost.modules.tf/
```

## State Management

For production use, store Terraform state remotely:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstateaccount"
    container_name       = "tfstate"
    key                  = "potato-disease.terraform.tfstate"
  }
}
```

## After Deployment

1. **Deploy Backend Code**:
```bash
cd ../API
az webapp up --resource-group $(terraform output -raw resource_group_name) \
             --name $(terraform output -raw backend_app_name)
```

2. **Deploy Frontend Code**:
```bash
cd ../frontend
npm run build
az webapp up --resource-group $(terraform output -raw resource_group_name) \
             --name $(terraform output -raw frontend_app_name)
```

3. **Test Deployment**:
```bash
curl $(terraform output -raw backend_url)/ping
```

## Outputs

After running `terraform apply`, you'll get:

- `resource_group_name`: Name of the created resource group
- `backend_url`: URL of the backend API
- `frontend_url`: URL of the frontend application
- `application_insights_instrumentation_key`: Key for monitoring (sensitive)

## Advanced Features

### Enable Auto-scaling

Add to `main.tf`:

```hcl
resource "azurerm_monitor_autoscale_setting" "backend" {
  name                = "${var.project_name}-autoscale"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  target_resource_id = azurerm_service_plan.backend.id

  profile {
    name = "AutoScale"

    capacity {
      default = 1
      minimum = 1
      maximum = 3
    }

    rule {
      metric_trigger {
        metric_name        = "CpuPercentage"
        metric_resource_id = azurerm_service_plan.backend.id
        operator           = "GreaterThan"
        statistic          = "Average"
        threshold          = 70
        time_aggregation   = "Average"
        time_grain         = "PT1M"
        time_window        = "PT5M"
      }

      scale_action {
        direction = "Increase"
        type      = "ChangeCount"
        value     = "1"
        cooldown  = "PT1M"
      }
    }
  }
}
```

### Add Custom Domain

```hcl
resource "azurerm_app_service_custom_hostname_binding" "frontend" {
  hostname            = "www.yourdomain.com"
  app_service_name    = azurerm_linux_web_app.frontend.name
  resource_group_name = azurerm_resource_group.main.name
}
```

## Troubleshooting

### State Lock Issues

```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

### Import Existing Resources

```bash
# Import existing resource group
terraform import azurerm_resource_group.main /subscriptions/{subscription-id}/resourceGroups/{resource-group-name}
```

## Cleanup

To delete all resources:

```bash
terraform destroy
```

This will remove all Azure resources created by this configuration.

## Learn More

- [Terraform Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure App Service with Terraform](https://learn.microsoft.com/en-us/azure/developer/terraform/deploy-azure-app-service)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

---

**Note**: Always review the plan before applying changes to production!
