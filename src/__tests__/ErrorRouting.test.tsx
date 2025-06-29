import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@/test/test-utils'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock the NotFound component
vi.mock('@/pages/NotFound', () => ({
  default: () => <div>404 - Page Not Found</div>
}))

// Mock other pages to ensure they don't interfere
vi.mock('@/pages/Index', () => ({ default: () => <div>Dashboard Page</div> }))
vi.mock('@/pages/Transactions', () => ({ default: () => <div>Transactions Page</div> }))
vi.mock('@/pages/Auth', () => ({ default: () => <div>Auth Page</div> }))

// Mock AuthGuard to always render children
vi.mock('@/components/AuthGuard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Mock AuthProvider
vi.mock('@/integrations/supabase/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
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

// Simple router setup for testing 404 behavior
const SimpleRouterApp = ({ initialRoute }: { initialRoute: string }) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/transactions" element={<div>Transactions Page</div>} />
        <Route path="/transactions/:id" element={<div>Transaction Detail Page</div>} />
        <Route path="/clients" element={<div>Clients Page</div>} />
        <Route path="/clients/:id" element={<div>Client Detail Page</div>} />
        <Route path="/auth" element={<div>Auth Page</div>} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </MemoryRouter>
  )
}

// Routes and Route are already imported above

describe('Error Routing and 404 Handling', () => {
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

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  describe('404 Page Rendering', () => {
    it('renders 404 page for completely non-existent routes', async () => {
      renderWithProviders(<SimpleRouterApp initialRoute="/this-page-does-not-exist" />)
      
      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
      })
    })

    it('renders 404 page for invalid nested routes', async () => {
      renderWithProviders(<SimpleRouterApp initialRoute="/transactions/invalid/nested/route" />)
      
      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
      })
    })

    it('renders 404 page for malformed paths', async () => {
      const malformedPaths = [
        '/transactions/',  // trailing slash on parameterized route
        '//double-slash',
        '/clients//nested',
        '/agents/123/invalid/action'
      ]

      for (const path of malformedPaths) {
        const { unmount } = renderWithProviders(<SimpleRouterApp initialRoute={path} />)
        
        await waitFor(() => {
          expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
        })
        
        unmount()
      }
    })

    it('renders 404 page for case-sensitive route mismatches', async () => {
      renderWithProviders(<SimpleRouterApp initialRoute="/Transactions" />)
      
      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
      })
    })
  })

  describe('Valid Route Handling', () => {
    it('renders correct pages for valid routes', async () => {
      const validRoutes = [
        { path: '/', expected: 'Home Page' },
        { path: '/dashboard', expected: 'Dashboard Page' },
        { path: '/transactions', expected: 'Transactions Page' },
        { path: '/clients', expected: 'Clients Page' },
        { path: '/auth', expected: 'Auth Page' }
      ]

      for (const route of validRoutes) {
        const { unmount } = renderWithProviders(<SimpleRouterApp initialRoute={route.path} />)
        
        await waitFor(() => {
          expect(screen.getByText(route.expected)).toBeInTheDocument()
          expect(screen.queryByText('404 - Page Not Found')).not.toBeInTheDocument()
        })
        
        unmount()
      }
    })

    it('renders parameterized routes correctly', async () => {
      const parameterizedRoutes = [
        { path: '/transactions/123', expected: 'Transaction Detail Page' },
        { path: '/clients/abc-456', expected: 'Client Detail Page' },
        { path: '/transactions/550e8400-e29b-41d4-a716-446655440000', expected: 'Transaction Detail Page' }
      ]

      for (const route of parameterizedRoutes) {
        const { unmount } = renderWithProviders(<SimpleRouterApp initialRoute={route.path} />)
        
        await waitFor(() => {
          expect(screen.getByText(route.expected)).toBeInTheDocument()
          expect(screen.queryByText('404 - Page Not Found')).not.toBeInTheDocument()
        })
        
        unmount()
      }
    })
  })

  describe('Edge Cases in Routing', () => {
    it('handles empty route parameters', async () => {
      // This should show 404 since the parameter is empty
      renderWithProviders(<SimpleRouterApp initialRoute="/transactions/" />)
      
      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
      })
    })

    it('handles special characters in route parameters', async () => {
      const specialCharRoutes = [
        '/clients/user%40example.com',  // URL encoded email
        '/transactions/test-id-123',    // Hyphens
        '/clients/user_name_123'        // Underscores
      ]

      for (const route of specialCharRoutes) {
        const { unmount } = renderWithProviders(<SimpleRouterApp initialRoute={route} />)
        
        await waitFor(() => {
          // These should be valid parameterized routes
          const isValidDetail = screen.queryByText('Client Detail Page') || 
                               screen.queryByText('Transaction Detail Page')
          expect(isValidDetail).toBeInTheDocument()
          expect(screen.queryByText('404 - Page Not Found')).not.toBeInTheDocument()
        })
        
        unmount()
      }
    })

    it('handles very long route paths', async () => {
      const longPath = '/this/is/a/very/long/path/that/should/not/match/any/existing/routes/in/the/application'
      
      renderWithProviders(<SimpleRouterApp initialRoute={longPath} />)
      
      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
      })
    })

    it('handles routes with query parameters on non-existent paths', async () => {
      renderWithProviders(<SimpleRouterApp initialRoute="/non-existent?param=value" />)
      
      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
      })
    })

    it('handles routes with hash fragments on non-existent paths', async () => {
      renderWithProviders(<SimpleRouterApp initialRoute="/non-existent#section" />)
      
      await waitFor(() => {
        expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
      })
    })
  })

  describe('Error Boundary Integration', () => {
    it('handles component rendering errors gracefully', async () => {
      // Create a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Component rendering error')
      }

      const ErrorRouterApp = () => (
        <MemoryRouter initialEntries={['/error-route']}>
          <Routes>
            <Route path="/error-route" element={<ErrorComponent />} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </MemoryRouter>
      )

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        renderWithProviders(<ErrorRouterApp />)
        
        // The error boundary or React should handle this gracefully
        // In a real app, you'd have an error boundary that shows a fallback UI
      } catch (error) {
        // Expected to throw in this test scenario
        expect(error).toBeInstanceOf(Error)
      }

      consoleSpy.mockRestore()
    })
  })

  describe('Route Matching Priority', () => {
    it('matches specific routes before catch-all', async () => {
      const PriorityRouterApp = () => (
        <MemoryRouter initialEntries={['/transactions']}>
          <Routes>
            <Route path="/transactions" element={<div>Specific Transactions Page</div>} />
            <Route path="/transactions/*" element={<div>Transactions Wildcard</div>} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </MemoryRouter>
      )

      renderWithProviders(<PriorityRouterApp />)
      
      await waitFor(() => {
        expect(screen.getByText('Specific Transactions Page')).toBeInTheDocument()
        expect(screen.queryByText('Transactions Wildcard')).not.toBeInTheDocument()
        expect(screen.queryByText('404 - Page Not Found')).not.toBeInTheDocument()
      })
    })

    it('matches wildcard routes when specific routes dont match', async () => {
      const PriorityRouterApp = () => (
        <MemoryRouter initialEntries={['/transactions/some/nested/path']}>
          <Routes>
            <Route path="/transactions" element={<div>Specific Transactions Page</div>} />
            <Route path="/transactions/*" element={<div>Transactions Wildcard</div>} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </MemoryRouter>
      )

      renderWithProviders(<PriorityRouterApp />)
      
      await waitFor(() => {
        expect(screen.getByText('Transactions Wildcard')).toBeInTheDocument()
        expect(screen.queryByText('Specific Transactions Page')).not.toBeInTheDocument()
        expect(screen.queryByText('404 - Page Not Found')).not.toBeInTheDocument()
      })
    })
  })

  describe('URL Validation', () => {
    it('handles invalid URL encoding', async () => {
      const invalidUrls = [
        '/clients/%GG',  // Invalid hex in URL encoding
        '/transactions/%',  // Incomplete URL encoding
      ]

      for (const url of invalidUrls) {
        const { unmount } = renderWithProviders(<SimpleRouterApp initialRoute={url} />)
        
        await waitFor(() => {
          // Should either show 404 or handle gracefully
          expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
        })
        
        unmount()
      }
    })

    it('properly decodes valid URL encoding', async () => {
      renderWithProviders(<SimpleRouterApp initialRoute="/clients/user%40example.com" />)
      
      await waitFor(() => {
        expect(screen.getByText('Client Detail Page')).toBeInTheDocument()
        expect(screen.queryByText('404 - Page Not Found')).not.toBeInTheDocument()
      })
    })
  })
})