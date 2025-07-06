# Vercel Analytics & Performance Monitoring Setup Guide

## Overview

This guide covers enabling and configuring Vercel Analytics, Speed Insights, and advanced performance monitoring for the Concierge Transaction Flow application.

## 1. Vercel Analytics Setup

### Enable in Vercel Dashboard
1. **Navigate to Project**: Go to your Vercel dashboard → `concierge-transaction-flow` project
2. **Access Analytics Tab**: Click on the "Analytics" tab in the project sidebar
3. **Enable Analytics**: Click "Enable Analytics" button
4. **Choose Plan**: 
   - **Free Tier**: 100K page views/month
   - **Pro Tier**: Unlimited page views + advanced features

### Frontend Integration
Add the Vercel Analytics script to your application:

```bash
npm install @vercel/analytics
```

Then integrate in your main app file:

```typescript
// src/main.tsx or src/App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app components */}
      <Analytics />
    </>
  );
}
```

## 2. Vercel Speed Insights

### Enable Speed Insights
1. **In Vercel Dashboard**: Go to Settings → Speed Insights
2. **Enable Feature**: Toggle "Enable Speed Insights"
3. **Configure Audience**: Choose data collection preferences

### Frontend Integration
```bash
npm install @vercel/speed-insights
```

```typescript
// src/main.tsx or src/App.tsx
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      {/* Your app components */}
      <SpeedInsights />
    </>
  );
}
```

## 3. Environment Variables Configuration

Add these to your Vercel project environment variables:

```env
# Analytics Configuration
VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Performance Monitoring
VERCEL_SPEED_INSIGHTS_ID=your-speed-insights-id
NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID=your-speed-insights-id

# Core Web Vitals Thresholds
NEXT_PUBLIC_LCP_THRESHOLD=2500
NEXT_PUBLIC_FID_THRESHOLD=100
NEXT_PUBLIC_CLS_THRESHOLD=0.1
```

## 4. Custom Performance Tracking

Create a custom performance monitoring utility:

