document.getElementById('cadastroForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita reload da página

    // Pega os dados do formulário
    const nome = document.getElementById('nome').value;
    const empresa = document.getElementById('empresa').value;
    const cargo = document.getElementById('cargo').value;
    const email = document.getElementById('email').value;
    const aceitaPromocoes = document.getElementById('aceita-promocoes').checked;

    // Monta o objeto
    const dados = {
        nome: nome,
        empresa: empresa,
        cargo: cargo,
        email: email,
        aceitaPromocoes: aceitaPromocoes
    };

    // Faz a requisição POST para o backend
    fetch('/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Se cadastro OK, esconde tela de cadastro e mostra quiz
            document.getElementById('cadastro-container').style.display = 'none';
            document.getElementById('quiz-container').style.display = 'block';
        } else {
            alert(data.message); // Mostra mensagem de erro (ex.: e-mail já cadastrado)
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar os dados. Tente novamente.');
    });
});