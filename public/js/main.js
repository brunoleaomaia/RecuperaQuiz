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

// Função para carregar a lista de capítulos
async function loadChaptersList() {
  try {
    const response = await axios.get('/data/index.json');
    const chapters = response.data.chapters;
    
    // Limpar o conteúdo anterior
    chapterList.innerHTML = '';
    
    // Se não há capítulos disponíveis
    if (!chapters || chapters.length === 0) {
      chapterList.innerHTML = `
        <div class="alert alert-info" role="alert">
          Nenhum capítulo disponível no momento.
        </div>
      `;
      return;
    }
    
    // Adicionar cada capítulo à lista
    chapters.forEach(chapter => {
      const listItem = document.createElement('a');
      listItem.setAttribute('data-quiz-id', chapter.file);
      listItem.href = '#';
      listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center quiz-card';
      listItem.innerHTML = `
        <div>
          <h5 class="mb-1">${chapter.title}</h5>
          <small>${chapter.description || 'Clique para acessar o resumo e o quiz'}</small>
        </div>
        <div class="text-end">
        <span class="badge bg-primary">${chapter.questions || '?'} perguntas</span><br>
        <i class="bi bi-puzzle-fill text-info"></i> <span class="badge bg-info quiz-stats-attempts">000</span><br>
        <i class="bi bi-arrow-up-right-square text-success"></i> <span class="badge bg-success quiz-stats-max">000</span><br>
        <i class="bi bi-arrow-down-right-square text-secondary text-opacity-75"></i> <span class="badge bg-secondary bg-opacity-50 quiz-stats-min">000</span><br>
        </div>
      `;
      
      // Adicionar evento de clique para abrir o resumo
      listItem.addEventListener('click', (e) => {
        e.preventDefault();
        loadChapterSummary(chapter.file);
      });
      
      chapterList.appendChild(listItem);
    });
    
  } catch (error) {
    console.error('Erro ao carregar a lista de capítulos:', error);
    chapterList.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Erro ao carregar a lista de capítulos. Por favor, tente novamente mais tarde.
      </div>
    `;
  }
  updateQuizListWithScores();
}

// Função para carregar o resumo de um capítulo
async function loadChapterSummary(chapterFile) {
  try {
    const response = await axios.get(`/data/${chapterFile}`);
    currentChapter = response.data;
    currentChapterFile = chapterFile;
    
    // Atualizar o título e o conteúdo do resumo
    summaryTitle.textContent = currentChapter.assunto;
    
    // Processar o conteúdo do resumo (convertendo quebras de linha e listas)
    const resumo = currentChapter.resumo;
    let htmlContent = '';
    
    // Dividir por parágrafos
    const paragraphs = resumo.split('\n\n');
    
    paragraphs.forEach(paragraph => {
      // Verificar se o parágrafo contém uma lista
      if (paragraph.includes('* ')) {
        // É uma lista - converter para HTML
        const items = paragraph.split('\n');
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
    loadChaptersList();
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
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
    fetch('/data/index.json')
      .then(response => {
        if (!response.ok) {
          // Se o arquivo não existir, carregue o capítulo padrão
          loadDefaultChapter();
        } else {
          // Se o arquivo existir, carregue a lista de capítulos
          loadChaptersList();
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
    loadChaptersList();
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