/**
 * providers/groq.js
 * ---------------------------------------------------------------
 * Integração com a API ultrarrápida e gratuita do Groq.
 * ---------------------------------------------------------------
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'; // modelo escolhido para respostas rápidas e precisas, mesmo em hardware sem GPU.

async function getChatCompletion(systemPrompt, messages) {
  if (!GROQ_API_KEY) {
    throw new Error('Chave GROQ_API_KEY não configurada no .env');
  }

  console.log(`[Groq] Consultando API na nuvem (modelo: ${GROQ_MODEL})...`);
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.0, // <-- Mantém o bot focado estritamente no manual do SEI
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro Groq: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Groq] Resposta recebida em ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    // Extrai o texto da resposta
    return data.choices[0].message.content;

  } catch (err) {
    throw new Error(`Falha na API da nuvem: ${err.message}`);
  }
}

module.exports = { getChatCompletion };