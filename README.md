# RecuperaQuiz - Aplicação de Quiz Educacional

RecuperaQuiz é uma aplicação web interativa desenvolvida para auxiliar estudantes do ensino fundamental na revisão de conteúdos escolares através de quizzes interativos.

## Características

- Exibição de resumos de capítulos para revisão
- Quiz interativo com perguntas de múltipla escolha
- Sistema de pontuação e feedback imediato
- Modo de revisão para perguntas respondidas incorretamente
- Interface responsiva para dispositivos móveis e desktop
- Sons de feedback para acerto e erro
- Formatação automática de resumos com markdown simples

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
│   │   └── quiz.js
│   ├── data/
│   │   ├── index.json
│   │   └── o_solo.json
│   ├── audio/
│   │   ├── acerto.mp3
│   │   └── erro.mp3
│   └── index.html
├── server.js
└── package.json
```

## Como Executar

1. Clone este repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   npm start
   ```
4. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

## Adicionando Novos Capítulos

Para adicionar novos capítulos:

1. Crie um arquivo JSON na pasta `public/data/` seguindo o formato:

```json
{
  "assunto": "Título do capítulo",
  "resumo": "Texto do resumo\n\n* Item da lista\n* Outro item",
  "perguntas": [
    {
      "tipo": "unica",
      "pergunta": "Texto da pergunta",
      "alternativas": ["opção A", "opção B", "opção C", "opção D"],
      "correta": "opção B",
      "pontos": 10
    }
  ]
}
```

2. Adicione o capítulo ao arquivo `index.json`:

```json
{
  "chapters": [
    {
      "title": "Título do capítulo",
      "description": "Breve descrição",
      "file": "nome_do_arquivo.json",
      "questions": 10
    }
  ]
}
```

## Licença

MIT