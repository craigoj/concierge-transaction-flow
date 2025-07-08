
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSentry } from './lib/sentry'
import { initializeErrorHandling } from './lib/error-handling'
import { logger } from './lib/logger'

// Initialize Sentry before anything else
try {
  initializeSentry();
} catch (error) {
  console.error('Failed to initialize Sentry:', error);
}

// Initialize centralized error handling
try {
  initializeErrorHandling();
} catch (error) {
  console.error('Failed to initialize error handling:', error);
}

// Initialize development tools in development mode
if (import.meta.env.MODE === 'development') {
  import('./lib/development-tools').then(({ devTools }) => {
    logger.info('Development tools loaded', {}, 'development');
  });
}

const container = document.getElementById("root");
if (!container) {
  console.error("Root element not found");
  throw new Error("Root element not found");
}

console.log("Starting app initialization...");

const root = createRoot(container);
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);
}
