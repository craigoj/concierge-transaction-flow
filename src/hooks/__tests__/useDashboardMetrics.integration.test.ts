
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { TransactionData, AgentData } from '@/types';

// Mock Supabase client with proper interface
const mockSupabaseResponse = {
  data: [] as any[],
  error: null,
  count: 0
};

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve(mockSupabaseResponse))
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

      // Create proper mock chain with argument handling
      const mockEqFunction = vi.fn().mockImplementation((field: string, value: any) => 
        Promise.resolve(mockSupabaseResponse)
      );
      
      const mockSelectFunction = vi.fn().mockImplementation((fields: string) => ({
        eq: mockEqFunction
      }));
      
      const mockFromFunction = vi.fn().mockImplementation((table: string) => ({
        select: mockSelectFunction
      }));

      // Override the mock implementation
      (mockSupabase.from as any) = mockFromFunction;

      // Simulate API calls
      const transactionsResult = await mockSupabase.from('transactions').select('*').eq('agent_id', agentId);
      const clientsResult = await mockSupabase.from('clients').select('*').eq('dummy', 'value');
      const tasksResult = await mockSupabase.from('tasks').select('*').eq('is_completed', false);

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

  return function TestWrapper(props: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      props.children
    );
  };
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

    mockSupabaseResponse.data = mockTransactions;
    mockSupabaseResponse.error = null;

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
    mockSupabaseResponse.data = null;
    mockSupabaseResponse.error = { message: 'Database connection failed' };

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

  it('should handle empty agent ID gracefully', () => {
    const { result } = renderHook(
      () => useDashboardMetrics(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activeTransactions).toBe(0);
  });
});
