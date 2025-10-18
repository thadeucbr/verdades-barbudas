// ===== API UTILITIES =====
// Funções para comunicação com o backend via proxy

const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

/**
 * Faz requisição de review para o código
 * 
 * @param {string} code - Código a revisar
 * @param {object} options - Opções
 * @returns {Promise<{review: string, metadata: object}>}
 */
export async function requestReview(code, options = {}) {
  try {
    // Validação básica
    if (!code || code.trim().length === 0) {
      throw new Error('Código não pode estar vazio');
    }
    
    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    // Faz requisição para proxy local
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        sourceType: options.sourceType || 'snippet',
        sourceUrl: options.sourceUrl || null,
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Parse response
    const data = await response.json();
    
    // Verifica se foi bem-sucedido
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao processar requisição');
    }
    
    return data.data; // Retorna data.data (review + metadata)
    
  } catch (error) {
    // Trata abort/timeout
    if (error.name === 'AbortError') {
      throw new Error(`Timeout: requisição demorou mais de ${API_TIMEOUT}ms`);
    }
    
    // Re-lança outro erros
    throw error;
  }
}

/**
 * Valida código antes de enviar
 * 
 * @param {string} code
 * @returns {object} - { isValid: boolean, error?: string }
 */
export function validateCode(code) {
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: 'Código não pode estar vazio' };
  }
  
  const maxSize = 51200; // 50KB
  if (code.length > maxSize) {
    return { isValid: false, error: `Código muito grande (máx: ${maxSize} bytes)` };
  }
  
  return { isValid: true };
}

/**
 * Formata tamanho de arquivo em bytes para string legível
 * 
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Copia texto para clipboard
 * 
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para clipboard:', error);
    return false;
  }
}
