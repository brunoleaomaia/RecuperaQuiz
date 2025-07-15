require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.CREATOR_PORT || 3001;
const fs = require('fs');
const indexData = JSON.parse(fs.readFileSync(path.join(__dirname, 'index.json'), 'utf8'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const processCreate = require('./create');
app.use('/dev', express.static(path.join(__dirname)));

// Página principal do Quiz Creator
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'creator.html'));
});

// Mock da rota /create

app.post('/create', upload.array('images'), (req, res) => {
  Promise.resolve(processCreate(req))
    .then(result => res.json(result))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Salva o JSON enviado em public/data
const { generateIndex } = require('../genindex');

app.post('/savedata', express.json(), (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filename = req.body.filename;
  const data = req.body.data;
  if (!filename || !data) {
    return res.status(400).json({ error: 'Nome do arquivo e dados são obrigatórios.' });
  }
  const safeName = filename.replace(/[^a-zA-Z0-9_\-.]/g, '');
  const filePath = path.join(__dirname, '..', 'public', 'data', safeName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    // Atualiza o index.json usando o módulo
    generateIndex();
    res.json({ success: true, file: safeName });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar arquivo: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Quiz Creator rodando em http://localhost:${PORT}`);
});
