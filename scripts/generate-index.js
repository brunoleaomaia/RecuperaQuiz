// Script para gerar index.json automaticamente a partir dos arquivos de data usando o módulo genindex.js
const { generateIndex } = require('../genindex');

function main() {
  generateIndex();
  console.log('Arquivo index.json gerado/atualizado com sucesso.');
}

main();
