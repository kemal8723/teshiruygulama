
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DataProvider } from './contexts/DataContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>
);