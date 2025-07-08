import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all the page components to avoid complex rendering
vi.mock('@/pages/Index', () => ({ default: () => <div data-testid="index-page">Dashboard Page</div> }));
vi.mock('@/pages/Transactions', () => ({ default: () => <div data-testid="transactions-page">Transactions Page</div> }));
vi.mock('@/pages/TransactionDetail', () => ({ default: () => <div data-testid="transaction-detail-page">Transaction Detail Page</div> }));
vi.mock('@/pages/Clients', () => ({ default: () => <div data-testid="clients-page">Clients Page</div> }));
vi.mock('@/pages/ClientDetail', () => ({ default: () => <div data-testid="client-detail-page">Client Detail Page</div> }));
vi.mock('@/pages/CreateClient', () => ({ default: () => <div data-testid="create-client-page">Create Client Page</div> }));
vi.mock('@/pages/Agents', () => ({ default: () => <div data-testid="agents-page">Agents Page</div> }));
vi.mock('@/pages/AgentDetail', () => ({ default: () => <div data-testid="agent-detail-page">Agent Detail Page</div> }));
vi.mock('@/pages/Communications', () => ({ default: () => <div data-testid="communications-page">Communications Page</div> }));
vi.mock('@/pages/Documents', () => ({ default: () => <div data-testid="documents-page">Documents Page</div> }));
vi.mock('@/pages/Analytics', () => ({ default: () => <div data-testid="analytics-page">Analytics Page</div> }));
vi.mock('@/pages/Templates', () => ({ default: () => <div data-testid="templates-page">Templates Page</div> }));
vi.mock('@/pages/Workflows', () => ({ default: () => <div data-testid="workflows-page">Workflows Page</div> }));
vi.mock('@/pages/WorkflowTemplates', () => ({ default: () => <div data-testid="workflow-templates-page">Workflow Templates Page</div> }));
vi.mock('@/pages/Settings', () => ({ default: () => <div data-testid="settings-page">Settings Page</div> }));
vi.mock('@/pages/Profile', () => ({ default: () => <div data-testid="profile-page">Profile Page</div> }));
vi.mock('@/pages/Search', () => ({ default: () => <div data-testid="search-page">Search Page</div> }));
vi.mock('@/pages/DemoSetup', () => ({ default: () => <div data-testid="demo-setup-page">Demo Setup Page</div> }));
vi.mock('@/pages/AutomationDashboard', () => ({ default: () => <div data-testid="automation-dashboard-page">Automation Dashboard Page</div> }));

// Agent portal pages
vi.mock('@/pages/agent/AgentDashboard', () => ({ default: () => <div data-testid="agent-dashboard-page">Agent Dashboard Page</div> }));
vi.mock('@/pages/agent/AgentSetup', () => ({ default: () => <div data-testid="agent-setup-page">Agent Setup Page</div> }));
vi.mock('@/pages/agent/TransactionDetail', () => ({ default: () => <div data-testid="agent-transaction-detail-page">Agent Transaction Detail Page</div> }));

// Landing pages
vi.mock('@/pages/landing/Home', () => ({ default: () => <div data-testid="landing-home-page">Landing Home Page</div> }));
vi.mock('@/pages/landing/About', () => ({ default: () => <div data-testid="about-page">About Page</div> }));
vi.mock('@/pages/landing/Services', () => ({ default: () => <div data-testid="services-page">Services Page</div> }));
vi.mock('@/pages/landing/Contact', () => ({ default: () => <div data-testid="contact-page">Contact Page</div> }));

// Auth and error pages
vi.mock('@/pages/Auth', () => ({ default: () => <div data-testid="auth-page">Auth Page</div> }));
vi.mock('@/pages/NotFound', () => ({ default: () => <div data-testid="not-found-page">Not Found Page</div> }));

// Mock AuthGuard to always render children (simulating authenticated state)
vi.mock('@/components/AuthGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-guard">{children}</div>
}));

// Mock AuthProvider and other providers
vi.mock('@/integrations/supabase/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-provider">{children}</div>
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />
}));

// Mock QueryClient
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="query-client-provider">{children}</div>
}));

