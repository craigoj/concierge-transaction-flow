import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useDashboardMetrics } from '../useDashboardMetrics'

// Mock the supabase client - create fresh mocks for each test
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}))

// Create wrapper for QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        staleTime: 0,
        gcTime: 0
      },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useDashboardMetrics', () => {
  let mockSupabase: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { supabase } = await import('@/integrations/supabase/client')
    mockSupabase = vi.mocked(supabase)
  })

  const mockTransactions = [
    {
      id: '1',
      status: 'active',
      purchase_price: '500000',
      commission_rate: '0.03',
      closing_date: '2024-02-20',
      created_at: '2024-02-01T10:00:00Z'
    },
    {
      id: '2', 
      status: 'intake',
      purchase_price: '750000',
      commission_rate: '0.025',
      closing_date: '2024-03-01',
      created_at: '2024-02-10T10:00:00Z'
    },
    {
      id: '3',
      status: 'closed',
      purchase_price: '600000',
      commission_rate: '0.03',
      closing_date: '2024-01-30',
      created_at: '2024-01-15T10:00:00Z'
    }
  ]

  const mockTasks = [
    {
      id: '1',
      is_completed: false,
      requires_agent_action: true
    },
    {
      id: '2',
      is_completed: true,
      requires_agent_action: false
    },
    {
      id: '3',
      is_completed: false,
      requires_agent_action: false
    }
  ]

  const mockClients = [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ]

  it('calculates metrics correctly with sample data', async () => {
    // Setup mocks
    mockSupabase.from.mockImplementation((table: string) => {
      const mockQuery = {
        select: vi.fn(),
        order: vi.fn()
      }

      if (table === 'transactions') {
        mockQuery.select.mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockTransactions,
            error: null
          })
        })
      } else if (table === 'tasks') {
        mockQuery.select.mockResolvedValue({
          data: mockTasks,
          error: null
        })
      } else if (table === 'clients') {
        mockQuery.select.mockResolvedValue({
          data: mockClients,
          error: null
        })
      }

      return mockQuery
    })

    const { result } = renderHook(() => useDashboardMetrics(), {
      wrapper: createWrapper()
    })

    // Wait for the query to resolve
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 10000 })

    expect(result.current.error).toBeFalsy()
    expect(result.current.metrics).toBeTruthy()
    expect(result.current.metrics?.activeTransactions).toBe(1) // only 1 active transaction
    expect(result.current.metrics?.pendingTransactions).toBe(1) // 1 intake transaction
    expect(result.current.metrics?.totalClients).toBe(3)
  })

  it('handles empty data correctly', async () => {
    // Setup mocks with empty data
    mockSupabase.from.mockImplementation((table: string) => {
      const mockQuery = {
        select: vi.fn(),
        order: vi.fn()
      }

      if (table === 'transactions') {
        mockQuery.select.mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } else {
        mockQuery.select.mockResolvedValue({
          data: [],
          error: null
        })
      }

      return mockQuery
    })

    const { result } = renderHook(() => useDashboardMetrics(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 10000 })

    expect(result.current.error).toBeFalsy()
    expect(result.current.metrics).toEqual({
      activeTransactions: 0,
      pendingTransactions: 0, 
      closingThisWeek: 0,
      totalClients: 0,
      monthlyRevenue: 0,
      totalVolume: 0,
      completionRate: 0,
      actionRequired: 0,
      incompleteTasks: 0
    })
  })

  it('handles supabase errors correctly', async () => {
    const error = new Error('Database connection failed')
    
    // Setup mocks with errors
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: error
        })
      }).mockResolvedValue({
        data: null,
        error: error
      })
    }))

    const { result } = renderHook(() => useDashboardMetrics(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 10000 })

    expect(result.current.error).toBeTruthy()
    expect(result.current.metrics).toBeNull()
  })

  it('returns loading state initially', () => {
    // Setup mocks that never resolve
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue(new Promise(() => {})) // Never resolves
      }).mockReturnValue(new Promise(() => {}))
    }))

    const { result } = renderHook(() => useDashboardMetrics(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.metrics).toBeNull()
    expect(result.current.error).toBeFalsy()
  })
})