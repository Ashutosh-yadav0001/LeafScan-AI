# Potato Disease Classification

This is a web application that helps farmers and agricultural students identify diseases in potato leaves. Just upload a photo of the leaf and it will tell you whether it's healthy or affected by Early Blight or Late Blight.

## About the Project

We built this project using deep learning to classify potato leaf diseases. The model was trained on a dataset of potato leaf images and can identify three conditions:

- **Early Blight** - A fungal infection that causes dark spots on the leaves
- **Late Blight** - A more serious disease that can destroy entire crops
- **Healthy** - No disease found, the leaf is good

## Project Structure

```
Pototo-disease__V2/
├── API/                    # Backend server (FastAPI + Python)
│   ├── main.py            # Main API file
│   └── requirement.txt    # Python packages needed
├── frontend/              # React frontend
│   ├── src/              # React source code
│   └── package.json      # Node packages needed
├── sample_images/         # Sample images for testing
├── Training/              # Dataset used for training
├── saved_models/          # Our trained model
├── Dockerfile             # Docker config for backend
├── docker-compose.yml     # Run entire app with Docker
└── requirements.txt       # Python dependencies (root level)
```

## How to Run

### Prerequisites

Make sure you have these installed on your system:
- Python 3.8 or higher
- Node.js 14 or higher
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/Pototo-disease__V2.git
cd Pototo-disease__V2
```

### Step 2: Setup Python Environment

```bash
# Create virtual environment
python -m venv venv_gpu

# Activate it
.\venv_gpu\Scripts\activate   # Windows
source venv_gpu/bin/activate  # Linux/Mac

# Install Python packages
cd API
pip install -r requirement.txt
cd ..
```

### Step 3: Setup Frontend

```bash
cd frontend
npm install
cd ..
```

Now you are ready to run the project.

---

### Step 4: Start the Backend

Open a terminal and run these commands:

```bash
cd Pototo-disease__V2

# Activate the virtual environment
.\venv_gpu\Scripts\activate   # Windows
source venv_gpu/bin/activate  # Linux/Mac

cd API
pip install -r requirement.txt   # Only needed first time
python main.py
```

The API will start on http://localhost:8000

### Step 5: Start the Frontend

Open another terminal:

```bash
cd Pototo-disease__V2/frontend
npm install   # Only needed first time
npm start
```

If you get an OpenSSL error (common in newer Node versions), use this instead:

```bash
# Windows PowerShell
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm start

# Linux/Mac
NODE_OPTIONS=--openssl-legacy-provider npm start
```

The frontend will open on http://localhost:3000

## API Details

The backend has two endpoints:

| Endpoint | What it does |
|----------|-------------|
| GET `/ping` | Just checks if server is running |
| POST `/predict` | Send image and get disease prediction |

### Example Usage

```python
import requests

# Check if server is up
response = requests.get("http://localhost:8000/ping")
print(response.json())

# Get prediction for an image
with open("leaf_image.jpg", "rb") as f:
    response = requests.post(
        "http://localhost:8000/predict",
        files={"file": f}
    )
print(response.json())
# Output: {"class": "Early Blight", "confidence": 0.95}
```

## Technologies Used

**Backend:**
- Python 3.8+
- TensorFlow 2.10 (for the deep learning model)
- FastAPI (for creating the API)
- Pillow (for image processing)

**Frontend:**
- React 17
- Material UI (for the nice looking components)
- Axios (for making API calls)

## Running with Docker (Alternative)

If you have Docker installed, you can run the entire app without worrying about dependencies:

```bash
# Build and run both frontend and backend
docker-compose up --build
```

This will start:
- Backend API on http://localhost:8000
- Frontend on http://localhost:3000

To stop:
```bash
docker-compose down
```

## Sample Images for Testing

We have included some sample images in the `sample_images` folder that you can use to test the app:

| File | Expected Result |
|------|-----------------|
| early_blight_sample.jpg | Early Blight |
| late_blight_sample.jpg | Late Blight |
| healthy_sample.jpg | Healthy |

Just upload any of these to the frontend and see the prediction.

## Common Issues

**OpenSSL Error:** If npm start gives crypto errors, add the `--openssl-legacy-provider` flag as shown above.

**Model Loading Slow:** First time loading takes a bit as TensorFlow initialises. After that its faster.

**Image Not Working:** Make sure the image is a proper photo of a potato leaf. The model rejects images that are too dark, too bright, or dont look like leaves.

## Deployment on Azure ☁️

Want to deploy this project on Microsoft Azure? We've got you covered!

Check out our comprehensive **[Azure Deployment Guide](AZURE_DEPLOYMENT.md)** for step-by-step instructions on:

- 🚀 Deploying with Azure App Service
- 🐳 Deploying with Azure Container Registry and Container Instances
- 🔄 Setting up CI/CD with GitHub Actions
- 📊 Monitoring and logging
- 💰 Cost estimation
- 🔧 Troubleshooting common issues

The guide includes multiple deployment options suitable for different needs and budgets, from quick deployments for testing to production-ready setups with auto-scaling.

**Quick Start:**
```bash
# Login to Azure
az login

# Deploy using Azure CLI (see full guide for details)
az webapp up --runtime PYTHON:3.9 --sku B1
```

For complete instructions, see [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)

## Note

This project was made for learning purposes. The model works well on the test dataset but may not be 100% accurate on all real world images. Always consult an agricultural expert for proper diagnosis.

---

Made as part of academic project work.
