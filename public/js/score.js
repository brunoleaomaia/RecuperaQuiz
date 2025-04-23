const ScoreManager = {
    // Inicializa o armazenamento se não existir
    initStorage: function () {
        if (!localStorage.getItem('recQuizScores')) {
            localStorage.setItem('recQuizScores', JSON.stringify({
                quizzes: {},
                totalScore: 0
            }));
        }
        return this.getStorage();
    },

    // Obtém os dados do localStorage
    getStorage: function () {
        return JSON.parse(localStorage.getItem('recQuizScores')) || { quizzes: {}, totalScore: 0 };
    },

    // Salva os dados no localStorage
    saveStorage: function (data) {
        localStorage.setItem('recQuizScores', JSON.stringify(data));
    },

    // Registra uma nova pontuação para um quiz específico
    saveScore: function (quizId, score) {
        const storage = this.getStorage();

        // Se o quiz não existir nos dados, cria um novo registro
        if (!storage.quizzes[quizId]) {
            storage.quizzes[quizId] = {
                attempts: 0,
                maxScore: 0,
                minScore: Infinity,
                scores: []
            };
        }

        const quizData = storage.quizzes[quizId];

        // Atualiza as estatísticas do quiz
        quizData.attempts += 1;
        quizData.scores.push(score);

        // Atualiza a pontuação máxima se necessário
        if (score > quizData.maxScore) {
            // Se a pontuação máxima aumentou, atualize o total
            quizData.maxScore = score;
        }

        // Atualiza a pontuação mínima se necessário
        if (score < quizData.minScore) {
            quizData.minScore = score;
        }

        // Se for a primeira tentativa, inicializa min e max
        if (quizData.attempts === 1) {
            quizData.minScore = score;
            quizData.maxScore = score;
        }
        storage.totalScore += score;

        // Salva as alterações
        this.saveStorage(storage);
        return quizData;
    },

    // Obtém os dados de um quiz específico
    getQuizStats: function (quizId) {
        const storage = this.getStorage();
        return storage.quizzes[quizId] || { attempts: 0, maxScore: 0, minScore: 0, scores: [] };
    },

    // Obtém todos os dados
    getAllStats: function () {
        return this.getStorage();
    },

    // Obtém a pontuação total acumulada (soma das pontuações máximas)
    getTotalScore: function () {
        const storage = this.getStorage();
        return storage.totalScore;
    }
};

// Inicializa o sistema de pontuação ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    ScoreManager.initStorage();
    //updateQuizListWithScores();
});

// Função para atualizar a lista de quizzes com as pontuações
function updateQuizListWithScores() {
    const quizCards = document.querySelectorAll('.quiz-card');
    const stats = ScoreManager.getAllStats();
    const totalScore = document.querySelector('.total-score');
    totalScore.innerText = stats.totalScore;
    quizCards.forEach(card => {
        const quizId = card.dataset.quizId;
        if (!quizId) return;

        const quizStats = stats.quizzes[quizId] || { attempts: 0, maxScore: 0, minScore: 0 };

        // Cria ou atualiza o elemento de estatísticas do quiz
        const attemptsElement = card.querySelector('.quiz-stats-attempts');
        if (attemptsElement) {
            attemptsElement.innerText = String(quizStats.attempts).padStart(3, '0');
        }
        const maxScoreElement = card.querySelector('.quiz-stats-max');
        if (maxScoreElement) {
            maxScoreElement.innerText = String(quizStats.maxScore).padStart(3, '0');
        }
        const minScoreElement = card.querySelector('.quiz-stats-min');
        if (minScoreElement) {
            minScoreElement.innerText = String(quizStats.minScore).padStart(3, '0');
        }
    });
}
