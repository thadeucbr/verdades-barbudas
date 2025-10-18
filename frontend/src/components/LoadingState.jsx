// ===== COMPONENTE: LoadingState =====
// Spinner e mensagem enquanto processa

'use client';

export function LoadingState() {
  const rickMessages = [
    "Rick tá fazendo um review MEGA tóxico...",
    "Burp... tá processando esse código ruim...",
    "A Citadela de Ricks aprova ou reprova? Vendo...",
    "Gerando insultos técnicos incríveis...",
    "Rick: 'Esse código é tão ruim que...'",
    "Conectando ao banco de insultos Rick's...",
    "Carregando a personalidade tóxica máxima...",
    "Processing... burp... morty!"
  ];
  
  const randomMessage = rickMessages[Math.floor(Math.random() * rickMessages.length)];
  
  return (
    <div className="loading-container">
      <div className="spinner">
        <div className="spinner-inner"></div>
      </div>
      
      <p className="loading-message">{randomMessage}</p>
      
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
