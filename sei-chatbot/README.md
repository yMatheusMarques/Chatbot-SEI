# Assistente Virtual — Portal SEI Alagoas

Chatbot de atendimento para dúvidas sobre o Sistema Eletrônico de Informações (SEI) do Governo de Alagoas, com base nos manuais oficiais SEI 4.0 e SEI 2.5.1.

## Arquitetura

```
sei-chatbot/
├── index.html          → estrutura da página
├── style.css           → estilos visuais
├── script.js           → lógica do front-end (chat, reiniciar, encerrar)
└── backend/
    ├── server.js        → servidor Express (recebe perguntas, consulta a IA)
    ├── knowledge-base.js → base de conhecimento extraída dos manuais SEI
    ├── providers/
    │   ├── ollama.js     → integração com modelo local (Ollama)
    │   └── anthropic.js  → integração com a API da Anthropic (opcional)
    ├── package.json
    └── .env.example
```

**Por que existe um backend separado:** o front-end (`script.js`) nunca se comunica
diretamente com nenhuma IA. Ele só conversa com o backend próprio, que decide qual
modelo consultar e — caso você use uma API paga no futuro — protege a chave de API,
que nunca fica visível no navegador (evitando que alguém abra o DevTools/F12 e a copie).

## Como rodar

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Por padrão, o backend espera um modelo rodando localmente via **Ollama** na porta `11434`.
Se ainda não tiver o Ollama instalado:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b
```

O backend vai rodar em `http://localhost:3000`.

### 2. Front-end

Basta abrir o `index.html` no navegador, ou servir a pasta com qualquer servidor
estático (Nginx, Apache, `npx serve`, etc). Se o backend estiver em um endereço
diferente de `localhost:3000`, ajuste a constante `apiUrl` no topo do `script.js`.

## Trocar de modelo de IA

No arquivo `backend/.env`, altere:

```
LLM_PROVIDER=ollama       # ou "anthropic"
OLLAMA_MODEL=llama3.1:8b  # qualquer modelo já baixado no Ollama
```

Nenhum código precisa ser alterado — a troca de modelo ou provedor é feita só por
variável de ambiente.

## Segurança e produção

- Em produção, troque `ALLOWED_ORIGIN=*` no `.env` pelo domínio real do site
  (ex: `https://chatbot.al.gov.br`), restringindo quem pode chamar o backend.
- O backend já inclui limite de requisições por IP (20 mensagens/minuto) para
  evitar abuso e sobrecarga do modelo.
- O arquivo `.env` nunca deve ser commitado em repositórios públicos — ele está
  no `.gitignore` por padrão.
