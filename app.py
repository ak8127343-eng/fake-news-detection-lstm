
from flask import Flask, request, jsonify, render_template
import tensorflow as tf
import pickle
from tensorflow.keras.preprocessing.sequence import pad_sequences

app = Flask(__name__)

# Load trained LSTM model
model = tf.keras.models.load_model(
    "models/fake_news_lstm.keras"
)

# Load tokenizer
with open("models/tokenizer.pkl", "rb") as file:
    tokenizer = pickle.load(file)

# Same sequence length used during training
MAX_LENGTH = 300


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        news = data.get("news", "").strip()

        if not news:
            return jsonify({"error": "Please enter news text"}), 400

        # Convert text into sequences
        sequence = tokenizer.texts_to_sequences([news])

        # Padding
        padded = pad_sequences(
            sequence,
            maxlen=MAX_LENGTH,
            padding="post",
            truncating="post"
        )

        # Model prediction
        result = float(model.predict(padded, verbose=0)[0][0])

        # Classification
        if result >= 0.5:
            label = "Real News"
        else:
            label = "Fake News"

        return jsonify({
            "prediction": label,
            "confidence": round(result * 100 if result >= 0.5 else (1 - result) * 100, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
