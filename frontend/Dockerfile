# syntax=docker/dockerfile:1
FROM node:22.10.0-alpine3.20 AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

FROM node:22.10.0-alpine3.20 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22.10.0-alpine3.20 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4310
ENV HOSTNAME=0.0.0.0

# Copia artefatos standalone do Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

EXPOSE 4310

CMD ["node", "server.js"]
