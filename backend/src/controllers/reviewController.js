// ===== REVIEW CONTROLLER =====
// Lógica de negócio para reviews
// Orquestra entre HTTP e serviços

const AIService = require('../services/aiService');
const logger = require('../utils/logger');

const ReviewController = {
  /**
   * Handler principal para POST /api/review
   * 
   * Fluxo:
   * 1. Recebe código do cliente
   * 2. Valida (feito no middleware)
   * 3. Chama AIService para fazer review
   * 4. Retorna resultado
   */
  async postReview(req, res, next) {
    try {
      const { code, sourceType = 'snippet', sourceUrl = null } = req.body;
      const clientIP = req.ip || 'unknown';
      
      logger.info(`ReviewController: novo review solicitado de ${clientIP}`);
      logger.debug(`Tipo: ${sourceType}, Tamanho: ${code.length} bytes`);
      
      // Chama service para fazer review
      const reviewResult = await AIService.reviewCode(code, {
        personality: 'rick-toxic'
      });
      
      // Log de sucesso
      logger.success(`ReviewController: review completado em ${reviewResult.metadata.processingTime}ms`);
      
      // Retorna resultado
      res.status(200).json({
        success: true,
        data: {
          review: reviewResult.review,
          metadata: {
            ...reviewResult.metadata,
            sourceType,
            sourceUrl,
            timestamp: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      logger.error(`ReviewController: erro ao processar review - ${error.message}`);
      
      // Passa para error handler
      next(error);
    }
  },
  
  /**
   * Health check endpoint
   * Verifica se server está rodando e providers disponíveis
   */
  async getHealth(req, res, next) {
    try {
      logger.info('ReviewController: health check solicitado');
      
      const health = await AIService.checkHealth();
      
      // Verifica se há ao menos um provider disponível
      const anyProviderAvailable = Object.values(health.providers)
        .some(p => p.available);
      
      if (!anyProviderAvailable) {
        return res.status(503).json({
          success: false,
          error: 'Nenhum provider de IA disponível',
          health
        });
      }
      
      res.status(200).json({
        success: true,
        health
      });
      
    } catch (error) {
      logger.error(`ReviewController: erro no health check - ${error.message}`);
      next(error);
    }
  }
};

module.exports = ReviewController;
