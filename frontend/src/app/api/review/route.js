// ===== PROXY ROUTE - /api/review =====
// Este endpoint faz proxy para o backend
// SEGURANÇA: Frontend -> Next.js Proxy -> Backend
// Isso esconde o backend e previne requisições diretas

import axios from 'axios';

// URL do backend (do .env)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * POST /api/review
 * 
 * Proxy para POST /api/review do backend
 * Recebe: { code, sourceType, sourceUrl }
 * Envia para: Backend
 * Retorna: Review do Rick
 */
export async function POST(request) {
  try {
    // Lê body da requisição
    const body = await request.json();
    
    // Log (apenas desenvolvimento)
    console.log('[PROXY] Requisição para review recebida');
    
    // Faz chamada para backend
    const response = await axios.post(
      `${BACKEND_URL}/api/review`,
      body,
      {
        timeout: 35000, // 35s timeout
        headers: {
          'Content-Type': 'application/json',
          // Pode adicionar autenticação aqui se necessário
        }
      }
    );
    
    // Log de sucesso
    console.log('[PROXY] Review concluído com sucesso');
    
    // Retorna resposta do backend
    return Response.json(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    // Log de erro
    console.error('[PROXY] Erro:', error.message);
    
    // Trata diferentes tipos de erro
    let status = 500;
    let errorMessage = 'Erro ao processar requisição';
    
    // Erro de conexão
    if (error.code === 'ECONNREFUSED') {
      status = 503;
      errorMessage = 'Backend não está disponível';
    }
    // Erro de timeout
    else if (error.code === 'ECONNABORTED') {
      status = 504;
      errorMessage = 'Timeout na resposta do backend';
    }
    // Erro HTTP do backend
    else if (error.response) {
      status = error.response.status;
      errorMessage = error.response.data?.error || errorMessage;
    }
    
    // Retorna erro
    return Response.json(
      {
        success: false,
        error: errorMessage
      },
      { status }
    );
  }
}
