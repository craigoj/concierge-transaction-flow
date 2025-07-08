/**
 * Development Tools for Concierge Transaction Flow
 * Provides utilities for development environment
 */

import { debugUtils } from './debug-utils';
import { logger } from './logger';

interface DevTool {
  name: string;
  description: string;
  action: () => void;
  category: 'data' | 'ui' | 'performance' | 'debug' | 'testing';
}

class DevelopmentTools {
  private static instance: DevelopmentTools;
  private tools: Map<string, DevTool> = new Map();
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = import.meta.env.MODE === 'development';
    if (this.isEnabled) {
      this.initializeTools();
      this.setupGlobalAccess();
      this.createDevToolsPanel();
    }
  }

  public static getInstance(): DevelopmentTools {
    if (!DevelopmentTools.instance) {
      DevelopmentTools.instance = new DevelopmentTools();
    }
    return DevelopmentTools.instance;
  }

  /**
   * Initialize development tools
   */
  private initializeTools(): void {
    // Data manipulation tools
    this.addTool('clear-storage', {
      name: 'Clear Storage',
      description: 'Clear localStorage and sessionStorage',
      category: 'data',
      action: () => {
        localStorage.clear();
        sessionStorage.clear();
        logger.info('Storage cleared', { context: 'development_tools' });
      }
    });

    this.addTool('dump-storage', {
      name: 'Dump Storage',
      description: 'Log all localStorage and sessionStorage contents',
      category: 'data',
      action: () => {
        const storageData = {
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage }
        };
        logger.info('Storage contents dump', { storageData, context: 'development_tools' });
      }
    });

    this.addTool('mock-user', {
      name: 'Mock User Data',
      description: 'Add mock user data for testing',
      category: 'data',
      action: () => {
        const mockUser = {
          id: 'dev-user-123',
          email: 'developer@test.com',
          role: 'coordinator',
          name: 'Dev User',
          created_at: new Date().toISOString()
        };
        localStorage.setItem('mock-user', JSON.stringify(mockUser));
        logger.info('Mock user data added', { mockUser, context: 'development_tools' });
      }
    });

    // UI debugging tools
    this.addTool('highlight-regions', {
      name: 'Highlight Regions',
      description: 'Add visual borders to layout regions',
      category: 'ui',
      action: () => {
        const style = document.createElement('style');
        style.id = 'dev-region-highlights';
        style.textContent = `
          * { outline: 1px solid rgba(255, 0, 0, 0.2) !important; }
          .container { outline: 2px solid rgba(0, 255, 0, 0.5) !important; }
          .grid { outline: 2px solid rgba(0, 0, 255, 0.5) !important; }
          .flex { outline: 2px solid rgba(255, 255, 0, 0.5) !important; }
        `;
        
        const existing = document.getElementById('dev-region-highlights');
        if (existing) {
          existing.remove();
          logger.info('🎨 Region highlights removed');
        } else {
          document.head.appendChild(style);
          logger.info('🎨 Region highlights added');
        }
      }
    });

    this.addTool('toggle-grid', {
      name: 'Toggle Grid Overlay',
      description: 'Show/hide CSS grid overlay',
      category: 'ui',
      action: () => {
        const style = document.createElement('style');
        style.id = 'dev-grid-overlay';
        style.textContent = `
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              linear-gradient(rgba(0, 0, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 255, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
            z-index: 9998;
          }
        `;
        
        const existing = document.getElementById('dev-grid-overlay');
        if (existing) {
          existing.remove();
          logger.info('📐 Grid overlay removed');
        } else {
          document.head.appendChild(style);
          logger.info('📐 Grid overlay added');
        }
      }
    });

    this.addTool('inspect-component', {
      name: 'Component Inspector',
      description: 'Click elements to inspect React components',
      category: 'ui',
      action: () => {
        const inspectorActive = (window as any).__componentInspectorActive;
        
        if (inspectorActive) {
          document.removeEventListener('click', (window as any).__componentInspectorHandler);
          (window as any).__componentInspectorActive = false;
          logger.info('🔍 Component inspector disabled');
        } else {
          const handler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            
            const element = e.target as HTMLElement;
            const reactFiber = (element as any)._reactInternalFiber || 
                             (element as any).__reactInternalInstance;
            
            logger.info('🔍 Component Inspector');
            logger.info('Element:', element);
            logger.info('React Fiber:', reactFiber);
            logger.info('Props:', reactFiber?.memoizedProps);
            logger.info('State:', reactFiber?.memoizedState);
            
          };
          
          document.addEventListener('click', handler);
          (window as any).__componentInspectorHandler = handler;
          (window as any).__componentInspectorActive = true;
          logger.info('🔍 Component inspector enabled - click elements to inspect');
        }
      }
    });

    // Performance tools
    this.addTool('performance-snapshot', {
      name: 'Performance Snapshot',
      description: 'Take performance snapshot and log metrics',
      category: 'performance',
      action: () => {
        logger.info('⚡ Performance Snapshot');
        
        // Memory usage
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          logger.info('Memory:', {
            used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
            total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
            limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
          });
        }
        
        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          logger.info('Navigation Timing:', {
            domContentLoaded: `${Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart)}ms`,
            pageLoad: `${Math.round(navigation.loadEventEnd - navigation.navigationStart)}ms`,
            firstByte: `${Math.round(navigation.responseStart - navigation.requestStart)}ms`
          });
        }
        
        // Resource timing
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources
          .filter(r => r.duration > 100)
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5);
        
        if (slowResources.length > 0) {
          logger.info('Slow Resources:', slowResources.map(r => ({
            name: r.name.split('/').pop(),
            duration: `${Math.round(r.duration)}ms`,
            size: `${Math.round((r as any).transferSize / 1024)}KB`
          })));
        }
        
        
      }
    });

    this.addTool('simulate-slow-network', {
      name: 'Simulate Slow Network',
      description: 'Add artificial delays to network requests',
      category: 'performance',
      action: () => {
        const originalFetch = window.fetch;
        const slowNetworkEnabled = (window as any).__slowNetworkEnabled;
        
        if (slowNetworkEnabled) {
          window.fetch = originalFetch;
          (window as any).__slowNetworkEnabled = false;
          logger.info('🐌 Slow network simulation disabled');
        } else {
          window.fetch = async (...args) => {
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            return originalFetch(...args);
          };
          (window as any).__slowNetworkEnabled = true;
          logger.info('🐌 Slow network simulation enabled (1-3s delay)');
        }
      }
    });

    // Debug tools
    this.addTool('react-profiler', {
      name: 'React Profiler',
      description: 'Start/stop React profiler',
      category: 'debug',
      action: () => {
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
          
          if (hook.isProfilingEnabled?.()) {
            hook.stopProfiling?.();
            logger.info('🛠️ React profiler stopped');
          } else {
            hook.startProfiling?.();
            logger.info('🛠️ React profiler started');
          }
        } else {
          logger.warn('React DevTools not installed');
        }
      }
    });

    this.addTool('error-test', {
      name: 'Test Error Handling',
      description: 'Trigger test errors to verify error boundaries',
      category: 'testing',
      action: () => {
        const errorTypes = [
          () => { throw new Error('Test synchronous error'); },
          () => { setTimeout(() => { throw new Error('Test async error'); }, 100); },
          () => { Promise.reject(new Error('Test promise rejection')); },
          () => { console.error('Test console error'); }
        ];
        
        const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        logger.info('💥 Triggering test error...');
        randomError();
      }
    });

    this.addTool('accessibility-check', {
      name: 'Quick A11y Check',
      description: 'Run basic accessibility checks',
      category: 'testing',
      action: () => {
        logger.info('♿ Accessibility Check');
        
        // Check for missing alt attributes
        const imagesWithoutAlt = Array.from(document.images)
          .filter(img => !img.alt && !img.getAttribute('aria-label'));
        
        if (imagesWithoutAlt.length > 0) {
          logger.warn('Images without alt text:', imagesWithoutAlt);
        }
        
        // Check for interactive elements without labels
        const interactiveElements = document.querySelectorAll('button, input, select, textarea');
        const unlabeledElements = Array.from(interactiveElements)
          .filter(el => {
            const hasLabel = el.getAttribute('aria-label') || 
                           el.getAttribute('aria-labelledby') ||
                           (el as HTMLElement).textContent?.trim() ||
                           document.querySelector(`label[for="${el.id}"]`);
            return !hasLabel;
          });
        
        if (unlabeledElements.length > 0) {
          logger.warn('Interactive elements without labels:', unlabeledElements);
        }
        
        // Check for proper heading hierarchy
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let previousLevel = 0;
        const hierarchyIssues: Element[] = [];
        
        headings.forEach(heading => {
          const level = parseInt(heading.tagName[1]);
          if (previousLevel > 0 && level > previousLevel + 1) {
            hierarchyIssues.push(heading);
          }
          previousLevel = level;
        });
        
        if (hierarchyIssues.length > 0) {
          logger.warn('Heading hierarchy issues:', hierarchyIssues);
        }
        
        logger.info('✅ Accessibility check complete');
        
      }
    });
  }

  /**
   * Add a new development tool
   */
  private addTool(id: string, tool: DevTool): void {
    this.tools.set(id, tool);
  }

  /**
   * Execute a development tool
   */
  public runTool(id: string): void {
    const tool = this.tools.get(id);
    if (tool) {
      try {
        tool.action();
        debugUtils.log('info', `Dev tool executed: ${tool.name}`, null, 'devtools');
      } catch (error) {
        debugUtils.logError(error as Error, { tool: tool.name });
      }
    } else {
      logger.warn(`Development tool not found: ${id}`);
    }
  }

  /**
   * List all available tools
   */
  public listTools(): void {
    logger.info('🛠️ Available Development Tools');
    
    const categories = new Map<string, DevTool[]>();
    this.tools.forEach(tool => {
      if (!categories.has(tool.category)) {
        categories.set(tool.category, []);
      }
      categories.get(tool.category)!.push(tool);
    });
    
    categories.forEach((tools, category) => {
      logger.info(`${category.toUpperCase()}`);
      tools.forEach((tool, index) => {
        logger.info(`${index + 1}. ${tool.name} - ${tool.description}`);
      });
      
    });
    
    logger.info('\nUsage: devTools.runTool("tool-id")');
    
  }

  /**
   * Create visual development tools panel
   */
  private createDevToolsPanel(): void {
    if (typeof window === 'undefined') return;

    const panel = document.createElement('div');
    panel.id = 'dev-tools-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      width: 250px;
      max-height: 300px;
      background: rgba(20, 20, 20, 0.95);
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      border-radius: 8px;
      border: 1px solid #333;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 9997;
      overflow: hidden;
      display: none;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: #333;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #444;
    `;
    header.innerHTML = `
      <strong>🛠️ Dev Tools</strong>
      <button onclick="devTools.togglePanel()" style="background: none; border: none; color: white; cursor: pointer; font-size: 14px;">×</button>
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      padding: 8px;
      max-height: 240px;
      overflow-y: auto;
    `;

    // Create tool buttons organized by category
    const categories = new Map<string, DevTool[]>();
    this.tools.forEach((tool, id) => {
      if (!categories.has(tool.category)) {
        categories.set(tool.category, []);
      }
      categories.get(tool.category)!.push({ ...tool, name: id });
    });

    categories.forEach((tools, category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.marginBottom = '8px';
      
      const categoryHeader = document.createElement('div');
      categoryHeader.style.cssText = 'font-weight: bold; margin-bottom: 4px; color: #ccc;';
      categoryHeader.textContent = category.toUpperCase();
      categoryDiv.appendChild(categoryHeader);

      tools.forEach(tool => {
        const button = document.createElement('button');
        button.style.cssText = `
          display: block;
          width: 100%;
          background: #444;
          border: 1px solid #555;
          color: white;
          padding: 4px 8px;
          margin: 2px 0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 10px;
          text-align: left;
        `;
        button.textContent = tool.description;
        button.onclick = () => this.runTool(tool.name);
        
        button.onmouseenter = () => {
          button.style.background = '#555';
        };
        button.onmouseleave = () => {
          button.style.background = '#444';
        };

        categoryDiv.appendChild(button);
      });

      content.appendChild(categoryDiv);
    });

    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);

    // Add keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        this.togglePanel();
      }
    });
  }

  /**
   * Toggle development tools panel
   */
  public togglePanel(): void {
    const panel = document.getElementById('dev-tools-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Setup global access to development tools
   */
  private setupGlobalAccess(): void {
    (window as any).devTools = {
      runTool: this.runTool.bind(this),
      listTools: this.listTools.bind(this),
      togglePanel: this.togglePanel.bind(this),
      
      // Quick access shortcuts
      clearStorage: () => this.runTool('clear-storage'),
      dumpStorage: () => this.runTool('dump-storage'),
      mockUser: () => this.runTool('mock-user'),
      highlightRegions: () => this.runTool('highlight-regions'),
      perfSnapshot: () => this.runTool('performance-snapshot'),
      a11yCheck: () => this.runTool('accessibility-check')
    };

    logger.info(`
🛠️ Development Tools loaded!

Quick commands:
- devTools.listTools() - Show all available tools
- devTools.togglePanel() - Toggle visual panel
- Ctrl+Shift+T - Toggle panel
- Ctrl+Shift+D - Toggle debug panel

Quick shortcuts:
- devTools.clearStorage()
- devTools.mockUser()
- devTools.perfSnapshot()
- devTools.a11yCheck()
    `);
  }
}

// Initialize development tools
export const devTools = DevelopmentTools.getInstance();

export default DevelopmentTools;