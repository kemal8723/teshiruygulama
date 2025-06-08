
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DataProvider } from './contexts/DataContext.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found");
}

// Extend HTMLElement type to include our custom property for storing the React root
interface RootElementWithMyAppRoot extends HTMLElement {
  __my_react_root?: ReactDOM.Root;
}

const appRootElement = rootElement as RootElementWithMyAppRoot;

let root: ReactDOM.Root;

// Check if a root has already been created and stored on the element
if (appRootElement.__my_react_root) {
  root = appRootElement.__my_react_root;
} else {
  // If not, create a new root and store it on the element
  root = ReactDOM.createRoot(appRootElement);
  appRootElement.__my_react_root = root;
}

root.render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>
);
