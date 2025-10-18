// ===== MIDDLEWARE: RATE LIMITER =====
// Protege contra abuso e DDoS
// Limita requisições por IP

const env = require('../config/env');
const logger = require('../utils/logger');

// Armazena info de requisições por IP
// Formato: { ip: { count: number, resetTime: timestamp } }
const requestCounts = {};

const rateLimiterMiddleware = (req, res, next) => {
  try {
    // Extrai IP do cliente
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    const now = Date.now();
    const windowStart = now - env.RATE_LIMIT_WINDOW_MS;
    
    // Inicializa registro se não existe
    if (!requestCounts[clientIP]) {
      requestCounts[clientIP] = {
        requests: [],
        lastCleanup: now
      };
    }
    
    const ipData = requestCounts[clientIP];
    
    // Limpa requisições antigas a cada hora
    if (now - ipData.lastCleanup > 3600000) {
      ipData.requests = ipData.requests.filter(t => t > windowStart);
      ipData.lastCleanup = now;
    }
    
    // Remove requisições fora da janela
    ipData.requests = ipData.requests.filter(t => t > windowStart);
    
    // Verifica limite
    if (ipData.requests.length >= env.RATE_LIMIT_MAX_REQUESTS) {
      logger.warn(`Rate limit excedido para IP ${clientIP} (${ipData.requests.length} requisições)`);
      
      return res.status(429).json({
        success: false,
        error: 'Rate limit excedido. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000)
      });
    }
    
    // Registra nova requisição
    ipData.requests.push(now);
    
    logger.debug(`Rate limiter: ${clientIP} (${ipData.requests.length}/${env.RATE_LIMIT_MAX_REQUESTS})`);
    
    // Passa para próximo middleware
    next();
    
  } catch (error) {
    logger.error(`Rate limiter: erro - ${error.message}`);
    // Em caso de erro, deixa passar (fail-open)
    next();
  }
};

module.exports = rateLimiterMiddleware;
