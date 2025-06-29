import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutomationTriggers } from '../useAutomationTriggers';

let mockSupabaseClient: any = null;

vi.mock('@/integrations/supabase/client', () => ({
  get supabase() {
    return mockSupabaseClient;
  }
}));

describe('useAutomationTriggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();

    mockSupabaseClient = {
      from: vi.fn(),
      functions: {
        invoke: vi.fn()
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hook Structure', () => {
    it('should return all three trigger functions', () => {
      const { result } = renderHook(() => useAutomationTriggers());
      
      expect(result.current).toHaveProperty('triggerStatusChangeAutomation');
      expect(result.current).toHaveProperty('triggerTaskCompletionAutomation');
      expect(result.current).toHaveProperty('triggerDocumentUploadAutomation');
      expect(typeof result.current.triggerStatusChangeAutomation).toBe('function');
      expect(typeof result.current.triggerTaskCompletionAutomation).toBe('function');
      expect(typeof result.current.triggerDocumentUploadAutomation).toBe('function');
    });

    it('should memoize functions with useCallback', () => {
      const { result, rerender } = renderHook(() => useAutomationTriggers());
      const firstRender = result.current;
      
      rerender();
      const secondRender = result.current;
      
      expect(firstRender.triggerStatusChangeAutomation).toBe(secondRender.triggerStatusChangeAutomation);
      expect(firstRender.triggerTaskCompletionAutomation).toBe(secondRender.triggerTaskCompletionAutomation);
      expect(firstRender.triggerDocumentUploadAutomation).toBe(secondRender.triggerDocumentUploadAutomation);
    });
  });

  describe('triggerStatusChangeAutomation', () => {
    const mockTransaction = {
      id: 'tx-123',
      status: 'in_progress',
      amount: 1000
    };

    const mockRule = {
      id: 'rule-123',
      is_active: true,
      trigger_event: 'status_change',
      trigger_condition: {
        from_status: 'pending',
        to_status: 'in_progress'
      }
    };

    it('should fetch transaction and execute matching rules', async () => {
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [mockRule], error: null })
            }))
          }))
        });

      mockSupabaseClient.functions.invoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('tx-123', 'pending', 'in_progress', 'user-123');
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('transactions');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('automation_rules');
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('execute-automation', {
        body: {
          ruleId: 'rule-123',
          context: {
            transaction_id: 'tx-123',
            transaction: mockTransaction,
            trigger_data: {
              old_status: 'pending',
              new_status: 'in_progress',
              trigger_type: 'status_change'
            },
            user_id: 'user-123'
          }
        }
      });
    });

    it('should handle transaction not found error', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
          }))
        }))
      });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('invalid-id', 'pending', 'in_progress');
      });

      expect(console.error).toHaveBeenCalledWith('Transaction not found for automation trigger:', { message: 'Not found' });
      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });

    it('should handle automation rules fetch error', async () => {
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Rules fetch failed' } })
            }))
          }))
        });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('tx-123', 'pending', 'in_progress');
      });

      expect(console.error).toHaveBeenCalledWith('Error fetching automation rules:', { message: 'Rules fetch failed' });
      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });

    it('should filter rules by status conditions', async () => {
      const nonMatchingRule = {
        id: 'rule-456',
        is_active: true,
        trigger_event: 'status_change',
        trigger_condition: {
          from_status: 'completed',
          to_status: 'archived'
        }
      };

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [mockRule, nonMatchingRule], error: null })
            }))
          }))
        });

      mockSupabaseClient.functions.invoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('tx-123', 'pending', 'in_progress');
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('execute-automation', {
        body: {
          ruleId: 'rule-123',
          context: expect.any(Object)
        }
      });
    });

    it('should handle rules with no status conditions (wildcard)', async () => {
      const wildcardRule = {
        id: 'rule-wildcard',
        is_active: true,
        trigger_event: 'status_change',
        trigger_condition: {}
      };

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [wildcardRule], error: null })
            }))
          }))
        });

      mockSupabaseClient.functions.invoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('tx-123', 'any_status', 'any_other_status');
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('execute-automation', {
        body: {
          ruleId: 'rule-wildcard',
          context: expect.any(Object)
        }
      });
    });

    it('should handle function execution errors gracefully', async () => {
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [mockRule], error: null })
            }))
          }))
        });

      mockSupabaseClient.functions.invoke.mockRejectedValue(new Error('Function execution failed'));

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('tx-123', 'pending', 'in_progress');
      });

      expect(console.error).toHaveBeenCalledWith('Error triggering status change automation:', expect.any(Error));
    });
  });

  describe('triggerTaskCompletionAutomation', () => {
    const mockTask = {
      id: 'task-123',
      title: 'Review documents',
      priority: 'high',
      status: 'completed'
    };

    const mockTransaction = {
      id: 'tx-123',
      status: 'in_progress',
      amount: 1000
    };

    const mockRule = {
      id: 'rule-task-123',
      is_active: true,
      trigger_event: 'task_completed',
      trigger_condition: {
        task_title_contains: 'review',
        task_priority: 'high'
      }
    };

    it('should fetch task and transaction, then execute matching rules', async () => {
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTask, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [mockRule], error: null })
            }))
          }))
        });

      mockSupabaseClient.functions.invoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerTaskCompletionAutomation('task-123', 'tx-123', 'user-123');
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('execute-automation', {
        body: {
          ruleId: 'rule-task-123',
          context: {
            transaction_id: 'tx-123',
            transaction: mockTransaction,
            trigger_data: {
              task: mockTask,
              trigger_type: 'task_completed'
            },
            user_id: 'user-123'
          }
        }
      });
    });

    it('should handle task not found error', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Task not found' } })
          }))
        }))
      });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerTaskCompletionAutomation('invalid-task', 'tx-123');
      });

      expect(console.error).toHaveBeenCalledWith('Task not found for automation trigger:', { message: 'Task not found' });
      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });

    it('should filter rules by task title and priority conditions', async () => {
      const nonMatchingTask = { ...mockTask, title: 'Different task', priority: 'low' };
      
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: nonMatchingTask, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [mockRule], error: null })
            }))
          }))
        });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerTaskCompletionAutomation('task-123', 'tx-123');
      });

      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });
  });

  describe('triggerDocumentUploadAutomation', () => {
    const mockDocument = {
      id: 'doc-123',
      file_name: 'contract.pdf',
      file_type: 'application/pdf'
    };

    const mockTransaction = {
      id: 'tx-123',
      status: 'in_progress',
      amount: 1000
    };

    const mockRule = {
      id: 'rule-doc-123',
      is_active: true,
      trigger_event: 'document_uploaded',
      trigger_condition: {
        document_type: 'contract'
      }
    };

    it('should fetch document and transaction, then execute matching rules', async () => {
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockDocument, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [mockRule], error: null })
            }))
          }))
        });

      mockSupabaseClient.functions.invoke.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerDocumentUploadAutomation('doc-123', 'tx-123', 'user-123');
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('execute-automation', {
        body: {
          ruleId: 'rule-doc-123',
          context: {
            transaction_id: 'tx-123',
            transaction: mockTransaction,
            trigger_data: {
              document: mockDocument,
              trigger_type: 'document_uploaded'
            },
            user_id: 'user-123'
          }
        }
      });
    });

    it('should handle document not found error', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Document not found' } })
          }))
        }))
      });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerDocumentUploadAutomation('invalid-doc', 'tx-123');
      });

      expect(console.error).toHaveBeenCalledWith('Document not found for automation trigger:', { message: 'Document not found' });
      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });

    it('should filter rules by document type', async () => {
      const nonMatchingDocument = { ...mockDocument, file_name: 'invoice.xlsx' };
      
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: nonMatchingDocument, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [mockRule], error: null })
            }))
          }))
        });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerDocumentUploadAutomation('doc-123', 'tx-123');
      });

      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockRejectedValue(new Error('Network error'))
          }))
        }))
      });

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('tx-123', 'pending', 'in_progress');
      });

      expect(console.error).toHaveBeenCalledWith('Error triggering status change automation:', expect.any(Error));
    });

    it('should handle multiple rule execution errors', async () => {
      const mockTransaction = { id: 'tx-123', status: 'in_progress' };
      const mockRules = [
        { id: 'rule-1', is_active: true, trigger_event: 'status_change', trigger_condition: {} },
        { id: 'rule-2', is_active: true, trigger_event: 'status_change', trigger_condition: {} }
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
            }))
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockRules, error: null })
            }))
          }))
        });

      mockSupabaseClient.functions.invoke
        .mockResolvedValueOnce({ data: null, error: null })
        .mockRejectedValueOnce(new Error('Second rule failed'));

      const { result } = renderHook(() => useAutomationTriggers());

      await act(async () => {
        await result.current.triggerStatusChangeAutomation('tx-123', 'pending', 'in_progress');
      });

      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith('Error triggering status change automation:', expect.any(Error));
    });
  });
});