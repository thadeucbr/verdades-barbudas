# 🗺️ MAPA VISUAL DO PROJETO

## Fluxo de Requisição Completo

```
┌──────────────────────────────────────────────────────────────┐
│                         USUÁRIO                               │
│                                                               │
│  Abre http://localhost:3000                                  │
│  Vê página bonitinha com textarea gigante                   │
│  Cola código (JavaScript, Python, Java, etc)                │
│  Clica botão "Me fazer um Review! 🔥"                       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                          │
│                   src/app/page.js                            │
│                                                               │
│  1. CodeEditor captura código                               │
│  2. useReview.js valida tamanho                             │
│  3. Muda estado para "loading"                              │
│  4. POST /api/review com código                             │
│                                                               │
│  Estado da UI: LoadingState aparece                         │
│  Mensagem: "Rick tá pensando... 🤔"                         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              PROXY LOCAL (Next.js Route)                      │
│              src/app/api/review/route.js                     │
│                                                               │
│  1. Recebe POST /api/review do frontend                      │
│  2. Valida básico (não é vazio, etc)                         │
│  3. Faz axios.post para http://localhost:3001               │
│  4. Espera resposta do backend                               │
│  5. Retorna para frontend                                    │
│                                                               │
│  Segurança: Backend URL nunca vaza pro browser              │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│             BACKEND (Express.js)                              │
│             backend/server.js                                │
│                                                               │
│  Middleware Chain:                                           │
│  1. CORS middleware - valida origem                         │
│  2. Rate Limiter - conta req por IP                         │
│  3. Validator - valida tamanho/tipo                         │
│  4. ParseJSON - lê body                                      │
│                                                               │
│  Controller recebe requisição:                              │
│  src/controllers/reviewController.js                         │
│  → postReview(code)                                          │
│                                                               │
│  Validações:                                                 │
│  ✓ Código não vazio                                         │
│  ✓ Código < 50KB                                            │
│  ✓ IP não excedeu rate limit                               │
│  ✓ Content-Type válido                                      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│         AIService (Orquestração de Providers)                │
│         src/services/aiService.js                            │
│                                                               │
│  1. Lê variável AI_PROVIDER do .env                         │
│  2. Seleciona provider dinamicamente:                        │
│                                                               │
│     AI_PROVIDER=gemini? → Carrega geminiProvider            │
│     AI_PROVIDER=openai? → Carrega openaiProvider            │
│     AI_PROVIDER=ollama? → Carrega ollamaProvider            │
│                                                               │
│  3. Chama provider.review(code, options)                     │
│  4. Aguarda resposta (com timeout de 30s)                   │
│  5. Retorna resultado padronizado                           │
└──────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
    ┌─────────────┐    ┌────────────┐    ┌──────────────┐
    │   Gemini    │    │   OpenAI   │    │   Ollama     │
    │   (Google)  │    │ (GPT-4/3.5)│    │   (Local)    │
    └─────────────┘    └────────────┘    └──────────────┘
        ↓                  ↓                      ↓
    API Call:          API Call:             API Call:
    model.generate    openai.chat.        http://
    Content()         completions          localhost:
                      (Bearer key)         11434/api
                                          /generate
        ↓                  ↓                      ↓
    ┌─────────────────────────────────────────────────┐
    │  Resposta com Review Tóxico do Rick:            │
    │                                                  │
    │  "Morty, Morty... esse código é TÃO ruim..."  │
    │  "Você conseguiu quebrar até o debugger!"      │
    │  "A Citadela de Ricks repudia isso!"           │
    │  "Refatora isso, grandson!"                    │
    │  "Burp! *bebe bebida verde*"                   │
    └─────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│          Backend Return (JSON)                                │
│                                                               │
│  {                                                            │
│    "success": true,                                          │
│    "data": {                                                 │
│      "review": "Review tóxico aqui...",                     │
│      "metadata": {                                           │
│        "provider": "gemini",                                │
│        "model": "gemini-pro",                               │
│        "processingTime": 1234,  // ms                       │
│        "tokensUsed": 500                                    │
│      }                                                       │
│    }                                                         │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│           PROXY RETORNA PARA FRONTEND                        │
│                                                               │
│  Frontend recebe resposta e muda estado                     │
│  useReview.js: state → 'success'                            │
│  review = "Morty, esse código..."                           │
│  metadata = { provider, model, tempo, tokens }              │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│         FRONTEND EXIBE RESULTADO                              │
│                                                               │
│  ReviewResult.jsx mostra:                                    │
│  ┌────────────────────────────────────────────────┐         │
│  │ 🔥 Review Tóxico do Rick 🔥                    │         │
│  │                                                │         │
│  │ 🤓 | Rick:                                     │         │
│  │     "Morty, Morty... esse código é TÃO ruim"  │         │
│  │     ...review completo...                      │         │
│  │                                                │         │
│  │ Metadata:                                      │         │
│  │ Provider: gemini | Modelo: gemini-pro          │         │
│  │ Tempo: 1234ms | Tokens: 500                    │         │
│  │                                                │         │
│  │ [Copiar Review] [Compartilhar] [Novo Review]  │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  Usuário pode:                                               │
│  ✓ Copiar review para clipboard                             │
│  ✓ Compartilhar em redes sociais                            │
│  ✓ Fazer novo review                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Arquitetura de Segurança

```
INTERNET (Browser)
    ↓
    ├─ HTTP/CORS
    ├─ Validação de origem
    └─ Sem acesso a chaves de API
         ↓
    ┌─────────────────────────────────┐
    │  Next.js Proxy                  │
    │  /api/review                    │
    │                                 │
    │  ✓ Valida requisição            │
    │  ✓ Pode ter rate limit próprio  │
    │  ✓ Encaminha para backend       │
    │  ✓ Protege backend URL          │
    └─────────────────────────────────┘
             ↓
    localhost:3001 (Backend)
    └─ CORS restritivo
    └─ Rate limiting por IP
    └─ Validação em múltiplas camadas
    └─ Chaves de API seguros em .env
