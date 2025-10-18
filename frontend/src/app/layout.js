// ===== LAYOUT RAIZ =====
// Metadados, providers, estilos globais

import '@/styles/globals.css';

export const metadata = {
  title: 'Verdades Barbudas - Rick Code Review',
  description: 'Reviews tóxicos de código com a personalidade do Rick de Rick e Morty',
  keywords: ['rick and morty', 'code review', 'toxic', 'funny', 'developer'],
  viewport: 'width=device-width, initial-scale=1',
  charset: 'utf-8'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
