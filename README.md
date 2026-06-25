# Assistente Virtual — Portal SEI Alagoas

Chatbot de atendimento para dúvidas sobre o Sistema Eletrônico de Informações (SEI) do Governo de Alagoas. O front-end conversa apenas com um backend próprio em Node.js, que por sua vez consulta o modelo de linguagem configurado — local (Ollama) ou na nuvem (Groq, gratuito).

---

## Como o projeto funciona

- O **front-end** (`index.html`, `style.css`, `script.js`) só fala com o backend. Ele nunca chama a IA diretamente.
- O **backend** (`server.js` e demais arquivos da pasta `backend/`) recebe a pergunta, monta o contexto com os manuais do SEI (`knowledge-base.js` + `knowledge-search.js`) e envia para o provedor de IA escolhido.
- Isso existe para que nenhuma chave de API fique exposta no navegador: se ela estivesse no JavaScript do front-end, qualquer pessoa poderia abrir o DevTools (F12) e copiá-la.

Você pode escolher **um** dos dois provedores de IA:

| Provedor | Onde roda | Custo | Observações |
|---|---|---|---|
| **Ollama** | Localmente, na sua máquina | Gratuito | Consome bastante RAM/CPU; respostas mais lentas em hardware sem GPU |
| **Groq** | Na nuvem | Gratuito (camada free generosa) | Não consome recursos da sua máquina; respostas muito rápidas; requer internet e uma conta no Groq |

Se a máquina onde o projeto vai rodar tiver recursos limitados, ou se você não quiser deixar um modelo rodando localmente, **o Groq é a opção recomendada**.

---

## Pré-requisitos

### 1. Node.js (versão 18 ou superior)

Acesse https://nodejs.org, baixe o instalador LTS e siga o assistente de instalação.

Verifique a instalação:
```bash
node --version
npm --version
```

### 2. Escolha do provedor de IA

Siga **apenas uma** das duas opções abaixo, de acordo com o que você quer usar.

#### Opção A — Groq (recomendado, roda na nuvem, gratuito)

1. Crie uma conta gratuita em https://console.groq.com
2. No painel, gere uma **API Key** (em "API Keys")
3. Guarde essa chave — você vai colá-la no arquivo `.env` mais adiante

Não é necessário instalar nada no computador para usar o Groq; tudo roda nos servidores deles.

#### Opção B — Ollama (roda localmente na sua máquina)

> ⚠️ Consome RAM e CPU/GPU da máquina onde estiver rodando. Recomendado apenas se você não quiser depender de internet ou de uma API externa.

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

Baixe um modelo (escolha conforme o hardware disponível):

| Modelo | Tamanho | RAM mínima | Velocidade (CPU) | Recomendado para |
|---|---|---|---|---|
| `qwen2.5:1.5b` | ~1 GB | 4 GB | Rápido | Hardware bem limitado |
| `phi3:mini` | 2.3 GB | 4 GB | ~15s/resposta | Hardware mais limitado |
| `llama3.1:8b` | 4.9 GB | 8 GB | ~60s/resposta | Melhor qualidade |

```bash
ollama pull qwen2.5:1.5b
# ou
ollama pull phi3:mini
# ou, com hardware mais robusto:
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
    │   ├── groq.js         → integração com a API Groq (nuvem, gratuito)
    │   └── anthropic.js    → integração com API Anthropic (opcional, pago)
    ├── package.json
    ├── .env.example        → modelo do arquivo de configuração
    └── .gitignore
```

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

Abra o arquivo `.env` e ajuste de acordo com o provedor escolhido:

**Se for usar o Groq:**
```env
PORT=3000
LLM_PROVIDER=groq
GROQ_API_KEY=cole_aqui_sua_chave_do_groq
GROQ_MODEL=llama-3.1-8b-instant
ALLOWED_ORIGIN=*           # em produção, coloque o domínio real
```

**Se for usar o Ollama:**
```env
PORT=3000
LLM_PROVIDER=ollama
OLLAMA_MODEL=phi3:mini     # ou qwen2.5:1.5b, llama3.1:8b, etc.
ALLOWED_ORIGIN=*           # em produção, coloque o domínio real
```

> 🚨 **Nunca** envie o arquivo `.env` para o GitHub ou compartilhe sua `GROQ_API_KEY` com outras pessoas. Ele já está listado no `.gitignore` por padrão. Se uma chave for exposta acidentalmente (por exemplo, em um arquivo enviado por engano), gere uma nova chave no painel do Groq e revogue a antiga imediatamente.

### 3. Instale as dependências do backend

```bash
npm install
```

### 4. Inicie o backend

```bash
npm start
```

Se estiver usando o Groq, você verá:
```
Backend do assistente SEI Alagoas rodando na porta 3000
Provedor de IA ativo: groq
```

Se estiver usando o Ollama, **certifique-se de que o Ollama está aberto e rodando** antes de iniciar o backend, e você verá:
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

O chatbot estará pronto para responder dúvidas sobre o SEI.

---

## Trocar o provedor de IA depois de instalado

Edite o arquivo `backend/.env` e altere a linha `LLM_PROVIDER` para `groq` ou `ollama`, ajustando as demais variáveis correspondentes (chave do Groq ou modelo do Ollama). Reinicie o backend com `npm start` — nenhum código precisa ser alterado.

---

## Parar o Ollama (apenas se estiver usando essa opção)

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

- O arquivo `.env` está no `.gitignore` e **nunca deve ir para o repositório** — ele contém suas chaves de API e configurações locais.
- Em produção, troque `ALLOWED_ORIGIN=*` pelo domínio real do seu site no `.env`.
- O backend já inclui limite de 20 requisições por minuto por IP para evitar abuso.
- Se estiver usando o Groq, monitore o uso da sua chave no painel do Groq para identificar qualquer atividade incomum.

---

## Tecnologias utilizadas

- **Front-end:** HTML, CSS e JavaScript puro (sem frameworks)
- **Backend:** Node.js com Express
- **IA:** Groq (API gratuita na nuvem) ou Ollama (modelos open-source locais, como Llama, Phi, Qwen)
- **Base de conhecimento:** Manuais oficiais SEI 4.0 e SEI 2.5.1
