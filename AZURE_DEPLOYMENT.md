# Azure Deployment Guide - Potato Disease Classification

This guide will help you deploy the Potato Disease Classification application on Microsoft Azure.

## Overview

The application consists of two main components:
- **Backend API**: FastAPI with TensorFlow (Python)
- **Frontend**: React application

We'll deploy both components using Azure App Service and Azure Container Registry.

## Prerequisites

Before you begin, make sure you have:
- An Azure account ([Sign up for free](https://azure.microsoft.com/free/))
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [Docker](https://www.docker.com/get-started) installed (for local testing)
- [Git](https://git-scm.com/downloads) installed

## Deployment Options

There are two ways to deploy this application on Azure:

### Option 1: Using Azure App Service (Recommended for Beginners)
Best for quick deployment with minimal configuration.

### Option 2: Using Azure Container Instances with Container Registry
Best for production deployments with full control.

---

## Option 1: Deploy Using Azure App Service

### Step 1: Login to Azure

```bash
az login
```

This will open a browser window for you to log in to your Azure account.

### Step 2: Create a Resource Group

```bash
# Set your preferred location (e.g., eastus, westus2, westeurope)
LOCATION="eastus"
RESOURCE_GROUP="potato-disease-rg"

az group create --name $RESOURCE_GROUP --location $LOCATION
```

### Step 3: Deploy Backend API

#### 3.1 Create an App Service Plan

```bash
az appservice plan create \
  --name potato-disease-backend-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux
```

#### 3.2 Create Web App for Backend

```bash
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan potato-disease-backend-plan \
  --name potato-disease-backend-<your-unique-id> \
  --runtime "PYTHON:3.9"
```

**Note**: Replace `<your-unique-id>` with a unique identifier (e.g., your name or random numbers) as the app name must be globally unique.

#### 3.3 Configure Backend Deployment

```bash
cd API

# Create a startup.sh file
cat > startup.sh << 'EOF'
#!/bin/bash
python -m pip install --upgrade pip
pip install -r requirement.txt
cd /home/site/wwwroot
python main.py
EOF

# Deploy code to Azure
az webapp up \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-backend-<your-unique-id> \
  --runtime "PYTHON:3.9" \
  --sku B1
```

#### 3.4 Configure App Settings

```bash
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-backend-<your-unique-id> \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Step 4: Deploy Frontend

#### 4.1 Create App Service for Frontend

```bash
az appservice plan create \
  --name potato-disease-frontend-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan potato-disease-frontend-plan \
  --name potato-disease-frontend-<your-unique-id> \
  --runtime "NODE:18-lts"
```

#### 4.2 Configure Frontend Environment

```bash
# Set backend API URL
BACKEND_URL="https://potato-disease-backend-<your-unique-id>.azurewebsites.net"

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-frontend-<your-unique-id> \
  --settings REACT_APP_API_URL=$BACKEND_URL
```

#### 4.3 Deploy Frontend Code

```bash
cd ../frontend

# Build the React app
npm install
npm run build

# Deploy using Azure CLI
az webapp up \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-frontend-<your-unique-id> \
  --html
```

### Step 5: Access Your Application

Your application is now deployed! Access it at:
- **Frontend**: `https://potato-disease-frontend-<your-unique-id>.azurewebsites.net`
- **Backend API**: `https://potato-disease-backend-<your-unique-id>.azurewebsites.net`

You can test the backend API:
```bash
curl https://potato-disease-backend-<your-unique-id>.azurewebsites.net/ping
```

---

## Option 2: Deploy Using Azure Container Registry and Container Instances

This method uses Docker containers for more control over the deployment.

### Step 1: Create Azure Container Registry

```bash
LOCATION="eastus"
RESOURCE_GROUP="potato-disease-rg"
ACR_NAME="potatodiseaseacr<your-unique-id>"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true
```

### Step 2: Build and Push Docker Images

#### 2.1 Backend Image

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Build and push backend image
cd /path/to/Pototo-disease
docker build -t $ACR_NAME.azurecr.io/potato-backend:latest -f Dockerfile .
docker push $ACR_NAME.azurecr.io/potato-backend:latest
```

#### 2.2 Frontend Image

```bash
# Build and push frontend image
cd frontend
docker build -t $ACR_NAME.azurecr.io/potato-frontend:latest -f Dockerfile .
docker push $ACR_NAME.azurecr.io/potato-frontend:latest
```

### Step 3: Deploy Container Instances

#### 3.1 Get ACR Credentials

```bash
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)
```

#### 3.2 Deploy Backend Container

```bash
az container create \
  --resource-group $RESOURCE_GROUP \
  --name potato-backend-container \
  --image $ACR_NAME.azurecr.io/potato-backend:latest \
  --registry-login-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label potato-backend-<your-unique-id> \
  --ports 8000 \
  --cpu 2 \
  --memory 4
```

#### 3.3 Deploy Frontend Container

```bash
# Get backend URL
BACKEND_URL="http://potato-backend-<your-unique-id>.$LOCATION.azurecontainer.io:8000"

az container create \
  --resource-group $RESOURCE_GROUP \
  --name potato-frontend-container \
  --image $ACR_NAME.azurecr.io/potato-frontend:latest \
  --registry-login-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label potato-frontend-<your-unique-id> \
  --ports 80 \
  --environment-variables REACT_APP_API_URL=$BACKEND_URL
```

### Step 4: Get Container URLs

```bash
# Get backend URL
az container show \
  --resource-group $RESOURCE_GROUP \
  --name potato-backend-container \
  --query ipAddress.fqdn \
  --output tsv

# Get frontend URL
az container show \
  --resource-group $RESOURCE_GROUP \
  --name potato-frontend-container \
  --query ipAddress.fqdn \
  --output tsv
```

---

## CI/CD with GitHub Actions

For automated deployments, you can use GitHub Actions. The repository includes workflow files in `.github/workflows/`.

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

- `AZURE_CREDENTIALS`: Your Azure service principal credentials
- `AZURE_WEBAPP_BACKEND_NAME`: Your backend app name
- `AZURE_WEBAPP_FRONTEND_NAME`: Your frontend app name
- `ACR_NAME`: Your Azure Container Registry name (if using containers)
- `ACR_USERNAME`: ACR username
- `ACR_PASSWORD`: ACR password

### Create Azure Service Principal

```bash
az ad sp create-for-rbac \
  --name "potato-disease-github-actions" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth
```

Copy the JSON output and save it as the `AZURE_CREDENTIALS` secret in GitHub.

---

## Cost Estimation

Here's an approximate monthly cost breakdown for running this application on Azure:

| Service | Tier | Monthly Cost (USD) |
|---------|------|-------------------|
| App Service Plan (Backend) | B1 Basic | ~$13 |
| App Service Plan (Frontend) | B1 Basic | ~$13 |
| Container Registry | Basic | ~$5 |
| **Total** | | **~$31/month** |

**Note**: 
- Costs may vary based on your region and usage
- Azure offers a free tier for students and new users
- You can use Azure Cost Management to monitor spending

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port for the API | 8000 |
| `CORS_ORIGINS` | Allowed CORS origins | localhost:3000 |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | https://backend.azurewebsites.net |

---

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
```bash
# Check logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-backend-<your-unique-id>
```

**Problem**: Model not loading
- Ensure the model files are included in the deployment
- Check if the file paths are correct in the code
- Increase memory allocation if needed

### Frontend Issues

**Problem**: Frontend can't connect to backend
- Verify CORS settings in the backend
- Check if the API URL environment variable is set correctly
- Ensure backend is running and accessible

**Problem**: Build fails
```bash
# Check build logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-frontend-<your-unique-id>
```

### General Issues

**Problem**: Out of memory
- Upgrade to a higher tier App Service Plan (e.g., B2 or B3)
- For Container Instances, increase memory allocation

**Problem**: Slow predictions
- Consider using Azure Machine Learning for model serving
- Upgrade to Premium tier for better performance
- Enable autoscaling for high traffic

---

## Monitoring and Logging

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app potato-disease-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app potato-disease-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Configure backend to use Application Insights
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-backend-<your-unique-id> \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

### View Logs

```bash
# Stream backend logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-backend-<your-unique-id>

# Stream frontend logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-frontend-<your-unique-id>
```

---

## Scaling

### Manual Scaling

```bash
# Scale up (increase resources)
az appservice plan update \
  --name potato-disease-backend-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B2

# Scale out (increase instances)
az appservice plan update \
  --name potato-disease-backend-plan \
  --resource-group $RESOURCE_GROUP \
  --number-of-workers 2
```

### Auto-scaling

```bash
# Enable auto-scale (requires Standard tier or higher)
az monitor autoscale create \
  --resource-group $RESOURCE_GROUP \
  --resource potato-disease-backend-<your-unique-id> \
  --resource-type Microsoft.Web/sites \
  --name potato-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1

# Add CPU-based scale-out rule
az monitor autoscale rule create \
  --resource-group $RESOURCE_GROUP \
  --autoscale-name potato-autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1
```

---

## Cleanup

To delete all resources and stop billing:

```bash
# Delete the entire resource group (removes all resources)
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

Or delete individual resources:

```bash
# Delete backend app
az webapp delete \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-backend-<your-unique-id>

# Delete frontend app
az webapp delete \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-frontend-<your-unique-id>

# Delete App Service plans
az appservice plan delete \
  --resource-group $RESOURCE_GROUP \
  --name potato-disease-backend-plan
```

---

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Deploy Python Apps to Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-python)
- [Deploy React Apps to Azure](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Azure service logs
3. Open an issue on the GitHub repository
4. Consult Azure documentation

---

**Happy Deploying! 🚀**
