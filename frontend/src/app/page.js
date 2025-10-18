// ===== PÁGINA PRINCIPAL =====
// Componente raiz que orquestra tudo

'use client';

import { useState } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { ReviewResult } from '@/components/ReviewResult';
import { LoadingState } from '@/components/LoadingState';
import { useReview } from '@/hooks/useReview';

export default function Home() {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);

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

  if (!hasAccepted) {
    return (
      <main className="main-container">
        <header className="header">
          <h1 className="title">VERDADES BARBUDAS 🧔</h1>
          <p className="subtitle">
            Aviso de conteúdo ofensivo
            <br />
            <span style={{ fontSize: '0.8em' }}>
              Esta é uma paródia do personagem Rick Sanchez realizando code reviews.
            </span>
          </p>
        </header>

        <div className="content">
          <div className="warning-box">
            <h2>⚠️ Conteúdo Potencialmente Ofensivo</h2>
            <p>
              Ao prosseguir você declara estar ciente de que receberá respostas sarcásticas e agressivas,
              criadas como homenagem/paródia ao Rick Sanchez. O objetivo é humor; não use em contextos sensíveis.
            </p>
            <p>
              Caso não concorde ou queira evitar esse tipo de conteúdo, clique em "Não aceito" e encerre o uso.
            </p>
            {declined && (
              <p className="error-text">
                Respeitamos sua decisão. Você pode fechar a página ou aceitar os termos para continuar.
              </p>
            )}
            <div className="button-group" style={{ justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setDeclined(true);
                }}
              >
                Não aceito
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDeclined(false);
                  setHasAccepted(true);
                }}
              >
                Aceito e quero prosseguir
              </button>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>
            Verdades Barbudas — Conteúdo humorístico inspirado em Rick and Morty
          </p>
        </footer>
      </main>
    );
  }
  
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
