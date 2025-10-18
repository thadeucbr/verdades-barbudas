# Frontend - Verdades Barbudas

## .env.local

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
```

## Estrutura

```
src/
├── app/                    # App Router do Next.js 13+
│   ├── layout.js           # Layout raiz
│   ├── page.js             # Página principal
│   └── api/
│       └── review/
│           └── route.js    # Proxy para backend
├── components/
│   ├── CodeEditor.jsx      # Editor de código
│   ├── ReviewResult.jsx    # Resultado
│   └── LoadingState.jsx    # Loading
├── hooks/
│   └── useReview.js        # Hook customizado
├── utils/
│   ├── api.js              # Chamadas de API
│   └── codeValidator.js    # Validação
└── styles/
    └── globals.css         # Estilos globais
```

## Fluxo Principal

1. Usuário cola código no editor
2. Clica "Get Rick Review"
3. Frontend valida (tamanho, etc)
4. Frontend envia para `/api/review` (proxy local)
5. Proxy redireciona para backend
6. Backend processa com IA
7. Resultado volta para frontend
8. Exibe review tóxico do Rick

## Proxy Local

O endpoint `/api/review` do frontend faz proxy para o backend.
Isso ESCONDE o backend dos browsers e previne:
- Acesso direto à chave de API
- Chamadas diretas ao backend
- Bypass de rate limiting do frontend
- Rastreamento de chamadas

## Componentes

### CodeEditor
- Textarea grande para código
- Validação em tempo real
- Contador de caracteres
- Indicador de tamanho

### ReviewResult
- Exibe review do Rick
- Mostra metadata (tempo, tokens, provider)
- Botão para copiar resultado
- Botão para novo review

### LoadingState
- Spinner animado
- Mensagem de loading divertida
- Cancelável (cancel requisição)

## Segurança

1. **Proxy Local**: Chamadas passam pelo servidor Next.js
2. **Rate Limiting**: Pode ser implementado no proxy também
3. **Validação Cliente**: Antes de enviar
4. **CORS**: Configurado no backend apenas para frontend URL
