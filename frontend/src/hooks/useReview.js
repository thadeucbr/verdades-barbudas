// ===== HOOK: useReview =====
// Logic customizado para gerenciar state do review
// Simplifica componentes principais

'use client';

import { useState, useCallback } from 'react';
import { requestReview, validateCode } from '@/utils/api';

/**
 * Hook customizado para gerenciar review
 * 
 * Estados:
 * - idle: inicial/aguardando
 * - loading: requisição em progresso
 * - success: review recebido
 * - error: erro ao processar
 */
export function useReview() {
  // State
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [review, setReview] = useState(null); // Review resultado
  const [metadata, setMetadata] = useState(null); // Metadata (tempo, tokens, etc)
  const [error, setError] = useState(null); // Mensagem de erro
  const [codeSize, setCodeSize] = useState(0); // Tamanho do código
  
  /**
   * Faz requisição de review
   * 
   * @param {string} code
   * @param {object} options
   */
  const submitReview = useCallback(async (code, options = {}) => {
    try {
      // Limpa estado anterior
      setError(null);
      setReview(null);
      
      // Valida código
      const validation = validateCode(code);
      if (!validation.isValid) {
        setError(validation.error);
        setState('error');
        return;
      }
      
      // Atualiza tamanho
      setCodeSize(code.length);
      
      // Muda para loading
      setState('loading');
      
      // Faz requisição
      const result = await requestReview(code, options);
      
      // Atualiza estado com sucesso
      setReview(result.review);
      setMetadata(result.metadata);
      setState('success');
      
    } catch (err) {
      // Trata erro
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      setState('error');
      console.error('Erro em useReview:', err);
    }
  }, []);
  
  /**
   * Reset para novo review
   */
  const reset = useCallback(() => {
    setState('idle');
    setReview(null);
    setMetadata(null);
    setError(null);
    setCodeSize(0);
  }, []);
  
  return {
    // Estado
    state,
    review,
    metadata,
    error,
    codeSize,
    
    // Ações
    submitReview,
    reset,
    
    // Helpers
    isLoading: state === 'loading',
    isError: state === 'error',
    isSuccess: state === 'success',
    isIdle: state === 'idle'
  };
}
