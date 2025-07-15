// Script para gerar index.json automaticamente a partir dos arquivos de data
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');
const outputDir = path.join(__dirname, '../public/generated');
const outputFile = path.join(outputDir, 'index.json');

function isQuizFile(file) {
  return file.endsWith('.json') && file !== 'index.json';
}

function getQuizMeta(quizData, fileName) {
  return {
    grade: quizData.grade || '',
    quarter: quizData.quarter || '',
    subject: quizData.subject || '',
    chapter: quizData.chapter || '',
    title: quizData.title || '',
    description: quizData.summary ? quizData.summary.substring(0, 80) + '...' : '',
    file: fileName,
    questions: Array.isArray(quizData.questions) ? quizData.questions.length : 0
  };
}

function main() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const files = fs.readdirSync(dataDir).filter(isQuizFile);
  const quizzes = [];
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      quizzes.push(getQuizMeta(data, file));
    } catch (e) {
      console.error('Erro ao ler', file, e);
    }
  });
  fs.writeFileSync(outputFile, JSON.stringify({ quizzes }, null, 2), 'utf8');
  console.log('Arquivo index.json gerado em', outputFile);
}

main();
