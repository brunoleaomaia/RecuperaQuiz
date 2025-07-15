# RecuperaQuiz

RecuperaQuiz é uma aplicação web interativa para revisão escolar, voltada para estudantes do ensino fundamental. Permite revisar conteúdos de diversas matérias por meio de quizzes dinâmicos, com sistema de pontuação, filtros avançados e feedback imediato.

## Funcionalidades

- Exibição de resumos de capítulos para revisão
- Quiz interativo com perguntas de múltipla escolha
- Sistema de pontuação e feedback imediato
- Modo de revisão para perguntas respondidas incorretamente
- Filtros dinâmicos por Ano Letivo, Bimestre, Matéria e Capítulo
- Botão para limpar filtros e pontuação geral
- Modal de confirmação para limpeza da pontuação
- Interface responsiva para dispositivos móveis e desktop
- Sons de feedback para acerto e erro
- Formatação automática de resumos com markdown simples
- Geração automática do arquivo `index.json` a partir dos arquivos de dados

## Tecnologias Utilizadas

- **Backend**: Node.js com Express
- **Frontend**: HTML5, CSS3, JavaScript
- **Bibliotecas**:
  - Bootstrap 5 (UI responsiva)
  - Bootstrap Icons (ícones)
  - Axios (requisições HTTP)

## Estrutura do Projeto

```
RecuperaQuiz/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── quiz.js
│   │   └── score.js
│   ├── data/
│   │   ├── vegetacao.json
│   │   └── ...
│   ├── generated/
│   │   └── index.json
│   ├── audio/
│   │   ├── acerto.mp3
│   │   └── erro.mp3
│   └── index.html
├── scripts/
│   └── generate-index.js
├── server.js
└── package.json
```

## Como Executar

1. Clone este repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Gere o arquivo de índice dos quizzes:
   ```
   node scripts/generate-index.js
   ```
4. Inicie o servidor:
   ```
   npm start
   ```
5. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

## Adicionando Novos Quizzes

1. Crie um arquivo JSON na pasta `public/data/` seguindo o formato:

```json
{
  "grade": "3º ano",
  "quarter": "2º Bimestre",
  "subject": "Geografia",
  "chapter": "Vegetação",
  "title": "Vegetação",
  "summary": "Texto do resumo...",
  "questions": [
    {
      "type": "single",
      "question": "Texto da pergunta",
      "choices": ["opção A", "opção B", "opção C", "opção D"],
      "correct": "opção B",
      "points": 10
    }
  ]
}
```

2. Execute o script para atualizar o índice:
   ```
   node scripts/generate-index.js
   ```

## Limpeza de Pontuação

- Para limpar toda a pontuação, utilize o botão de lixeira ao lado da pontuação geral. Confirme a ação no modal para zerar todos os dados de pontuação.

## Licença

MIT