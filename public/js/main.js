// Elementos do DOM
const chapterSelector = document.getElementById('chapter-selector');
const chapterSummary = document.getElementById('chapter-summary');
const chapterList = document.getElementById('chapter-list');
const summaryTitle = document.getElementById('summary-title');
const summaryContent = document.getElementById('summary-content');
const btnBackToChapters = document.getElementById('btn-back-to-chapters');
const btnStartQuiz = document.getElementById('btn-start-quiz');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const btnRetryQuiz = document.getElementById('btn-retry-quiz');
const btnReturnHome = document.getElementById('btn-return-home');

// Variáveis globais
let currentChapter = null;
let currentChapterFile = null;
let quizzesCache = [];

// Funções para manipulação de rota
function getRouteParams() {
  const hash = window.location.hash;
  if (!hash) return {};
  
  const params = hash.split('/').slice(1);
  return {
    grade: decodeURIComponent(params[0]) || '',
    quarter: decodeURIComponent(params[1]) || '',
    subject: decodeURIComponent(params[2]) || '',
    chapter: decodeURIComponent(params[3]) || ''
  };
}

// Flag para evitar loops infinitos
let isUpdatingFromURL = false;

function updateURL(filters) {
  if (isUpdatingFromURL) return; // Não atualiza a URL se estiver atualizando a partir dela
  
  let path = '#';
  if (filters.grade) {
    path += `/${filters.grade}`;
    if (filters.quarter) {
      path += `/${filters.quarter}`;
      if (filters.subject) {
        path += `/${filters.subject}`;
        if (filters.chapter) {
          path += `/${filters.chapter}`;
        }
      }
    }
  }
  
  // Só atualiza se a URL for diferente da atual
  if (window.location.hash !== path) {
    history.replaceState(null, null, path);
  }
}

