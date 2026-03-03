# 🌿 LeafScan AI — Plant Disease Detection

![Python](https://img.shields.io/badge/Python-3.8--3.10-blue?logo=python)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.10-orange?logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)

A full-stack web application that uses Deep Learning (CNN) to detect diseases in **Potato** and **Tomato** leaves from a simple photo upload.

> Built with TensorFlow, FastAPI, and React.

---

## 📸 What It Does

Upload a photo of a potato or tomato leaf → the AI instantly tells you:
- ✅ **Healthy** — your plant looks good
- ⚠️ **Disease Detected** — identifies the specific disease with confidence %

### Supported Diseases

| Potato (3 classes) | Tomato (10 classes) |
|---|---|
| Early Blight | Bacterial Spot |
| Late Blight | Early Blight |
| Healthy | Healthy |
| | Late Blight |
| | Leaf Mold |
| | Septoria Leaf Spot |
| | Spider Mites (Two-spotted) |
| | Target Spot |
| | Tomato Mosaic Virus |
| | Yellow Leaf Curl Virus |

---

## 🛠️ Prerequisites

Make sure these are installed on your laptop before starting:

| Tool | Version | Download |
|---|---|---|
| **Python** | 3.8 – 3.10 | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 14+ | [nodejs.org](https://nodejs.org/) |
| **Git** | Any | [git-scm.com](https://git-scm.com/downloads) |

> ⚠️ **Python 3.11+ users:** TensorFlow 2.10.1 does not support Python 3.11+. Use Python 3.10 or below.

---

## 🚀 Quick Start (Step-by-Step)

### 1. Clone the Repository

```bash
git clone https://github.com/Ashutosh-yadav0001/Pototo-disease.git
cd Pototo-disease
```

### 2. Set Up Python Environment (Recommended)

Create a virtual environment to keep your system clean:

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

This installs: TensorFlow, FastAPI, Uvicorn, Pillow, NumPy, etc.

### 4. Start the Backend (API Server)

Open a terminal and run:

```bash
cd backend
python main.py
```

You should see:
```
Loading models...
✅ Potato model loaded from SavedModel
✅ Tomato model loaded from SavedModel
INFO:     Uvicorn running on http://localhost:8000
```

> 🟢 Keep this terminal open! The backend must stay running.

### 5. Start the Frontend (Website)

Open a **second terminal** and run:

```bash
cd frontend
npm install
npm start
```

The website will open automatically at **http://localhost:3000** 🎉

---

## 🎮 How to Use

1. Open **http://localhost:3000** in your browser
2. Select plant type: **🥔 Potato** or **🍅 Tomato**
3. Drag & drop a leaf image (or click to browse)
4. View the result: disease name + confidence percentage
5. Check prediction history by expanding the "Recent Predictions" panel

### API Documentation

FastAPI provides interactive docs at: **http://localhost:8000/docs**

You can test the API directly from the browser using the Swagger UI.

---

## 📂 Project Structure

```
Pototo-disease/
│
├── backend/                      # Backend API server
│   ├── main.py                   # FastAPI app — loads models, handles predictions
│   ├── Dockerfile                # Docker support for backend
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # API-specific documentation
│
├── frontend/                     # React web application
│   ├── src/
│   │   ├── home.js               # Main page with upload, prediction, history
│   │   ├── App.js                # App root component
│   │   ├── index.js              # App entry point
│   │   └── index.css             # Global styles
│   ├── Dockerfile                # Docker support for frontend
│   └── package.json              # Node.js dependencies
│
├── Training/                     # Model training notebooks
│   ├── Training.ipynb            # Potato model training (Jupyter Notebook)
│   ├── Training_Tomato.ipynb     # Tomato model training (50 epochs)
│   └── PlantVillage/             # Training dataset (not included in repo)
│
├── saved_models/                 # Trained model weights
│   ├── potato/                   # Potato model (SavedModel format)
│   └── tomato/2/                 # Tomato model (SavedModel format)
│
├── sample_images/                # Test images for quick testing
│
├── docs/                         # Additional documentation
│   └── GPU_SETUP_NOTES.txt       # GPU/CUDA setup reference
│
├── docker-compose.yml            # Docker Compose for full stack
└── .gitignore
```

---

## 🐳 Docker (Alternative Setup)

If you prefer Docker over manual setup:

```bash
docker-compose up --build
```

This starts both backend (`:8000`) and frontend (`:3000`) automatically.

---

## ❓ Troubleshooting

### "OpenSSL Error" when running `npm start`

If you see `ERR_OSSL_EVP_UNSUPPORTED` or `digital envelope routines`:

**Windows (PowerShell):**
```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

**Mac/Linux:**
```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

### "Tomato model not found"

This means `saved_models/tomato/2/` is missing. The app will still work for potato predictions. To fix:
- Make sure you cloned the full repository (including large files)
- Or retrain the tomato model using `Training/Training_Tomato.ipynb`

### Backend won't start / TensorFlow errors

- Ensure you're using **Python 3.8–3.10** (not 3.11+)
- Ensure TensorFlow is installed: `pip install tensorflow==2.10.1`
- For GPU acceleration, see `docs/GPU_SETUP_NOTES.txt`

### Frontend can't connect to backend

- Make sure the backend is running in a separate terminal (`cd backend && python main.py`)
- The frontend proxies API calls to `http://localhost:8000` (configured in `package.json`)

---

## 🧠 Model Details

| | Potato Model | Tomato Model |
|---|---|---|
| **Architecture** | CNN (6 Conv2D layers) | CNN (6 Conv2D layers) |
| **Input Size** | 256 × 256 px | 256 × 256 px |
| **Classes** | 3 | 10 |
| **Test Accuracy** | 97.2% | 89.6% |
| **Framework** | TensorFlow 2.10 | TensorFlow 2.10 |
| **Training Epochs** | 50 | 50 |
| **Dataset** | PlantVillage (2,152 images) | PlantVillage (16,011 images) |

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Deep Learning** | TensorFlow / Keras (CNN) |
| **Backend API** | FastAPI + Uvicorn |
| **Frontend** | React 18 + Material UI 5 |
| **Image Processing** | Pillow, NumPy |
| **Deployment** | Docker + Docker Compose |

---

## 👤 Author

**Ashutosh Yadav**
- GitHub: [@Ashutosh-yadav0001](https://github.com/Ashutosh-yadav0001)

---

*Created as a Deep Learning academic project — B.Sc. (Hons) Data Science & AI*
