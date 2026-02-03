#!/bin/bash
# Azure App Service startup script for backend

echo "Starting Potato Disease Classification Backend..."

# Navigate to API directory
cd /home/site/wwwroot/API || cd /app/API

# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r ../requirements.txt || pip install -r requirements.txt

# Start the application
# Azure sets the PORT environment variable
python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
