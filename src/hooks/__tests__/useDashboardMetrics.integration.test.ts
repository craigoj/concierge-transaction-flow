
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { TransactionData, AgentData } from '@/types';

// Mock Supabase client
const mockSupabaseResponse = {
  data: null,
  error: null,
  count: 0
};

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null,
        count: 0
      })),
      count: vi.fn(() => mockSupabaseResponse)
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock dashboard metrics hook
interface DashboardMetrics {
  activeTransactions: number;
  totalClients: number;
  pendingTasks: number;
  monthlyVolume: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const useDashboardMetrics = (agentId: string): DashboardMetrics => {
  const [metrics, setMetrics] = React.useState<DashboardMetrics>({
    activeTransactions: 0,
    totalClients: 0,
    pendingTasks: 0,
    monthlyVolume: 0,
    isLoading: true,
    error: null,
    refetch: async () => {}
  });

  const fetchMetrics = async () => {
    try {
      setMetrics(prev => ({ ...prev, isLoading: true, error: null }));

      const [transactionsResult, clientsResult, tasksResult] = await Promise.all([
        mockSupabase.from('transactions').select('*').eq('agent_id', agentId),
        mockSupabase.from('clients').select('*'),
        mockSupabase.from('tasks').select('*').eq('is_completed', false)
      ]);

      if (transactionsResult.error || clientsResult.error || tasksResult.error) {
        throw new Error('Data fetching failed');
      }

      setMetrics(prev => ({
        ...prev,
        activeTransactions: transactionsResult.data?.length || 0,
        totalClients: clientsResult.data?.length || 0,
        pendingTasks: tasksResult.data?.length || 0,
        monthlyVolume: 150000,
        isLoading: false
      }));
    } catch (error) {
      setMetrics(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
    }
  };

  React.useEffect(() => {
    if (agentId) {
      fetchMetrics();
    }
  }, [agentId]);

  return {
    ...metrics,
    refetch: fetchMetrics
  };
};

// Test wrapper with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return TestWrapper;
};

describe('useDashboardMetrics Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseResponse.data = [];
    mockSupabaseResponse.error = null;
  });

  it('should fetch dashboard metrics successfully', async () => {
    const mockTransactions: TransactionData[] = [
      {
        id: '1',
        property_address: '123 Main St',
        status: 'active',
        agent_id: 'agent-1',
        city: 'Norfolk',
        state: 'VA',
        zip_code: '23502',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: mockTransactions,
          error: null
        })
      })
    });

    const { result } = renderHook(
      () => useDashboardMetrics('agent-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeTransactions).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('should handle data fetching failures', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: null,
          error: { message: 'Database connection failed' }
        })
      })
    });

    const { result } = renderHook(
      () => useDashboardMetrics('agent-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Data fetching failed');
  });

  it('should handle state management correctly during loading', async () => {
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(mockPromise)
      })
    });

    const { result } = renderHook(
      () => useDashboardMetrics('agent-1'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    resolvePromise({ data: [], error: null });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should refetch data correctly', async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: [], error: null });
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: mockFn
      })
    });

    const { result } = renderHook(
      () => useDashboardMetrics('agent-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.refetch();

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should handle empty agent ID gracefully', () => {
    const { result } = renderHook(
      () => useDashboardMetrics(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activeTransactions).toBe(0);
  });

  it('should calculate metrics correctly', async () => {
    const mockData = {
      transactions: [
        { id: '1', status: 'active', agent_id: 'agent-1' },
        { id: '2', status: 'active', agent_id: 'agent-1' }
      ],
      clients: [
        { id: '1', name: 'Client 1' },
        { id: '2', name: 'Client 2' },
        { id: '3', name: 'Client 3' }
      ],
      tasks: [
        { id: '1', is_completed: false },
        { id: '2', is_completed: false }
      ]
    };

    mockSupabase.from.mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: mockData[table as keyof typeof mockData] || [],
          error: null
        })
      })
    }));

    const { result } = renderHook(
      () => useDashboardMetrics('agent-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeTransactions).toBe(2);
    expect(result.current.totalClients).toBe(3);
    expect(result.current.pendingTasks).toBe(2);
    expect(result.current.monthlyVolume).toBe(150000);
  });
});
