# Backend - API

This folder contains the Python code for the backend server.

## Files
*   `main.py`: This is the main file. It uses FastAPI to create the web server. It loads the trained model and makes predictions.
*   `requirement.txt`: Lists all the libraries needed, like tensorflow and fastapi.

## How it works
1.  The server loads the saved models from the hard drive.
2.  When a user uploads an image, the `predict` function is called.
3.  The image is converted to a numpy array.
4.  The model predicts the class (disease) and confidence.
5.  The result is sent back to the frontend.
