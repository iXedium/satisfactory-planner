// src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { generateIconCSS } from './utils/setupIcons';
import { theme } from './theme/theme';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

generateIconCSS();

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
