// --- Estado ---
let perguntas = [];
let perguntasSelecionadas = [];
let perguntaAtual = 0;
let acertos = 0;
let timer = null;
let tempoRestante = 30;

// --- Elementos ---
const startScreen   = document.getElementById("start-screen");
const quizScreen    = document.getElementById("quiz-screen");
const resultScreen  = document.getElementById("result-screen");

const statusMsg     = document.getElementById("status-msg");
const startBtn      = document.getElementById("start-btn");

const questionEl    = document.getElementById("question");
const answersEl     = document.getElementById("answers");
const timerEl       = document.getElementById("timer");
const progressEl    = document.getElementById("progress");

const resultTextEl  = document.getElementById("result-text");
const playAgainBtn  = document.getElementById("play-again");
const backHomeBtn   = document.getElementById("back-home");

// --- Util ---
const hidden = el => el.classList.add("hidden");
const show   = el => el.classList.remove("hidden");

function embaralhar(array){
  // Fisher–Yates
  const a = array.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function selecionar5Perguntas(){
  const pool = embaralhar(perguntas);
  return pool.slice(0, Math.min(5, pool.length));
}

// --- Carregar perguntas ---
async function carregarPerguntas(){
  // Aviso se estiver rodando via file://
  if (location.protocol === "file:"){
    show(statusMsg);
    statusMsg.textContent = "Dica: abra com Live Server no VSCode (fetch de JSON não funciona com file://).";
  }
  try{
    const resp = await fetch("/static/perguntas.json", { cache: "no-store" });
    if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
    perguntas = await resp.json();

    if(!Array.isArray(perguntas) || perguntas.length === 0){
      throw new Error("JSON vazio ou inválido.");
    }
  }catch(err){
    // Fallback mínimo para não travar a demo
    show(statusMsg);
    statusMsg.textContent = "Não foi possível carregar 'perguntas.json'. Usando perguntas de fallback.";
    perguntas = [
      { pergunta:"Fallback: capital do Brasil?", respostas:["RJ","Brasília","SP","BH"], correta:1 },
      { pergunta:"Fallback: símbolo do Ferro?", respostas:["Fe","Ir","Pb","Cu"], correta:0 },
      { pergunta:"Fallback: fórmula da água?", respostas:["H2","O2","H2O","HO2"], correta:2 },
      { pergunta:"Fallback: planeta vermelho?", respostas:["Marte","Vênus","Mercúrio","Júpiter"], correta:0 },
      { pergunta:"Fallback: ano da Lua?", respostas:["1965","1969","1972","1975"], correta:1 }
    ];
  }
}

// --- Fluxo do jogo ---
function iniciarQuiz(){
  hidden(startScreen);
  show(quizScreen);

  perguntasSelecionadas = selecionar5Perguntas();
  perguntaAtual = 0;
  acertos = 0;

  mostrarPergunta();
}

function mostrarPergunta(){
  limparTimer();
  const p = perguntasSelecionadas[perguntaAtual];

  progressEl.textContent = `Pergunta ${perguntaAtual+1}/${perguntasSelecionadas.length}`;
  questionEl.textContent = p.pergunta;

  answersEl.innerHTML = "";
  p.respostas.forEach((texto, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = texto;
    btn.onclick = () => verificarResposta(idx, btn);
    answersEl.appendChild(btn);
  });

  tempoRestante = 30;
  timerEl.textContent = `Tempo: ${tempoRestante}s`;
  iniciarTimer();
}

function iniciarTimer(){
  limparTimer();
  timer = setInterval(() => {
    tempoRestante--;
    timerEl.textContent = `Tempo: ${tempoRestante}s`;
    if (tempoRestante <= 0){
      limparTimer();
      verificarResposta(-1, null); // tempo esgotado, conta como erro
    }
  }, 1000);
}

function limparTimer(){
  if (timer){
    clearInterval(timer);
    timer = null;
  }
}

function verificarResposta(indiceEscolhido, btnClicado){
  limparTimer();

  const p = perguntasSelecionadas[perguntaAtual];
  const botoes = Array.from(answersEl.querySelectorAll(".option"));

  // Desabilita tudo
  botoes.forEach(b => b.disabled = true);

  if (indiceEscolhido === p.correta){
    acertos++;
    if (btnClicado) btnClicado.classList.add("correct");
    else botoes[p.correta].classList.add("correct"); // caso tempo esgote sem clique
  } else {
    if (btnClicado) btnClicado.classList.add("wrong");
    botoes[p.correta].classList.add("correct");
  }

  // Pausa breve para o usuário ver o feedback
  setTimeout(() => {
    perguntaAtual++;
    if (perguntaAtual < perguntasSelecionadas.length){
      mostrarPergunta();
    } else {
      finalizarQuiz();
    }
  }, 1200);
}

function finalizarQuiz(){
  hidden(quizScreen);
  show(resultScreen);

  if (acertos === perguntasSelecionadas.length){
    resultTextEl.textContent = `🎉 Parabéns! Você acertou ${acertos}/${perguntasSelecionadas.length} e ganhou o brinde!`;
  } else {
    resultTextEl.textContent = `Você acertou ${acertos}/${perguntasSelecionadas.length}. Tente novamente!`;
  }
}

// --- Controles ---
startBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // --- Validação do cadastro ---
  const nome   = document.getElementById("nome").value.trim();
  const empresa= document.getElementById("empresa").value.trim();
  const cargo  = document.getElementById("cargo").value;
  const email  = document.getElementById("email").value.trim();
  const promo  = document.getElementById("promo").checked;
  const msg    = document.getElementById("cadastro-msg");

  if(!nome || !empresa || !cargo || !email || promo === false){
    msg.textContent = "⚠ Preencha todos os campos antes de começar.";
    return;
  }

  // --- Envia para Google Forms ---
  const formURL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdqP6PJmmrzDglGUHbT88BzlqpKc0Kf3jkh8KZMFzghiarLYQ/formResponse";
  const formData = new FormData();
  formData.append("entry.256952764", nome);
  formData.append("entry.2095918796", empresa);
  formData.append("entry.1632623222", cargo);
  formData.append("entry.1737381222", email);

  fetch(formURL, {
    method: "POST",
    body: formData,
    mode: "no-cors"
  }).then(() => {
    // Google não responde JSON (no-cors), mas já salva
    msg.textContent = "";
    iniciarQuiz(); // inicia quiz normalmente
  }).catch(err => {
    msg.textContent = "⚠ Erro ao salvar cadastro.";
    console.error(err);
  });

  // --- Inicia o quiz normalmente ---
  if (perguntas.length === 0) {
    await carregarPerguntas();
  }
  iniciarQuiz();
});

playAgainBtn.addEventListener("click", () => {
  hidden(resultScreen);
  show(quizScreen);
  perguntasSelecionadas = selecionar5Perguntas();
  perguntaAtual = 0;
  acertos = 0;
  mostrarPergunta();
});

backHomeBtn.addEventListener("click", () => {
  hidden(resultScreen);
  show(startScreen);
});


// Pré-carrega perguntas ao abrir (mostra tela inicial mesmo se falhar)
carregarPerguntas();
