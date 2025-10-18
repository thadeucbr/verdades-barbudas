# 🤖 INSTRUÇÕES PARA MANUTENÇÃO POR IA

## Objetivo Deste Documento

Este documento é um guia **PARA OUTRAS IAs** manterem este projeto.
Código está otimizado para ser compreendido e modificado por IAs.

---

## 📊 Mapa Mental do Projeto

```
VERDADES BARBUDAS
├── BACKEND (Node.js + Express)
│   ├── Função Principal: Receber código → Chamar IA → Retornar review
│   ├── Providers: Abstração para múltiplas IAs (Gemini, OpenAI, Ollama)
│   ├── Segurança: Rate limiting, validação, CORS
│   └── Entry: server.js
│
├── FRONTEND (Next.js + React)
│   ├── Função Principal: UI para usuário enviar código
│   ├── Proxy: /api/review redireciona para backend
│   ├── Componentes: CodeEditor, ReviewResult, LoadingState
│   └── Entry: src/app/page.js
│
└── Fluxo:
    Usuário → Frontend UI
           ↓
    Submete código → /api/review (proxy)
           ↓
    Backend recebe → Valida → Seleciona IA
           ↓
    Chama IA (Gemini/OpenAI/Ollama)
           ↓
    Retorna review tóxico → Frontend exibe
```

---

## 🔑 Conceitos-Chave

### 1. Provider Pattern (Abstração de IAs)

**Problema:** Diferentes IAs têm diferentes APIs.

**Solução:** Interface padrão em `backend/src/providers/`

Cada provider implementa:
```javascript
{
  name: string,
  async review(code, options) { },
  async isAvailable() { },
  getMetadata() { }
}
```

**Para adicionar nova IA:**
1. Criar `backend/src/providers/NOME.js`
2. Implementar interface acima
3. Adicionar à factory em `aiProviders.js`
4. Configurável via `.env` com `AI_PROVIDER=NOME`

### 2. Proxy Local (Segurança)

**Por que existe:** Esconder backend do browser

**Como funciona:**
```
Browser → /api/review (Next.js local)
       ↓
       Proxy valida + encaminha
       ↓
       Backend (3001) responde
       ↓
       Proxy retorna ao browser
```

**Arquivo:** `frontend/src/app/api/review/route.js`

### 3. Rate Limiting

**Objetivo:** Prevenir abuso

**Localização:** `backend/src/middleware/rateLimiter.js`

**Como funciona:**
- Conta requisições por IP
- Armazena em memória (objeto)
- Se exceder limite: HTTP 429

**Configurável via `.env`:**
```
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
```

### 4. Validação

**Localização:** `backend/src/middleware/validators.js`

**Valida:**
- Código não vazio
- Código < 50KB
- sourceType válido (snippet, github, file)
- sourceUrl válida se fornecida

---

## 📂 Arquivo-por-Arquivo: Guia de Modificação

### Backend

#### `backend/server.js`
**O quê:** Entrada principal, setup Express
**Modificar se:** Adicionar novas rotas, middlewares, ou handlers globais
**Não é um lugar para:** Lógica de negócio (vai em controllers/services)

#### `backend/src/config/env.js`
**O quê:** Centraliza TODAS as variáveis de ambiente
**Modificar se:** Adicionar novo setting configurável
**Padrão:** `const MY_VAR = process.env.MY_VAR || 'default_value';`

#### `backend/src/config/aiProviders.js`
**O quê:** Registry de providers disponíveis
**Modificar se:** Adicionar novo provider à lista
**Estrutura:** Array de objetos com metadata

#### `backend/src/providers/*.js`
**O quê:** Implementações de cada IA (Gemini, OpenAI, Ollama)
**Modificar se:** 
- Mudar parâmetros de chamada à IA
- Adicionar nova IA (copiar estrutura)
- Ajustar retry logic ou timeouts

#### `backend/src/services/aiService.js`
**O quê:** Orquestra providers, seleciona qual usar
**Modificar se:**
- Mudar lógica de seleção de provider
- Adicionar cache
- Implementar fallback (se IA 1 falhar, tenta IA 2)

