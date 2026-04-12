/**
 * Performance Monitoring Utility for Concierge Transaction Flow
 * Tracks Core Web Vitals and custom performance metrics
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { sentryUtils } from './sentry';
import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url?: string;
  userAgent?: string;
}

interface PerformanceThresholds {
  LCP: number; // Largest Contentful Paint (ms)
  INP: number; // Interaction to Next Paint (ms)
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint (ms)
  TTFB: number; // Time to First Byte (ms)
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds = {
    LCP: 2500,
    INP: 200, // Interaction to Next Paint threshold
    CLS: 0.1,
    FCP: 1800,
    TTFB: 600,
  };

  private constructor() {
    this.initializeMetrics();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMetrics(): void {
    // Core Web Vitals
    onCLS(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this)); // Interaction to Next Paint (replaces FID)
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));

    // Custom metrics
    this.trackPageLoad();
    this.trackUserInteractions();
    this.trackResourceTiming();
    this.trackErrors();
  }

  private handleMetric(metric: any): void {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(performanceMetric);

    // Send to analytics
    this.sendToAnalytics(performanceMetric);

    // Check thresholds
    this.checkThresholds(performanceMetric);
  }

  private sendToAnalytics(metric: PerformanceMetric): void {
    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Performance Metric', {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: metric.url,
      });
    }

    // Log metric collection
    logger.info(
      'Performance metric collected',
      {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: metric.url,
      },
      'performance'
    );
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds[metric.name as keyof PerformanceThresholds];

    if (threshold && metric.value > threshold) {
      logger.warn(
        'Performance threshold exceeded',
        {
          metric: metric.name,
          value: metric.value,
          threshold: threshold,
          exceedsBy: metric.value - threshold,
          rating: metric.rating,
          url: metric.url,
        },
        'performance'
      );

      // Send alert to monitoring system
      this.sendAlert(metric, threshold);
    }
  }

  private sendAlert(metric: PerformanceMetric, threshold: number): void {
    // Send to Sentry for performance tracking
    sentryUtils.trackPerformanceIssue(metric.name, metric.value, threshold);

    // Only send to API in production environment
    if (import.meta.env.PROD && import.meta.env.VITE_VERCEL_ENV === 'production') {
      // Integration with alerting system
      fetch('/api/performance-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          threshold: threshold,
          rating: metric.rating,
          timestamp: metric.timestamp,
          url: metric.url,
          userAgent: metric.userAgent,
        }),
      }).catch((error) => {
        logger.error(
          'Failed to send performance alert',
          error as Error,
          {
            metric: metric.name,
            value: metric.value,
            threshold: threshold,
            apiEndpoint: '/api/performance-alert',
          },
          'performance'
        );

        sentryUtils.captureException(new Error('Performance alert API failed'), {
          metric: metric.name,
          value: metric.value,
          originalError: error,
        });
      });
    } else {
      // In development, just log the alert
      logger.warn(
        'Performance alert (dev mode)',
        new Error('Performance threshold exceeded'),
        {
          metric: metric.name,
          value: metric.value,
          threshold: threshold,
          rating: metric.rating,
          exceedsBy: metric.value - threshold,
          exceedsPercent: Math.round(((metric.value - threshold) / threshold) * 100),
        },
        'performance'
      );
    }
  }

  private trackPageLoad(): void {
    window.addEventListener('load', () => {
      // Use Navigation Timing API
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const metrics = {
          'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
          'TCP Connect': navigation.connectEnd - navigation.connectStart,
          'SSL Negotiation': navigation.connectEnd - navigation.secureConnectionStart,
          'Server Response': navigation.responseStart - navigation.requestStart,
          'DOM Processing': navigation.domComplete - navigation.responseEnd,
          'Page Load': navigation.loadEventEnd - navigation.navigationStart,
        };

        // Send each timing metric to analytics
        Object.entries(metrics).forEach(([metricName, value]) => {
          if (value > 0) {
            // Only send valid metrics
            if (typeof window !== 'undefined' && (window as any).va) {
              (window as any).va('track', 'Page Load Timing', {
                metric: metricName,
                value: Math.round(value),
                url: window.location.pathname,
              });
            }
          }
        });
      }
    });
  }

  private trackUserInteractions(): void {
    // Click tracking with performance impact
    document.addEventListener('click', (event) => {
      const startTime = performance.now();

      // Use requestIdleCallback to measure when the interaction is complete
      requestIdleCallback(() => {
        const duration = performance.now() - startTime;
        const target = event.target as HTMLElement;

        if (typeof window !== 'undefined' && (window as any).va) {
          (window as any).va('track', 'User Interaction', {
            type: 'click',
            element: target.tagName.toLowerCase(),
            duration: Math.round(duration),
            url: window.location.pathname,
          });
        }
      });
    });

    // Form submission tracking
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';

      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Form Submission', {
          formId,
          url: window.location.pathname,
        });
      }
    });
  }

  private trackResourceTiming(): void {
    // Use PerformanceObserver for resource timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;

            // Only track significant resources
            if (resource.duration > 100) {
              // > 100ms
              if (typeof window !== 'undefined' && (window as any).va) {
                (window as any).va('track', 'Resource Timing', {
                  name: this.getResourceName(resource.name),
                  duration: Math.round(resource.duration),
                  size: resource.transferSize || 0,
                  type: this.getResourceType(resource.name),
                });
              }
            }
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        logger.warn(
          'PerformanceObserver not supported for resource timing',
          {
            userAgent: navigator.userAgent,
            supportedAPIs: {
              performanceObserver: 'PerformanceObserver' in window,
              performance: 'performance' in window,
            },
          },
          'performance'
        );
      }
    }
  }

  private trackErrors(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'JavaScript Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          url: window.location.pathname,
        });
      }
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Unhandled Promise Rejection', {
          reason: event.reason?.toString() || 'Unknown',
          url: window.location.pathname,
        });
      }
    });
  }

  private getResourceName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop() || urlObj.pathname;
    } catch {
      return url.split('/').pop() || url;
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    if (url.includes('supabase')) return 'database';
    return 'other';
  }

  // Public methods for manual tracking
  public trackCustomMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Custom Metric', {
        metric: name,
        value,
        ...metadata,
        url: window.location.pathname,
      });
    }
  }

  public trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Feature Usage', {
        feature,
        ...metadata,
        url: window.location.pathname,
        timestamp: Date.now(),
      });
    }
  }

  public trackPageView(page?: string): void {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Page View', {
        page: page || window.location.pathname,
        referrer: document.referrer,
        timestamp: Date.now(),
      });
    }
  }

  // Getter methods for analytics
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getAverageMetric(metricName: string): number {
    const relevantMetrics = this.metrics.filter((m) => m.name === metricName);
    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  public getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

    // Calculate averages for each metric type
    const metricTypes = [...new Set(this.metrics.map((m) => m.name))];
    metricTypes.forEach((type) => {
      summary[type] = {
        average: this.getAverageMetric(type),
        count: this.metrics.filter((m) => m.name === type).length,
        latest: this.metrics.filter((m) => m.name === type).slice(-1)[0]?.value || 0,
      };
    });

    return summary;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export for manual initialization
export default PerformanceMonitor;
