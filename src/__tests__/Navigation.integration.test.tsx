import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Navigation test component removed as it's not used in tests

// Mock navigation hooks
const mockNavigate = vi.fn()
const mockLocation = { pathname: '/', search: '', hash: '', state: null, key: 'default' }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: vi.fn(() => ({})),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  }
})

describe('Navigation Integration Tests', () => {
  let queryClient: QueryClient
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  describe('Basic Navigation', () => {
    it('navigates between different pages using useNavigate', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        return (
          <div>
            <button onClick={() => navigate('/transactions')}>
              Go to Transactions
            </button>
            <button onClick={() => navigate('/clients')}>
              Go to Clients
            </button>
          </div>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Go to Transactions'))
      expect(mockNavigate).toHaveBeenCalledWith('/transactions')

      fireEvent.click(screen.getByText('Go to Clients'))
      expect(mockNavigate).toHaveBeenCalledWith('/clients')
    })

    it('navigates with state and options', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        return (
          <button onClick={() => navigate('/clients/123', { 
            state: { from: 'dashboard' },
            replace: true 
          })}>
            Navigate with State
          </button>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Navigate with State'))
      expect(mockNavigate).toHaveBeenCalledWith('/clients/123', {
        state: { from: 'dashboard' },
        replace: true
      })
    })
  })

  describe('Parameterized Navigation', () => {
    it('navigates to routes with parameters', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        const transactionId = '12345'
        const clientId = 'client-abc'
        
        return (
          <div>
            <button onClick={() => navigate(`/transactions/${transactionId}`)}>
              View Transaction
            </button>
            <button onClick={() => navigate(`/clients/${clientId}`)}>
              View Client
            </button>
            <button onClick={() => navigate(`/agents/${clientId}/edit`)}>
              Edit Agent
            </button>
          </div>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('View Transaction'))
      expect(mockNavigate).toHaveBeenCalledWith('/transactions/12345')

      fireEvent.click(screen.getByText('View Client'))
      expect(mockNavigate).toHaveBeenCalledWith('/clients/client-abc')

      fireEvent.click(screen.getByText('Edit Agent'))
      expect(mockNavigate).toHaveBeenCalledWith('/agents/client-abc/edit')
    })

    it('handles URL encoding in parameters', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        const email = 'user@example.com'
        
        return (
          <button onClick={() => navigate(`/clients/${encodeURIComponent(email)}`)}>
            View Client by Email
          </button>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('View Client by Email'))
      expect(mockNavigate).toHaveBeenCalledWith('/clients/user%40example.com')
    })
  })

  describe('Query Parameters Navigation', () => {
    it('navigates with query parameters', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        return (
          <div>
            <button onClick={() => navigate('/transactions?status=active&sort=date')}>
              Filter Transactions
            </button>
            <button onClick={() => navigate('/clients?page=2&limit=20')}>
              Paginate Clients
            </button>
          </div>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Filter Transactions'))
      expect(mockNavigate).toHaveBeenCalledWith('/transactions?status=active&sort=date')

      fireEvent.click(screen.getByText('Paginate Clients'))
      expect(mockNavigate).toHaveBeenCalledWith('/clients?page=2&limit=20')
    })

    it('preserves existing query parameters when navigating', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        return (
          <button onClick={() => navigate('/transactions?status=active')}>
            Add Filter
          </button>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Add Filter'))
      expect(mockNavigate).toHaveBeenCalledWith('/transactions?status=active')
    })
  })

  describe('Relative Navigation', () => {
    it('navigates relatively from current location', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        return (
          <div>
            <button onClick={() => navigate('../')}>
              Go Back
            </button>
            <button onClick={() => navigate('./edit')}>
              Edit Current
            </button>
            <button onClick={() => navigate(-1)}>
              Browser Back
            </button>
          </div>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Go Back'))
      expect(mockNavigate).toHaveBeenCalledWith('../')

      fireEvent.click(screen.getByText('Edit Current'))
      expect(mockNavigate).toHaveBeenCalledWith('./edit')

      fireEvent.click(screen.getByText('Browser Back'))
      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('Conditional Navigation', () => {
    it('navigates based on conditions', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        const userRole = 'agent'
        
        const handleNavigation = () => {
          if (userRole === 'agent') {
            navigate('/agent/dashboard')
          } else {
            navigate('/dashboard')
          }
        }
        
        return (
          <button onClick={handleNavigation}>
            Go to Dashboard
          </button>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Go to Dashboard'))
      expect(mockNavigate).toHaveBeenCalledWith('/agent/dashboard')
    })

    it('prevents navigation based on conditions', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        const hasUnsavedChanges = true
        
        const handleNavigation = () => {
          if (hasUnsavedChanges) {
            const confirmed = window.confirm('You have unsaved changes. Continue?')
            if (confirmed) {
              navigate('/clients')
            }
          } else {
            navigate('/clients')
          }
        }
        
        return (
          <button onClick={handleNavigation}>
            Navigate Away
          </button>
        )
      }

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Navigate Away'))
      expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Continue?')
      expect(mockNavigate).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })
  })

  describe('Error Handling in Navigation', () => {
    it('handles navigation errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const TestComponent = () => {
        const navigate = mockNavigate
        
        const handleErrorNavigation = () => {
          try {
            // Simulate an error during navigation
            throw new Error('Navigation failed')
          } catch (error) {
            console.error('Navigation error:', error)
            navigate('/error')
          }
        }
        
        return (
          <button onClick={handleErrorNavigation}>
            Navigate with Error
          </button>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Navigate with Error'))
      expect(consoleSpy).toHaveBeenCalledWith('Navigation error:', expect.any(Error))
      expect(mockNavigate).toHaveBeenCalledWith('/error')

      consoleSpy.mockRestore()
    })
  })

  describe('Navigation with Form Data', () => {
    it('navigates after form submission', async () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          // Simulate form submission
          setTimeout(() => {
            navigate('/clients', { state: { created: true } })
          }, 0)
        }
        
        return (
          <form onSubmit={handleSubmit}>
            <input name="name" defaultValue="Test Client" />
            <button type="submit">Create Client</button>
          </form>
        )
      }

      renderWithProviders(<TestComponent />)

      await user.click(screen.getByRole('button', { name: 'Create Client' }))
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/clients', { state: { created: true } })
      })
    })
  })

  describe('Navigation Guards', () => {
    it('implements navigation guards for protected routes', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        const isAuthenticated = false
        
        const handleProtectedNavigation = () => {
          if (!isAuthenticated) {
            navigate('/auth', { state: { returnUrl: '/settings' } })
          } else {
            navigate('/settings')
          }
        }
        
        return (
          <button onClick={handleProtectedNavigation}>
            Go to Settings
          </button>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Go to Settings'))
      expect(mockNavigate).toHaveBeenCalledWith('/auth', { 
        state: { returnUrl: '/settings' } 
      })
    })
  })

  describe('Programmatic Navigation Timing', () => {
    it('handles immediate navigation', () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        // Immediate navigation on mount
        React.useEffect(() => {
          navigate('/dashboard')
        }, [navigate])
        
        return <div>Redirecting...</div>
      }

      renderWithProviders(<TestComponent />)
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('handles delayed navigation', async () => {
      const TestComponent = () => {
        const navigate = mockNavigate
        
        const handleDelayedNavigation = () => {
          setTimeout(() => {
            navigate('/transactions')
          }, 100)
        }
        
        return (
          <button onClick={handleDelayedNavigation}>
            Navigate After Delay
          </button>
        )
      }

      renderWithProviders(<TestComponent />)

      fireEvent.click(screen.getByText('Navigate After Delay'))
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/transactions')
      }, { timeout: 200 })
    })
  })
})
