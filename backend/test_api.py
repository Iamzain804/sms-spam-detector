import os
import pickle
from main import transform_text

print("Testing text transformation...")
raw_sms = "WINNER!! As a valued network customer you have been selected to receivea £900 prize reward! Claim call 09061701461. Claim code KL341. Valid 12 hours only."
processed = transform_text(raw_sms)
print(f"Original SMS: {raw_sms}")
print(f"Transformed SMS: {processed}")

print("\nTesting model prediction loading...")
model_path = "model.pkl"
vectorizer_path = "vectorizer.pkl"

with open(model_path, "rb") as f:
    model = pickle.load(f)
with open(vectorizer_path, "rb") as f:
    vectorizer = pickle.load(f)

vectorized = vectorizer.transform([processed]).toarray()
pred = model.predict(vectorized)[0]
prob = model.predict_proba(vectorized)[0]

print(f"Prediction result class: {pred} ({'Spam' if pred == 1 else 'Ham'})")
print(f"Probability details: Ham = {prob[0]*100:.2f}%, Spam = {prob[1]*100:.2f}%")

if pred == 1:
    print("SUCCESS: Model correctly identified Spam!")
else:
    print("WARNING: Model missed spam. Check feature processing alignment.")
