from fastapi import FastAPI, File, UploadFile, Form
import tensorflow as tf
import numpy as np
import joblib
from PIL import Image
import io
from datetime import datetime

classifier = tf.keras.models.load_model("urban_issue_classifier.keras")
severity_model = joblib.load("severity_predictor.pkl")

CLASS_NAMES = ['garbage', 'normal', 'pothole', 'waterlogging']

def severity_to_priority(severity):
    if severity <= 2:
        return "Low"
    elif severity == 3:
        return "Medium"
    elif severity == 4:
        return "High"
    else:
        return "Emergency"

app = FastAPI(title="Urban Issue AI Inference Service")

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image) / 127.5 - 1.0
    return np.expand_dims(image, axis=0)

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    description_length: int = Form(...),
    location_freq: int = Form(...)
):
    image_bytes = await file.read()
    img = preprocess_image(image_bytes)

    preds = classifier.predict(img)
    issue_idx = int(np.argmax(preds))
    confidence = float(np.max(preds))

    hour = datetime.now().hour

    severity = int(
        severity_model.predict(
            [[issue_idx, confidence, hour, location_freq, description_length]]
        )[0]
    )

    return {
        "issue_type": CLASS_NAMES[issue_idx],
        "issue_index": issue_idx,
        "confidence": round(confidence, 3),
        "severity": severity,
        "priority": severity_to_priority(severity)
    }
