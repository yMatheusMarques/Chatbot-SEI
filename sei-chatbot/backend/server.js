/**
 * server.js
 * ---------------------------------------------------------------
 * Backend do assistente virtual do Portal SEI Alagoas.
 *
 * Responsabilidade deste servidor: receber as mensagens do usuário
 * (enviadas pelo front-end), montar o prompt com a base de
 * conhecimento, consultar o modelo de linguagem configurado
 * (Ollama local por padrão) e devolver a resposta.
 *
 * Por que isso existe (e não uma chamada direta do front-end à IA):
 * se a aplicação um dia usar uma API paga (Anthropic, Groq, OpenAI,
 * etc.), a chave de API precisa ficar só aqui no servidor. Se ela
 * estivesse no JavaScript do navegador, qualquer pessoa poderia abrir
 * o DevTools (F12), copiar a chave e usá-la por conta própria,
 * gerando custos indevidos para o órgão.
 *
 * Como rodar:
 *   1. cp .env.example .env   (e ajuste os valores conforme necessário)
 *   2. npm install
 *   3. npm start
 * ---------------------------------------------------------------
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { SEI_KNOWLEDGE } = require('./knowledge-base');
const { findRelevantContext } = require('./knowledge-search');
const ollamaProvider = require('./providers/ollama');
const anthropicProvider = require('./providers/anthropic');

const app = express();

// ===========================================================
// CONFIGURAÇÃO GERAL
// ===========================================================
const PORT = process.env.PORT || 3000;
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'ollama';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// O prompt de sistema base — sem a base de conhecimento completa.
// O contexto relevante é buscado dinamicamente por pergunta (ver buildSystemPrompt).
const SYSTEM_PROMPT_BASE = `Você é o assistente virtual oficial do Portal SEI de Alagoas (portal.sei.al.gov.br).
Sua ÚNICA função é responder dúvidas estritamente relacionadas ao Sistema Eletrônico de Informações (SEI).

🚨 REGRA DE SEGURANÇA (TRAVA DE CONTEXTO) 🚨
Se o usuário perguntar sobre QUALQUER assunto que não seja o uso do SEI (por exemplo: receitas como fazer pipoca, códigos de programação, piadas, clima, conhecimentos gerais, problemas pessoais, etc.), você DEVE se recusar a responder.
Nesse caso, você é obrigado a responder EXATAMENTE com a seguinte frase e nada mais:
"Desculpe, mas sou o assistente virtual do SEI Alagoas e só fui treinado para tirar dúvidas exclusivas sobre o uso do Sistema Eletrônico de Informações."

Para perguntas válidas sobre o SEI:
Responda de forma clara, objetiva e amigável em português brasileiro.
Use APENAS o contexto fornecido abaixo. Se a resposta não estiver no contexto, diga que não encontrou essa informação nos manuais e sugira entrar em contato com o suporte do portal.
Formate respostas com parágrafos curtos. Use **negrito** apenas para termos técnicos importantes.
Seja conciso. Máximo de 250 palavras.`;

/**
 * Monta o prompt de sistema com apenas os trechos da base de
 * conhecimento relevantes para a pergunta atual, mantendo o
 * contexto enviado ao modelo pequeno o suficiente para responder
 * rapidamente mesmo em hardware sem GPU.
 */
function buildSystemPrompt(userQuery) {
  const context = findRelevantContext(userQuery);
  return SYSTEM_PROMPT_BASE + '\n\nCONTEXTO DOS MANUAIS SEI:\n' + context;
}

// Seleciona o provedor de IA configurado. Para trocar de provedor,
// basta mudar LLM_PROVIDER no .env — nenhum código precisa ser alterado.
const providers = {
  ollama: ollamaProvider,
  anthropic: anthropicProvider,
  groq: require('./providers/groq') // <-- Adicione esta linha
};

const activeProvider = providers[LLM_PROVIDER];

if (!activeProvider) {
  throw new Error(
    `LLM_PROVIDER="${LLM_PROVIDER}" não é válido. Use "ollama" ou "anthropic".`
  );
}

// ===========================================================
// MIDDLEWARES
// ===========================================================
app.use(express.json({ limit: '50kb' }));

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    methods: ['POST', 'GET'],
  })
);

// Limita quantas requisições um mesmo IP pode fazer, evitando abuso
// e protegendo o servidor (e o modelo local) de sobrecarga.
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // até 20 mensagens por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas mensagens em pouco tempo. Aguarde um momento antes de continuar.',
  },
});

// ===========================================================
// VALIDAÇÃO DE ENTRADA
// ===========================================================

const MAX_MESSAGES_IN_HISTORY = 30;
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Valida o formato do histórico de mensagens enviado pelo front-end,
 * evitando que dados malformados cheguem até o modelo de linguagem.
 */
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'O campo "messages" deve ser uma lista não vazia.';
  }

  if (messages.length > MAX_MESSAGES_IN_HISTORY) {
    return `Histórico de conversa excede o limite de ${MAX_MESSAGES_IN_HISTORY} mensagens.`;
  }

  for (const msg of messages) {
    if (!msg || (msg.role !== 'user' && msg.role !== 'assistant')) {
      return 'Cada mensagem deve ter "role" igual a "user" ou "assistant".';
    }
    if (typeof msg.content !== 'string' || msg.content.trim().length === 0) {
      return 'Cada mensagem deve ter um campo "content" de texto não vazio.';
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return `Mensagens não podem exceder ${MAX_MESSAGE_LENGTH} caracteres.`;
    }
  }

  return null; // sem erros
}

// ===========================================================
// ROTAS
// ===========================================================

/**
 * Rota de verificação de saúde do serviço — útil para monitoramento.
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: LLM_PROVIDER });
});

/**
 * Rota principal do chat. Recebe o histórico de mensagens do front-end,
 * consulta o modelo de linguagem configurado e retorna a resposta.
 *
 * Corpo esperado:
 *   { "messages": [{ "role": "user", "content": "..." }, ...] }
 */
app.post('/api/chat', chatRateLimiter, async (req, res) => {
  const { messages } = req.body || {};

  const validationError = validateMessages(messages);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    // Extrai a última pergunta do usuário para buscar contexto relevante
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const systemPrompt = buildSystemPrompt(lastUserMessage ? lastUserMessage.content : '');
    const reply = await activeProvider.getChatCompletion(systemPrompt, messages);
    res.json({ reply });
  } catch (err) {
    console.error('Erro ao consultar o modelo de linguagem:', err.message);
    res.status(502).json({
      error: 'Não foi possível obter resposta do assistente. Tente novamente em instantes.',
    });
  }
});

// ===========================================================
// INICIALIZAÇÃO
// ===========================================================

const server = app.listen(PORT, () => {
  console.log(`Backend do assistente SEI Alagoas rodando na porta ${PORT}`);
  console.log(`Provedor de IA ativo: ${LLM_PROVIDER}`);
});