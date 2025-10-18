# API Documentation - Verdades Barbudas Backend

## Base URL
```
http://localhost:3001
```

---

## Endpoints

### 1. GET / (Root)
Informações gerais do servidor

**Request:**
```http
GET /
```

**Response (200):**
```json
{
  "name": "Verdades Barbudas API",
  "version": "1.0.0",
  "provider": "gemini",
  "endpoints": {
    "review": "POST /api/review",
    "health": "GET /api/health"
  }
}
```

---

### 2. POST /api/review
**Endpoint principal** - Faz review do código com personalidade Rick tóxica

**Request:**
```http
POST /api/review
Content-Type: application/json

{
  "code": "function sum(a, b) { return a + b; }",
  "sourceType": "snippet",
  "sourceUrl": null
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | ✅ Yes | Código a fazer review (máx 50KB) |
| `sourceType` | string | ❌ No | Tipo: `snippet` \| `github` \| `file` (default: `snippet`) |
| `sourceUrl` | string | ❌ No | URL da origem se aplicável |

**Response (200 - Success):**
```json
{
  "success": true,
  "data": {
    "review": "Rick's toxic review here...",
    "metadata": {
      "provider": "gemini",
      "model": "gemini-pro",
      "processingTime": 1234,
      "tokensUsed": 500,
      "sourceType": "snippet",
      "sourceUrl": null,
      "timestamp": "2024-10-17T10:30:00.000Z"
    }
  }
}
```

**Response (400 - Validation Error):**
```json
{
  "success": false,
  "error": "Campo \"code\" é obrigatório e deve ser string"
}
```

**Response (413 - Payload Too Large):**
```json
{
  "success": false,
  "error": "Código muito grande. Máximo: 51200 bytes"
}
```

**Response (429 - Rate Limited):**
```json
{
  "success": false,
  "error": "Rate limit excedido. Tente novamente em alguns minutos.",
  "retryAfter": 60
}
```

**Response (503 - Service Unavailable):**
```json
{
  "success": false,
  "error": "AI Provider não disponível"
}
```

---

### 3. GET /api/health
Verifica saúde do servidor e disponibilidade dos providers

**Request:**
```http
GET /api/health
```

**Response (200):**
```json
{
  "success": true,
  "health": {
    "activeProvider": "gemini",
    "timestamp": "2024-10-17T10:30:00.000Z",
    "providers": {
      "gemini": {
        "available": true,
        "metadata": {
          "name": "Google Gemini",
          "model": "gemini-pro",
          "available": true,
          "maxInputTokens": 30000,
          "maxOutputTokens": 2048
        }
      },
      "openai": {
        "available": false,
        "metadata": {
          "name": "OpenAI",
          "model": "gpt-4",
          "available": false
        }
      },
      "ollama": {
        "available": true,
        "metadata": {
          "name": "Ollama",
          "model": "llama2",
          "available": true,
          "url": "http://localhost:11434",
          "isLocal": true
        }
      }
    }
  }
}
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Requisição bem-sucedida |
| 400 | Bad Request | Validação falhou (código inválido, etc) |
| 404 | Not Found | Endpoint não existe |
| 413 | Payload Too Large | Código maior que o máximo permitido |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro do servidor |
| 503 | Service Unavailable | Nenhum provider de IA disponível |
| 504 | Gateway Timeout | Timeout na resposta da IA |

---

## Rate Limiting

- **Limite padrão:** 10 requisições por minuto por IP
- **Janela:** 60 segundos
- **Configurável via:** `RATE_LIMIT_MAX_REQUESTS` e `RATE_LIMIT_WINDOW_MS` em `.env`

Quando rate limit é atingido, servidor retorna:
- Status: `429`
- Header: `Retry-After: {segundos}`

---

## CORS

**Origens permitidas (por padrão):**
- `http://localhost:3000`
- `http://localhost:3001`

**Métodos permitidos:**
- `GET`
- `POST`
- `OPTIONS`

**Configurável via:** `ALLOWED_ORIGINS` em `.env`

---

## Segurança

### 1. Rate Limiting
Protege contra abuso e DDoS. Limite por IP.

### 2. Input Validation
- Máximo 50KB de código
- Validação de tipo
- Validação de URLs

### 3. CORS Restritivo
Apenas origens explicitamente configuradas.

### 4. Helmet
Headers de segurança HTTP ativados.

### 5. Timeout
- Timeout global: 30 segundos
- Falha segura com erro 504

---

## Exemplo de Uso (cURL)

### 1. Health Check
```bash
curl -X GET http://localhost:3001/api/health
```

### 2. Review Simples
```bash
curl -X POST http://localhost:3001/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function hello() { console.log(\"hello\"); }"
  }'
```

### 3. Review com Metadados
```bash
curl -X POST http://localhost:3001/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "code": "var x = 1; var y = 2; z = x + y;",
    "sourceType": "snippet",
    "sourceUrl": "https://github.com/user/repo"
  }'
```

---

## Exemplo de Uso (JavaScript/Node.js)

```javascript
const BASE_URL = 'http://localhost:3001';

async function getReview(code) {
  const response = await fetch(`${BASE_URL}/api/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      sourceType: 'snippet'
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Uso
try {
  const result = await getReview('function test() { return 42; }');
  console.log(result.data.review);
} catch (error) {
  console.error(error);
}
```

---

## Exemplo de Uso (Python)

```python
import requests
import json

BASE_URL = 'http://localhost:3001'

def get_review(code):
    response = requests.post(
        f'{BASE_URL}/api/review',
        json={
            'code': code,
            'sourceType': 'snippet'
        }
    )
    response.raise_for_status()
    return response.json()

# Uso
try:
    result = get_review('x = 1\ny = 2\nz = x + y')
    print(result['data']['review'])
except Exception as e:
    print(f'Error: {e}')
```

---

## Notas Importantes

1. **Máximo de código:** 50KB (configurável via `MAX_CODE_SIZE`)
2. **Timeout:** 30 segundos por requisição
3. **Rate Limit:** 10 req/min por IP (configurável)
4. **Provider:** Configurável via `AI_PROVIDER` (.env)
5. **CORS:** Requer origin explicitamente permitida

---

## Próximas Melhorias

- [ ] Autenticação com chaves de API
- [ ] Webhooks para notificação de resultados
- [ ] Histórico de reviews
- [ ] Estatísticas de uso
- [ ] Dashboard de admin
- [ ] Diferentes personalidades além de Rick