```typescript
// src/lib/performance-monitoring.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Core Web Vitals
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: any) {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now()
    };

    this.metrics.push(performanceMetric);
    
    // Send to analytics
    this.sendToAnalytics(performanceMetric);
    
    // Check thresholds
    this.checkThresholds(performanceMetric);
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', 'Performance', {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating
      });
    }
  }

  private checkThresholds(metric: PerformanceMetric) {
    const thresholds = {
      LCP: 2500,
      FID: 100,
      CLS: 0.1
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded: ${metric.name} = ${metric.value}`);
      
      // Send alert to monitoring system
      this.sendAlert(metric);
    }
  }

  private sendAlert(metric: PerformanceMetric) {
    // Integration with alerting system
    fetch('/api/performance-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        threshold: metric.rating,
        timestamp: metric.timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(console.error);
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageMetric(metricName: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === metricName);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

## 5. Performance API Endpoint

Create an API endpoint for performance alerts:

```typescript
// api/performance-alert.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alert: PerformanceAlert = req.body;
    
    // Log performance issue
    console.warn('Performance Alert:', {
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      url: alert.url,
      timestamp: new Date(alert.timestamp).toISOString()
    });

    // Here you could:
    // 1. Send to logging service (e.g., Sentry, LogRocket)
    // 2. Store in database for analysis
    // 3. Send notifications to team
    // 4. Trigger automated responses

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Performance alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## 6. Dashboard Configuration

### Vercel Analytics Dashboard
- **Page Views**: Track page popularity and user flow
- **Top Pages**: Identify most visited pages
- **Top Referrers**: Understand traffic sources
- **Countries**: Geographic distribution of users
- **Devices**: Device and browser analytics

### Custom Analytics Events
```typescript
// Track custom events
import { track } from '@vercel/analytics';

// Feature usage tracking
track('feature_used', {
  feature: 'agent_intake_form',
  step: 'vendor_preferences',
  user_type: 'authenticated'
});

// Performance tracking
track('performance_metric', {
  metric: 'LCP',
  value: 1234,
  page: '/dashboard'
});

// Error tracking
track('error_occurred', {
  error_type: 'api_error',
  endpoint: '/api/transactions',
  status_code: 500
});
```

## 7. Monitoring Alerts Setup

### Performance Budgets
Configure alerts for performance degradation:

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### GitHub Actions Integration
Add performance monitoring to CI/CD:

```yaml
# .github/workflows/performance-monitoring.yml
name: Performance Monitoring

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Run every 6 hours

jobs:
  performance-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## 8. Real User Monitoring (RUM)

Implement comprehensive RUM tracking:

```typescript
// src/lib/rum-monitoring.ts
class RealUserMonitoring {
  private static instance: RealUserMonitoring;
  
  public static getInstance(): RealUserMonitoring {
    if (!RealUserMonitoring.instance) {
      RealUserMonitoring.instance = new RealUserMonitoring();
    }
    return RealUserMonitoring.instance;
  }

  private constructor() {
    this.initializeRUM();
  }

  private initializeRUM() {
    // Page load timing
    window.addEventListener('load', () => {
      this.trackPageLoad();
    });

    // User interactions
    this.trackUserInteractions();
    
    // Error tracking
    this.trackErrors();
    
    // Resource timing
    this.trackResources();
  }

  private trackPageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connect: navigation.connectEnd - navigation.connectStart,
      ssl_negotiation: navigation.connectEnd - navigation.secureConnectionStart,
      server_response: navigation.responseStart - navigation.requestStart,
      dom_processing: navigation.domComplete - navigation.responseEnd,
      page_load: navigation.loadEventEnd - navigation.navigationStart
    };

    // Send to analytics
    Object.entries(metrics).forEach(([metric, value]) => {
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'Page Load Timing', { metric, value });
      }
    });
  }

  private trackUserInteractions() {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const id = target.id;
      const className = target.className;

      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'User Interaction', {
          type: 'click',
          element: tagName,
          id: id || 'none',
          className: className || 'none'
        });
      }
    });

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || 'unknown';

      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'Form Submission', { formId });
      }
    });
  }

  private trackErrors() {
    window.addEventListener('error', (event) => {
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'JavaScript Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'Unhandled Promise Rejection', {
          reason: event.reason?.toString() || 'Unknown'
        });
      }
    });
  }

  private trackResources() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          if (typeof window !== 'undefined' && window.va) {
            window.va('track', 'Resource Timing', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize || 0,
              type: this.getResourceType(resource.name)
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }
}

// Initialize RUM
export const rum = RealUserMonitoring.getInstance();
```

## 9. Implementation Checklist

### Immediate Setup (15 minutes)
- [ ] Enable Vercel Analytics in dashboard
- [ ] Enable Speed Insights in dashboard
- [ ] Install @vercel/analytics and @vercel/speed-insights packages
- [ ] Add Analytics and SpeedInsights components to App.tsx

### Advanced Configuration (30 minutes)
- [ ] Set up custom performance monitoring
- [ ] Create performance alert API endpoint
- [ ] Configure performance budgets
- [ ] Set up RUM tracking

### Monitoring Setup (15 minutes)
- [ ] Configure dashboard alerts
- [ ] Set up GitHub Actions performance monitoring
- [ ] Test alert notifications
- [ ] Review analytics data flow

## 10. Monitoring Dashboard URLs

Once configured, access your monitoring dashboards:

- **Vercel Analytics**: `https://vercel.com/craigoj/concierge-transaction-flow/analytics`
- **Speed Insights**: `https://vercel.com/craigoj/concierge-transaction-flow/speed-insights`
- **GitHub Actions**: `https://github.com/craigoj/concierge-transaction-flow/actions`

## 11. Performance Optimization Tips

### Bundle Optimization
- Use dynamic imports for code splitting
- Optimize images with next/image or similar
- Implement lazy loading for non-critical components
- Minimize JavaScript bundle size

### Caching Strategy
- Configure proper cache headers
- Use CDN for static assets
- Implement service worker for offline support
- Optimize database queries

### Core Web Vitals
- **LCP**: Optimize server response times and resource loading
- **FID**: Minimize JavaScript execution time
- **CLS**: Ensure proper image and font loading

This setup provides comprehensive performance monitoring and analytics for your Vercel deployment, enabling data-driven optimization decisions.