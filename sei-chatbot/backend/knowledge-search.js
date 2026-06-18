/**
 * knowledge-search.js
 * ---------------------------------------------------------------
 * Busca simples por relevância na base de conhecimento do SEI.
 * Em vez de enviar os ~10.000 caracteres completos em toda requisição
 * (o que trava modelos menores em CPU), extrai apenas os trechos mais
 * relevantes para a pergunta do usuário (~1.500 caracteres no máximo).
 * ---------------------------------------------------------------
 */

const { SEI_KNOWLEDGE } = require('./knowledge-base');

// Divide a base de conhecimento em seções pelo marcador "##"
const SECTIONS = SEI_KNOWLEDGE
  .split(/\n(?=## )/)
  .map(s => s.trim())
  .filter(s => s.length > 0);

/**
 * Calcula uma pontuação de relevância entre a pergunta e uma seção,
 * contando quantas palavras significativas da pergunta aparecem no texto.
 */
function scoreSection(section, query) {
  const sectionLower = section.toLowerCase();
  const words = query
    .toLowerCase()
    .replace(/[?!.,;]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3); // ignora palavras curtas (de, do, um, etc.)

  return words.reduce((score, word) => {
    return score + (sectionLower.includes(word) ? 1 : 0);
  }, 0);
}

/**
 * Retorna os trechos mais relevantes da base de conhecimento para
 * a pergunta recebida, respeitando um limite máximo de caracteres.
 *
 * @param {string} query - Última pergunta do usuário
 * @param {number} maxChars - Limite de caracteres a retornar (padrão: 2000)
 * @returns {string} Trecho(s) relevante(s) concatenados
 */
function findRelevantContext(query, maxChars = 2000) {
  const scored = SECTIONS
    .map(section => ({ section, score: scoreSection(section, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  // Se nenhuma seção for relevante, retorna um resumo introdutório
  if (scored.length === 0) {
    return SECTIONS.slice(0, 2).join('\n\n').slice(0, maxChars);
  }

  let result = '';
  for (const { section } of scored) {
    if (result.length + section.length > maxChars) break;
    result += (result ? '\n\n' : '') + section;
  }

  return result;
}

module.exports = { findRelevantContext };