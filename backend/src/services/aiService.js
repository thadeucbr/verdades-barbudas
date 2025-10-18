// ===== AI SERVICE =====
// Orquestra chamadas aos providers de IA
// Seleciona provider correto, trata erros, etc

const env = require('../config/env');
const logger = require('../utils/logger');
const { getAIProvider } = require('../config/aiProviders');

const AIService = {
  // Cache de provider para não recarregar
  _provider: null,
  
  /**
   * Carrega o provider configurado
   * 
   * @returns {Promise<object>} - Provider (Gemini, OpenAI, Ollama)
   */
  async getProvider() {
    try {
      if (!this._provider) {
        this._provider = await getAIProvider();
        logger.info(`AIService: Provider carregado - ${env.AI_PROVIDER}`);
      }
      return this._provider;
    } catch (error) {
      logger.error(`AIService: Erro ao carregar provider - ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Realiza review do código
   * Ponto de entrada principal
   * 
   * @param {string} code - Código a revisar
   * @param {object} options - Opções
   * @param {string} options.personality - Personalidade do review (rick, standard, etc)
   * @returns {Promise<{review: string, metadata: object}>}
   */
  async reviewCode(code, options = {}) {
    try {
      logger.info('AIService: iniciando review de código');
      
      // Valida entrada
      if (!code || code.trim().length === 0) {
        throw new Error('Código vazio');
      }
      
      if (code.length > env.MAX_CODE_SIZE) {
        throw new Error(`Código muito grande (máx: ${env.MAX_CODE_SIZE} bytes)`);
      }
      
      // Carrega provider
      const provider = await this.getProvider();
      
      // Faz timeout se necessário
      const reviewPromise = provider.review(code, options);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na resposta da IA')), env.AI_TIMEOUT)
      );
      
      // Executa com timeout
      const result = await Promise.race([reviewPromise, timeoutPromise]);
      
      logger.info('AIService: review concluído com sucesso');
      return result;
      
    } catch (error) {
      logger.error(`AIService: Erro no review - ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verifica saúde dos providers
   * 
   * @returns {Promise<object>} - Status de cada provider
   */
  async checkHealth() {
    try {
      logger.info('AIService: verificando saúde dos providers');
      
      const health = {
        activeProvider: env.AI_PROVIDER,
        timestamp: new Date().toISOString(),
        providers: {}
      };
      
      // Testa cada provider
      const providers = ['gemini', 'openai', 'ollama'];
      
      for (const providerName of providers) {
        try {
          // Carrega provider dinamicamente
          const provider = require(`../providers/${providerName}Provider`);
          const available = await provider.isAvailable();
          
          health.providers[providerName] = {
            available,
            metadata: provider.getMetadata()
          };
        } catch (error) {
          health.providers[providerName] = {
            available: false,
            error: error.message
          };
        }
      }
      
      return health;
      
    } catch (error) {
      logger.error(`AIService: Erro ao verificar saúde - ${error.message}`);
      throw error;
    }
  }
};

module.exports = AIService;
