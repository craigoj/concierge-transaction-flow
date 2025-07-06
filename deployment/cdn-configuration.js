/**
 * CDN Configuration for Concierge Transaction Flow
 * Optimizes static asset delivery and performance
 */

// Vercel CDN Configuration
const vercelCDNConfig = {
  // Static asset caching
  headers: [
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        },
        {
          key: 'CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    },
    {
      source: '/assets/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        },
        {
          key: 'CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        },
        {
          key: 'CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    },
    {
      source: '/favicon.ico',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400'
        }
      ]
    },
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400'
        }
      ]
    },
    {
      source: '/(.*\\.(?:jpg|jpeg|png|gif|webp|avif|svg|ico))',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=2592000, stale-while-revalidate=86400'
        }
      ]
    },
    {
      source: '/(.*\\.(?:css|js|woff|woff2|ttf|otf))',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    },
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate'
        }
      ]
    }
  ]
};

// Cloudflare CDN Configuration
const cloudflareCDNConfig = {
  // Page Rules for caching
  pageRules: [
    {
      target: '*.concierge-transaction-flow.com/static/*',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 31536000, // 1 year
        browser_cache_ttl: 31536000, // 1 year
        rocket_loader: 'off'
      }
    },
    {
      target: '*.concierge-transaction-flow.com/assets/*',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 31536000, // 1 year
        browser_cache_ttl: 31536000, // 1 year
        rocket_loader: 'off'
      }
    },
    {
      target: '*.concierge-transaction-flow.com/_next/static/*',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 31536000, // 1 year
        browser_cache_ttl: 31536000, // 1 year
        rocket_loader: 'off'
      }
    },
    {
      target: '*.concierge-transaction-flow.com/*.{jpg,jpeg,png,gif,webp,avif,svg,ico}',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 2592000, // 30 days
        browser_cache_ttl: 2592000, // 30 days
        rocket_loader: 'off'
      }
    },
    {
      target: '*.concierge-transaction-flow.com/*.{css,js,woff,woff2,ttf,otf}',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 31536000, // 1 year
        browser_cache_ttl: 31536000, // 1 year
        rocket_loader: 'off'
      }
    },
    {
      target: '*.concierge-transaction-flow.com/api/*',
      settings: {
        cache_level: 'bypass'
      }
    }
  ],
  
  // Transform Rules for optimization
  transformRules: [
    {
      description: 'Optimize images',
      expression: 'http.request.uri.path matches ".*\\.(jpg|jpeg|png|gif|webp)$"',
      action: 'rewrite',
      action_parameters: {
        uri: {
          path: {
            value: '/cdn-cgi/image/format=auto,quality=85${http.request.uri.path}'
          }
        }
      }
    }
  ]
};

// AWS CloudFront Configuration (Alternative)
const cloudFrontConfig = {
  distributions: [
    {
      comment: 'Concierge Transaction Flow - Static Assets',
      defaultCacheBehavior: {
        targetOriginId: 'vercel-origin',
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD'],
        cachedMethods: ['GET', 'HEAD'],
        compress: true,
        cachePolicyId: 'managed-caching-optimized',
        originRequestPolicyId: 'managed-cors-s3-origin',
        responseHeadersPolicyId: 'managed-security-headers'
      },
      cacheBehaviors: [
        {
          pathPattern: '/static/*',
          targetOriginId: 'vercel-origin',
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD'],
          cachedMethods: ['GET', 'HEAD'],
          compress: true,
          cachePolicyId: 'managed-caching-optimized-for-uncompressed-objects',
          ttl: {
            defaultTtl: 86400,
            maxTtl: 31536000,
            minTtl: 0
          }
        },
        {
          pathPattern: '/assets/*',
          targetOriginId: 'vercel-origin',
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD'],
          cachedMethods: ['GET', 'HEAD'],
          compress: true,
          cachePolicyId: 'managed-caching-optimized-for-uncompressed-objects',
          ttl: {
            defaultTtl: 86400,
            maxTtl: 31536000,
            minTtl: 0
          }
        },
        {
          pathPattern: '/api/*',
          targetOriginId: 'vercel-origin',
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
          cachedMethods: ['GET', 'HEAD'],
          compress: true,
          cachePolicyId: 'managed-caching-disabled',
          originRequestPolicyId: 'managed-cors-s3-origin'
        }
      ],
      origins: [
        {
          id: 'vercel-origin',
          domainName: 'concierge-transaction-flow.vercel.app',
          customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: 'https-only',
            originSslProtocols: ['TLSv1.2']
          }
        }
      ],
      priceClass: 'PriceClass_All',
      enabled: true,
      httpVersion: 'http2',
      isIpv6Enabled: true,
      webAclId: '' // Optional: Associate with AWS WAF
    }
  ]
};

