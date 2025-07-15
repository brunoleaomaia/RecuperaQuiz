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
4. (Opcional) Configure a porta do servidor principal criando um arquivo `.env` na raiz do projeto:
   ```
   PORT=3000
   ```
   Se não definido, o padrão será 3000.
5. Inicie o servidor:
   ```
   npm start
   ```
6. Acesse a aplicação em seu navegador:
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

## Opções de Desenvolvimento (Dev)

### Quiz Creator (OCR + IA)

O projeto inclui uma ferramenta de desenvolvimento para criar quizzes automaticamente a partir de imagens de capítulos de livros, usando OCR e IA (GPT):

- Interface web: `/dev/creator.html` (executada por um servidor Express próprio)
- Backend: `/dev/creator.js` (executa OCR, chama GPT, salva JSON e atualiza o índice)
- Configuração de variáveis: `/dev/.env` (veja `/dev/.env_sample`)

#### Como usar o Quiz Creator

1. Instale as dependências extras para dev:
   ```
   npm install tesseract.js openai node-fetch multer dotenv
   ```
2. Configure a chave da OpenAI em `/dev/.env`:
   ```
   OPENAI_API_KEY=sua-chave-aqui
   CREATOR_PORT=3001
   ```
3. Inicie o servidor de desenvolvimento:
   ```
   node dev/creator.js
   ```
4. Acesse a interface de criação em:
   ```
   http://localhost:3001
   ```
5. Preencha os metadados, envie imagens do capítulo e gere o quiz automaticamente.
6. Edite o JSON gerado se necessário e salve. O arquivo será salvo em `public/data/` e o índice será atualizado automaticamente.

> **Observação:** O fluxo de dev não é necessário para uso normal do app, apenas para facilitar a criação de novos quizzes por OCR/IA.