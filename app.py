from flask import Flask, render_template, request, session, jsonify
import hashlib
from datetime import datetime

app = Flask(__name__)
app.secret_key = "change_this_to_a_random_secret"


def generate_hashes(text: str):
    return {
        "MD5": hashlib.md5(text.encode()).hexdigest(),
        "SHA1": hashlib.sha1(text.encode()).hexdigest(),
        "SHA256": hashlib.sha256(text.encode()).hexdigest(),
        "SHA512": hashlib.sha512(text.encode()).hexdigest(),
    }


@app.route("/")
def index():
    if "history" not in session:
        session["history"] = []
    return render_template("index.html", history=session["history"])


@app.route("/generate", methods=["POST"])
def generate():
    data = request.json or {}
    text = data.get("text", "")

    result = generate_hashes(text)

    entry = {
        "text": text,
        "hashes": result,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    session["history"].append(entry)
    session.modified = True

    return jsonify({"status": "success", "hashes": result, "entry": entry})


@app.route("/clear", methods=["POST"])
def clear():
    session["history"] = []
    session.modified = True
    return jsonify({"status": "cleared"})


if __name__ == "__main__":
    app.run(debug=True)
