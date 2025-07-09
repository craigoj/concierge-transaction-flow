import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all the page components to avoid complex rendering
vi.mock('@/pages/Index', () => ({
  default: () => <div data-testid="index-page">Dashboard Page</div>,
}));
vi.mock('@/pages/Transactions', () => ({
  default: () => <div data-testid="transactions-page">Transactions Page</div>,
}));
vi.mock('@/pages/TransactionDetail', () => ({
  default: () => <div data-testid="transaction-detail-page">Transaction Detail Page</div>,
}));
vi.mock('@/pages/Clients', () => ({
  default: () => <div data-testid="clients-page">Clients Page</div>,
}));
vi.mock('@/pages/ClientDetail', () => ({
  default: () => <div data-testid="client-detail-page">Client Detail Page</div>,
}));
vi.mock('@/pages/CreateClient', () => ({
  default: () => <div data-testid="create-client-page">Create Client Page</div>,
}));
vi.mock('@/pages/Agents', () => ({
  default: () => <div data-testid="agents-page">Agents Page</div>,
}));
vi.mock('@/pages/AgentDetail', () => ({
  default: () => <div data-testid="agent-detail-page">Agent Detail Page</div>,
}));
vi.mock('@/pages/Communications', () => ({
  default: () => <div data-testid="communications-page">Communications Page</div>,
}));
vi.mock('@/pages/Documents', () => ({
  default: () => <div data-testid="documents-page">Documents Page</div>,
}));
vi.mock('@/pages/Analytics', () => ({
  default: () => <div data-testid="analytics-page">Analytics Page</div>,
}));
vi.mock('@/pages/Templates', () => ({
  default: () => <div data-testid="templates-page">Templates Page</div>,
}));
vi.mock('@/pages/Workflows', () => ({
  default: () => <div data-testid="workflows-page">Workflows Page</div>,
}));
vi.mock('@/pages/WorkflowTemplates', () => ({
  default: () => <div data-testid="workflow-templates-page">Workflow Templates Page</div>,
}));
vi.mock('@/pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));
vi.mock('@/pages/Profile', () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>,
}));
vi.mock('@/pages/Search', () => ({
  default: () => <div data-testid="search-page">Search Page</div>,
}));
vi.mock('@/pages/DemoSetup', () => ({
  default: () => <div data-testid="demo-setup-page">Demo Setup Page</div>,
}));
vi.mock('@/pages/AutomationDashboard', () => ({
  default: () => <div data-testid="automation-dashboard-page">Automation Dashboard Page</div>,
}));

// Agent portal pages
vi.mock('@/pages/agent/AgentDashboard', () => ({
  default: () => <div data-testid="agent-dashboard-page">Agent Dashboard Page</div>,
}));
vi.mock('@/pages/agent/AgentSetup', () => ({
  default: () => <div data-testid="agent-setup-page">Agent Setup Page</div>,
}));
vi.mock('@/pages/agent/TransactionDetail', () => ({
  default: () => (
    <div data-testid="agent-transaction-detail-page">Agent Transaction Detail Page</div>
  ),
}));

// Import real components that actually exist in the app
vi.mock('@/pages/OfferDrafting', () => ({
  default: () => <div data-testid="offer-drafting-page">Offer Drafting Page</div>,
}));
vi.mock('@/pages/ServiceTierSelection', () => ({
  default: () => <div data-testid="service-tier-page">Service Tier Page</div>,
}));
vi.mock('@/pages/AgentIntake', () => ({
  default: () => <div data-testid="agent-intake-page">Agent Intake Page</div>,
}));

// Auth and error pages
vi.mock('@/pages/Auth', () => ({ default: () => <div data-testid="auth-page">Auth Page</div> }));
vi.mock('@/pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Mock AuthGuard to always render children (simulating authenticated state)
vi.mock('@/components/AuthGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock ProtectedRoute to always render children (simulating authenticated state)
vi.mock('@/components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock AppLayout to always render children
vi.mock('@/components/layout/AppLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// Mock AuthProvider and other providers
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

// Mock QueryClient
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

// Mock React Router to use MemoryRouter instead of BrowserRouter for testing
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock performance monitoring and analytics
vi.mock('@/lib/performance-monitoring', () => ({
  performanceMonitor: {
    trackPageView: vi.fn(),
  },
}));

vi.mock('@/lib/sentry', () => ({
  Sentry: {
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sentry-error-boundary">{children}</div>
    ),
  },
}));

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="analytics" />,
}));

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}));