```

---

## Fluxo de Seleção de Provider

```
Backend inicializa:
    ↓
env.js:
    AI_PROVIDER = process.env.AI_PROVIDER
    ↓ (ex: "gemini")
    ↓
aiProviders.js:
    function getAIProvider() {
        if (AI_PROVIDER === 'gemini')
            return require('./providers/geminiProvider');
        else if (AI_PROVIDER === 'openai')
            return require('./providers/openaiProvider');
        else if (AI_PROVIDER === 'ollama')
            return require('./providers/ollamaProvider');
    }
    ↓
    Carrega provider correspondente
    ↓
Cada provider implementa:
    {
        name: "Gemini" / "OpenAI" / "Ollama",
        async review(code, options) { },
        async isAvailable() { },
        getMetadata() { }
    }
    ↓
aiService.js:
    const provider = await getAIProvider();
    result = await provider.review(code, options);
    ↓
    Retorna resultado padronizado
```

---

## Estrutura de Middleware (Backend)

```
POST /api/review
    ↓
┌─────────────────────────────────────┐
│ 1. CORS Middleware                  │
│    - Valida: Origin = localhost:3000│
│    - Métodos: GET, POST, OPTIONS    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Rate Limiter Middleware          │
│    - Extrai IP do cliente           │
│    - Conta requisições por IP       │
│    - Se > 10/min: HTTP 429          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Validator Middleware             │
│    - Código não vazio?              │
│    - Código < 50KB?                 │
│    - Type é string?                 │
│    - Se invalida: HTTP 400          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 4. Controller                       │
│    reviewController.postReview()    │
│    - Valida lógica de negócio       │
│    - Chama AIService                │
│    - Retorna resposta               │
└─────────────────────────────────────┘
    ↓
    HTTP 200 + JSON
    ↓
