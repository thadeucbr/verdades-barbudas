# Arquitetura - Verdades Barbudas (Rick Review)

## 📋 Visão Geral

Sistema de review de código com personalidade tóxica do Rick (Rick e Morty). 
O usuário envia código via front-end → Back-end processa → Chamada para IA → Response tóxico volta para o usuário.

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend  │────────▶│     Backend      │────────▶│   Gemini    │
│  (Next.js)  │◀────────│   (Express.js)   │◀────────│  / OpenAI   │
│             │         │                  │         │  / Ollama   │
└─────────────┘         └──────────────────┘         └─────────────┘
      ▲                        ▲
      │                        │
      │                        │
   User Submit             Rate Limiting
   Code Request            Request Validation
                           AI Selection
```

## 🔐 Segurança

### 1. **Mascaramento de Endpoints (Proxy)**
- Front envia requisições para `/api/review`
- Backend mascara as chamadas reais para IA providers
- Chaves de API NUNCA são expostas ao cliente

### 2. **Rate Limiting**
- Limite de requisições por IP/Usuário (via middleware)
- Previne abuso malicioso

### 3. **Validação**
- Validação de tamanho máximo de código
- Validação de conteúdo suspeito
- CORS configurado corretamente

## 📁 Estrutura de Pastas

```
backend/
├── .env.example                    # Variáveis de ambiente modelo
├── .env                            # Variáveis de ambiente (NÃO COMMITAR)
├── package.json
├── server.js                       # Entrada principal
├── src/
│   ├── config/
│   │   ├── env.js                  # Configurações de ambiente
│   │   └── aiProviders.js          # Configuração de IAs
│   ├── controllers/
│   │   └── reviewController.js     # Lógica do review
│   ├── services/
│   │   ├── aiService.js            # Orquestração de IAs
│   │   └── codeProcessorService.js # Processamento de código
│   ├── providers/
│   │   ├── geminiProvider.js       # Integração Gemini
│   │   ├── openaiProvider.js       # Integração OpenAI
│   │   └── ollamaProvider.js       # Integração Ollama
│   ├── middleware/
│   │   ├── rateLimiter.js          # Rate limiting
│   │   ├── validators.js           # Validações
│   │   └── errorHandler.js         # Handler de erros
│   └── utils/
│       ├── prompts.js              # Prompts para as IAs
│       └── logger.js               # Sistema de logs
└── docs/
    └── API.md                      # Documentação da API

frontend/
├── .env.local.example              # Variáveis de ambiente modelo
├── package.json
├── next.config.js
├── src/
│   ├── app/
│   │   ├── layout.js               # Layout principal
│   │   ├── page.js                 # Página inicial
│   │   └── api/                    # Route handlers (proxy)
│   │       └── review/
│   │           └── route.js        # POST /api/review
│   ├── components/
│   │   ├── CodeEditor.jsx          # Editor de código
│   │   ├── ReviewResult.jsx        # Resultado do review
│   │   └── LoadingState.jsx        # Loading
│   ├── hooks/
│   │   └── useReview.js            # Hook customizado
│   ├── utils/
│   │   ├── api.js                  # Chamadas de API
│   │   └── codeValidator.js        # Validação de código
│   └── styles/
│       └── globals.css
└── public/
```

## 🤖 Suporte a IAs

O sistema é **agnóstico a IA**. Cada provider implementa a mesma interface:

```javascript
// Cada provider deve ter:
class AIProvider {
  async review(code, personality) {
    // Implementação específica
  }
  
  isAvailable() {
    // Verifica se provider está disponível
  }
  
  getMetadata() {
    // Retorna info do provider
  }
}
```

### Providers Disponíveis:
- **Gemini**: Google's generative AI (default)
- **OpenAI**: GPT-4, GPT-3.5 Turbo
- **Ollama**: Local LLMs (Llama 2, Mistral, etc)

Seleção via `AI_PROVIDER` env var.

## 🔌 API Endpoints

### POST /api/review
```json
{
  "code": "string (máx 50KB)",
  "sourceType": "snippet|github",
  "sourceUrl": "string (opcional)",
  "aiProvider": "gemini|openai|ollama" (opcional, usa default)
}
```

Response:
```json
{
  "success": true,
  "review": "Review tóxico do Rick...",
  "metadata": {
    "aiProvider": "gemini",
    "processingTime": 1234,
    "tokensUsed": 500
  }
}
```

## 🛡️ Rate Limiting

- 10 requisições por minuto por IP (configurável)
- 100 requisições por hora por IP
- Timeout: 30 segundos para resposta

## 📝 Fluxo de Processamento

1. **Frontend**: Usuário cola código e clica "enviar"
2. **Frontend**: Valida tamanho, faz POST para `/api/review`
3. **Backend (Middleware)**:
   - Rate limiter verifica IP
   - Validadores verificam tamanho/conteúdo
   - Criptografia/compressão (opcional)
4. **Backend (Controller)**:
   - Extrai código do body
   - Chama AIService com AI provider selecionado
5. **Backend (AIService)**:
   - Seleciona provider baseado em config
   - Formata prompt com personalidade Rick tóxica
   - Envia para API da IA
   - Processa resposta
6. **Backend**: Retorna review para frontend
7. **Frontend**: Exibe resultado de forma divertida

## 🌍 Variáveis de Ambiente

### Backend
```
# AI Provider (gemini, openai, ollama)
AI_PROVIDER=gemini

# Keys das APIs
GEMINI_API_KEY=
OPENAI_API_KEY=
OLLAMA_URL=http://localhost:11434

# Server
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Validation
MAX_CODE_SIZE=51200 # 50KB
```

### Frontend
```
# Backend URL (proxy)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
```

## 🚀 Próximos Passos

### ✅ Concluído

1. ✅ Criar estrutura backend com Express
2. ✅ Implementar providers de IA
3. ✅ Configurar rate limiting e middleware
4. ✅ Criar frontend com Next.js
5. ✅ Testar integração
6. ✅ Configurar Docker e Docker Compose
7. ✅ Documentar deploy com Cloudflare Zero Trust

### 🚀 Próximas Melhorias

1. Implementar autenticação de usuários
2. Adicionar banco de dados para histórico
3. Criar dashboard de métricas
4. Implementar webhooks
5. Adicionar mais providers de IA
6. Criar testes automatizados

---

## 🐳 Deploy e Infraestrutura

### Docker

O projeto está containerizado usando Docker multi-stage builds:

- **Backend**: Node.js 22 Alpine (imagem otimizada)
- **Frontend**: Next.js standalone mode (build otimizado)
- **Comunicação**: Rede interna Docker entre containers

### Arquitetura de Produção

```text
Cloudflare Zero Trust
        ↓
Frontend Container (4310)
        ↓ (rede Docker)
Backend Container (4311)
        ↓
AI APIs (Gemini/OpenAI/Ollama)
```

**Características:**

- Frontend exposto via Cloudflare: `verdades.barbudas.com`
- Backend NÃO exposto publicamente (apenas rede interna)
- Comunicação interna: `http://backend:4311`
- Apenas 1 domínio necessário no Cloudflare

Consulte `DEPLOYMENT_DOCKER.md` para instruções completas de deploy.

---

**Nota**: Código otimizado para manutenção por IA. Muitos comentários explicativos, nomes descritivos, funções pequenas e focadas.