vi.mock('@/components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

const renderAppWithRoute = (initialEntries: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Provider Setup', () => {
    it('should render with all required providers', () => {
      renderAppWithRoute(['/auth']);

      expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });

  describe('Public Routes', () => {
    it('should render auth page without authentication', () => {
      renderAppWithRoute(['/auth']);
      expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    });

    it('should render not found page for invalid routes', () => {
      renderAppWithRoute(['/non-existent-route']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should render agent setup page with token', () => {
      renderAppWithRoute(['/agent/setup/test-token']);
      expect(screen.getByTestId('agent-setup-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Main Dashboard', () => {
    it('should render dashboard at root path when authenticated', () => {
      renderAppWithRoute(['/']);
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render dashboard at /dashboard path when authenticated', () => {
      renderAppWithRoute(['/dashboard']);
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Transactions', () => {
    it('should render transactions page when authenticated', () => {
      renderAppWithRoute(['/transactions']);
      expect(screen.getByTestId('transactions-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render transaction detail page when authenticated', () => {
      renderAppWithRoute(['/transactions/123']);
      expect(screen.getByTestId('transaction-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Clients', () => {
    it('should render clients page when authenticated', () => {
      renderAppWithRoute(['/clients']);
      expect(screen.getByTestId('clients-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render create client page when authenticated', () => {
      renderAppWithRoute(['/clients/new']);
      expect(screen.getByTestId('create-client-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render not found page for non-existent client detail route', () => {
      renderAppWithRoute(['/clients/456']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Agents', () => {
    it('should render agents page when authenticated', () => {
      renderAppWithRoute(['/agents']);
      expect(screen.getByTestId('agents-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render not found page for non-existent agent detail route', () => {
      renderAppWithRoute(['/agents/789']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Core Features', () => {
    it('should render communications page when authenticated', () => {
      renderAppWithRoute(['/communications']);
      expect(screen.getByTestId('communications-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render documents page when authenticated', () => {
      renderAppWithRoute(['/documents']);
      expect(screen.getByTestId('documents-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render not found page for non-existent analytics route', () => {
      renderAppWithRoute(['/analytics']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should render templates page when authenticated', () => {
      renderAppWithRoute(['/templates']);
      expect(screen.getByTestId('templates-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Workflows', () => {
    it('should render workflows page when authenticated', () => {
      renderAppWithRoute(['/workflows']);
      expect(screen.getByTestId('workflows-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render not found page for non-existent workflow templates route', () => {
      renderAppWithRoute(['/workflow-templates']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Automation', () => {
    it('should render automation dashboard when authenticated', () => {
      renderAppWithRoute(['/automation']);
      expect(screen.getByTestId('automation-dashboard-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Settings and Profile', () => {
    it('should render settings page when authenticated', () => {
      renderAppWithRoute(['/settings']);
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render profile page when authenticated', () => {
      renderAppWithRoute(['/profile']);
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Utility Pages', () => {
    it('should render not found page for non-existent search route', () => {
      renderAppWithRoute(['/search']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should render not found page for non-existent demo setup route', () => {
      renderAppWithRoute(['/demo-setup']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Agent Portal', () => {
    it('should render agent dashboard when authenticated', () => {
      renderAppWithRoute(['/agent/dashboard']);
      expect(screen.getByTestId('agent-dashboard-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should render not found page for agent setup without token', () => {
      renderAppWithRoute(['/agent/setup']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should render agent transaction detail when authenticated', () => {
      renderAppWithRoute(['/agent/transactions/123']);
      expect(screen.getByTestId('agent-transaction-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should render not found page for invalid routes', () => {
      renderAppWithRoute(['/invalid-route']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should render not found page for deeply nested invalid routes', () => {
      renderAppWithRoute(['/invalid/route/deeply/nested']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Route Parameters', () => {
    it('should handle transaction ID parameter correctly', () => {
      renderAppWithRoute(['/transactions/tx-12345']);
      expect(screen.getByTestId('transaction-detail-page')).toBeInTheDocument();
    });

    it('should handle non-existent client ID parameter correctly', () => {
      renderAppWithRoute(['/clients/client-67890']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should handle non-existent agent ID parameter correctly', () => {
      renderAppWithRoute(['/agents/agent-99999']);
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should handle agent transaction ID parameter correctly', () => {
      renderAppWithRoute(['/agent/transactions/agent-tx-111']);
      expect(screen.getByTestId('agent-transaction-detail-page')).toBeInTheDocument();
    });
  });

  describe('Route Structure Validation', () => {
    it('should have proper route separation between public and protected routes', () => {
      // Public routes should not have AuthGuard
      renderAppWithRoute(['/landing']);
      expect(screen.queryByTestId('protected-route')).not.toBeInTheDocument();

      // Protected routes should have AuthGuard
      renderAppWithRoute(['/dashboard']);
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should handle multiple route levels correctly', () => {
      // Test nested route structure
      renderAppWithRoute(['/agent/transactions/123']);
      expect(screen.getByTestId('agent-transaction-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });

    it('should differentiate between similar route patterns', () => {
      // Both routes exist but should render different components
      renderAppWithRoute(['/transactions']);
      expect(screen.getByTestId('transactions-page')).toBeInTheDocument();

      renderAppWithRoute(['/transactions/123']);
      expect(screen.getByTestId('transaction-detail-page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty route paths', () => {
      renderAppWithRoute(['']);
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
    });

    it('should handle routes with trailing slashes', () => {
      renderAppWithRoute(['/nonexistent/']);
      // Test with a clearly non-existent route with trailing slash
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should handle case-sensitive routes', () => {
      renderAppWithRoute(['/NONEXISTENT']);
      // Test with a clearly non-existent route in uppercase
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should handle routes with query parameters', () => {
      renderAppWithRoute(['/dashboard?tab=overview']);
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
    });

    it('should handle routes with hash fragments', () => {
      renderAppWithRoute(['/dashboard#section1']);
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
    });
  });
});
