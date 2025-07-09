module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/transactions',
        'http://localhost:4173/agents',
        'http://localhost:4173/analytics',
      ],
      startServerCommand: 'npx vite preview --port 4173 --host',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.85}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.85}],
        'categories:seo': ['warn', {minScore: 0.8}],
        'categories:pwa': 'off', // PWA not implemented yet
        
        // Performance metrics
        'first-contentful-paint': ['warn', {maxNumericValue: 2000}],
        'largest-contentful-paint': ['warn', {maxNumericValue: 4000}],
        'speed-index': ['warn', {maxNumericValue: 3000}],
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],
        'total-blocking-time': ['warn', {maxNumericValue: 300}],
        
        // Resource optimization
        'unused-css-rules': ['warn', {maxLength: 2}],
        'unused-javascript': ['warn', {maxLength: 2}],
        'modern-image-formats': ['warn', {maxLength: 0}],
        'uses-responsive-images': ['warn', {maxLength: 0}],
        'efficient-animated-content': ['warn', {maxLength: 0}],
        
        // Security
        'is-on-https': 'off', // Local testing
        'uses-http2': 'off', // Local testing
        'no-vulnerable-libraries': ['error', {maxLength: 0}],
        
        // Best practices
        'errors-in-console': ['warn', {maxLength: 0}],
        'uses-text-compression': ['warn', {maxLength: 0}],
        'render-blocking-resources': ['warn', {maxLength: 1}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        dbPath: '.lighthouseci/db.sql',
      },
    },
  },
};