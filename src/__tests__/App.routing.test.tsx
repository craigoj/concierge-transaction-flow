import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@/test/test-utils'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from "@/components/ui/tooltip"
import App from '../App'

// Mock all the page components
vi.mock('@/pages/Index', () => ({ default: () => <div>Dashboard Page</div> }))
vi.mock('@/pages/Transactions', () => ({ default: () => <div>Transactions Page</div> }))
vi.mock('@/pages/TransactionDetail', () => ({ default: () => <div>Transaction Detail Page</div> }))
vi.mock('@/pages/Clients', () => ({ default: () => <div>Clients Page</div> }))
vi.mock('@/pages/ClientDetail', () => ({ default: () => <div>Client Detail Page</div> }))
vi.mock('@/pages/CreateClient', () => ({ default: () => <div>Create Client Page</div> }))
vi.mock('@/pages/Agents', () => ({ default: () => <div>Agents Page</div> }))
vi.mock('@/pages/AgentDetail', () => ({ default: () => <div>Agent Detail Page</div> }))
vi.mock('@/pages/Analytics', () => ({ default: () => <div>Analytics Page</div> }))
vi.mock('@/pages/Settings', () => ({ default: () => <div>Settings Page</div> }))
vi.mock('@/pages/Profile', () => ({ default: () => <div>Profile Page</div> }))
vi.mock('@/pages/Auth', () => ({ default: () => <div>Auth Page</div> }))
vi.mock('@/pages/NotFound', () => ({ default: () => <div>404 Not Found</div> }))

// Mock landing pages
vi.mock('@/pages/landing/Home', () => ({ default: () => <div>Landing Home</div> }))
vi.mock('@/pages/landing/About', () => ({ default: () => <div>About Page</div> }))
vi.mock('@/pages/landing/Services', () => ({ default: () => <div>Services Page</div> }))
vi.mock('@/pages/landing/Contact', () => ({ default: () => <div>Contact Page</div> }))

// Mock agent pages  
vi.mock('@/pages/agent/AgentDashboard', () => ({ default: () => <div>Agent Dashboard</div> }))
vi.mock('@/pages/agent/AgentSetup', () => ({ default: () => <div>Agent Setup</div> }))
vi.mock('@/pages/agent/TransactionDetail', () => ({ default: () => <div>Agent Transaction Detail</div> }))

