
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSentry } from './lib/sentry'
import { initializeErrorHandling } from './lib/error-handling'
import { logger } from './lib/logger'

// Initialize Sentry before anything else
initializeSentry();

// Initialize centralized error handling
initializeErrorHandling();

// Initialize development tools in development mode
if (import.meta.env.MODE === 'development') {
  import('./lib/development-tools').then(({ devTools }) => {
    logger.info('Development tools loaded', {}, 'development');
  });
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
