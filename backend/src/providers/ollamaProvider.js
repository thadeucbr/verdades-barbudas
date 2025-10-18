// ===== PROVIDER OLLAMA =====
// Integração com Ollama (LLMs locais - Llama, Mistral, etc)
// Implementa interface padrão de provider

const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

// ===== INTERFACE PADRÃO DO PROVIDER =====

const OllamaProvider = {
  // Nome do provider
  name: 'Ollama',
  
  /**
   * Realiza review do código usando Ollama
   * 
   * @param {string} code - Código a fazer review
   * @param {object} options - Opções de configuração
   * @returns {Promise<{review: string, metadata: object}>}
   */
  async review(code, options = {}) {
    try {
      logger.info('OllamaProvider: iniciando review');
      
      // Importa prompts
      const { getRickToxicPrompt } = require('../utils/prompts');
      const systemPrompt = getRickToxicPrompt(code);
      
      // URL do endpoint Ollama
      const ollamaUrl = `${env.OLLAMA_URL}/api/generate`;
      
      // Payload para Ollama
      const payload = {
        model: env.OLLAMA_MODEL || 'llama2',
        prompt: systemPrompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.9,
          top_p: 0.95,
          top_k: 40,
          num_predict: 2048
        }
      };
      
      // Realiza chamada à API
      const startTime = Date.now();
      const response = await axios.post(ollamaUrl, payload, {
        timeout: env.AI_TIMEOUT
      });
      const processingTime = Date.now() - startTime;
      
      // Extrai resposta
      const review = response.data.response;
      
      logger.info(`OllamaProvider: review concluído em ${processingTime}ms`);
      
      // Retorna em formato padrão
      return {
        review,
        metadata: {
          provider: 'ollama',
          model: env.OLLAMA_MODEL,
          processingTime,
          tokensUsed: response.data.eval_count || 0
        }
      };
      
    } catch (error) {
      logger.error(`OllamaProvider: erro durante review - ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verifica se o provider está disponível
   * Testa conexão com servidor Ollama
   * 
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      if (!env.OLLAMA_URL) {
        return false;
      }
      
      // Testa conectividade com endpoint Ollama
      const tagsUrl = `${env.OLLAMA_URL}/api/tags`;
      await axios.get(tagsUrl, { timeout: 5000 });
      
      logger.info('OllamaProvider: disponível');
      return true;
      
    } catch (error) {
      logger.warn(`OllamaProvider: não disponível - ${error.message}`);
      return false;
    }
  },
  
  /**
   * Retorna metadata do provider
   * 
   * @returns {object}
   */
  getMetadata() {
    return {
      name: 'Ollama',
      model: env.OLLAMA_MODEL || 'llama2',
      available: !!env.OLLAMA_URL,
      url: env.OLLAMA_URL,
      maxInputTokens: 4096,
      maxOutputTokens: 2048,
      isLocal: true
    };
  }
};

module.exports = OllamaProvider;