// Função para carregar a lista de quizzes
async function loadQuizzesList() {
  try {
    const response = await axios.get('/generated/index.json');
    quizzesCache = response.data.quizzes;
    renderQuizzes(quizzesCache);
    populateFilters(quizzesCache);
    
    // Aplicar filtros da URL após carregar os dados
    const routeParams = getRouteParams();
    if (Object.keys(routeParams).length > 0) {
      if (routeParams.grade) document.getElementById('filter-grade').value = routeParams.grade;
      if (routeParams.quarter) document.getElementById('filter-quarter').value = routeParams.quarter;
      if (routeParams.subject) document.getElementById('filter-subject').value = routeParams.subject;
      if (routeParams.chapter) document.getElementById('filter-chapter').value = routeParams.chapter;
      populateFilters(quizzesCache);
      applyFilters();
    }
  } catch (error) {
    console.error('Erro ao carregar a lista de quizzes:', error);
    chapterList.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Error loading the list of quizzes. Please try again later.
      </div>
    `;
  }
  updateQuizListWithScores();
}

function renderQuizzes(quizzes) {
  chapterList.innerHTML = '';
  if (!quizzes || quizzes.length === 0) {
    chapterList.innerHTML = `
      <div class="alert alert-info" role="alert">
        No quizzes available at the moment.
      </div>
    `;
    return;
  }
  quizzes.forEach(quiz => {
    const listItem = document.createElement('a');
    listItem.setAttribute('data-quiz-id', quiz.file);
    listItem.href = '#';
    listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center quiz-card';
    listItem.innerHTML = `
      <div>
        <span class="badge bg-primary">${quiz.grade}</span>
        <span class="badge bg-primary bg-opacity-50">${quiz.quarter}</span>
        <span class="badge bg-success">${quiz.subject}</span>
        <span class="badge bg-success bg-opacity-50"> Capítulo ${quiz.chapter}</span>
        <h5 class="mb-1">${quiz.title}</h5>
        <small>${quiz.description || 'Click to access the summary and quiz'}</small><br>
      </div>
      <div class="text-end">
      <span class="badge bg-primary">${quiz.questions || '?'} questões</span><br>
      <i class="bi bi-puzzle-fill text-info"></i> <span class="badge bg-info quiz-stats-attempts">000</span><br>
      <i class="bi bi-arrow-up-right-square text-success"></i> <span class="badge bg-success quiz-stats-max">000</span><br>
      <i class="bi bi-arrow-down-right-square text-secondary text-opacity-75"></i> <span class="badge bg-secondary bg-opacity-50 quiz-stats-min">000</span><br>
      </div>
    `;
    listItem.addEventListener('click', (e) => {
      e.preventDefault();
      loadChapterSummary(quiz.file);
    });
    chapterList.appendChild(listItem);
  });
}

function populateFilters(quizzes) {
  // Atualiza as opções dos filtros de acordo com a seleção anterior
  const grade = document.getElementById('filter-grade').value;
  const quarter = document.getElementById('filter-quarter').value;
  const subject = document.getElementById('filter-subject').value;
  const chapter = document.getElementById('filter-chapter').value;

  // Filtro progressivo
  let filtered = quizzes;
  if (grade) filtered = filtered.filter(q => q.grade === grade);
  const quarters = Array.from(new Set(filtered.map(q => q.quarter)));
  fillSelect('filter-quarter', quarters, quarter);

  filtered = quizzes;
  if (grade) filtered = filtered.filter(q => q.grade === grade);
  if (quarter) filtered = filtered.filter(q => q.quarter === quarter);
  const subjects = Array.from(new Set(filtered.map(q => q.subject)));
  fillSelect('filter-subject', subjects, subject);

  filtered = quizzes;
  if (grade) filtered = filtered.filter(q => q.grade === grade);
  if (quarter) filtered = filtered.filter(q => q.quarter === quarter);
  if (subject) filtered = filtered.filter(q => q.subject === subject);
  const chapters = Array.from(new Set(filtered.map(q => q.chapter)));
  fillSelect('filter-chapter', chapters, chapter);

  // O filtro de grade sempre mostra todas as opções
  const grades = Array.from(new Set(quizzes.map(q => q.grade)));
  fillSelect('filter-grade', grades, grade);
}

function fillSelect(selectId, options) {
  const select = document.getElementById(selectId);
  const current = select.value;
  select.innerHTML = `<option value="">${select.options[0].textContent}</option>`;
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    if (opt === current) option.selected = true;
    select.appendChild(option);
  });
}

document.addEventListener('change', function(e) {
  if (e.target.closest('#quiz-filters')) {
    populateFilters(quizzesCache);
    applyFilters();
  }
});

function applyFilters() {
  let filtered = quizzesCache;
  const filters = {
    grade: document.getElementById('filter-grade').value,
    quarter: document.getElementById('filter-quarter').value,
    subject: document.getElementById('filter-subject').value,
    chapter: document.getElementById('filter-chapter').value
  };

  if (filters.grade) filtered = filtered.filter(q => q.grade === filters.grade);
  if (filters.quarter) filtered = filtered.filter(q => q.quarter === filters.quarter);
  if (filters.subject) filtered = filtered.filter(q => q.subject === filters.subject);
  if (filters.chapter) filtered = filtered.filter(q => q.chapter === filters.chapter);

  // Atualizar a URL com os filtros atuais
  updateURL(filters);
  renderQuizzes(filtered);
}

// Função para carregar o resumo de um capítulo
async function loadChapterSummary(chapterFile) {
  try {
    const response = await axios.get(`/data/${chapterFile}`);
    currentChapter = response.data;
    currentChapterFile = chapterFile;
    
    // Atualizar o título e o conteúdo do resumo
    summaryTitle.textContent = currentChapter.title;
    
    // Processar o conteúdo do resumo (convertendo quebras de linha e listas)
    const summary = currentChapter.summary;
    let htmlContent = '';
    
    // Dividir por parágrafos
    const paragraphs = summary.split('<br><br>');
    
    paragraphs.forEach(paragraph => {
      // Verificar se o parágrafo contém uma lista
      if (paragraph.includes('* ')) {
        // É uma lista - converter para HTML
        const items = paragraph.split('<br>');
        htmlContent += '<ul>';
        
        items.forEach(item => {
          if (item.trim().startsWith('* ')) {
            const listItemText = item.trim().substring(2);
            htmlContent += `<li>${listItemText}</li>`;
          } else if (item.trim()) {
            // Se não começa com * mas não está vazio
            htmlContent += `<p>${item}</p>`;
          }
        });
        
        htmlContent += '</ul>';
      } else if (paragraph.trim()) {
        // Parágrafo normal
        htmlContent += `<p>${paragraph}</p>`;
      }
    });
    
    summaryContent.innerHTML = htmlContent;
    
    // Mostrar seção de resumo e esconder seletor de capítulos
    chapterSelector.classList.add('d-none');
    chapterSummary.classList.remove('d-none');
    
  } catch (error) {
    console.error('Erro ao carregar o resumo do capítulo:', error);
    showFeedbackToast('Erro', 'Não foi possível carregar o resumo do capítulo.', false);
  }
}

// Carregar capítulo padrão para demonstração
async function loadDefaultChapter() {
  try {
    // Tentar carregar o_solo.json diretamente para demonstração
    await loadChapterSummary('o_solo.json');
  } catch (error) {
    console.error('Erro ao carregar capítulo padrão:', error);
    // Em caso de erro, tentar carregar a lista de capítulos
    loadQuizzesList();
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Adicionar listener para mudanças na URL
  window.addEventListener('hashchange', () => {
    isUpdatingFromURL = true;
    const params = getRouteParams();
    if (Object.keys(params).length > 0) {
      const gradeSelect = document.getElementById('filter-grade');
      const quarterSelect = document.getElementById('filter-quarter');
      const subjectSelect = document.getElementById('filter-subject');
      const chapterSelect = document.getElementById('filter-chapter');

      // Atualizar os valores dos selects
      gradeSelect.value = params.grade || '';
      quarterSelect.value = params.quarter || '';
      subjectSelect.value = params.subject || '';
      chapterSelect.value = params.chapter || '';

      // Atualizar as opções disponíveis e aplicar os filtros
      populateFilters(quizzesCache);
      applyFilters();
    } else {
      // Se não houver parâmetros, limpar os filtros
      document.getElementById('btn-clear-filters').click();
    }
    isUpdatingFromURL = false;
  });

  // Botão de lixeira para limpar pontuação
  document.getElementById('btn-clear-score').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalClearScore'));
    modal.show();
  });

  document.getElementById('btn-confirm-clear-score').addEventListener('click', () => {
    // Limpa a pontuação do ScoreManager
    if (window.ScoreManager && typeof window.ScoreManager.clearScore === 'function') {
      window.ScoreManager.clearScore();
    }
    updateQuizListWithScores();
    // Fecha o modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalClearScore'));
    if (modal) modal.hide();
    showFeedbackToast('Pontuação', 'Pontuação limpa com sucesso!', true);
  });
  // Botão para limpar filtros
  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    isUpdatingFromURL = true;
    document.getElementById('filter-grade').value = '';
    document.getElementById('filter-quarter').value = '';
    document.getElementById('filter-subject').value = '';
    document.getElementById('filter-chapter').value = '';
    history.replaceState(null, null, '#');
    populateFilters(quizzesCache);
    applyFilters();
    isUpdatingFromURL = false;
  });
  // Carregar a lista de capítulos
  const indexJson = {
    "chapters": [
      {
        "title": "O Solo Terrestre",
        "description": "Estudo sobre os tipos e composição do solo",
        "file": "o_solo.json",
        "questions": 10
      }
    ]
  };
  
  // Criar o arquivo index.json com o conteúdo padrão
  try {
    fetch('/generated/index.json')
      .then(response => {
        if (!response.ok) {
          // Se o arquivo não existir, carregue o capítulo padrão
          loadDefaultChapter();
        } else {
          // Se o arquivo existir, carregue a lista de capítulos
          loadQuizzesList();
        }
      })
      .catch(() => {
        // Em caso de erro, carregue o capítulo padrão
        loadDefaultChapter();
      });
  } catch (error) {
    console.error('Erro ao verificar index.json:', error);
    loadDefaultChapter();
  }
  
  // Botão para voltar à lista de capítulos
  btnBackToChapters.addEventListener('click', () => {
    chapterSummary.classList.add('d-none');
    chapterSelector.classList.remove('d-none');
  });
  
  // Botão para iniciar o quiz
  btnStartQuiz.addEventListener('click', () => {
    if (currentChapter) {
      initializeQuiz(currentChapter, currentChapterFile);
      chapterSummary.classList.add('d-none');
      quizContainer.classList.remove('d-none');
    }
  });
  
  // Botão para tentar o quiz novamente
  btnRetryQuiz.addEventListener('click', () => {
    if (currentChapter) {
      initializeQuiz(currentChapter, currentChapterFile);
      resultsContainer.classList.add('d-none');
      quizContainer.classList.remove('d-none');
    }
  });
  
  // Botão para voltar ao início
  btnReturnHome.addEventListener('click', () => {
    resultsContainer.classList.add('d-none');
    chapterSelector.classList.remove('d-none');
    loadQuizzesList();
  });
});

// Função auxiliar para exibir toast de feedback
function showFeedbackToast(title, message, isSuccess) {
  const toast = document.getElementById('feedback-toast');
  const toastTitle = document.getElementById('toast-title');
  const toastBody = document.getElementById('toast-body');
  const toastHeader = document.getElementById('toast-header');
  
  // Configurar o conteúdo do toast
  toastTitle.textContent = title;
  toastBody.textContent = message;
  
  // Configurar o estilo do toast
  toast.classList.remove('toast-success', 'toast-error');
  toast.classList.add(isSuccess ? 'toast-success' : 'toast-error');
  toastHeader.classList.remove('bg-success', 'bg-danger', 'text-white');
  toastHeader.classList.add(isSuccess ? 'bg-success' : 'bg-danger', 'text-white');
  
  // Mostrar o toast
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}