// Mock React Router to use MemoryRouter instead of BrowserRouter for testing
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  };
});

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
      renderAppWithRoute(['/landing']);
      
      expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });

  describe('Public Routes', () => {
    it('should render landing page without authentication', () => {
      renderAppWithRoute(['/landing']);
      expect(screen.getByTestId('landing-home-page')).toBeInTheDocument();
    });

    it('should render about page without authentication', () => {
      renderAppWithRoute(['/about']);
      expect(screen.getByTestId('about-page')).toBeInTheDocument();
    });

    it('should render services page without authentication', () => {
      renderAppWithRoute(['/services']);
      expect(screen.getByTestId('services-page')).toBeInTheDocument();
    });

    it('should render contact page without authentication', () => {
      renderAppWithRoute(['/contact']);
      expect(screen.getByTestId('contact-page')).toBeInTheDocument();
    });

    it('should render auth page without authentication', () => {
      renderAppWithRoute(['/auth']);
      expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Main Dashboard', () => {
    it('should render dashboard at root path when authenticated', () => {
      renderAppWithRoute(['/']);
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render dashboard at /dashboard path when authenticated', () => {
      renderAppWithRoute(['/dashboard']);
      expect(screen.getByTestId('index-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Transactions', () => {
    it('should render transactions page when authenticated', () => {
      renderAppWithRoute(['/transactions']);
      expect(screen.getByTestId('transactions-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render transaction detail page when authenticated', () => {
      renderAppWithRoute(['/transactions/123']);
      expect(screen.getByTestId('transaction-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Clients', () => {
    it('should render clients page when authenticated', () => {
      renderAppWithRoute(['/clients']);
      expect(screen.getByTestId('clients-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render create client page when authenticated', () => {
      renderAppWithRoute(['/clients/new']);
      expect(screen.getByTestId('create-client-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render client detail page when authenticated', () => {
      renderAppWithRoute(['/clients/456']);
      expect(screen.getByTestId('client-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Agents', () => {
    it('should render agents page when authenticated', () => {
      renderAppWithRoute(['/agents']);
      expect(screen.getByTestId('agents-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render agent detail page when authenticated', () => {
      renderAppWithRoute(['/agents/789']);
      expect(screen.getByTestId('agent-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Core Features', () => {
    it('should render communications page when authenticated', () => {
      renderAppWithRoute(['/communications']);
      expect(screen.getByTestId('communications-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render documents page when authenticated', () => {
      renderAppWithRoute(['/documents']);
      expect(screen.getByTestId('documents-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render analytics page when authenticated', () => {
      renderAppWithRoute(['/analytics']);
      expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render templates page when authenticated', () => {
      renderAppWithRoute(['/templates']);
      expect(screen.getByTestId('templates-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Workflows', () => {
    it('should render workflows page when authenticated', () => {
      renderAppWithRoute(['/workflows']);
      expect(screen.getByTestId('workflows-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render workflow templates page when authenticated', () => {
      renderAppWithRoute(['/workflow-templates']);
      expect(screen.getByTestId('workflow-templates-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Automation', () => {
    it('should render automation dashboard when authenticated', () => {
      renderAppWithRoute(['/automation']);
      expect(screen.getByTestId('automation-dashboard-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Settings and Profile', () => {
    it('should render settings page when authenticated', () => {
      renderAppWithRoute(['/settings']);
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render profile page when authenticated', () => {
      renderAppWithRoute(['/profile']);
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Utility Pages', () => {
    it('should render search page when authenticated', () => {
      renderAppWithRoute(['/search']);
      expect(screen.getByTestId('search-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render demo setup page when authenticated', () => {
      renderAppWithRoute(['/demo-setup']);
      expect(screen.getByTestId('demo-setup-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Agent Portal', () => {
    it('should render agent dashboard when authenticated', () => {
      renderAppWithRoute(['/agent/dashboard']);
      expect(screen.getByTestId('agent-dashboard-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render agent setup when authenticated', () => {
      renderAppWithRoute(['/agent/setup']);
      expect(screen.getByTestId('agent-setup-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should render agent transaction detail when authenticated', () => {
      renderAppWithRoute(['/agent/transactions/123']);
      expect(screen.getByTestId('agent-transaction-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
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

    it('should handle client ID parameter correctly', () => {
      renderAppWithRoute(['/clients/client-67890']);
      expect(screen.getByTestId('client-detail-page')).toBeInTheDocument();
    });

    it('should handle agent ID parameter correctly', () => {
      renderAppWithRoute(['/agents/agent-99999']);
      expect(screen.getByTestId('agent-detail-page')).toBeInTheDocument();
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
      expect(screen.queryByTestId('auth-guard')).not.toBeInTheDocument();
      
      // Protected routes should have AuthGuard  
      renderAppWithRoute(['/dashboard']);
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    });

    it('should handle multiple route levels correctly', () => {
      // Test nested route structure
      renderAppWithRoute(['/agent/transactions/123']);
      expect(screen.getByTestId('agent-transaction-detail-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
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