// ===== PROVIDER OPENAI =====
// Integração com OpenAI API (GPT-4, GPT-3.5, etc)
// Implementa interface padrão de provider

const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

// Base URL da API OpenAI
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ===== INTERFACE PADRÃO DO PROVIDER =====

const OpenAIProvider = {
  // Nome do provider
  name: 'OpenAI',
  
  /**
   * Realiza review do código usando OpenAI
   * 
   * @param {string} code - Código a fazer review
   * @param {object} options - Opções de configuração
   * @returns {Promise<{review: string, metadata: object}>}
   */
  async review(code, options = {}) {
    try {
      logger.info('OpenAIProvider: iniciando review');
      
      // Importa prompts
      const { getRickToxicPrompt } = require('../utils/prompts');
      const systemPrompt = getRickToxicPrompt(code);
      
      // Preparação da requisição
      const config = {
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      };
      
      const payload = {
        model: env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é o Rick de Rick e Morty, extremamente tóxico e mal-humorado ao fazer code reviews. Seja criativo, agressivo e engraçado.'
          },
          {
            role: 'user',
            content: systemPrompt
          }
        ],
        temperature: options.temperature || 0.9,
        top_p: 0.95,
        max_tokens: 2048,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      };
      
      // Realiza chamada à API
      const startTime = Date.now();
      const response = await axios.post(OPENAI_API_URL, payload, config);
      const processingTime = Date.now() - startTime;
      
      // Extrai resposta
      const review = response.data.choices[0].message.content;
      const tokensUsed = response.data.usage.total_tokens;
      
      logger.info(`OpenAIProvider: review concluído em ${processingTime}ms (${tokensUsed} tokens)`);
      
      // Retorna em formato padrão
      return {
        review,
        metadata: {
          provider: 'openai',
          model: env.OPENAI_MODEL,
          processingTime,
          tokensUsed
        }
      };
      
    } catch (error) {
      logger.error(`OpenAIProvider: erro durante review - ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verifica se o provider está disponível
   * 
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      if (!env.OPENAI_API_KEY) {
        return false;
      }
      
      // Faz requisição de teste
      const config = {
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      };
      
      const payload = {
        model: env.OPENAI_MODEL || 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      };
      
      await axios.post(OPENAI_API_URL, payload, config);
      
      logger.info('OpenAIProvider: disponível');
      return true;
      
    } catch (error) {
      logger.warn(`OpenAIProvider: não disponível - ${error.message}`);
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
      name: 'OpenAI',
      model: env.OPENAI_MODEL || 'gpt-4',
      available: !!env.OPENAI_API_KEY,
      maxInputTokens: 8000,
      maxOutputTokens: 2048
    };
  }
};

module.exports = OpenAIProvider;
