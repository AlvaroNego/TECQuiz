from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Permite todas as origens por padrão

CADASTROS_FILE = os.path.join(os.path.dirname(__file__), "cadastros.json")
TOKEN = '2005'

# Função para carregar os cadastros
def carregar_cadastros():
    if os.path.exists(CADASTROS_FILE):
        with open(CADASTROS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Função para salvar os cadastros
def salvar_cadastros(cadastros):
    with open(CADASTROS_FILE, 'w', encoding='utf-8') as f:
        json.dump(cadastros, f, indent=4, ensure_ascii=False)

# Garantir arquivo de cadastros
if not os.path.exists(CADASTROS_FILE):
    with open(CADASTROS_FILE, "w") as f:
        json.dump([], f)

# ✅ Rota para cadastrar usuário
@app.route('/cadastro', methods=['POST'])
def cadastrar():
    dados = request.json
    cadastros = carregar_cadastros()

    # Checar se email já existe
    for c in cadastros:
        if c['email'] == dados['email']:
            return jsonify({'status': 'error', 'message': 'Este e-mail já foi cadastrado.'}), 400

    cadastros.append(dados)
    salvar_cadastros(cadastros)
    return jsonify({'status': 'success', 'message': 'Cadastro realizado com sucesso!'})

# ✅ Rota para baixar cadastros
@app.route('/download-cadastros')
def download_cadastros():
    return send_file(CADASTROS_FILE, as_attachment=True)

# ✅ Rota para limpar cadastros com token
@app.route('/limpar-cadastros')
def limpar_cadastros():
    token = request.args.get('token')
    if token != TOKEN:
        return jsonify({'status': 'error', 'message': 'Acesso negado. Token inválido.'}), 403

    salvar_cadastros([])  # limpa o arquivo
    return jsonify({'status': 'success', 'message': 'Todos os cadastros foram apagados.'})

@app.route("/")
def home():
    return render_template("quiz.html")

#@app.route("/quiz")
#def quiz():
#    return render_template("quiz.html")
#
#@app.route("/ja-jogou")
#def ja_jogou():
#    return render_template("ja_jogou.html")

#@app.route("/cadastrar", methods=["POST"])
#def cadastrar():
#    data = request.get_json()
#    email = data.get("email")
#
#    with open(CADASTROS_FILE, "r") as f:
#        cadastros = json.load(f)
#
#    # Verificar duplicidade
#    if any(c["email"] == email for c in cadastros):
#        return jsonify({"status": "error", "message": "Email já cadastrado"})
#
#    # Adicionar novo cadastro
#    cadastros.append(data)
#
#    with open(CADASTROS_FILE, "w") as f:
#        json.dump(cadastros, f, indent=4)
#
#    return jsonify({"status": "success", "message": "Cadastro realizado"})
    
#@app.route('/download-cadastros')
#def download_cadastros():
#    return send_file(CADASTROS_FILE, as_attachment=True)



if __name__ == "__main__":
    app.run(debug=True)
