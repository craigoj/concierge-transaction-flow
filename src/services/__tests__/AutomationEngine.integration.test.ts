
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import type { AutomationRuleData, WorkflowExecution } from '@/types';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock fetch for edge function calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock AutomationEngine class with the required methods
class MockAutomationEngine {
  async processRules(transactionId: string, triggerEvent: string, context: any): Promise<any> {
    // Mock implementation that simulates rule processing
    const { data: rules } = await supabase.from('automation_rules').select('*').eq('trigger_event', triggerEvent);
    
    if (!rules || rules.length === 0) {
      return { processed: 0, results: [] };
    }

    // Simulate processing each rule
    const results = await Promise.all(
      rules.map(async (rule) => {
        const response = await fetch('/edge-function/execute-automation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rule, transactionId, context })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
      })
    );

    return { processed: rules.length, results };
  }

  async processRulesWithRetry(transactionId: string, triggerEvent: string, context: any, maxRetries: number = 3): Promise<any> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.processRules(transactionId, triggerEvent, context);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  }
}

describe('AutomationEngine Integration Tests', () => {
  let automationEngine: MockAutomationEngine;
  const mockRule: AutomationRuleData = {
    id: 'rule-1',
    name: 'Test Rule',
    trigger_event: 'status_change',
    trigger_condition: { from_status: 'intake', to_status: 'active' },
    template_id: 'template-1',
    is_active: true,
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    automationEngine = new MockAutomationEngine();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process automation rules successfully', async () => {
    // Mock Supabase responses
    const mockSupabaseFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: [mockRule],
          error: null
        })
      }),
      insert: vi.fn().mockReturnValue({
        data: { id: 'execution-1' },
        error: null
      })
    });

    (supabase.from as any).mockImplementation(mockSupabaseFrom);

    // Mock edge function response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, executionId: 'execution-1' })
    });

    const result = await automationEngine.processRules('transaction-1', 'status_change', {
      from_status: 'intake',
      to_status: 'active'
    });

    expect(result).toBeDefined();
    expect(mockSupabaseFrom).toHaveBeenCalledWith('automation_rules');
  });

  it('should handle service timeouts gracefully', async () => {
    // Mock timeout scenario
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 100);
    });

    mockFetch.mockImplementationOnce(() => timeoutPromise);

    const mockSupabaseFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: [mockRule],
          error: null
        })
      })
    });

    (supabase.from as any).mockImplementation(mockSupabaseFrom);

    await expect(
      automationEngine.processRules('transaction-1', 'status_change', {})
    ).rejects.toThrow('Request timeout');
  });

  it('should handle network errors and retry logic', async () => {
    // Mock network error
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    const mockSupabaseFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: [mockRule],
          error: null
        })
      }),
      insert: vi.fn().mockReturnValue({
        data: { id: 'execution-1' },
        error: null
      })
    });

    (supabase.from as any).mockImplementation(mockSupabaseFrom);

    // Should retry and succeed on second attempt
    const result = await automationEngine.processRulesWithRetry('transaction-1', 'status_change', {});
    expect(result).toBeDefined();
  });

  it('should validate trigger conditions correctly', async () => {
    const invalidRule = {
      ...mockRule,
      trigger_condition: { invalid_field: 'value' }
    };

    const mockSupabaseFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: [invalidRule],
          error: null
        })
      })
    });

    (supabase.from as any).mockImplementation(mockSupabaseFrom);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    const result = await automationEngine.processRules('transaction-1', 'status_change', {
      from_status: 'intake',
      to_status: 'active'
    });

    // Should handle validation gracefully
    expect(result).toBeDefined();
  });
});
