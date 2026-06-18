# Assistente Virtual — Portal SEI Alagoas

Chatbot de atendimento para dúvidas sobre o Sistema Eletrônico de Informações (SEI) do Governo de Alagoas, alimentado por um modelo de linguagem open-source rodando localmente (sem custo por requisição).

---

## Pré-requisitos

Antes de começar, instale as ferramentas abaixo no servidor ou máquina onde o projeto vai rodar:

### 1. Node.js (versão 18 ou superior)

Acesse https://nodejs.org, baixe o instalador LTS e siga o assistente de instalação.

Verifique a instalação:
```bash
node --version
npm --version
```

### 2. Ollama (modelo de linguagem local)

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows / macOS:**
Acesse https://ollama.com/download e baixe o instalador para o seu sistema.

Após instalar, verifique se está rodando:
```bash
curl http://localhost:11434
# Deve retornar: Ollama is running
```

### 3. Modelo de linguagem

Baixe o modelo recomendado (escolha um conforme seu hardware):

| Modelo | Tamanho | RAM mínima | Velocidade (CPU) | Recomendado para |
|---|---|---|---|---|
| `phi3:mini` | 2.3 GB | 4 GB | ~15s/resposta | Hardware mais limitado |
| `llama3.1:8b` | 4.9 GB | 8 GB | ~60s/resposta | Melhor qualidade |

```bash
# Recomendado para começar:
ollama pull phi3:mini

# Ou, se tiver hardware mais robusto:
ollama pull llama3.1:8b
```

---

## Estrutura do projeto

```
sei-chatbot/
├── index.html              → estrutura da página do chatbot
├── style.css               → estilos visuais
├── script.js               → lógica do front-end
└── backend/
    ├── server.js           → servidor Node.js (proxy entre front-end e IA)
    ├── knowledge-base.js   → base de conhecimento dos manuais SEI
    ├── knowledge-search.js → busca de contexto relevante por pergunta
    ├── providers/
    │   ├── ollama.js       → integração com Ollama (local, gratuito)
    │   └── anthropic.js    → integração com API Anthropic (opcional, pago)
    ├── package.json
    ├── .env.example        → modelo do arquivo de configuração
    └── .gitignore
```

**Por que existe um backend separado?**
O front-end nunca se comunica com a IA diretamente. Toda chamada passa pelo backend, que protege eventuais chaves de API — impedindo que alguém abra o DevTools (F12) no navegador e as copie.

---

## Instalação e execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sei-chatbot.git
cd sei-chatbot
```

### 2. Configure o backend

```bash
cd backend
cp .env.example .env
```

Abra o arquivo `.env` e ajuste conforme necessário:

```env
PORT=3000
LLM_PROVIDER=ollama
OLLAMA_MODEL=phi3:mini     # ou llama3.1:8b
ALLOWED_ORIGIN=*           # em produção, coloque o domínio real
```

### 3. Instale as dependências do backend

```bash
npm install
```

### 4. Inicie o backend

```bash
npm start
```

Você deve ver:
```
Backend do assistente SEI Alagoas rodando na porta 3000
Provedor de IA ativo: ollama
```

### 5. Abra o front-end

Abra o arquivo `index.html` diretamente no navegador, ou sirva a pasta raiz com qualquer servidor estático:

```bash
# Opção simples com Node.js (instale uma vez: npm install -g serve)
npx serve .
```

Acesse `http://localhost:3000` no navegador — o chatbot estará pronto.

---

## Trocar o modelo de linguagem

Edite o arquivo `backend/.env` e altere a linha do modelo:

```env
OLLAMA_MODEL=phi3:mini
```

Reinicie o backend com `npm start`. Nenhum código precisa ser alterado.

Para ver os modelos disponíveis no Ollama:
```bash
ollama list
```

Para baixar outros modelos:
```bash
ollama pull gemma2:2b      # muito leve e rápido
ollama pull phi3:mini      # bom custo-benefício
ollama pull llama3.1:8b    # melhor qualidade
```

---

## Parar o Ollama

**Windows:** clique com botão direito no ícone do Ollama na bandeja do sistema (perto do relógio) → Quit Ollama. Ou pelo terminal:
```bash
taskkill /IM ollama.exe /F
```

**Linux:**
```bash
sudo systemctl stop ollama
```

**macOS:**
```bash
killall ollama
```

---

## Segurança antes de publicar / colocar em produção

- O arquivo `.env` está no `.gitignore` e **nunca vai para o repositório** — ele contém configurações locais e eventuais chaves de API.
- Em produção, troque `ALLOWED_ORIGIN=*` pelo domínio real do seu site no `.env`.
- O backend já inclui limite de 20 requisições por minuto por IP para evitar abuso.

---

## Tecnologias utilizadas

- **Front-end:** HTML, CSS e JavaScript puro (sem frameworks)
- **Backend:** Node.js com Express
- **IA:** Ollama com modelos open-source (Llama, Phi, Gemma, etc.)
- **Base de conhecimento:** Manuais oficiais SEI 4.0 e SEI 2.5.1
