// ===== CONFIGURAÇÃO DE PROVIDERS DE IA =====
// Registro centralizado de todos os providers disponíveis
// Fácil adicionar novos providers aqui

const env = require('./env');

// Factory de providers
// Retorna o provider correto baseado na configuração
const getAIProvider = async () => {
  const providerName = env.AI_PROVIDER.toLowerCase();
  
  // Importa o provider dinamicamente baseado na config
  switch (providerName) {
    case 'gemini':
      return require('../providers/geminiProvider');
    
    case 'openai':
      return require('../providers/openaiProvider');
    
    case 'ollama':
      return require('../providers/ollamaProvider');
    
    default:
      throw new Error(`Provider não suportado: ${providerName}`);
  }
};

// Lista de todos os providers disponíveis
// Usado para seleção dinâmica, health check, etc
const AVAILABLE_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google Generative AI - Gemini',
    requiresKey: true,
    keyEnvVar: 'GEMINI_API_KEY'
  },
  openai: {
    name: 'OpenAI',
    description: 'OpenAI GPT models',
    requiresKey: true,
    keyEnvVar: 'OPENAI_API_KEY'
  },
  ollama: {
    name: 'Ollama',
    description: 'Local Ollama LLM',
    requiresKey: false,
    urlEnvVar: 'OLLAMA_URL'
  }
};

module.exports = {
  getAIProvider,
  AVAILABLE_PROVIDERS
};
