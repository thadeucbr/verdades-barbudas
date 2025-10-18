// ===== COMPONENTE: ReviewResult =====
// Exibe resultado do review
// Metadata, botões de ação, etc

'use client';

import { copyToClipboard } from '@/utils/api';

export function ReviewResult({ review, metadata, onNewReview }) {
  const handleCopy = async () => {
    const success = await copyToClipboard(review);
    if (success) {
      alert('Review copiado para o clipboard! 📋');
    }
  };
  
  const handleShare = () => {
    const text = `Olha que review tóxico do Rick:\n\n${review}`;
    
    // Tenta usar Share API se disponível
    if (navigator.share) {
      navigator.share({
        title: 'Verdades Barbudas',
        text: text
      }).catch(() => {
        // Fallback se falhar
        copyToClipboard(text);
      });
    } else {
      // Fallback: copia para clipboard
      copyToClipboard(text);
    }
  };
  
  return (
    <div className="result-container">
      <div className="result-header">
        <h2>🔥 Review Tóxico do Rick 🔥</h2>
      </div>
      
      <div className="review-box">
        <div className="rick-avatar">🤓</div>
        <p className="review-text">{review}</p>
      </div>
      
      <div className="metadata">
        <div className="metadata-item">
          <span className="label">Provider:</span>
          <span className="value">{metadata?.provider}</span>
        </div>
        
        <div className="metadata-item">
          <span className="label">Modelo:</span>
          <span className="value">{metadata?.model}</span>
        </div>
        
        <div className="metadata-item">
          <span className="label">Tempo:</span>
          <span className="value">{metadata?.processingTime}ms</span>
        </div>
        
        {metadata?.tokensUsed > 0 && (
          <div className="metadata-item">
            <span className="label">Tokens:</span>
            <span className="value">{metadata?.tokensUsed}</span>
          </div>
        )}
        
        <div className="metadata-item">
          <span className="label">Tipo:</span>
          <span className="value">{metadata?.sourceType}</span>
        </div>
      </div>
      
      <div className="button-group">
        <button onClick={handleCopy} className="btn btn-secondary">
          Copiar Review 📋
        </button>
        
        <button onClick={handleShare} className="btn btn-secondary">
          Compartilhar 🚀
        </button>
        
        <button onClick={onNewReview} className="btn btn-primary">
          Novo Review 🔄
        </button>
      </div>
    </div>
  );
}
