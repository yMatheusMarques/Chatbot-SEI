/**
 * providers/ollama.js
 * ---------------------------------------------------------------
 * Encapsula a comunicação com um modelo rodando localmente via Ollama.
 * Nenhuma chave de API é necessária aqui — o Ollama roda no mesmo
 * servidor (ou em uma rede interna) e não exige autenticação por padrão.
 * ---------------------------------------------------------------
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// Tempo máximo de espera pela resposta do modelo (em ms).
// Em CPUs sem GPU, modelos de 8B podem levar 2-3 minutos — ajuste
// este valor se necessário.
const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutos

/**
 * Envia o histórico de conversa + prompt de sistema para o Ollama
 * e retorna o texto da resposta do modelo.
 *
 * @param {string} systemPrompt - Instruções de sistema (papel do assistente + base de conhecimento)
 * @param {Array<{role: string, content: string}>} messages - Histórico da conversa
 * @returns {Promise<string>} Texto da resposta do modelo
 */
async function getChatCompletion(systemPrompt, messages) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  console.log(`[Ollama] Enviando requisição para ${OLLAMA_URL} (modelo: ${OLLAMA_MODEL})...`);
  const startTime = Date.now();

  let response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Timeout: o modelo não respondeu em ${TIMEOUT_MS / 1000}s. Tente um modelo menor (ex: phi3:mini) ou aguarde mais.`);
    }
    throw new Error(`Não foi possível conectar ao Ollama em ${OLLAMA_URL}: ${err.message}`);
  }

  clearTimeout(timeoutId);
  console.log(`[Ollama] Resposta recebida em ${((Date.now() - startTime) / 1000).toFixed(1)}s — status ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Ollama respondeu com status ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data || !data.message || typeof data.message.content !== 'string') {
    throw new Error('Resposta do Ollama em formato inesperado.');
  }

  return data.message.content;
}

module.exports = { getChatCompletion };