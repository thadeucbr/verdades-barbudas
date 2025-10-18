// ===== MIDDLEWARE: ERROR HANDLER =====
// Captura erros globalmente e retorna responses padronizadas

const logger = require('../utils/logger');

/**
 * Handler global de erros
 * Deve ser o último middleware adicionado
 */
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.id || 'unknown';
  
  logger.error(`Erro capturado [${requestId}] - ${err.message}`);
  
  // Response padrão
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  
  // Trata erros conhecidos
  if (err.message.includes('Rate limit')) {
    statusCode = 429;
  } else if (err.message.includes('Código muito grande')) {
    statusCode = 413;
  } else if (err.message.includes('Timeout')) {
    statusCode = 504;
  } else if (err.message.includes('Provider não suportado')) {
    statusCode = 400;
  }
  
  // Responde
  res.status(statusCode).json({
    success: false,
    error: message,
    requestId,
    timestamp
  });
};

module.exports = errorHandler;
