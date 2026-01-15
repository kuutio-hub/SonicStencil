import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DesignProvider } from './context/DesignContext.tsx';
import { CardDataProvider } from './context/CardDataContext.tsx';
import { LanguageProvider } from './hooks/useLocalization.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <CardDataProvider>
        <DesignProvider>
          <App />
        </DesignProvider>
      </CardDataProvider>
    </LanguageProvider>
  </React.StrictMode>
);