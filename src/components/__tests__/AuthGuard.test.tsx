import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AuthGuard from '../AuthGuard'

// Mock the supabase client with proper hoisting
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn()
  }
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' })
  }
})

// Test component
const TestComponent = () => <div>Protected Content</div>

describe('AuthGuard', () => {
  let mockSupabase: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { supabase } = await import('@/integrations/supabase/client')
    mockSupabase = vi.mocked(supabase)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading spinner while checking authentication', async () => {
      // Mock pending auth check
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
      mockSupabase.auth.getSession.mockReturnValue(
        new Promise(() => {}) // Never resolves to keep loading state
      )

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  describe('Unauthenticated State', () => {
    it('redirects to /auth when user is not authenticated', async () => {
      // Mock no session
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth')
      })
    })

    it('redirects to /auth when session exists but user is null', async () => {
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: null } }
      })

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth')
      })
    })
  })

  describe('Authenticated State', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com'
    }

    const mockSession = {
      user: mockUser,
      access_token: 'token-123'
    }

    it('renders protected content when user is authenticated', async () => {
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession }
      })

      // Mock profile fetch
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'coordinator' },
              error: null
            })
          })
        })
      })

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })
  })

  describe('Role-Based Routing', () => {
    const mockUser = {
      id: 'user-123',
      email: 'agent@example.com'
    }

    const mockSession = {
      user: mockUser,
      access_token: 'token-123'
    }

    it('redirects agent to /agent/dashboard when accessing coordinator routes', async () => {
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession }
      })

      // Mock agent role
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'agent' },
              error: null
            })
          })
        })
      })

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/agent/dashboard')
      })
    })
  })

  describe('Error Handling', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com'
    }

    const mockSession = {
      user: mockUser,
      access_token: 'token-123'
    }

    it('handles profile fetch errors gracefully', async () => {
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession }
      })

      // Mock profile fetch error
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Profile not found')
            })
          })
        })
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('handles network errors during profile fetch', async () => {
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        // Call immediately with session
        setTimeout(() => callback('SIGNED_IN', mockSession), 0)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession }
      })

      // Mock network error
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Network error'))
          })
        })
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      // The component should show protected content even with profile fetch error
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      }, { timeout: 5000 })

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user role:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('Auth State Changes', () => {
    it('responds to auth state change events', async () => {
      let authStateCallback: (event: string, session: any) => void

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      // Mock the profile fetch before triggering auth change
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'coordinator' },
              error: null
            })
          })
        })
      })

      // Simulate sign in
      const newSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123'
      }

      // Trigger auth state change with a slight delay to allow for async operations
      setTimeout(() => {
        authStateCallback!('SIGNED_IN', newSession)
      }, 100)

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('unsubscribes from auth state changes on unmount', () => {
      const unsubscribeMock = vi.fn()
      
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } }
      })
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      })

      const { unmount } = render(
        <BrowserRouter>
          <AuthGuard>
            <TestComponent />
          </AuthGuard>
        </BrowserRouter>
      )

      unmount()

      expect(unsubscribeMock).toHaveBeenCalled()
    })
  })
})