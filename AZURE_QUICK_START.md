# Quick Azure Deployment Commands

This is a quick reference for deploying the Potato Disease Classification app to Azure. For detailed explanations, see [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md).

## Prerequisites Setup

```bash
# Install Azure CLI (if not already installed)
# Windows: https://aka.ms/installazurecliwindows
# macOS: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "Your-Subscription-Name"
```

## Option 1: Quick Deploy with Azure App Service (5 minutes)

```bash
# Set variables
export LOCATION="eastus"
export RESOURCE_GROUP="potato-disease-rg"
export BACKEND_NAME="potato-backend-$(date +%s)"
export FRONTEND_NAME="potato-frontend-$(date +%s)"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy Backend
cd API
az webapp up \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --runtime "PYTHON:3.9" \
  --sku B1

# Get backend URL
BACKEND_URL=$(az webapp show \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --query defaultHostName -o tsv)
echo "Backend URL: https://$BACKEND_URL"

# Deploy Frontend
cd ../frontend
npm install
npm run build

az webapp up \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_NAME \
  --runtime "NODE:18-lts" \
  --sku B1

# Configure frontend to use backend
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $FRONTEND_NAME \
  --settings REACT_APP_API_URL="https://$BACKEND_URL"

echo "Frontend URL: https://$(az webapp show --resource-group $RESOURCE_GROUP --name $FRONTEND_NAME --query defaultHostName -o tsv)"
```

## Option 2: Deploy with Docker Containers (10 minutes)

```bash
# Set variables
export LOCATION="eastus"
export RESOURCE_GROUP="potato-disease-rg"
export ACR_NAME="potatoacr$(date +%s)"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

# Login to ACR
az acr login --name $ACR_NAME

# Build and push backend
docker build -f Dockerfile.azure -t $ACR_NAME.azurecr.io/potato-backend:latest .
docker push $ACR_NAME.azurecr.io/potato-backend:latest

# Build and push frontend
cd frontend
docker build -f Dockerfile.production -t $ACR_NAME.azurecr.io/potato-frontend:latest .
docker push $ACR_NAME.azurecr.io/potato-frontend:latest
cd ..

# Deploy backend container
az container create \
  --resource-group $RESOURCE_GROUP \
  --name potato-backend \
  --image $ACR_NAME.azurecr.io/potato-backend:latest \
  --registry-login-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label potato-backend-$ACR_NAME \
  --ports 8000 \
  --cpu 2 \
  --memory 4

# Get backend URL
BACKEND_URL="http://potato-backend-$ACR_NAME.$LOCATION.azurecontainer.io:8000"

# Deploy frontend container
az container create \
  --resource-group $RESOURCE_GROUP \
  --name potato-frontend \
  --image $ACR_NAME.azurecr.io/potato-frontend:latest \
  --registry-login-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label potato-frontend-$ACR_NAME \
  --ports 80 \
  --environment-variables BACKEND_URL=$BACKEND_URL

echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: http://potato-frontend-$ACR_NAME.$LOCATION.azurecontainer.io"
```

## Useful Commands

```bash
# Check app status
az webapp show --resource-group $RESOURCE_GROUP --name $BACKEND_NAME

# View logs
az webapp log tail --resource-group $RESOURCE_GROUP --name $BACKEND_NAME

# Restart app
az webapp restart --resource-group $RESOURCE_GROUP --name $BACKEND_NAME

# Scale up (more power)
az appservice plan update \
  --name $BACKEND_NAME-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B2

# Scale out (more instances)
az appservice plan update \
  --name $BACKEND_NAME-plan \
  --resource-group $RESOURCE_GROUP \
  --number-of-workers 2

# Check container logs
az container logs --resource-group $RESOURCE_GROUP --name potato-backend
az container logs --resource-group $RESOURCE_GROUP --name potato-frontend

# Stop containers (to save costs)
az container stop --resource-group $RESOURCE_GROUP --name potato-backend
az container stop --resource-group $RESOURCE_GROUP --name potato-frontend

# Start containers
az container start --resource-group $RESOURCE_GROUP --name potato-backend
az container start --resource-group $RESOURCE_GROUP --name potato-frontend
```

## Cleanup (Delete Everything)

```bash
# Delete entire resource group (removes all resources)
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## Cost Monitoring

```bash
# Check current month's costs
az consumption usage list --output table

# Set up budget alert
az consumption budget create \
  --resource-group $RESOURCE_GROUP \
  --budget-name potato-disease-budget \
  --amount 50 \
  --time-grain Monthly \
  --start-date $(date +%Y-%m-01) \
  --notifications amount=80 email=your-email@example.com
```

## GitHub Actions Setup

```bash
# Create service principal for GitHub Actions
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

az ad sp create-for-rbac \
  --name "potato-disease-github" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth

# Copy the JSON output and add it as AZURE_CREDENTIALS secret in GitHub
```

## Troubleshooting

```bash
# Backend not starting?
az webapp log tail --resource-group $RESOURCE_GROUP --name $BACKEND_NAME

# Check environment variables
az webapp config appsettings list \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME

# SSH into container (for App Service)
az webapp ssh --resource-group $RESOURCE_GROUP --name $BACKEND_NAME

# Check if backend is responding
curl https://$BACKEND_NAME.azurewebsites.net/ping

# View container events
az container show \
  --resource-group $RESOURCE_GROUP \
  --name potato-backend \
  --query instanceView.events
```

## Next Steps

- Read the full guide: [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)
- Set up custom domain
- Configure SSL/TLS certificates
- Enable Application Insights for monitoring
- Set up auto-scaling rules
- Configure backup and disaster recovery

---

**Need Help?**
- [Azure Documentation](https://docs.microsoft.com/azure)
- [Azure Support](https://azure.microsoft.com/support)
- Repository Issues: Create an issue on GitHub
