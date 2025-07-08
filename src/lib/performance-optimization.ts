import { logger } from './logger';

export interface PerformanceMetrics {
  bundleSize: number;
  chunkCount: number;
  loadTime: number;
  renderTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = Date.now();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Monitor initial page load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.captureLoadMetrics();
      });

      // Monitor lazy loaded components
      this.setupIntersectionObserver();
      
      // Monitor memory usage periodically
      this.setupMemoryMonitoring();
    }
  }

  private captureLoadMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    const metrics: PerformanceMetrics = {
      bundleSize: this.estimateBundleSize(),
      chunkCount: this.countLoadedChunks(),
      loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
      renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : 0,
      memoryUsage: memory ? {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      } : undefined
    };

    this.metrics.push(metrics);
    this.logPerformanceMetrics(metrics);
  }

  private estimateBundleSize(): number {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.includes('.js'));
    return jsResources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
  }

  private countLoadedChunks(): number {
    const resources = performance.getEntriesByType('resource');
    return resources.filter(r => r.name.includes('.js') && r.name.includes('assets')).length;
  }

  private setupIntersectionObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const componentName = element.getAttribute('data-component');
            if (componentName) {
              this.logComponentRender(componentName);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe lazy-loaded components
    setTimeout(() => {
      document.querySelectorAll('[data-component]').forEach(el => {
        observer.observe(el);
      });
    }, 1000);
  }

  private setupMemoryMonitoring(): void {
    if ((performance as any).memory) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 30000); // Check every 30 seconds
    }
  }

  private checkMemoryUsage(): void {
    const memory = (performance as any).memory;
    if (memory) {
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      const usagePercent = (usedMB / limitMB) * 100;

      if (usagePercent > 80) {
        logger.warn('High memory usage detected', {
          usedMB,
          limitMB,
          usagePercent: Math.round(usagePercent),
          context: 'performance_optimization'
        });
      }
    }
  }

  private logComponentRender(componentName: string): void {
    logger.debug('Component rendered', {
      component: componentName,
      timestamp: Date.now() - this.startTime,
      context: 'performance_optimization'
    });
  }

  private logPerformanceMetrics(metrics: PerformanceMetrics): void {
    logger.info('Performance metrics captured', {
      bundleSize: `${Math.round(metrics.bundleSize / 1024)}KB`,
      chunkCount: metrics.chunkCount,
      loadTime: `${metrics.loadTime}ms`,
      renderTime: `${metrics.renderTime}ms`,
      memoryUsage: metrics.memoryUsage ? `${metrics.memoryUsage.used}MB` : 'unknown',
      context: 'performance_optimization'
    });
  }

  // Public methods for manual performance tracking
  public startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.debug('Performance timer', {
        name,
        duration: `${Math.round(duration)}ms`,
        context: 'performance_optimization'
      });
      
      return duration;
    };
  }

  public measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const stopTimer = this.startTimer(name);
    
    return fn().finally(() => {
      stopTimer();
    });
  }

  public measureSync<T>(name: string, fn: () => T): T {
    const stopTimer = this.startTimer(name);
    
    try {
      return fn();
    } finally {
      stopTimer();
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public analyzePerformance(): {
    averageLoadTime: number;
    averageRenderTime: number;
    memoryTrend: 'increasing' | 'stable' | 'decreasing';
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageRenderTime: 0,
        memoryTrend: 'stable',
        recommendations: ['No performance data available yet']
      };
    }

    const averageLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.length;
    const averageRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / this.metrics.length;
    
    const memoryTrend = this.analyzeMemoryTrend();
    const recommendations = this.generateRecommendations(averageLoadTime, averageRenderTime, memoryTrend);

    return {
      averageLoadTime,
      averageRenderTime,
      memoryTrend,
      recommendations
    };
  }

  private analyzeMemoryTrend(): 'increasing' | 'stable' | 'decreasing' {
    const memoryMetrics = this.metrics
      .filter(m => m.memoryUsage)
      .map(m => m.memoryUsage!.used)
      .slice(-5); // Last 5 measurements

    if (memoryMetrics.length < 2) return 'stable';

    const trend = memoryMetrics[memoryMetrics.length - 1] - memoryMetrics[0];
    const threshold = 5; // MB

    if (trend > threshold) return 'increasing';
    if (trend < -threshold) return 'decreasing';
    return 'stable';
  }

  private generateRecommendations(loadTime: number, renderTime: number, memoryTrend: string): string[] {
    const recommendations: string[] = [];

    if (loadTime > 3000) {
      recommendations.push('Consider implementing more aggressive code splitting');
      recommendations.push('Optimize bundle size by removing unused dependencies');
    }

    if (renderTime > 1000) {
      recommendations.push('Consider lazy loading non-critical components');
      recommendations.push('Implement React.memo for expensive components');
    }

    if (memoryTrend === 'increasing') {
      recommendations.push('Memory usage is increasing - check for memory leaks');
      recommendations.push('Consider implementing component cleanup in useEffect');
    }

    const chunkCount = this.metrics[this.metrics.length - 1]?.chunkCount || 0;
    if (chunkCount < 5) {
      recommendations.push('Consider more granular code splitting for better caching');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Continue monitoring.');
    }

    return recommendations;
  }
}

// Performance optimization utilities
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const startTimer = (name: string) => performanceOptimizer.startTimer(name);
  const measureAsync = <T>(name: string, fn: () => Promise<T>) => performanceOptimizer.measureAsync(name, fn);
  const measureSync = <T>(name: string, fn: () => T) => performanceOptimizer.measureSync(name, fn);
  const getMetrics = () => performanceOptimizer.getMetrics();
  const analyzePerformance = () => performanceOptimizer.analyzePerformance();

  return {
    startTimer,
    measureAsync,
    measureSync,
    getMetrics,
    analyzePerformance
  };
};

// HOC for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      const stopTimer = performanceOptimizer.startTimer(`${componentName}-mount`);
      return stopTimer;
    }, []);

    return <Component {...props} ref={ref} data-component={componentName} />;
  });
};

// Bundle analysis for development
export const bundleAnalyzer = {
  logChunkInfo: () => {
    if (process.env.NODE_ENV === 'development') {
      const resources = performance.getEntriesByType('resource');
      const jsChunks = resources.filter(r => r.name.includes('.js'));
      
      logger.info('Bundle analysis', {
        totalChunks: jsChunks.length,
        totalSize: `${Math.round(jsChunks.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024)}KB`,
        largestChunk: jsChunks.reduce((largest, current) => 
          (current.transferSize || 0) > (largest.transferSize || 0) ? current : largest
        ).name.split('/').pop(),
        context: 'performance_optimization'
      });
    }
  }
};