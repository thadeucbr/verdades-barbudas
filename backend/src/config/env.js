// ===== GERENCIADOR DE VARIÁVEIS DE AMBIENTE =====
// Este arquivo centraliza TODAS as variáveis de ambiente
// Facilita manutenção por IA - tudo em um lugar
// Comentários explicam cada variável

const env = {
  // ===== SERVER =====
  // Porta que o servidor irá rodar
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // Ambiente: development, production, test
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // ===== AI PROVIDER =====
  // Qual IA usar: gemini, openai, ollama
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  
  // ===== GEMINI =====
  // Chave de API do Google Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  // Modelo do Gemini (ex.: gemini-2.5-flash)
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  
  // ===== OPENAI =====
  // Chave de API da OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  // Modelo da OpenAI a usar
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
  
  // ===== OLLAMA =====
  // URL do servidor Ollama (local)
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  // Modelo do Ollama a usar
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama2',
  
  // ===== RATE LIMITING =====
  // Janela de tempo em ms (60000 = 1 minuto)
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  // Máximo de requisições por janela
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  
  // ===== VALIDAÇÃO =====
  // Tamanho máximo de código em bytes (50KB)
  MAX_CODE_SIZE: parseInt(process.env.MAX_CODE_SIZE || '51200', 10),
  // Timeout para chamadas à IA em ms
  AI_TIMEOUT: parseInt(process.env.AI_TIMEOUT || '30000', 10),
  
  // ===== CORS =====
  // URLs permitidas (separadas por vírgula)
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(url => url.trim()),
  
  // ===== UTILIDADES =====
  // Determina se é produção
  isProduction() {
    return this.NODE_ENV === 'production';
  },
  
  // Determina se é desenvolvimento
  isDevelopment() {
    return this.NODE_ENV === 'development';
  },
  
  // Valida configurações críticas
  validate() {
    const errors = [];
    
    // Valida API key do provider selecionado
    if (this.AI_PROVIDER === 'gemini' && !this.GEMINI_API_KEY) {
      errors.push('GEMINI_API_KEY é obrigatória quando AI_PROVIDER=gemini');
    }
    if (this.AI_PROVIDER === 'gemini' && !this.GEMINI_MODEL) {
      errors.push('GEMINI_MODEL é obrigatório quando AI_PROVIDER=gemini');
    }
    if (this.AI_PROVIDER === 'openai' && !this.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY é obrigatória quando AI_PROVIDER=openai');
    }
    if (this.AI_PROVIDER === 'ollama' && !this.OLLAMA_URL) {
      errors.push('OLLAMA_URL é obrigatória quando AI_PROVIDER=ollama');
    }
    
    // Valida rate limit
    if (this.RATE_LIMIT_MAX_REQUESTS <= 0) {
      errors.push('RATE_LIMIT_MAX_REQUESTS deve ser maior que 0');
    }
    
    // Se houver erros, lança exceção
    if (errors.length > 0) {
      throw new Error(`Configuração inválida:\n${errors.join('\n')}`);
    }
  }
};

// Valida na inicialização
env.validate();

module.exports = env;
