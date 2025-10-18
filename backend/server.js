// ===== SERVIDOR PRINCIPAL =====
// Express app setup
// Middleware, rotas, iniciação

// CARREGA VARIÁVEIS DE AMBIENTE DO .env PRIMEIRO
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// Importações internas
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const rateLimiter = require('./src/middleware/rateLimiter');
const { validateReviewRequest } = require('./src/middleware/validators');
const errorHandler = require('./src/middleware/errorHandler');
const ReviewController = require('./src/controllers/reviewController');

// ===== CRIAR APP EXPRESS =====
const app = express();

// ===== MIDDLEWARE GLOBAL =====

// Segurança
app.use(helmet());

// Compressão
app.use(compression());

// Parse JSON
app.use(express.json({ 
  limit: '50kb' // Limite de 50KB por segurança
}));

// CORS - apenas origins permitidas
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Gera ID único para cada requisição (facilita tracking)
app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  logger.debug(`Requisição: ${req.method} ${req.path} [${req.id}]`);
  next();
});

// ===== ROTAS =====

/**
 * POST /api/review
 * 
 * Principais endpoint - recebe código e retorna review
 * 
 * Fluxo:
 * 1. Rate limiter
 * 2. Validadores
 * 3. Controller
 */
app.post('/api/review', 
  rateLimiter,
  validateReviewRequest,
  ReviewController.postReview
);

/**
 * GET /api/health
 * 
 * Health check - verifica se server e providers estão ok
 */
app.get('/api/health', 
  ReviewController.getHealth
);

/**
 * GET / (raiz)
 * 
 * Info do servidor
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Verdades Barbudas API',
    version: '1.0.0',
    provider: env.AI_PROVIDER,
    endpoints: {
      review: 'POST /api/review',
      health: 'GET /api/health'
    }
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.path
  });
});

// ===== ERROR HANDLER (deve ser último) =====
app.use(errorHandler);

// ===== INICIAR SERVIDOR =====
const server = app.listen(env.PORT, () => {
  logger.success(`🚀 Servidor iniciado na porta ${env.PORT}`);
  logger.info(`📡 Ambiente: ${env.NODE_ENV}`);
  logger.info(`🤖 IA Provider: ${env.AI_PROVIDER}`);
  logger.info(`🔒 Rate Limit: ${env.RATE_LIMIT_MAX_REQUESTS} req/${env.RATE_LIMIT_WINDOW_MS}ms`);
  logger.info(`📏 Tamanho máx de código: ${env.MAX_CODE_SIZE} bytes`);
  logger.info(`🌍 CORS permitido: ${env.ALLOWED_ORIGINS.join(', ')}`);
  logger.info(`\n📖 Documentação: http://localhost:${env.PORT}\n`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  logger.warn('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    logger.success('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.warn('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    logger.success('Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;
