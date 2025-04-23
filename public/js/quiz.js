// Elementos do DOM para o Quiz
const quizTitle = document.getElementById('quiz-title');
const questionCounter = document.getElementById('question-counter');
const pointsCounter = document.getElementById('points-counter');
const quizProgress = document.getElementById('quiz-progress');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const finalScore = document.getElementById('final-score');
const performanceMessage = document.getElementById('performance-message');
const soundCorrect = document.getElementById('sound-correct');
const soundWrong = document.getElementById('sound-wrong');

// Variáveis de controle do Quiz
let questions = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
let score = 0;
let incorrectQuestions = [];
let isReviewMode = false;
let chapterFile = null;

// Função para inicializar o quiz
function initializeQuiz(chapter, file) {
  console.log(chapter);
  // Reset das variáveis
  currentQuestionIndex = 0;
  score = 0;
  incorrectQuestions = [];
  isReviewMode = false;
  chapterFile = file;
  
  // Configurar título
  quizTitle.textContent = `Quiz: ${chapter.assunto}`;
  
  // Preparar perguntas (embaralhando-as)
  questions = [...chapter.perguntas];
  shuffleArray(questions);
  totalQuestions = questions.length;
  
  // Atualizar contador de perguntas
  updateQuestionCounter();
  updateScoreDisplay();
  
  // Carregar primeira pergunta
  loadQuestion();
}

// Função para carregar uma pergunta
function loadQuestion() {
  // Verificar se ainda há perguntas
  if (currentQuestionIndex >= questions.length) {
    // Se não há mais perguntas, verificar se há incorretas para revisar
    if (incorrectQuestions.length > 0 && !isReviewMode) {
      startReviewMode();
    } else {
      // Se não há mais perguntas (ou já revisou as incorretas), mostrar resultados
      showResults();

    }
    return;
  }
  
  // Obter a pergunta atual
  const question = questions[currentQuestionIndex];
  
  // Atualizar o texto da pergunta
  questionText.textContent = question.pergunta;
  
  // Limpar opções anteriores
  optionsContainer.innerHTML = '';
  
  // Criar uma cópia das alternativas para embaralhar
  const shuffledOptions = [...question.alternativas];
  shuffleArray(shuffledOptions);
  
  // Adicionar as opções
  shuffledOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'btn btn-outline-primary';
    button.textContent = option;
    
    // Adicionar evento de clique para verificar resposta
    button.addEventListener('click', () => {
      checkAnswer(button, option, question.correta, question.pontos);
    });
    
    optionsContainer.appendChild(button);
  });
  
  // Atualizar barra de progresso
  updateProgress();
}

// Função para verificar a resposta
function checkAnswer(buttonElement, selectedOption, correctOption, points) {
  // Desativar todos os botões para evitar múltiplas respostas
  const allButtons = optionsContainer.querySelectorAll('button');
  allButtons.forEach(btn => {
    btn.disabled = true;
  });
  
  // Verificar se a resposta está correta
  const isCorrect = selectedOption === correctOption;
  
  // Atualizar a aparência do botão selecionado
  if (isCorrect) {
    buttonElement.classList.remove('btn-outline-primary');
    buttonElement.classList.add('correct-answer');
    
    // Adicionar pontos se a resposta estiver correta
    // Se estiver no modo de revisão, os pontos valem metade
    const pointsToAdd = isReviewMode ? Math.floor(points / 2) : points;
    score += pointsToAdd;
    
    // Tocar som de acerto
    soundCorrect.play();
    
    // Mostrar feedback de acerto
    showFeedbackToast('Correto!', `+${pointsToAdd} pontos`, true);
  } else {
    buttonElement.classList.remove('btn-outline-primary');
    buttonElement.classList.add('wrong-answer');
    
    // Encontrar e destacar a resposta correta
    allButtons.forEach(btn => {
      if (btn.textContent === correctOption) {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('correct-answer');
      }
    });
    
    // Adicionar esta pergunta à lista de perguntas incorretas (se não estiver no modo revisão)
    if (!isReviewMode) {
      const currentQuestion = questions[currentQuestionIndex];
      incorrectQuestions.push(currentQuestion);
    }
    
    // Tocar som de erro
    soundWrong.play();
    
    // Mostrar feedback de erro
    showFeedbackToast('Incorreto!', `A resposta correta era: ${correctOption}`, false);
  }
  
  // Atualizar exibição da pontuação
  updateScoreDisplay();
  
  // Avançar para a próxima pergunta após um breve delay
  setTimeout(() => {
    currentQuestionIndex++;
    updateQuestionCounter();
    loadQuestion();
  }, 1500);
}

// Função para iniciar o modo de revisão
function startReviewMode() {
  isReviewMode = true;
  questions = [...incorrectQuestions];
  incorrectQuestions = [];
  currentQuestionIndex = 0;
  totalQuestions = questions.length;
  
  // Atualizar contadores
  updateQuestionCounter();
  
  // Mostrar toast informando sobre o modo revisão
  showFeedbackToast('Modo de Revisão', 'Vamos revisar as perguntas que você errou! (Valem metade dos pontos)', true);
  
  // Carregar a primeira pergunta da revisão
  loadQuestion();
}

// Função para mostrar os resultados finais
function showResults() {
  // Esconder o quiz
  quizContainer.classList.add('d-none');
  
  // Mostrar resultados
  resultsContainer.classList.remove('d-none');
  
  // Atualizar pontuação final
  finalScore.textContent = score;
  
  // Determinar e exibir mensagem de desempenho
  let message = '';
  if (score === 0) {
    message = 'Não desanime! Tente novamente para melhorar seu desempenho.';
  } else if (score < 50) {
    message = 'Continue praticando! Você pode melhorar.';
  } else if (score < 80) {
    message = 'Bom trabalho! Você está no caminho certo.';
  } else if (score < 100) {
    message = 'Muito bom! Você domina bem este conteúdo.';
  } else {
    message = 'Excelente! Você dominou completamente este conteúdo!';
    finalScore.classList.add('shine');
  }
  
  performanceMessage.textContent = message;
  finishQuiz(chapterFile, score);
  updateQuizListWithScores();
}

// Função para atualizar o contador de perguntas
function updateQuestionCounter() {
  const totalToShow = isReviewMode ? 
    `${currentQuestionIndex}/${questions.length} (Revisão)` : 
    `${currentQuestionIndex}/${totalQuestions}`;
  
  questionCounter.textContent = totalToShow;
}

// Função para atualizar a exibição da pontuação
function updateScoreDisplay() {
  pointsCounter.textContent = score;
}

// Função para atualizar a barra de progresso
function updateProgress() {
  const progressValue = isReviewMode ? 
    (currentQuestionIndex / questions.length) * 100 : 
    (currentQuestionIndex / totalQuestions) * 100;
  
  quizProgress.style.width = `${progressValue}%`;
  quizProgress.setAttribute('aria-valuenow', progressValue);
  quizProgress.textContent = `${Math.round(progressValue)}%`;
}

// Função para embaralhar array (algoritmo Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Função para registrar a pontuação ao finalizar um quiz
function finishQuiz(quizId, score) {
  // Salva a pontuação
  ScoreManager.saveScore(quizId, score);
  // Exibe um resumo dos resultados
  console.log(`Quiz concluído!\nPontuação: ${score}%\nSua pontuação foi salva.`);
}