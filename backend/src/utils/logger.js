// ===== SISTEMA DE LOGS =====
// Centralizado para facilitar debug e manutenção

const env = require('../config/env');

const logger = {
  // Log de informação
  info: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  ${message}`);
  },
  
  // Log de aviso
  warn: (message) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️  ${message}`);
  },
  
  // Log de erro
  error: (message) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ${message}`);
  },
  
  // Log de debug (só em desenvolvimento)
  debug: (message) => {
    if (env.isDevelopment()) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🐛 ${message}`);
    }
  },
  
  // Log de sucesso
  success: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ ${message}`);
  }
};

module.exports = logger;
