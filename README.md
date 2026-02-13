# Potato & Tomato Disease Classification 🌿

A simple and effective web application to detect diseases in potato and tomato leaves using Deep Learning.

## 📌 Overview
This project helps farmers and gardeners identify plant diseases by simply uploading a photo of a leaf. The system analyzes the image using a Convolutional Neural Network (CNN) and predicts whether the plant is **Healthy** or suffering from diseases like **Early Blight** or **Late Blight**.

### ✨ Key Features
- **Dual Plant Support**: Works for both Potato and Tomato plants.
- **Easy to Use**: Simple drag-and-drop interface.
- **Fast & Accurate**: Powered by TensorFlow for quick results.

## 🛠️ Prerequisites
Before running the project, make sure you have the following installed on your computer:
- **Python** (version 3.8 or higher)
- **Node.js** (version 14 or higher)

## 🚀 How to Run the Project

Follow these steps to set up and run the application on your machine.

### Step 1: Backend Setup (The Brain)
The backend runs the AI model.

1.  Open your terminal or command prompt.
2.  Navigate to the project folder:
    ```bash
    cd Pototo-disease__V2
    ```
3.  Go into the API folder:
    ```bash
    cd API
    ```
4.  Install the necessary Python libraries:
    ```bash
    pip install -r requirement.txt
    ```
5.  Start the Backend Server:
    ```bash
    python main.py
    ```
    You should see a message saying the server is running at `http://localhost:8000`.

### Step 2: Frontend Setup (The Interface)
The frontend is the website you interact with.

1.  Open a **new** terminal window (keep the backend running in the first one).
2.  Navigate to the project folder and then to the frontend:
    ```bash
    cd Pototo-disease__V2/frontend
    ```
3.  Install the required packages (only needed the first time):
    ```bash
    npm install
    ```
4.  Start the Website:
    ```bash
    npm start
    ```
    The website should automatically open in your browser at `http://localhost:3000`.

---

## ❓ Troubleshooting

If you face any issues, here are some common fixes:

*   **"OpenSSL Error" in Frontend**:
    If you see an error about `digital envelope routines` when running `npm start`:
    *   **Windows**: Run `$env:NODE_OPTIONS="--openssl-legacy-provider"` and then `npm start`.
    *   **Mac/Linux**: Run `export NODE_OPTIONS=--openssl-legacy-provider` and then `npm start`.

*   **"Tomato model not found"**:
    The system will still work for Potatoes! This warning just means the tomato training file wasn't found in the expected folder, but the app will handle it gracefully.

*   **Server not connecting?**:
    Make sure you keep the **Backend terminal open** while using the website. If you close it, the website cannot make predictions.

---

## 📂 Project Structure
*   `API/`: Contains the Python code for the backend server (`main.py`).
*   `frontend/`: Contains the React code for the website.
*   `Training/`: Jupyter notebooks used to train the deep learning models.
*   `saved_models/`: Where the trained models are stored.

---
*Created for a Deep Learning Project Assignment.*