#### `backend/src/controllers/reviewController.js`
**O quê:** Handlers de rotas HTTP
**Modificar se:** 
- Mudar estrutura de response
- Adicionar validações
- Implementar logging customizado

#### `backend/src/middleware/*`
**O quê:** Middlewares Express
**Modificar se:**
- Mudar regra de rate limiting
- Adicionar validações
- Implementar autenticação

#### `backend/src/utils/prompts.js`
**O quê:** Prompts para as IAs
**Modificar se:**
- Mudar personalidade do Rick
- Adicionar novas personalidades (getStandardPrompt, etc)
- Ajustar tom/idioma

### Frontend

#### `frontend/src/app/page.js`
**O quê:** Página principal, orquestra componentes
**Modificar se:**
- Mudar layout
- Adicionar seções
- Implementar novas funcionalidades

#### `frontend/src/app/layout.js`
**O quê:** Layout raiz, metadados
**Modificar se:**
- Mudar metadata (title, description)
- Adicionar providers globais (context, etc)

#### `frontend/src/app/api/review/route.js`
**O quê:** Proxy para backend
**Modificar se:**
- Mudar regras de validação no proxy
- Adicionar logs
- Implementar cache

#### `frontend/src/hooks/useReview.js`
**O quê:** Logic customizado, gerencia state
**Modificar se:**
- Mudar estados (idle, loading, success, error)
- Adicionar retry logic
- Implementar cache

#### `frontend/src/components/*.jsx`
**O quê:** Componentes React
**Componentes:**
- `CodeEditor`: Textarea + validação
- `ReviewResult`: Exibe resultado
- `LoadingState`: Spinner durante processo

#### `frontend/src/utils/api.js`
**O quê:** Funções de comunicação com backend
**Modificar se:**
- Mudar endpoint
- Adicionar novos tipos de requisição
- Implementar retry

#### `frontend/src/styles/globals.css`
**O quê:** Estilos globais
**Modificar se:**
- Mudar cores/tema
- Adicionar responsividade
- Melhorar UX/animações

---

## 🔧 Tarefas Comuns

### Adicionar Nova IA

1. **Criar provider:**
   ```bash
   cp backend/src/providers/geminiProvider.js backend/src/providers/NOMEAI.js
   ```

2. **Implementar interface:**
   - Copiar estrutura de GeminiProvider
   - Substituir chamada de API pela da nova IA
   - Testar que implementa: `review()`, `isAvailable()`, `getMetadata()`

3. **Adicionar a aiProviders.js:**
   ```javascript
   case 'nomeai':
     return require('../providers/nomeaiProvider');
   ```

4. **Adicionar env vars:**
   ```
   # .env.example e .env
   NOMEAI_API_KEY=valor
   ```

5. **Testar:**
   ```bash
   AI_PROVIDER=nomeai npm start
   ```

### Mudar Personalidade do Rick

1. **Editar `backend/src/utils/prompts.js`**

2. **Modificar `getRickToxicPrompt()`:**
   ```javascript
   const getRickToxicPrompt = (code) => {
     return `
     NOVAS INSTRUÇÕES...
     `;
   };
   ```

3. **Testar via curl:**
   ```bash
   curl -X POST http://localhost:3001/api/review \
     -H "Content-Type: application/json" \
     -d '{"code": "..."}'
   ```

### Aumentar Rate Limit

1. **Editar `.env`:**
   ```
   RATE_LIMIT_MAX_REQUESTS=20
   RATE_LIMIT_WINDOW_MS=120000  # 2 minutos
   ```

2. **Reiniciar backend**

### Implementar Persistência (BD)

1. **Backend:**
   - Adicionar `mongodb` ou `postgresql` à `package.json`
   - Criar `backend/src/models/` para schemas
   - Editar `reviewController.js` para salvar no BD

2. **Frontend:**
   - Editar `useReview.js` para carregar histórico
   - Adicionar componente de histórico

---

## 📋 Checklist de Manutenção

### Ao Adicionar Feature