┌─────────────────────────────────────┐
│ 5. Error Handler (Fallback)         │
│    - Captura erros não tratados     │
│    - Retorna HTTP 500 + erro JSON   │
└─────────────────────────────────────┘
```

---

## Variáveis de Ambiente (CI/CD)

```
Backend (.env)
├─ AI_PROVIDER (obrigatório)
│  └─ gemini | openai | ollama
│
├─ Chaves de API (obrigatório para provider)
│  ├─ GEMINI_API_KEY (se AI_PROVIDER=gemini)
│  ├─ OPENAI_API_KEY (se AI_PROVIDER=openai)
│  └─ OLLAMA_URL (se AI_PROVIDER=ollama)
│
├─ Server
│  ├─ PORT (default: 3001)
│  └─ NODE_ENV (development|production)
│
├─ Rate Limiting
│  ├─ RATE_LIMIT_MAX_REQUESTS (default: 10)
│  └─ RATE_LIMIT_WINDOW_MS (default: 60000)
│
└─ Segurança
   ├─ MAX_CODE_SIZE (default: 51200)
   ├─ AI_TIMEOUT (default: 30000)
   └─ ALLOWED_ORIGINS (default: localhost:3000)

Frontend (.env.local)
├─ NEXT_PUBLIC_BACKEND_URL (default: localhost:3001)
└─ NEXT_PUBLIC_API_TIMEOUT (default: 30000)
```

---

## Estados Possíveis (Frontend)

```
useReview Hook Estados:

1. IDLE
   ├─ CodeEditor ativo
   ├─ Botão "Enviar" ativo
   └─ Nenhum resultado

2. LOADING
   ├─ CodeEditor desativado
   ├─ LoadingState mostra spinner
   ├─ Timeout de 30s
   └─ Pode ser cancelado

3. SUCCESS
   ├─ ReviewResult mostra review
   ├─ Metadata visível
   ├─ Botões de copiar/compartilhar
   └─ Botão "Novo Review" ativa

4. ERROR
   ├─ ErrorBox mostra mensagem
   ├─ Possíveis erros:
   │  ├─ Código vazio
   │  ├─ Código muito grande
   │  ├─ Rate limit excedido
   │  ├─ Backend não disponível
   │  └─ Timeout
   └─ Botão "Tentar Novamente"
```

---

## 🐳 Deploy com Docker

```text
DESENVOLVIMENTO (Local)
├─ Backend: npm run dev (port 3001)
└─ Frontend: npm run dev (port 3000)

PRODUÇÃO (Docker + Cloudflare Zero Trust)

┌─────────────────────────────────────────────────────────┐
│                    CLOUDFLARE TUNNEL                     │
│                                                          │
│  verdades.barbudas.com → http://127.0.0.1:4310         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              DOCKER COMPOSE (Ubuntu Server)             │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │  Frontend Container (verdades-frontend)       │      │
│  │  - Porta: 4310                                │      │
│  │  - Image: Node 22 Alpine                      │      │
│  │  - Next.js Standalone Build                   │      │
│  │  - ENV: NEXT_PUBLIC_BACKEND_URL=http://backend:4311│
│  └──────────────────────────────────────────────┘      │
│                      ↓ (rede interna Docker)            │
│  ┌──────────────────────────────────────────────┐      │
│  │  Backend Container (verdades-backend)         │      │
│  │  - Porta: 4311 (NÃO exposto publicamente)    │      │
│  │  - Image: Node 22 Alpine                      │      │
│  │  - Express.js                                 │      │
│  │  - ENV: AI_PROVIDER, GEMINI_API_KEY, etc     │      │
│  └──────────────────────────────────────────────┘      │
│                      ↓                                   │
│              AI APIs (Gemini/OpenAI/Ollama)             │
└─────────────────────────────────────────────────────────┘

Características:
✅ Backend NÃO exposto na internet (apenas rede interna)
✅ Apenas 1 domínio necessário no Cloudflare
✅ Comunicação segura entre containers via nome do serviço
✅ Builds multi-stage otimizados
✅ Imagens Alpine Linux (leves)
✅ Hot restart com Docker Compose

Comandos:
docker compose up --build -d    # Subir containers
docker compose logs -f          # Ver logs
docker compose down             # Parar containers
```

**Consulte `DEPLOYMENT_DOCKER.md` para instruções completas.**

---

_Diagrama atualizado: 21 de outubro de 2025_
