# Deploy em Ubuntu com Docker e Cloudflare Zero Trust

Este guia resume os passos para rodar o Verdades Barbudas em um servidor Ubuntu usando Docker Compose e expor os serviços via Cloudflare Zero Trust.

## 1. Pré-requisitos

- Ubuntu 22.04 LTS (ou superior) com acesso root
- Docker Engine e Docker Compose instalados
- Domínios configurados no Cloudflare (`verdades.barbudas.com` e `backverdades.barbudas.com`)
- Chave válida do provedor de IA escolhido (ex.: `GEMINI_API_KEY`)

## 2. Clonar o repositório no servidor

```bash
ssh usuario@seu-servidor
cd /opt
sudo git clone https://github.com/thadeucbr/verdades-barbudas.git
cd verdades-barbudas
```

## 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (ele é consumido pelo `docker-compose.yml`).

```bash
cat <<'EOF' > .env
# --- Backend ---
AI_PROVIDER=gemini
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4
OLLAMA_URL=
OLLAMA_MODEL=llama2
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
MAX_CODE_SIZE=51200
AI_TIMEOUT=30000
ALLOWED_ORIGINS=https://verdades.barbudas.com,https://backverdades.barbudas.com

# --- Frontend ---
NEXT_PUBLIC_BACKEND_URL=https://backverdades.barbudas.com
NEXT_PUBLIC_API_TIMEOUT=30000
EOF
```

> Para testes locais você pode acrescentar `http://localhost:4310` e `http://localhost:4311` em `ALLOWED_ORIGINS`.

## 4. Construir e subir os containers

```bash
sudo docker compose up --build -d
```

Serviços:

- Frontend: porta interna `4310`
- Backend: porta interna `4311`

Verifique os logs se necessário:

```bash
sudo docker compose logs -f frontend
sudo docker compose logs -f backend
```

## 5. Configurar Cloudflare Zero Trust

1. Crie (ou edite) um túnel apontando para o IP do seu servidor Ubuntu.
2. Adicione duas rotas HTTP no túnel:
   - `https://verdades.barbudas.com` → `http://127.0.0.1:4310`
   - `https://backverdades.barbudas.com` → `http://127.0.0.1:4311`
3. Salve e publique o túnel.
4. (Opcional) Crie políticas de acesso para limitar quem pode abrir as URLs.

## 6. Manutenção

- `sudo docker compose pull && sudo docker compose up --build -d` para atualizar o código.
- `sudo docker compose down` para parar os serviços.
- Os volumes não são persistidos; se desejar logs persistentes, configure volumes no `docker-compose.yml`.

---

Com isso o Verdades Barbudas estará disponível nas URLs desejadas por trás da camada Zero Trust do Cloudflare.
