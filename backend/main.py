import os
import pickle
import string
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem.porter import PorterStemmer

# Ensure NLTK packages are downloaded
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

# Initialize FastAPI App
app = FastAPI(
    title="SMS Spam Classifier API",
    description="Backend ML Inference Service using Naive Bayes Model with TF-IDF Vectorizer",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify front-end domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Text Preprocessing helper exactly matching the training notebook
ps = PorterStemmer()

def transform_text(text: str) -> str:
    # 1. Lowercase
    text = text.lower()
    # 2. Tokenization
    tokens = word_tokenize(text)
    
    # 3. Remove non-alphanumeric tokens
    alnum_tokens = [t for t in tokens if t.isalnum()]
    
    # 4. Remove stopwords and punctuation
    stop_words = set(stopwords.words('english'))
    cleaned_tokens = [
        t for t in alnum_tokens 
        if t not in stop_words and t not in string.punctuation
    ]
    
    # 5. Stemming
    stemmed_tokens = [ps.stem(t) for t in cleaned_tokens]
    
    return " ".join(stemmed_tokens)

# Load pickle files (ML Model & Vectorizer)
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
vectorizer_path = os.path.join(os.path.dirname(__file__), "vectorizer.pkl")

model = None
vectorizer = None

@app.on_event("startup")
def load_models():
    global model, vectorizer
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        with open(vectorizer_path, "rb") as f:
            vectorizer = pickle.load(f)
        print("Model and Vectorizer loaded successfully!")
    except Exception as e:
        print(f"Error loading pickle files: {e}")
        raise RuntimeError(f"Could not load ML assets: {e}")

@app.get("/")
def root():
    return {
        "name": "SMS Spam Classifier API",
        "version": "1.0.0",
        "status": "running",
        "description": "ML-powered API to detect spam SMS messages using Multinomial Naive Bayes",
        "endpoints": {
            "predict": "POST /api/predict",
            "metrics": "GET /api/metrics",
            "docs": "GET /docs"
        }
    }

# Request Schema
class MessageRequest(BaseModel):
    text: str

# Response Schema
class MessageResponse(BaseModel):
    transformed_text: str
    prediction: str  # "Spam" or "Ham"
    label: int       # 1 for Spam, 0 for Ham
    spam_probability: float

@app.post("/api/predict", response_model=MessageResponse)
def predict_spam(request: MessageRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Classifier models are not initialized.")
        
    try:
        # Preprocess text
        transformed = transform_text(request.text)
        
        # Vectorize
        vectorized_text = vectorizer.transform([transformed]).toarray()
        
        # Predict Class
        prediction_val = int(model.predict(vectorized_text)[0])
        
        # Predict Probability
        prob_matrix = model.predict_proba(vectorized_text)[0]
        # In MultinomialNB, index 1 corresponds to Spam class probability
        spam_probability = float(prob_matrix[1])
        
        label_text = "Spam" if prediction_val == 1 else "Ham"
        
        return MessageResponse(
            transformed_text=transformed,
            prediction=label_text,
            label=prediction_val,
            spam_probability=round(spam_probability * 100, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/api/metrics")
def get_model_metrics():
    # Performance metrics from the training stage
    return {
        "selected_model": "Multinomial Naive Bayes (MNB)",
        "vocabulary_features": 3000,
        "accuracy_score": 0.9709,  # TF-IDF max_features=3000 score
        "precision_score": 1.0,    # TF-IDF max_features=3000 score (100% precision - 0 False Positives!)
        "baseline_comparison": [
            {"Algorithm": "Support Vector Classifier (SVC)", "Accuracy": 0.9758, "Precision": 0.9747},
            {"Algorithm": "K-Nearest Neighbors (KNN)", "Accuracy": 0.9052, "Precision": 1.0},
            {"Algorithm": "Multinomial Naive Bayes (MNB)", "Accuracy": 0.9709, "Precision": 1.0},
            {"Algorithm": "Decision Tree Classifier", "Accuracy": 0.9274, "Precision": 0.8118},
            {"Algorithm": "Logistic Regression (LR)", "Accuracy": 0.9584, "Precision": 0.9702},
            {"Algorithm": "Random Forest Classifier (RF)", "Accuracy": 0.9758, "Precision": 0.9829},
            {"Algorithm": "Extra Trees Classifier (ETC)", "Accuracy": 0.9748, "Precision": 0.9745},
            {"Algorithm": "Bernoulli Naive Bayes (BNB)", "Accuracy": 0.9700, "Precision": 0.9734}
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
