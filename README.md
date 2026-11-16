# Fake News Detection using LSTM

A Deep Learning project for detecting whether a given news article is **Real or Fake** using an **LSTM (Long Short-Term Memory)** neural network.

The project also includes a web-based application named **TruthLens AI**, which allows users to enter news articles and receive predictions through the trained LSTM model.

## 📌 Project Overview

Fake news can spread rapidly through online platforms and social media. It can be difficult and time-consuming to manually identify whether a piece of news is genuine or misleading.

This project aims to develop a **Deep Learning-based Fake News Detection System** that analyzes textual news data and classifies it as **Real** or **Fake**.

The trained model is integrated into a Flask-based web application called **TruthLens AI**, providing an interactive interface for news analysis.

## 🎯 Problem Statement

The large amount of news content available online makes manual verification difficult. The objective of this project is to build an automated system that learns patterns from labeled news data and predicts whether new news content belongs to the Real or Fake category.

## 💡 Proposed Solution

The project uses **Natural Language Processing (NLP)** and an **LSTM-based Deep Learning model**.

The basic workflow is:

News Text
↓
Data Cleaning
↓
Text Preprocessing
↓
Tokenization
↓
Padding
↓
Embedding
↓
LSTM Model
↓
Classification
↓
Real / Fake

The trained model is integrated with a Flask backend and a web-based frontend to provide predictions through TruthLens AI.

## 🧠 Model

The primary Deep Learning model used in this project is **LSTM (Long Short-Term Memory)**.

LSTM is a type of Recurrent Neural Network (RNN) designed to process sequential data and retain relevant information from earlier parts of a sequence.

For this project, the LSTM model learns patterns from sequences of words in news text.

**Label Mapping:**

- Fake News = 0
- Real News = 1

**Model Performance:**

- Test accuracy: Approximately 94%

## 🌐 TruthLens AI – Web Application

TruthLens AI is the web-based interface developed for the Fake News Detection System.

### Features

- Interactive and responsive user interface
- News article input
- Sample Real News and Fake News buttons
- Clear input functionality
- News analysis using the trained LSTM model
- Real News / Fake News prediction
- Confidence percentage display
- Input validation and error handling

### Application Workflow

User enters news article
↓
Frontend sends request to Flask API
↓
Backend preprocesses the text
↓
Trained LSTM model generates prediction
↓
Prediction and confidence are displayed

## 🛠️ Technologies

- Python
- Pandas
- NumPy
- Scikit-learn
- TensorFlow / Keras
- Flask
- HTML
- CSS
- JavaScript
- Google Colab
- VS Code
- Git
- GitHub

## 📁 Project Structure

```text
fake_news_detection_lstm/
│
├── app.py
├── fake_news_detection_lstm.ipynb
├── requirements.txt
├── README.md
├── .gitignore
│
├── models/
│   ├── fake_news_lstm.keras
│   └── tokenizer.pkl
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    │   └── style.css
    │
    └── js/
        └── script.js
```

### 📂 Folder and File Description

- **README.md** — Contains project overview, objectives, workflow, technologies, and documentation.
- **app.py** — Flask backend responsible for loading the trained model, preprocessing news text, and generating predictions.
- **fake_news_detection_lstm.ipynb** — Google Colab notebook containing data preprocessing, LSTM model development, training, evaluation, and prediction code.
- **requirements.txt** — Lists the Python libraries required to run the project.
- **.gitignore** — Specifies files and folders that should not be uploaded to GitHub.
- **models/** — Contains the trained LSTM model and saved tokenizer.
- **templates/** — Contains the HTML frontend.
- **static/css/** — Contains the application's CSS styling.
- **static/js/** — Contains the frontend JavaScript functionality.

## 📊 Dataset

A labeled fake-news dataset containing real and fake news articles was used for training and testing.

The dataset contains two categories:

- **Fake.csv** — Fake news articles
- **True.csv** — Real news articles

The data was cleaned and preprocessed before being used for model training.

## 📈 Model Evaluation

The trained LSTM model was evaluated using a test dataset.

Evaluation methods included:

- Accuracy
- Confusion Matrix

The model achieved approximately **94% test accuracy**.

## 🚀 Installation and Execution

### Prerequisites

- Python 3.12
- Git
- Trained model file: `models/fake_news_lstm.keras`
- Tokenizer file: `models/tokenizer.pkl`

### 1. Clone the Repository

```bash
git clone https://github.com/ak8127343-eng/fake-news-detection-lstm.git
```

### 2. Navigate to the Project Directory

```bash
cd fake-news-detection-lstm
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

### 4. Activate the Virtual Environment

For Windows:

```bash
venv\Scripts\activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Run the Application

```bash
python app.py
```

The Flask application will start. Keep the terminal running while using the application.

## 🚧 Project Status

### Current Progress

- [x] GitHub repository created
- [x] Project planning
- [x] Dataset selection and exploration
- [x] Data cleaning
- [x] Text preprocessing
- [x] Tokenization
- [x] Padding
- [x] LSTM model development
- [x] Model training
- [x] Model evaluation
- [x] Trained model and tokenizer saved
- [x] Flask backend development
- [x] Web frontend development
- [x] Model integration with web application
- [x] Basic frontend testing
- [x] Complete backend and API testing
- [x] Final documentation
- [x] Final GitHub update

## 🔄 Development Workflow

1. Project setup and planning
2. Dataset selection and exploration
3. Data cleaning and preprocessing
4. Tokenization and padding
5. LSTM model development
6. Model training
7. Model evaluation
8. Fake/Real prediction system
9. Flask backend development
10. Web frontend development
11. Testing and documentation

## 🔮 Future Scope

The system can later be extended with:

- Transformer-based models such as BERT or DistilBERT
- Larger and multilingual datasets
- Real-time news analysis
- Improved text representation techniques
- Enhanced model accuracy and generalization

## 👩‍💻 Project Author

**Ankit Kumar**

---

> This project is developed for learning and academic purposes.

