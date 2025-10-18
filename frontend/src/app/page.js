// ===== PÁGINA PRINCIPAL =====
// Componente raiz que orquestra tudo

'use client';

import { CodeEditor } from '@/components/CodeEditor';
import { ReviewResult } from '@/components/ReviewResult';
import { LoadingState } from '@/components/LoadingState';
import { useReview } from '@/hooks/useReview';

export default function Home() {
  const {
    state,
    review,
    metadata,
    error,
    isLoading,
    isSuccess,
    isError,
    submitReview,
    reset
  } = useReview();
  
  return (
    <main className="main-container">
      {/* Header */}
      <header className="header">
        <h1 className="title">
          VERDADES BARBUDAS 🧔
        </h1>
        <p className="subtitle">
          Cole seu código e deixa o Rick te fazer um review
          <br />
          <span style={{ fontSize: '0.8em' }}>⚠️ AVISO: Reviews extremamente tóxicos ⚠️</span>
        </p>
      </header>
      
      {/* Main Content */}
      <div className="content">
        {/* Editor visível somente antes de concluir um review */}
        {!isSuccess && (
          <CodeEditor
            onSubmit={submitReview}
            isLoading={isLoading}
          />
        )}
        
        {/* Estado: Loading */}
        {isLoading && <LoadingState />}
        
        {/* Estado: Sucesso */}
        {isSuccess && review && (
          <ReviewResult
            review={review}
            metadata={metadata}
            onNewReview={reset}
          />
        )}
        
        {/* Estado: Erro */}
        {isError && error && (
          <div className="error-container">
            <div className="error-box">
              <h3>❌ Oops! Algo deu errado</h3>
              <p>{error}</p>
              <button onClick={reset} className="btn btn-primary">
                Tentar Novamente
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="footer">
        <p>
          Made with ❤️ by Verdades Barbudas
          <br />
          <span style={{ fontSize: '0.8em' }}>
            Wubba Lubba Dub Dub! 🍻
          </span>
        </p>
      </footer>
    </main>
  );
}