- [ ] Adicionar comentários explicativos
- [ ] Validar inputs (backend e frontend)
- [ ] Adicionar rate limiting se necessário
- [ ] Testar manualmente
- [ ] Testar com diferentes IAs
- [ ] Atualizar documentação

### Ao Corrigir Bug

- [ ] Identificar root cause
- [ ] Adicionar logs para debug
- [ ] Implementar fix
- [ ] Validar que não quebrou outra coisa
- [ ] Documentar fix no código

### Ao Deploy

- [ ] Verificar `.env` tem todas as vars
- [ ] Correr `npm install` (backend e frontend)
- [ ] Correr testes (se tiver)
- [ ] Verificar health check: `GET /api/health`
- [ ] Testar requisição básica

---

## 🐛 Debugging para IAs

### Backend Não Responde

```bash
# 1. Verificar se está rodando
curl http://localhost:3001/

# 2. Verificar health
curl http://localhost:3001/api/health

# 3. Ver logs (stderr)
# Procura por: ❌ ou ⚠️

# 4. Verificar .env
# Certificar que GEMINI_API_KEY ou OPENAI_API_KEY está lá

# 5. Testar diretamente
curl -X POST http://localhost:3001/api/review \
  -H "Content-Type: application/json" \
  -d '{"code": "test"}'
```

### Frontend Não Funciona

```javascript
// F12 → Console
// Procurar por erros de requisição

// Verificar se proxy está funcionando
// DevTools → Network → Procurar por /api/review
// Deve retornar 200 OK

// Se retornar 503 ou erro
// Significa backend não está disponível
```

### IA Não Está Disponível

1. **Verificar API key:**
   ```bash
   # Verificar .env tem a key
   grep GEMINI_API_KEY backend/.env
   # Deve ser não-vazio
   ```

2. **Verificar conexão:**
   ```bash
   # Se Gemini:
   curl https://generativelanguage.googleapis.com/v1beta/models?key=SEU_CHAVE

   # Se OpenAI:
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer SEU_CHAVE"

   # Se Ollama:
   curl http://localhost:11434/api/tags
   ```

---

## 📚 Stack Técnico

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (minimalista)
- **APIs:** Gemini, OpenAI, Ollama
- **Middleware:** express-rate-limit, cors, helmet

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Rendering:** Client-side (SPA)
- **Styling:** CSS puro (sem Tailwind para simples)
- **HTTP:** Fetch API

### Deployment
- **Backend:** Pode ser em: Heroku, Railway, Render, VPS
- **Frontend:** Pode ser em: Vercel, Netlify, Cloudflare

---

## 🎯 Próximas Tasks Recomendadas

1. **Adicionar autenticação de usuário**
2. **Persistência (histórico de reviews)**
3. **Mais personalidades (além de Rick)**
4. **GitHub integration (importar repos)**
5. **Suporte a mais linguagens de código**
6. **Analytics/Dashboard**
7. **Testes automatizados**
8. **Docker containerization**

---

## 💡 Pro Tips para IAs

1. **Sempre comece lendo:**
   - Este arquivo (você está aqui ✓)
   - `ARQUITETURA.md` (visão geral)
   - `README.md` (guia de uso)

2. **Estrutura é sua amiga:**
   - Código está organizadoLogicamente
   - Cada arquivo tem responsabilidade clara
   - Fácil encontrar onde mudar

3. **Comentários são seu guia:**
   - Cada função tem comentários explicativos
   - Seções são marcadas com `===== DESCRIÇÃO =====`
   - Fácil entender intenção

4. **Teste sempre:**
   - Testar backend: `curl http://localhost:3001/api/review`
   - Testar frontend: Abrir browser em `http://localhost:3000`
   - Verificar logs em ambos

5. **Não quebra o que funciona:**
   - Validações existem por razão
   - Rate limiting existe por razão
   - Provider pattern existe por razão

---

**Última atualização:** 17 de outubro de 2025

**Versão:** 1.0.0

**Mantido para:** Manutenção por Inteligência Artificial 🤖
