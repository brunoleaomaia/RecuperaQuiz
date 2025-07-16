// create.js - processamento da rota /create
require('dotenv').config();
const { OpenAI } = require('openai');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function gpt(text) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        fetch
    });
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `
                    Você é um agente educacional que:
                    1. Recebe texto proveniente de OCR de imagens de páginas de livros escolares.
                    2. Resume o conteúdo separando parágrafos com '<br><br>', quebras de linhas com '<br> e listas com *.
                    3. Cria 10 perguntas de múltipla escolha com alternativas e resposta correta.
                    4. Gera um JSON no seguinte formato:
                    {"suggestedfileName": "vegetacao.json","title": "Vegetação","summary": "A vegetação é composta por diferentes tipos de plantas, como árvores, arbustos, gramas e flores, que podem ser observados em ruas, parques e jardins. Algumas plantas são frutíferas e oferecem sombras e alimentos, enquanto outras têm flores coloridas que embelezam o ambiente e atraem animais, como borboletas.<br><br>Vegetação é todo tipo de vegetal presente sobre o solo, incluindo plantas, árvores, grama e qualquer cobertura vegetal da Terra. Árvores e plantas nas cidades, parques e quintais fazem parte da vegetação, sendo essenciais para a qualidade do ar e a vida humana, pois funcionam como filtros naturais.<br><br>* As plantas se adaptam às condições do ambiente, como temperatura e quantidade de água, o que dá origem a diferentes tipos de vegetação.<br>* Os cactos são típicos de regiões quentes e secas, como a Caatinga no Nordeste do Brasil.<br>* As taigas ou coníferas se desenvolvem em regiões frias e com neve.<br>* As florestas tropicais crescem em locais quentes e úmidos e são comuns no Brasil.<br><br>O cuidado com o meio ambiente é essencial. Plantar árvores, respeitar a natureza e evitar o desmatamento são atitudes importantes. O desmatamento leva à perda da biodiversidade e afeta negativamente o planeta.<br><br>* Exemplos de vegetações do Brasil: Amazônia, Cerrado, Pantanal.<br>* A árvore mais velha registrada no Brasil é um jequitibá-rosa com cerca de 3.032 anos, localizado no Parque Estadual do Vassununga, em São Paulo.","questions": [{"type": "single","question": "O que é considerado vegetação?","choices": ["Apenas árvores", "Apenas grama", "Todo tipo de vegetal presente sobre o solo", "Somente flores coloridas"],"correct": "Todo tipo de vegetal presente sobre o solo","points": 10}]}
                    5. O GPT preenche lacunas com coerência e mantém formalidade e objetividade.
                    6. O GPT deve criar perguntas e respostas somente baseado no conteúdo do resumo e pode também reutilizar as perguntas presentes no conteúdo escaneado.
                    7. O GPT não deverá jamais fazer variações na estrutura do JSON. 
                    8. O GPT deve disponibilizar o nome sugerido para o arquivo JSON para download (suggestedfileName). O nome do arquivo deve ser formado pelas palavras do campo título em mínuscula, sem caracteres especiais, separadas por _  (Exemplo: titulo_do_capitulo.json).
                    9. O GPT deve garantir que apenas uma resposta correta seja fornecida para cada pergunta.
                `
            },
            {
                role: "user",
                content: text
            }
        ]
    });
    return response.choices[0].message.content;
}

module.exports = async function processCreate(req) {
    const tesseract = require('tesseract.js');
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const timestamp = Date.now();
    const subDir = path.join(uploadsDir, String(timestamp));
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
    if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir);
    }
    let savedFiles = [];
    let ocrTexts = [];
    if (req.files && req.files.length > 0) {
        // Ordena os arquivos por nome antes de processar
        const sortedFiles = [...req.files].sort((a, b) => a.originalname.localeCompare(b.originalname));
        for (const file of sortedFiles) {
            const fileName = `${timestamp}_${file.originalname}`;
            const filePath = path.join(subDir, fileName);
            const fileSize = (file.size / 1024).toFixed(2); // Tamanho em KB
            fs.writeFileSync(filePath, file.buffer);
            savedFiles.push(filePath);
            try {
                console.log(`Fazendo OCR para ${fileName} [${fileSize} KB=...`);
                const { data: { text } } = await tesseract.recognize(filePath, 'por');
                ocrTexts.push(text);
            } catch (err) {
                console.error(`Erro no OCR (${fileName}):`, err);
            }
        }
    }
    const fullText = ocrTexts.join('<br><br>');
    console.log('OCR completo. Texto extraído:\n', fullText);
    console.log('Iniciando processamento com GPT...');
    const gptResult = await gpt(fullText);
    console.log('Resultado do GPT:', gptResult);
    try {
        const json = JSON.parse(gptResult);
        // Garante que os campos do request estejam presentes e corretos
        json.grade = req.body.grade || json.grade;
        json.quarter = req.body.quarter || json.quarter;
        json.subject = req.body.subject || json.subject;
        json.chapter = req.body.chapter || json.chapter;
        return json;
    } catch (e) {
        return { error: 'Erro ao gerar JSON do GPT', message: e.message, gptResult };
    }
}
