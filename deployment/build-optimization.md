# Build Optimization Guide for Vercel Deployment

## Overview

This guide covers optimizing the build process and bundle size for better performance and faster deployments.

## Current Build Analysis

Based on the latest build output:
```
dist/assets/index-Bi6mL54q.js     1,829.51 kB │ gzip: 384.17 kB
dist/assets/vendor-Ba2cQyxV.js      314.71 kB │ gzip:  96.85 kB
dist/assets/supabase-C1rwyODW.js    112.87 kB │ gzip:  31.05 kB
dist/assets/ui-18WLsXtI.js           94.74 kB │ gzip:  31.85 kB
```

**Issues Identified:**
- Main bundle (1.8MB) is too large
- Needs code splitting for better caching
- Opportunity for dynamic imports

## 1. Vite Configuration Optimization

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false, // Disable sourcemaps in production
    reportCompressedSize: false, // Speed up build
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'lucide-react'
          ],
          
          // Data fetching
          'query-vendor': ['@tanstack/react-query'],
          
          // Forms and validation
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Charts and data viz
          'chart-vendor': ['recharts'],
          
          // Authentication and crypto
          'auth-vendor': ['crypto-js', 'dompurify'],
          
          // Supabase (keep separate for caching)
          'supabase': ['@supabase/supabase-js'],
          
          // Analytics
          'analytics': ['@vercel/analytics', '@vercel/speed-insights', 'web-vitals'],
          
          // Testing utilities (should be dev only, but just in case)
          'test-vendor': [
            '@testing-library/react',
            '@testing-library/user-event',
            '@testing-library/jest-dom'
          ]
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^.]*$/, '') || 'chunk'
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Enable tree shaking
    treeshake: {
      preset: 'recommended',
      unknownGlobalSideEffects: false
    }
  },
  // Development optimizations
  server: {
    fs: {
      strict: false
    }
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    exclude: ['@vercel/analytics', '@vercel/speed-insights']
  }
});
```

## 2. Dynamic Imports for Route-Based Code Splitting

Update `App.tsx` to use lazy loading:

```typescript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Index'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const TransactionDetail = lazy(() => import('@/pages/TransactionDetail'));
const Workflows = lazy(() => import('@/pages/Workflows'));
const AutomationDashboard = lazy(() => import('@/pages/AutomationDashboard'));
const Templates = lazy(() => import('@/pages/Templates'));
const Documents = lazy(() => import('@/pages/Documents'));
const Clients = lazy(() => import('@/pages/Clients'));
const CreateClient = lazy(() => import('@/pages/CreateClient'));
const Settings = lazy(() => import('@/pages/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const OfferDrafting = lazy(() => import('@/pages/OfferDrafting'));
const ServiceTierSelection = lazy(() => import('@/pages/ServiceTierSelection'));
const Agents = lazy(() => import('@/pages/Agents'));
const AgentIntake = lazy(() => import('@/pages/AgentIntake'));
const Communications = lazy(() => import('@/pages/Communications'));

// Agent pages
const AgentDashboard = lazy(() => import('@/pages/agent/AgentDashboard'));
const AgentTransactionDetail = lazy(() => import('@/pages/agent/TransactionDetail'));
const AgentTransactions = lazy(() => import('@/pages/agent/AgentTransactions'));
const AgentTasks = lazy(() => import('@/pages/agent/AgentTasks'));
const AgentClients = lazy(() => import('@/pages/agent/AgentClients'));
const AgentCalendar = lazy(() => import('@/pages/agent/AgentCalendar'));
const AgentSetup = lazy(() => import('@/pages/agent/AgentSetup'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Routes with lazy-loaded components */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                {/* ... other routes */}
              </Routes>
            </Suspense>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
        <Analytics />
        <SpeedInsights />
      </Router>
    </ErrorBoundary>
  );
}
```

## 3. Component-Level Code Splitting

Create a utility for component lazy loading:

```typescript
// src/utils/lazy-loading.ts
import { lazy, ComponentType } from 'react';

interface LazyComponentOptions {
  fallback?: ComponentType;
  delay?: number;
}

export function createLazyComponent<T = {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentOptions = {}
) {
  const LazyComponent = lazy(importFunc);
  
  return (props: T) => (
    <Suspense fallback={options.fallback ? <options.fallback /> : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Usage example:
const LazyTransactionCard = createLazyComponent(
  () => import('@/components/TransactionCard'),
  { fallback: TransactionCardSkeleton }
);
```

## 4. Bundle Analyzer Integration

Add bundle analysis script:

```json
// package.json
{
  "scripts": {
    "analyze": "npm run build && npx vite-bundle-analyzer dist"
  },
  "devDependencies": {
    "vite-bundle-analyzer": "^0.7.0"
  }
}
```

## 5. Image Optimization

Create an optimized image component:

```typescript
// src/components/OptimizedImage.tsx
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate WebP and fallback URLs
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
  
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </picture>
  );
}
```

## 6. Service Worker for Caching

Create a simple service worker:

```javascript
// public/sw.js
const CACHE_NAME = 'concierge-transaction-flow-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

Register the service worker:

```typescript
// src/utils/register-sw.ts
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
```

## 7. CSS Optimization

Configure CSS optimization in Vite:

```typescript
// vite.config.ts - CSS optimization
export default defineConfig({
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
});
```

Create a CSS purging configuration:

```javascript
// purgecss.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  css: ['./src/**/*.css'],
  safelist: {
    standard: [
      /^react-/,
      /^radix-/,
      /^cmdk-/
    ]
  }
};
```

## 8. Environment-Specific Optimizations

Create different build configurations:

```typescript
// vite.config.production.ts
import { defineConfig } from 'vite';
import { baseConfig } from './vite.config.base';

export default defineConfig({
  ...baseConfig,
  mode: 'production',
  build: {
    ...baseConfig.build,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  }
});
```

## 9. Vercel Build Configuration

Update `vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci --production=false",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## 10. Performance Budget

Add performance budget to `package.json`:

```json
{
  "budgets": [
    {
      "path": "/",
      "timings": [
        {
          "metric": "interactive",
          "budget": 5000
        },
        {
          "metric": "first-meaningful-paint",
          "budget": 2000
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": "500kb"
        },
        {
          "resourceType": "total",
          "budget": "2mb"
        }
      ]
    }
  ]
}
```

## 11. Build Monitoring Script

Create a build analysis script:

```bash
#!/bin/bash
# scripts/analyze-build.sh

echo "🔍 Analyzing build output..."

# Build the project
npm run build

# Calculate total bundle size
TOTAL_SIZE=$(du -sh dist/ | cut -f1)
echo "📦 Total bundle size: $TOTAL_SIZE"

# List largest files
echo "📋 Largest files:"
find dist/ -type f -name "*.js" -o -name "*.css" | xargs du -h | sort -rh | head -10

# Check for unused dependencies
npx depcheck --ignores="@types/*,@testing-library/*,vitest,playwright"

# Check bundle composition
npx vite-bundle-analyzer dist/ --open=false --report=json > bundle-analysis.json

echo "✅ Build analysis complete!"
```

## 12. Implementation Checklist

### Immediate Optimizations (30 minutes)
- [ ] Update Vite configuration with manual chunks
- [ ] Implement route-based code splitting
- [ ] Configure CSS optimization
- [ ] Update Vercel build settings

### Advanced Optimizations (60 minutes)
- [ ] Implement lazy loading for components
- [ ] Add image optimization
- [ ] Set up service worker
- [ ] Configure performance budgets

### Monitoring & Analysis (15 minutes)
- [ ] Set up bundle analyzer
- [ ] Create build monitoring script
- [ ] Configure performance tracking
- [ ] Test optimized build

This optimization strategy should reduce bundle sizes by 40-60% and improve loading times significantly.