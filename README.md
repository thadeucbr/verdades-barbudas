# 🚀 GUIA DE EXECUÇÃO - Verdades Barbudas

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Adicionar chaves de API ao .env (escolha pelo menos uma):
# GEMINI_API_KEY=sua_chave_aqui
# ou
# OPENAI_API_KEY=sua_chave_aqui
# ou
# OLLAMA_URL=http://localhost:11434

# Rodar em desenvolvimento
npm run dev

# Ou apenas iniciar
npm start
```

**Output esperado:**
```
[2024-10-17T10:30:00.000Z] ✅ Servidor iniciado na porta 3001
[2024-10-17T10:30:00.000Z] ℹ️  Ambiente: development
[2024-10-17T10:30:00.000Z] 🤖 IA Provider: gemini
```

### 2. Frontend Setup

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
cp .env.local.example .env.local

# Rodar em desenvolvimento
npm run dev
```

**Output esperado:**
```
- Ready in 1.234s
- Local: http://localhost:3000
```

## ✅ Testar

1. Abrir http://localhost:3000
2. Colar código qualquer
3. Clicar "Me fazer um Review!"
4. Esperar resposta tóxica do Rick

## 🔑 Configurar IAs

### Google Gemini (Recomendado - Gratuito)

1. Ir para https://ai.google.dev
2. Criar API key
3. Adicionar ao `.env` do backend:
```
AI_PROVIDER=gemini
GEMINI_API_KEY=sua_chave_aqui
```

### OpenAI (Pago)

1. Criar conta em https://platform.openai.com
2. Gerar API key
3. Adicionar ao `.env` do backend:
```
AI_PROVIDER=openai
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4
```

### Ollama (Local - Grátis)

1. Instalar Ollama: https://ollama.ai
2. Rodar um modelo:
```bash
ollama run llama2
```

3. Adicionar ao `.env` do backend:
```
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## 📁 Estrutura de Pastas

```
verdades-barbudas/
├── backend/
│   ├── server.js                 # Entrada principal
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/               # Configurações
│   │   ├── controllers/          # Lógica HTTP
│   │   ├── services/             # Lógica de negócio
│   │   ├── providers/            # Integrações com IAs
│   │   ├── middleware/           # Middlewares Express
│   │   └── utils/                # Utilitários
│   └── docs/
│       └── API.md                # Documentação API
│
├── frontend/
│   ├── next.config.js
│   ├── package.json
│   ├── .env.local.example
│   ├── src/
│   │   ├── app/                  # Pages e layouts
│   │   │   └── api/review/       # Proxy endpoint
│   │   ├── components/           # Componentes React
│   │   ├── hooks/                # Hooks customizados
│   │   ├── utils/                # Utilitários
│   │   └── styles/               # CSS
│   └── public/
│
└── ARQUITETURA.md               # Documentação técnica
```

## 🛡️ Segurança

### Proxy Local
- Frontend faz requisições para `/api/review` (Next.js local)
- Next.js redireciona para backend (3001)
- **Resultado:** Backend URL não é exposta ao browser

### Rate Limiting
- 10 requisições por minuto por IP (configurável)
- Previne abuso
- Responde com HTTP 429

### CORS
- Apenas `http://localhost:3000` pode chamar backend
- Configurável via `ALLOWED_ORIGINS` no `.env`

### Tamanho Máximo
- 50KB de código por requisição
- Previne DoS
- Retorna HTTP 413 se exceder

## 🧪 Testar API Manualmente

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Review de Código
```bash
curl -X POST http://localhost:3001/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function sum(a, b) { return a + b; }"
  }'
```

## 📊 Customizações

### Mudar Personalidade do Rick

Editar `backend/src/utils/prompts.js`:

```javascript
const getRickToxicPrompt = (code) => {
  return `
  // Customize o prompt aqui
  // Adicione mais insultos, referências, etc
`;
};
```

### Mudar Rate Limit

No `.env` do backend:
```
RATE_LIMIT_MAX_REQUESTS=20
RATE_LIMIT_WINDOW_MS=60000
```

### Mudar Tamanho Máximo

No `.env` do backend:
```
MAX_CODE_SIZE=102400  # 100KB
```

### Mudar UI

Editar `frontend/src/styles/globals.css` para cores, fontes, etc.

## 🐛 Debug

### Backend
```bash
# Terminal 1: Rodar com nodemon (auto-reload)
cd backend
npm run dev
```

### Frontend
```bash
# Terminal 2: Rodar Next.js
cd frontend
npm run dev
```

### Logs
- Backend: Terminal do backend mostra todos os logs
- Frontend: Console do browser (F12)
- Network: Aba Network do browser mostra requisições

## 🚀 Deploy

### Backend (Heroku, Railway, etc)

```bash
# Build
npm install

# Comando start
npm start

# Variáveis de ambiente
# GEMINI_API_KEY, OPENAI_API_KEY, etc
```

### Frontend (Vercel, Netlify, etc)

```bash
# Build
npm run build

# Variáveis de ambiente
# NEXT_PUBLIC_BACKEND_URL=https://seu-backend.com
```

## 📚 Próximas Features

- [ ] Histórico de reviews (localStorage/DB)
- [ ] Diferentes personalidades (além de Rick)
- [ ] GitHub integration (importar repos)
- [ ] Dashboard de estatísticas
- [ ] API key de usuário (persistência)
- [ ] Compartilhamento de reviews
- [ ] Dark/Light theme toggle
- [ ] Suporte multi-idioma

## ❓ FAQ

**P: Por que usar proxy?**
R: Para esconder o backend do browser e prevenir acesso direto.

**P: Qual IA escolho?**
R: Gemini é gratuita, OpenAI é paga mas mais poderosa, Ollama é local.

**P: Rate limit pode ser aumentado?**
R: Sim, edite `RATE_LIMIT_MAX_REQUESTS` no `.env`

**P: Como adicionar nova IA?**
R: Crie novo arquivo em `backend/src/providers/NOME.js` implementando a interface.

**P: Frontend é seguro?**
R: Sim, usa proxy local para não expor backend.

## 📞 Suporte

Se tiver problemas:

1. Verificar logs do backend
2. Abrir console do browser (F12)
3. Checar Network tab para requisições
4. Validar variáveis de `.env`

## 📝 Notas

- Código otimizado para manutenção por IA
- Muitos comentários explicativos
- Estrutura modular e escalável
- Fácil adicionar novos providers
- Fácil customizar prompts e UI

---

**Wubba Lubba Dub Dub! 🍻**
