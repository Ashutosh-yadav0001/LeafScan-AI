
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load both models
print("Loading models...")

# Potato model
POTATO_MODEL_PATH = "../saved_models/1"
if os.path.exists(POTATO_MODEL_PATH):
    POTATO_MODEL = tf.keras.models.load_model(POTATO_MODEL_PATH)
    print("✅ Potato model loaded from SavedModel")
else:
    POTATO_MODEL = tf.keras.models.load_model("../Training/potatoes.h5")
    print("✅ Potato model loaded from .h5 file")

# Tomato model
TOMATO_MODEL_PATH = "../saved_models/tomato/2"
if os.path.exists(TOMATO_MODEL_PATH):
    TOMATO_MODEL = tf.keras.models.load_model(TOMATO_MODEL_PATH)
    print("✅ Tomato model loaded from SavedModel")
elif os.path.exists("../Training/tomatoes.h5"):
    TOMATO_MODEL = tf.keras.models.load_model("../Training/tomatoes.h5")
    print("✅ Tomato model loaded from .h5 file")
else:
    TOMATO_MODEL = None
    print("Tomato model not found")

# Class names for each model
POTATO_CLASSES = ["Early Blight", "Late Blight", "Healthy"]

TOMATO_CLASSES = [
    "Bacterial Spot",
    "Early Blight", 
    "Healthy",
    "Late Blight",
    "Leaf Mold",
    "Septoria Leaf Spot",
    "Spider Mites (Two-spotted)",
    "Target Spot",
    "Tomato Mosaic Virus",
    "Yellow Leaf Curl Virus"
]

# Minimum confidence threshold
CONFIDENCE_THRESHOLD = 0.50

# Expected image size for the model
IMAGE_SIZE = 256

@app.get("/ping")
async def ping():
    return "Hello, I am alive"

@app.get("/models")
async def get_models():
    """Return available models"""
    return {
        "models": ["potato", "tomato"],
        "potato_classes": POTATO_CLASSES,
        "tomato_classes": TOMATO_CLASSES
    }

def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data))
    # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
    if image.mode != 'RGB':
        image = image.convert('RGB')
    # Resize to expected size
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    return np.array(image)

def is_valid_leaf_image(image: np.ndarray) -> tuple[bool, str]:
    '''
    Check if the uploaded image is valid.
    It should be an RGB image and not too dark or bright.
    '''
    if len(image.shape) != 3 or image.shape[2] != 3:
        return False, "Invalid image format. Please upload a color image."
    
    # Calculate average color channels
    avg_red = np.mean(image[:, :, 0])
    avg_green = np.mean(image[:, :, 1])
    avg_blue = np.mean(image[:, :, 2])
    
    # Check for very dark or very bright images
    brightness = (avg_red + avg_green + avg_blue) / 3
    if brightness < 30:
        return False, "Image is too dark. Please upload a clearer photo."
    if brightness > 240:
        return False, "Image is too bright/overexposed. Please upload a clearer photo."
    
    return True, ""

@app.post("/predict")
async def predict(
        file: UploadFile = File(...),
        plant_type: str = "potato"
):
    '''
    Function to predict the disease.
    '''
    # Validate plant type
    plant_type = plant_type.lower()
    if plant_type not in ["potato", "tomato"]:
        raise HTTPException(status_code=400, detail="Invalid plant type. Use 'potato' or 'tomato'.")
    
    # Check if tomato model is available
    if plant_type == "tomato" and TOMATO_MODEL is None:
        raise HTTPException(status_code=503, detail="Tomato model not available.")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Please upload an image file.")
    
    try:
        image = read_file_as_image(await file.read())
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not process the image. Please upload a valid image file.")
    
    # Basic image validation
    is_valid, error_msg = is_valid_leaf_image(image)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    img_batch = np.expand_dims(image, 0)
    
    # Select model and class names based on plant type
    if plant_type == "potato":
        model = POTATO_MODEL
        class_names = POTATO_CLASSES
    else:
        model = TOMATO_MODEL
        class_names = TOMATO_CLASSES
    
    print(f"Predicting with {plant_type} model...")
    predictions = model.predict(img_batch)
    
    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = float(np.max(predictions[0]))
    print(f"Result: {predicted_class} ({confidence*100:.1f}%)")
    
    # Check if confidence is above threshold
    if confidence < CONFIDENCE_THRESHOLD:
        raise HTTPException(
            status_code=400, 
            detail=f"This doesn't look like a {plant_type} leaf. Please upload a clear photo."
        )
    
    return {
        'class': predicted_class,
        'confidence': confidence,
        'plant_type': plant_type
    }

# Legacy endpoint for backward compatibility
@app.post("/predict/potato")
async def predict_potato(file: UploadFile = File(...)):
    return await predict(file=file, plant_type="potato")

@app.post("/predict/tomato")
async def predict_tomato(file: UploadFile = File(...)):
    return await predict(file=file, plant_type="tomato")

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)