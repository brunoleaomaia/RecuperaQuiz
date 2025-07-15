require('dotenv').config();
const express = require('express');
const path = require('path');
const { execSync } = require('child_process');

// Executa o generate-index.js antes de iniciar o servidor
try {
  execSync('node scripts/generate-index.js', { stdio: 'inherit' });
  console.log('index.json atualizado com sucesso.');
} catch (err) {
  console.error('Erro ao atualizar index.json:', err.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal que serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor RecuperaQuiz rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});