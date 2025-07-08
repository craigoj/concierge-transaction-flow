import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component for Suspense fallback
export const ComponentLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-2">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  </div>
);

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return React.forwardRef<React.ComponentRef<React.ComponentType<P>>, P>((props, ref) => (
    <Suspense fallback={fallback || <ComponentLoader />}>
      <Component {...props} ref={ref} />
    </Suspense>
  ));
};

// Lazy loaded page components
export const LazyTransactionDetail = React.lazy(() => 
  import('../pages/TransactionDetail').then(module => ({ default: module.default }))
);

export const LazyTemplates = React.lazy(() => 
  import('../pages/Templates').then(module => ({ default: module.default }))
);

export const LazyWorkflows = React.lazy(() => 
  import('../pages/Workflows').then(module => ({ default: module.default }))
);

export const LazyAgentTasks = React.lazy(() => 
  import('../pages/agent/AgentTasks').then(module => ({ default: module.default }))
);

export const LazyEnhancedAgentSetup = React.lazy(() => 
  import('../pages/agent/EnhancedAgentSetup').then(module => ({ default: module.default }))
);

export const LazyCreateClient = React.lazy(() => 
  import('../pages/CreateClient').then(module => ({ default: module.default }))
);

export const LazyCommunications = React.lazy(() => 
  import('../pages/Communications').then(module => ({ default: module.default }))
);

export const LazyProfile = React.lazy(() => 
  import('../pages/Profile').then(module => ({ default: module.default }))
);

// Lazy loaded component chunks
export const LazyDashboardStats = React.lazy(() => 
  import('../components/dashboard/DashboardStats').then(module => ({ default: module.default }))
);

export const LazyWorkflowTemplateManager = React.lazy(() => 
  import('../components/workflows/WorkflowTemplateManager').then(module => ({ default: module.default }))
);

export const LazyApplyWorkflowTemplateDialog = React.lazy(() => 
  import('../components/workflows/ApplyWorkflowTemplateDialog').then(module => ({ default: module.default }))
);

export const LazyXMLTemplateImportDialog = React.lazy(() => 
  import('../components/workflows/XMLTemplateImportDialog').then(module => ({ default: module.default }))
);

export const LazyEnhancedCreateAgentDialog = React.lazy(() => 
  import('../components/agents/EnhancedCreateAgentDialog').then(module => ({ default: module.default }))
);

export const LazyAgentProfileTemplateManager = React.lazy(() => 
  import('../components/agents/AgentProfileTemplateManager').then(module => ({ default: module.default }))
);

export const LazyAgentIntakeForm = React.lazy(() => 
  import('../components/forms/AgentIntakeForm').then(module => ({ default: module.default }))
);

export const LazyOfferDraftingForm = React.lazy(() => 
  import('../components/forms/OfferDraftingForm').then(module => ({ default: module.default }))
);

export const LazyEnhancedOfferDraftingForm = React.lazy(() => 
  import('../components/forms/EnhancedOfferDraftingForm').then(module => ({ default: module.default }))
);

// Lazy loaded utility components
export const LazyFileSecurity = React.lazy(() => 
  import('../lib/file-security').then(module => ({ default: module.SecureFileUpload }))
);

// HOCs for common lazy loading patterns
export const LazyPage = withLazyLoading;
export const LazyComponent = withLazyLoading;

// Preloader for critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be needed soon
  const preloadTargets = [
    () => import('../pages/TransactionDetail'),
    () => import('../components/dashboard/DashboardStats'),
    () => import('../components/workflows/WorkflowTemplateManager')
  ];

  // Start preloading after a short delay to not block initial render
  setTimeout(() => {
    preloadTargets.forEach(loader => {
      loader().catch(() => {
        // Silently fail if preloading fails
      });
    });
  }, 2000);
};

// Dynamic import helpers
export const dynamicImport = {
  TransactionDetail: () => import('../pages/TransactionDetail'),
  Templates: () => import('../pages/Templates'),
  Workflows: () => import('../pages/Workflows'),
  AgentTasks: () => import('../pages/agent/AgentTasks'),
  EnhancedAgentSetup: () => import('../pages/agent/EnhancedAgentSetup'),
  CreateClient: () => import('../pages/CreateClient'),
  Communications: () => import('../pages/Communications'),
  Profile: () => import('../pages/Profile'),
  
  // Components
  DashboardStats: () => import('../components/dashboard/DashboardStats'),
  WorkflowTemplateManager: () => import('../components/workflows/WorkflowTemplateManager'),
  ApplyWorkflowTemplateDialog: () => import('../components/workflows/ApplyWorkflowTemplateDialog'),
  XMLTemplateImportDialog: () => import('../components/workflows/XMLTemplateImportDialog'),
  EnhancedCreateAgentDialog: () => import('../components/agents/EnhancedCreateAgentDialog'),
  AgentProfileTemplateManager: () => import('../components/agents/AgentProfileTemplateManager'),
  AgentIntakeForm: () => import('../components/forms/AgentIntakeForm'),
  OfferDraftingForm: () => import('../components/forms/OfferDraftingForm'),
  EnhancedOfferDraftingForm: () => import('../components/forms/EnhancedOfferDraftingForm')
};

// Bundle analyzer helper for development
export const bundleAnalysis = {
  logChunkSizes: () => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Bundle Analysis');
      console.log('Available lazy components:', Object.keys(dynamicImport));
      console.log('Critical components preloaded:', 3);
      console.groupEnd();
    }
  }
};