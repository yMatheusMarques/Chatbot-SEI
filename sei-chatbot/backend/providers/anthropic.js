/**
 * providers/anthropic.js
 * ---------------------------------------------------------------
 * Encapsula a comunicação com a API da Anthropic.
 * A chave de API é lida de uma variável de ambiente no servidor
 * e NUNCA é enviada ao front-end — é exatamente essa separação
 * que impede que alguém abra o DevTools do navegador e roube a chave.
 * ---------------------------------------------------------------
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Envia o histórico de conversa + prompt de sistema para a API da
 * Anthropic e retorna o texto da resposta do modelo.
 *
 * @param {string} systemPrompt
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
async function getChatCompletion(systemPrompt, messages) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY não configurada no .env do backend. Defina a chave antes de usar este provedor.'
    );
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Anthropic respondeu com status ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data || !data.content || !data.content[0] || typeof data.content[0].text !== 'string') {
    throw new Error('Resposta da Anthropic em formato inesperado.');
  }

  return data.content[0].text;
}

module.exports = { getChatCompletion };