// Performance Optimization Configuration
const performanceConfig = {
  // Vite build optimization for CDN
  viteConfig: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            utils: ['clsx', 'tailwind-merge', 'date-fns']
          }
        }
      },
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 500
    }
  },
  
  // Asset optimization
  assetOptimization: {
    images: {
      formats: ['avif', 'webp', 'jpg'],
      quality: 85,
      sizes: [320, 640, 768, 1024, 1280, 1920],
      lazy: true
    },
    fonts: {
      preload: ['Inter-Regular.woff2', 'Inter-Medium.woff2', 'Inter-SemiBold.woff2'],
      display: 'swap'
    },
    css: {
      minify: true,
      purge: true,
      critical: true
    },
    javascript: {
      minify: true,
      treeshake: true,
      compress: true
    }
  }
};

// Content Security Policy for CDN
const cspConfig = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://vercel.live'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'https://images.unsplash.com',
      'https://avatars.githubusercontent.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ],
    'connect-src': [
      "'self'",
      process.env.VITE_SUPABASE_URL,
      'https://vitals.vercel-insights.com',
      'https://api.github.com'
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': []
  }
};

// CDN Monitoring and Analytics
const monitoringConfig = {
  // Core Web Vitals monitoring
  coreWebVitals: {
    lcp: 2.5, // Largest Contentful Paint (seconds)
    fid: 100, // First Input Delay (milliseconds)
    cls: 0.1, // Cumulative Layout Shift
    fcp: 1.8, // First Contentful Paint (seconds)
    ttfb: 600 // Time to First Byte (milliseconds)
  },
  
  // CDN performance metrics
  cdnMetrics: {
    cacheHitRatio: 0.95, // Target 95% cache hit ratio
    originLoadTime: 500, // Max origin load time (milliseconds)
    edgeResponseTime: 50, // Max edge response time (milliseconds)
    bandwidth: '99.9%', // Bandwidth availability
    uptime: '99.99%' // Uptime SLA
  },
  
  // Alerts and notifications
  alerts: {
    cacheHitRatioBelow: 0.9,
    originLoadTimeAbove: 1000,
    edgeResponseTimeAbove: 100,
    errorRateAbove: 0.01
  }
};

// Geographic Distribution Configuration
const geoConfig = {
  // Primary regions for content delivery
  regions: [
    'us-east-1',    // N. Virginia
    'us-west-1',    // N. California
    'us-west-2',    // Oregon
    'eu-west-1',    // Ireland
    'eu-central-1', // Frankfurt
    'ap-south-1',   // Mumbai
    'ap-southeast-1', // Singapore
    'ap-northeast-1', // Tokyo
    'sa-east-1'     // São Paulo
  ],
  
  // Content prioritization by region
  prioritization: {
    'us-east-1': ['html', 'css', 'js', 'images'],
    'us-west-1': ['html', 'css', 'js', 'images'],
    'eu-west-1': ['html', 'css', 'js'],
    'ap-south-1': ['html', 'css', 'js'],
    'default': ['html', 'css']
  }
};

// Export configurations
export {
  vercelCDNConfig,
  cloudflareCDNConfig,
  cloudFrontConfig,
  performanceConfig,
  cspConfig,
  monitoringConfig,
  geoConfig
};

// Default export for main configuration
export default {
  vercel: vercelCDNConfig,
  cloudflare: cloudflareCDNConfig,
  cloudfront: cloudFrontConfig,
  performance: performanceConfig,
  security: cspConfig,
  monitoring: monitoringConfig,
  geographic: geoConfig
};