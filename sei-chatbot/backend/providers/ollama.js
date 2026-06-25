const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b'; // troque para o modelo que desejar. Roda localmente.

async function getChatCompletion(systemPrompt, messages) {
  console.log(`[Ollama] Enviando requisição para ${OLLAMA_URL} (modelo: ${OLLAMA_MODEL})...`);
  const startTime = Date.now();

  let response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });
  } catch (err) {
    throw new Error(`Não foi possível conectar ao Ollama em ${OLLAMA_URL}: ${err.message}`);
  }

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