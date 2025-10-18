// ===== MIDDLEWARE: VALIDADORES =====
// Valida requisições antes de chegar ao controller

const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Valida body da requisição de review
 */
const validateReviewRequest = (req, res, next) => {
  try {
    const { code, sourceType, sourceUrl } = req.body;
    
    // Valida código
    if (!code || typeof code !== 'string') {
      logger.warn('Validação falhou: código ausente ou inválido');
      return res.status(400).json({
        success: false,
        error: 'Campo "code" é obrigatório e deve ser string'
      });
    }
    
    // Valida tamanho
    if (code.length > env.MAX_CODE_SIZE) {
      logger.warn(`Validação falhou: código muito grande (${code.length} > ${env.MAX_CODE_SIZE})`);
      return res.status(400).json({
        success: false,
        error: `Código muito grande. Máximo: ${env.MAX_CODE_SIZE} bytes`
      });
    }
    
    // Valida que não está vazio
    if (code.trim().length === 0) {
      logger.warn('Validação falhou: código vazio');
      return res.status(400).json({
        success: false,
        error: 'Código não pode estar vazio'
      });
    }
    
    // Valida sourceType se fornecido
    if (sourceType && !['snippet', 'github', 'file'].includes(sourceType)) {
      logger.warn(`Validação falhou: sourceType inválido - ${sourceType}`);
      return res.status(400).json({
        success: false,
        error: 'sourceType deve ser: snippet, github ou file'
      });
    }
    
    // Valida sourceUrl se fornecido (deve ser URL válida)
    if (sourceUrl && !isValidURL(sourceUrl)) {
      logger.warn(`Validação falhou: sourceUrl inválida - ${sourceUrl}`);
      return res.status(400).json({
        success: false,
        error: 'sourceUrl deve ser uma URL válida'
      });
    }
    
    logger.debug('Validação passou: requisição de review válida');
    next();
    
  } catch (error) {
    logger.error(`Erro em validador - ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao validar requisição'
    });
  }
};

/**
 * Valida se é uma URL válida
 * 
 * @param {string} url
 * @returns {boolean}
 */
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  validateReviewRequest
};
