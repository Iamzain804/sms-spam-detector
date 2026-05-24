---
title: SMS Spam Detector
emoji: 📩
colorFrom: blue
colorTo: green
sdk: docker
app_file: main.py
pinned: false
---

# 📩 SMS Spam Detector

Ever wondered if that suspicious text message is spam? This project uses **Machine Learning** to instantly classify any SMS message as **Spam** or **Ham (Not Spam)** — with high accuracy and zero false positives.

---

## 🚀 Live Demo

🔗 [Try it on Hugging Face Spaces](https://huggingface.co/spaces/MuhammadZain09/sms-spam-detector)

---

## 🧠 How It Works

1. You send an SMS message to the API
2. The text goes through **preprocessing** — lowercasing, tokenization, stopword removal, and stemming
3. It's then **vectorized** using TF-IDF (top 3000 features)
4. A **Multinomial Naive Bayes** model predicts whether it's Spam or Ham
5. You get back the prediction along with a spam probability score

---

## 📊 Model Performance

The model was trained and evaluated against multiple algorithms:

| Algorithm | Accuracy | Precision |
|-----------|----------|-----------|
| **Multinomial Naive Bayes (MNB)** ✅ | 97.09% | **100%** |
| Support Vector Classifier (SVC) | 97.58% | 97.47% |
| Random Forest Classifier | 97.58% | 98.29% |
| Logistic Regression | 95.84% | 97.02% |
| K-Nearest Neighbors | 90.52% | 100% |
| Decision Tree | 92.74% | 81.18% |

> ✅ **MNB was chosen** because it achieves **100% Precision** — meaning zero false positives. A legitimate message will never be wrongly flagged as spam.

---

## 📈 Visual Insights

<table>
  <tr>
    <td><img src="research/spam_wordcloud.png" width="300" alt="Spam Word Cloud"/><br><center>Spam Word Cloud</center></td>
    <td><img src="research/ham_wordcloud.png" width="300" alt="Ham Word Cloud"/><br><center>Ham Word Cloud</center></td>
  </tr>
  <tr>
    <td><img src="research/heatmap.png" width="300" alt="Correlation Heatmap"/><br><center>Correlation Heatmap</center></td>
    <td><img src="research/confusion_matrix.png" width="300" alt="Confusion Matrix"/><br><center>Confusion Matrix</center></td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | Scikit-learn (Multinomial Naive Bayes) |
| Text Processing | NLTK (Tokenization, Stemming, Stopwords) |
| Vectorization | TF-IDF (max 3000 features) |
| Backend API | FastAPI + Uvicorn |
| Containerization | Docker |
| Deployment | Hugging Face Spaces |

---

## 📡 API Usage

**Endpoint:** `POST /api/predict`

```json
{
  "text": "Congratulations! You've won a free iPhone. Click here to claim now!"
}
```

**Response:**
```json
{
  "transformed_text": "congratul won free iphon click claim",
  "prediction": "Spam",
  "label": 1,
  "spam_probability": 99.87
}
```

**Model Metrics:** `GET /api/metrics`

---

## 📁 Project Structure

```
sms-spam-detector/
├── backend/
│   ├── main.py          # FastAPI app
│   ├── model.pkl        # Trained MNB model
│   ├── vectorizer.pkl   # TF-IDF vectorizer
│   └── requirements.txt
├── research/
│   ├── Sms_spam_detection.ipynb  # Training notebook
│   └── *.png                     # Visualizations
├── Dockerfile
└── README.md
```

---

## 👨‍💻 Author

Made with ❤️ by **Muhammad Zain**
