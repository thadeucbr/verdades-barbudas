// ===== COMPONENTE: CodeEditor =====
// Editor de código textarea
// Validação, contador, etc

'use client';

import { useState } from 'react';
import { formatFileSize } from '@/utils/api';

const MAX_SIZE = 51200; // 50KB

export function CodeEditor({ onSubmit, isLoading, codeSize }) {
  const [code, setCode] = useState('');
  
  // Calcula porcentagem de uso
  const usagePercent = (code.length / MAX_SIZE) * 100;
  
  // Determina cor da barra de progresso
  const getProgressColor = () => {
    if (usagePercent < 50) return '#4CAF50'; // Verde
    if (usagePercent < 80) return '#FFC107'; // Amarelo
    return '#F44336'; // Vermelho
  };
  
  const handleSubmit = () => {
    onSubmit(code);
  };
  
  const handleClear = () => {
    setCode('');
  };
  
  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>Cole seu código aqui 👇</h2>
        <span className="size-indicator">
          {formatFileSize(code.length)} / {formatFileSize(MAX_SIZE)}
        </span>
      </div>
      
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// Seu código aqui... JavaScript, Python, Java, etc&#10;function hello() {&#10;  console.log('Hello, World!');&#10;}"
        disabled={isLoading}
        className="code-textarea"
      />
      
      <div className="editor-footer">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(usagePercent, 100)}%`,
              backgroundColor: getProgressColor()
            }}
          />
        </div>
        
        <div className="button-group">
          <button
            onClick={handleClear}
            disabled={isLoading || code.length === 0}
            className="btn btn-secondary"
          >
            Limpar
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || code.length === 0}
            className="btn btn-primary"
          >
            {isLoading ? 'Rick tá pensando... 🤔' : 'Me fazer um Review! 🔥'}
          </button>
        </div>
      </div>
    </div>
  );
}
