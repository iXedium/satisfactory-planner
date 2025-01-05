// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { generateIconCSS } from './utils/setupIcons';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

generateIconCSS();

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