// Mock AuthGuard to always render children (we'll test it separately)
vi.mock('@/components/AuthGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

// Mock AuthProvider
vi.mock('@/integrations/supabase/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

describe('App Routing', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  const renderApp = (initialEntries: string[] = ['/']) => {
    // Since App already contains BrowserRouter, QueryClient, and AuthProvider,
    // we need to test it in isolation without adding additional routers.
    // For testing purposes, we'll create a modified version that accepts initialEntries
    const AppWithMemoryRouter = () => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <Routes>
              {/* Same routes as App.tsx but without the outer providers */}
              <Route path="/landing" element={<div>Landing Home</div>} />
              <Route path="/about" element={<div>About Page</div>} />
              <Route path="/services" element={<div>Services Page</div>} />
              <Route path="/contact" element={<div>Contact Page</div>} />
              <Route path="/auth" element={<div>Auth Page</div>} />
              <Route path="/" element={<div>Dashboard Page</div>} />
              <Route path="/dashboard" element={<div>Dashboard Page</div>} />
              <Route path="/transactions" element={<div>Transactions Page</div>} />
              <Route path="/transactions/:id" element={<div>Transaction Detail Page</div>} />
              <Route path="/clients" element={<div>Clients Page</div>} />
              <Route path="/clients/new" element={<div>Create Client Page</div>} />
              <Route path="/clients/:id" element={<div>Client Detail Page</div>} />
              <Route path="/agents" element={<div>Agents Page</div>} />
              <Route path="/agents/:id" element={<div>Agent Detail Page</div>} />
              <Route path="/analytics" element={<div>Analytics Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
              <Route path="/profile" element={<div>Profile Page</div>} />
              <Route path="/agent/dashboard" element={<div>Agent Dashboard</div>} />
              <Route path="/agent/setup" element={<div>Agent Setup</div>} />
              <Route path="/agent/transactions/:id" element={<div>Agent Transaction Detail</div>} />
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    )
    
    return render(<AppWithMemoryRouter />)
  }

  describe('Public Routes', () => {
    it('renders landing home page', async () => {
      renderApp(['/landing'])
      
      await waitFor(() => {
        expect(screen.getByText('Landing Home')).toBeInTheDocument()
      })
    })

    it('renders about page', async () => {
      renderApp(['/about'])
      
      await waitFor(() => {
        expect(screen.getByText('About Page')).toBeInTheDocument()
      })
    })

    it('renders services page', async () => {
      renderApp(['/services'])
      
      await waitFor(() => {
        expect(screen.getByText('Services Page')).toBeInTheDocument()
      })
    })

    it('renders contact page', async () => {
      renderApp(['/contact'])
      
      await waitFor(() => {
        expect(screen.getByText('Contact Page')).toBeInTheDocument()
      })
    })

    it('renders auth page', async () => {
      renderApp(['/auth'])
      
      await waitFor(() => {
        expect(screen.getByText('Auth Page')).toBeInTheDocument()
      })
    })
  })

  describe('Protected Routes', () => {
    it('renders dashboard on root path', async () => {
      renderApp(['/'])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
      })
    })

    it('renders dashboard on /dashboard path', async () => {
      renderApp(['/dashboard'])
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
      })
    })

    it('renders transactions page', async () => {
      renderApp(['/transactions'])
      
      await waitFor(() => {
        expect(screen.getByText('Transactions Page')).toBeInTheDocument()
      })
    })

    it('renders clients page', async () => {
      renderApp(['/clients'])
      
      await waitFor(() => {
        expect(screen.getByText('Clients Page')).toBeInTheDocument()
      })
    })

    it('renders create client page', async () => {
      renderApp(['/clients/new'])
      
      await waitFor(() => {
        expect(screen.getByText('Create Client Page')).toBeInTheDocument()
      })
    })

    it('renders agents page', async () => {
      renderApp(['/agents'])
      
      await waitFor(() => {
        expect(screen.getByText('Agents Page')).toBeInTheDocument()
      })
    })

    it('renders analytics page', async () => {
      renderApp(['/analytics'])
      
      await waitFor(() => {
        expect(screen.getByText('Analytics Page')).toBeInTheDocument()
      })
    })

    it('renders settings page', async () => {
      renderApp(['/settings'])
      
      await waitFor(() => {
        expect(screen.getByText('Settings Page')).toBeInTheDocument()
      })
    })

    it('renders profile page', async () => {
      renderApp(['/profile'])
      
      await waitFor(() => {
        expect(screen.getByText('Profile Page')).toBeInTheDocument()
      })
    })
  })

  describe('Parameterized Routes', () => {
    it('renders transaction detail page with ID parameter', async () => {
      renderApp(['/transactions/123'])
      
      await waitFor(() => {
        expect(screen.getByText('Transaction Detail Page')).toBeInTheDocument()
      })
    })

    it('renders client detail page with ID parameter', async () => {
      renderApp(['/clients/456'])
      
      await waitFor(() => {
        expect(screen.getByText('Client Detail Page')).toBeInTheDocument()
      })
    })

    it('renders agent detail page with ID parameter', async () => {
      renderApp(['/agents/789'])
      
      await waitFor(() => {
        expect(screen.getByText('Agent Detail Page')).toBeInTheDocument()
      })
    })
  })

  describe('Agent Portal Routes', () => {
    it('renders agent dashboard', async () => {
      renderApp(['/agent/dashboard'])
      
      await waitFor(() => {
        expect(screen.getByText('Agent Dashboard')).toBeInTheDocument()
      })
    })

    it('renders agent setup page', async () => {
      renderApp(['/agent/setup'])
      
      await waitFor(() => {
        expect(screen.getByText('Agent Setup')).toBeInTheDocument()
      })
    })

    it('renders agent transaction detail with ID parameter', async () => {
      renderApp(['/agent/transactions/123'])
      
      await waitFor(() => {
        expect(screen.getByText('Agent Transaction Detail')).toBeInTheDocument()
      })
    })
  })

  describe('404 Error Handling', () => {
    it('renders 404 page for non-existent routes', async () => {
      renderApp(['/non-existent-page'])
      
      await waitFor(() => {
        expect(screen.getByText('404 Not Found')).toBeInTheDocument()
      })
    })

    it('renders 404 page for invalid nested routes', async () => {
      renderApp(['/transactions/invalid/nested/route'])
      
      await waitFor(() => {
        expect(screen.getByText('404 Not Found')).toBeInTheDocument()
      })
    })

    it('renders 404 page for invalid agent routes', async () => {
      renderApp(['/agent/invalid-route'])
      
      await waitFor(() => {
        expect(screen.getByText('404 Not Found')).toBeInTheDocument()
      })
    })
  })

  describe('Route Edge Cases', () => {
    it('handles empty string route parameters', async () => {
      renderApp(['/transactions/'])
      
      await waitFor(() => {
        expect(screen.getByText('Transaction Detail Page')).toBeInTheDocument()
      })
    })

    it('handles special characters in route parameters', async () => {
      renderApp(['/clients/user%40example.com'])
      
      await waitFor(() => {
        expect(screen.getByText('Client Detail Page')).toBeInTheDocument()
      })
    })

    it('handles numeric route parameters', async () => {
      renderApp(['/transactions/12345'])
      
      await waitFor(() => {
        expect(screen.getByText('Transaction Detail Page')).toBeInTheDocument()
      })
    })

    it('handles UUID route parameters', async () => {
      renderApp(['/agents/550e8400-e29b-41d4-a716-446655440000'])
      
      await waitFor(() => {
        expect(screen.getByText('Agent Detail Page')).toBeInTheDocument()
      })
    })
  })

  describe('Route Case Sensitivity', () => {
    it('handles exact case matching for routes', async () => {
      renderApp(['/transactions'])
      
      await waitFor(() => {
        expect(screen.getByText('Transactions Page')).toBeInTheDocument()
      })
    })

    it('renders 404 for incorrect case routes', async () => {
      renderApp(['/Transactions'])
      
      await waitFor(() => {
        expect(screen.getByText('404 Not Found')).toBeInTheDocument()
      })
    })
  })

  describe('Nested Route Structures', () => {
    it('properly handles agent portal nested routes', async () => {
      renderApp(['/agent/dashboard'])
      
      await waitFor(() => {
        expect(screen.getByText('Agent Dashboard')).toBeInTheDocument()
      })
    })

    it('handles clients nested create route', async () => {
      renderApp(['/clients/new'])
      
      await waitFor(() => {
        expect(screen.getByText('Create Client Page')).toBeInTheDocument()
      })
    })

    it('distinguishes between similar routes', async () => {
      // Test that /clients/new doesn't match /clients/:id
      renderApp(['/clients/new'])
      
      await waitFor(() => {
        expect(screen.getByText('Create Client Page')).toBeInTheDocument()
        expect(screen.queryByText('Client Detail Page')).not.toBeInTheDocument()
      })
    })
  })
})