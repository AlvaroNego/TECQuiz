from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

CADASTROS_FILE = "cadastros.json"

# Garantir arquivo de cadastros
if not os.path.exists(CADASTROS_FILE):
    with open(CADASTROS_FILE, "w") as f:
        json.dump([], f)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")

@app.route("/ja-jogou")
def ja_jogou():
    return render_template("ja_jogou.html")

@app.route("/cadastrar", methods=["POST"])
def cadastrar():
    data = request.get_json()
    email = data.get("email")

    with open(CADASTROS_FILE, "r") as f:
        cadastros = json.load(f)

    # Verificar duplicidade
    if any(c["email"] == email for c in cadastros):
        return jsonify({"status": "error", "message": "Email já cadastrado"})

    # Adicionar novo cadastro
    cadastros.append(data)

    with open(CADASTROS_FILE, "w") as f:
        json.dump(cadastros, f, indent=4)

    return jsonify({"status": "success", "message": "Cadastro realizado"})
    
if __name__ == "__main__":
    app.run(debug=True)
