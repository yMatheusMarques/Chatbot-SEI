/**
 * script.js
 * ---------------------------------------------------------------
 * Lógica do front-end do assistente virtual do Portal SEI Alagoas.
 *
 * Este arquivo NÃO se comunica com nenhuma IA diretamente — ele só
 * conversa com o backend próprio (ver pasta /backend), que protege
 * qualquer chave de API e decide qual modelo de linguagem consultar.
 * ---------------------------------------------------------------
 */

(function () {
  'use strict';

  // ===========================================================
  // CONFIGURAÇÃO
  // ===========================================================
  //
  // O front-end NUNCA chama a IA diretamente. Ele só conversa com o
  // backend próprio (pasta /backend), que por sua vez consulta o
  // modelo de linguagem configurado (Ollama local, por padrão).
  //
  // Por quê: se a chamada à IA (e qualquer chave de API necessária)
  // estivesse aqui no JavaScript do navegador, qualquer pessoa
  // poderia abrir o DevTools (F12) e copiar a chave. Mantendo essa
  // lógica no backend, nada sensível fica exposto no navegador.
  //
  // Ajuste apiUrl para o endereço real do backend quando for para
  // produção, por exemplo: 'https://chatbot.al.gov.br/api/chat'
  const CONFIG = {
    apiUrl: 'http://localhost:3000/api/chat',
    maxHistoryBeforeSuggestions: 4,
  };

  const SUGGESTED_QUESTIONS_INITIAL = [
    'Como faço login no SEI?',
    'Como iniciar um processo?',
    'Como assinar um documento?',
    'O que é autenticação em dois fatores?',
  ];

  const SUGGESTED_QUESTIONS_FOLLOWUP = [
    'Como pesquisar um processo?',
    'Como usar blocos de assinatura?',
    'O que são processos sobrestados?',
    'Como configurar o Painel de Controle?',
  ];

  // O prompt de sistema e a base de conhecimento dos manuais do SEI
  // residem no backend (server.js + knowledge-base.js), não aqui.
  // Isso mantém o front-end simples e evita duplicar conteúdo grande
  // em dois lugares.

  // ===========================================================
  // ESTADO DA APLICAÇÃO
  // ===========================================================
  const state = {
    conversationHistory: [], // histórico enviado à LLM
    isConversationEnded: false,
    isWaitingResponse: false,
  };

  // ===========================================================
  // REFERÊNCIAS DO DOM
  // ===========================================================
  const dom = {
    messages: document.getElementById('messages'),
    input: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    restartBtn: document.getElementById('restart-btn'),
    endBtn: document.getElementById('end-btn'),
    endedState: document.getElementById('ended-state'),
    newConversationBtn: document.getElementById('new-conversation-btn'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
    confirmEndBtn: document.getElementById('confirm-end-btn'),
    inputArea: document.getElementById('input-area'),
  };

  // ===========================================================
  // RENDERIZAÇÃO DE MENSAGENS
  // ===========================================================

  /**
   * Converte markdown simples (negrito, quebras de linha) em HTML seguro.
   * Faz escape de HTML antes de aplicar as substituições, evitando
   * injeção de conteúdo arbitrário vindo do modelo ou do usuário.
   */
  function formatMessageText(text) {
    const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const escaped = text.replace(/[&<>"']/g, (char) => escapeMap[char]);
    return escaped
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function createSuggestionsElement(questions) {
    const wrapper = document.createElement('div');
    wrapper.className = 'suggestions';
    questions.forEach((question) => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-btn';
      btn.textContent = question;
      btn.addEventListener('click', () => sendSuggestion(question));
      wrapper.appendChild(btn);
    });
    return wrapper;
  }

  function addMessage(text, role, suggestions) {
    const msgEl = document.createElement('div');
    msgEl.className = `msg ${role}`;

    if (role === 'system') {
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = text;
      msgEl.appendChild(bubble);
      dom.messages.appendChild(msgEl);
      scrollToBottom();
      return msgEl;
    }

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'bot' ? 'SEI' : 'EU';

    const content = document.createElement('div');
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = formatMessageText(text);
    content.appendChild(bubble);

    if (suggestions && suggestions.length) {
      content.appendChild(createSuggestionsElement(suggestions));
    }

    msgEl.appendChild(avatar);
    msgEl.appendChild(content);
    dom.messages.appendChild(msgEl);
    scrollToBottom();
    return msgEl;
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="msg-avatar">SEI</div>
      <div class="msg-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    dom.messages.appendChild(div);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    dom.messages.scrollTop = dom.messages.scrollHeight;
  }

  function renderWelcomeMessage() {
    addMessage(
      'Olá! Sou o assistente virtual do **Portal SEI Alagoas**. Estou aqui para tirar suas dúvidas sobre o Sistema Eletrônico de Informações.\n\nComo posso te ajudar hoje?',
      'bot',
      SUGGESTED_QUESTIONS_INITIAL
    );
  }

  // ===========================================================
  // COMUNICAÇÃO COM O BACKEND
  // ===========================================================
  //
  // O front-end envia apenas o histórico de mensagens da conversa.
  // É o backend quem decide qual modelo de IA consultar, monta o
  // prompt de sistema com a base de conhecimento e devolve só o
  // texto da resposta — sem expor nenhum detalhe de implementação
  // ou chave de API ao navegador.

  /**
   * Monta o corpo da requisição enviada ao backend próprio.
   */
  function buildRequestBody() {
    return {
      messages: state.conversationHistory,
    };
  }

  /**
   * Extrai o texto de resposta do payload retornado pelo backend.
   * Formato esperado: { reply: "..." }
   */
  function extractReplyText(data) {
    if (data && typeof data.reply === 'string') {
      return data.reply;
    }
    return null;
  }

  async function requestBotReply() {
    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildRequestBody()),
    });

    if (!response.ok) {
      // O backend retorna { error: "..." } em respostas de erro (4xx/5xx).
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData && errorData.error ? errorData.error : `Erro na API: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const reply = extractReplyText(data);

    if (!reply) {
      throw new Error('Resposta vazia ou em formato inesperado.');
    }

    return reply;
  }

  // ===========================================================
  // FLUXO PRINCIPAL DE ENVIO DE MENSAGEM
  // ===========================================================

  async function sendMessage() {
    const text = dom.input.value.trim();
    if (!text || state.isWaitingResponse || state.isConversationEnded) return;

    dom.input.value = '';
    autoResizeInput();
    setWaitingState(true);

    addMessage(text, 'user');
    state.conversationHistory.push({ role: 'user', content: text });

    addTypingIndicator();

    try {
      const reply = await requestBotReply();
      removeTypingIndicator();

      state.conversationHistory.push({ role: 'assistant', content: reply });

      const shouldShowSuggestions =
        state.conversationHistory.length > CONFIG.maxHistoryBeforeSuggestions;
      addMessage(reply, 'bot', shouldShowSuggestions ? SUGGESTED_QUESTIONS_FOLLOWUP : null);
    } catch (err) {
      removeTypingIndicator();
      const isConnectionError = err instanceof TypeError; // fetch falha assim quando o servidor não responde
      const errorMessage = isConnectionError
        ? 'Não consegui me conectar ao servidor do assistente. Verifique se o backend está rodando.'
        : err.message || 'Desculpe, houve um problema ao processar sua pergunta. Tente novamente.';
      addMessage(errorMessage, 'bot');
      console.error('Erro ao consultar o assistente:', err);
    } finally {
      setWaitingState(false);
    }
  }

  function sendSuggestion(text) {
    dom.input.value = text;
    sendMessage();
  }

  function setWaitingState(isWaiting) {
    state.isWaitingResponse = isWaiting;
    dom.sendBtn.disabled = isWaiting;
  }

  function autoResizeInput() {
    dom.input.style.height = 'auto';
    dom.input.style.height = Math.min(dom.input.scrollHeight, 100) + 'px';
  }

  // ===========================================================
  // REINICIAR CONVERSA
  // ===========================================================

  function restartConversation() {
    state.conversationHistory = [];
    state.isConversationEnded = false;
    dom.messages.innerHTML = '';
    dom.input.value = '';
    autoResizeInput();
    setInputAreaVisible(true);
    dom.endedState.classList.add('hidden');
    renderWelcomeMessage();
    dom.input.focus();
  }

  // ===========================================================
  // ENCERRAR CONVERSA
  // ===========================================================

  function openConfirmModal() {
    dom.confirmModal.classList.remove('hidden');
  }

  function closeConfirmModal() {
    dom.confirmModal.classList.add('hidden');
  }

  function endConversation() {
    closeConfirmModal();
    state.isConversationEnded = true;
    state.conversationHistory = [];

    addMessage('A conversa foi encerrada. Obrigado por usar o assistente do Portal SEI Alagoas.', 'system');
    setInputAreaVisible(false);
    dom.endedState.classList.remove('hidden');
  }

  function setInputAreaVisible(isVisible) {
    dom.inputArea.classList.toggle('hidden', !isVisible);
  }

  // ===========================================================
  // EVENTOS
  // ===========================================================

  function registerEventListeners() {
    dom.sendBtn.addEventListener('click', sendMessage);

    dom.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    dom.input.addEventListener('input', autoResizeInput);

    dom.restartBtn.addEventListener('click', restartConversation);

    dom.endBtn.addEventListener('click', openConfirmModal);
    dom.confirmCancelBtn.addEventListener('click', closeConfirmModal);
    dom.confirmEndBtn.addEventListener('click', endConversation);

    dom.newConversationBtn.addEventListener('click', restartConversation);

    // Permite fechar o modal clicando fora da caixa de diálogo
    dom.confirmModal.addEventListener('click', (e) => {
      if (e.target === dom.confirmModal) closeConfirmModal();
    });
  }

  // ===========================================================
  // INICIALIZAÇÃO
  // ===========================================================

  function init() {
    registerEventListeners();
    renderWelcomeMessage();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
