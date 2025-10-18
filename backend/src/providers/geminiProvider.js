// ===== PROVIDER GEMINI =====
// Integração com Google Gemini API
// Implementa interface padrão de provider

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../utils/logger');

// Inicializa cliente Gemini
// Lazy initialization - só cria quando necessário
let geminiClient = null;

const getGeminiClient = () => {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return geminiClient;
};

// Configurações padrão para geração e segurança do Gemini 2.x
const resolveHarmCategory = (...keys) => {
  for (const key of keys) {
    if (HarmCategory && HarmCategory[key]) {
      return HarmCategory[key];
    }
  }
  return null;
};

const SAFETY_SETTINGS = [
  resolveHarmCategory('HARM_CATEGORY_HARASSMENT'),
  resolveHarmCategory('HARM_CATEGORY_HATE_SPEECH'),
  resolveHarmCategory('HARM_CATEGORY_DANGEROUS_CONTENT'),
  resolveHarmCategory('HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_SEXUAL_CONTENT'),
  resolveHarmCategory('HARM_CATEGORY_CIVIC_INTEGRITY')
]
  .filter(Boolean)
  .map((category) => ({
    category,
    threshold: HarmBlockThreshold.BLOCK_NONE
  }));

if (!SAFETY_SETTINGS.length) {
  logger.warn('GeminiProvider: safety settings não configurados, utilizando defaults da API');
}

const buildGenerationConfig = (options = {}) => ({
  temperature: typeof options.temperature === 'number' ? options.temperature : 0.85,
  topP: 0.95,
  topK: 32,
  maxOutputTokens: Math.min(options.maxOutputTokens || 2048, 4096)
});

// ===== INTERFACE PADRÃO DO PROVIDER =====
// Todos os providers devem implementar esses métodos

const GeminiProvider = {
  // Nome do provider
  name: 'Gemini',
  
  /**
   * Realiza review do código usando Gemini
   * 
   * @param {string} code - Código a fazer review
   * @param {object} options - Opções de configuração
   * @param {string} options.personality - Personalidade (rick, toxic, etc)
   * @param {number} options.temperature - Criatividade (0-1)
   * @returns {Promise<{review: string, metadata: object}>}
   */
  async review(code, options = {}) {
    try {
      logger.info('GeminiProvider: iniciando review');
      
      const client = getGeminiClient();
      const model = client.getGenerativeModel({
        model: env.GEMINI_MODEL,
        safetySettings: SAFETY_SETTINGS,
        generationConfig: buildGenerationConfig(options)
      });

      // Importa prompts
      const { getRickToxicPrompt } = require('../utils/prompts');
      const systemPrompt = getRickToxicPrompt(code);

      // Realiza chamada à API
      const startTime = Date.now();
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ],
        safetySettings: SAFETY_SETTINGS
      });
      
      const processingTime = Date.now() - startTime;
      
      // Extrai texto da resposta
      const review = result.response.text()?.trim();
      if (!review) {
        throw new Error('Gemini retornou uma resposta vazia');
      }

      const usage = result.response.usageMetadata || {};
      const tokensUsed = usage.totalTokenCount || usage.totalTokens || 0;
      const inputTokens = usage.promptTokenCount || usage.promptTokens || 0;
      const outputTokens = usage.candidatesTokenCount || usage.candidatesTokens || usage.completionTokens || 0;
      
      logger.info(`GeminiProvider: review concluído em ${processingTime}ms`);
      
      // Retorna em formato padrão
      return {
        review,
        metadata: {
          provider: 'gemini',
          model: env.GEMINI_MODEL,
          processingTime,
          tokensUsed,
          inputTokens,
          outputTokens
        }
      };
      
    } catch (error) {
      logger.error(`GeminiProvider: erro durante review - ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verifica se o provider está disponível
   * Testa conexão com API
   * 
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      if (!env.GEMINI_API_KEY) {
        return false;
      }
      
      const client = getGeminiClient();
      const model = client.getGenerativeModel({
        model: env.GEMINI_MODEL,
        safetySettings: SAFETY_SETTINGS
      });

      // Faz teste rápido usando countTokens para evitar gerar resposta completa
      try {
        await model.countTokens({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'ping' }]
            }
          ]
        });
      } catch (countError) {
        logger.debug(`GeminiProvider: fallback para generateContent no health check - ${countError.message}`);
        await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'ping' }]
            }
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 8
          }
        });
      }
      
      logger.info('GeminiProvider: disponível');
      return true;
      
    } catch (error) {
      logger.warn(`GeminiProvider: não disponível - ${error.message}`);
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
      name: 'Google Gemini',
      model: env.GEMINI_MODEL,
      available: !!env.GEMINI_API_KEY,
      maxInputTokens: 2000000,
      maxOutputTokens: 4096
    };
  }
};

module.exports = GeminiProvider;
