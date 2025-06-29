import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TriggerDetector } from '../TriggerDetector'

// Mock the AutomationEngine
vi.mock('../AutomationEngine', () => ({
  automationEngine: {
    processTriggeredRules: vi.fn()
  }
}))

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('TriggerDetector', () => {
  let detector: TriggerDetector
  let mockSupabase: any
  let mockProcessTriggeredRules: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { supabase } = await import('@/integrations/supabase/client')
    const { automationEngine } = await import('../AutomationEngine')
    
    mockSupabase = vi.mocked(supabase)
    mockProcessTriggeredRules = vi.mocked(automationEngine.processTriggeredRules)
    
    // Get fresh instance for each test
    detector = TriggerDetector.getInstance()
    
    // Mock console methods to reduce noise
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Test data
  const mockTransaction = {
    id: 'txn-123',
    property_address: '123 Main St',
    status: 'active',
    created_at: '2024-02-01T10:00:00Z',
    closing_date: '2024-02-20T10:00:00Z',
    agent_id: 'agent-456'
  }

  const mockTask = {
    id: 'task-123',
    transaction_id: 'txn-123',
    title: 'Complete contract review',
    priority: 'high',
    is_completed: true,
    requires_agent_action: false
  }

  const mockDocument = {
    id: 'doc-123',
    transaction_id: 'txn-123',
    file_name: 'contract-signed.pdf',
    file_path: '/documents/contract-signed.pdf',
    uploaded_by_id: 'user-123'
  }

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = TriggerDetector.getInstance()
      const instance2 = TriggerDetector.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('maintains state across getInstance calls', () => {
      const instance1 = TriggerDetector.getInstance()
      const instance2 = TriggerDetector.getInstance()
      expect(instance1).toBe(detector)
      expect(instance2).toBe(detector)
    })
  })

  describe('detectStatusChange', () => {
    it('detects status change and triggers automation', async () => {
      // Mock successful transaction fetch
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTransaction,
                  error: null
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectStatusChange('txn-123', 'pending', 'active', 'user-789')

      expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
      expect(mockProcessTriggeredRules).toHaveBeenCalledWith({
        transaction_id: 'txn-123',
        transaction: mockTransaction,
        trigger_data: {
          old_status: 'pending',
          new_status: 'active',
          trigger_type: 'status_change'
        },
        user_id: 'user-789'
      })
    })

    it('handles missing transaction gracefully', async () => {
      // Mock transaction not found
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Transaction not found')
            })
          })
        })
      }))

      await detector.detectStatusChange('non-existent', 'pending', 'active')

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('handles supabase errors gracefully', async () => {
      // Mock supabase error
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database connection failed')
            })
          })
        })
      }))

      await detector.detectStatusChange('txn-123', 'pending', 'active')

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('works without userId parameter', async () => {
      // Mock successful transaction fetch
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTransaction,
              error: null
            })
          })
        })
      }))

      await detector.detectStatusChange('txn-123', 'pending', 'active')

      expect(mockProcessTriggeredRules).toHaveBeenCalledWith({
        transaction_id: 'txn-123',
        transaction: mockTransaction,
        trigger_data: {
          old_status: 'pending',
          new_status: 'active',
          trigger_type: 'status_change'
        },
        user_id: undefined
      })
    })

    it('handles automation engine errors gracefully', async () => {
      // Mock successful transaction fetch
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTransaction,
              error: null
            })
          })
        })
      }))

      // Mock automation engine error
      mockProcessTriggeredRules.mockRejectedValue(new Error('Automation failed'))

      // Should not throw error
      await expect(detector.detectStatusChange('txn-123', 'pending', 'active')).resolves.toBeUndefined()
    })
  })

  describe('detectTaskCompletion', () => {
    it('detects task completion and triggers automation', async () => {
      // Mock successful task and transaction fetch
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTask,
                  error: null
                })
              })
            })
          }
        }
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTransaction,
                  error: null
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectTaskCompletion('task-123', 'txn-123', 'user-789')

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks')
      expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
      expect(mockProcessTriggeredRules).toHaveBeenCalledWith({
        transaction_id: 'txn-123',
        transaction: mockTransaction,
        trigger_data: {
          task: mockTask,
          trigger_type: 'task_completed'
        },
        user_id: 'user-789'
      })
    })

    it('handles missing task gracefully', async () => {
      // Mock task not found
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Task not found')
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectTaskCompletion('non-existent', 'txn-123')

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('handles missing transaction for task completion gracefully', async () => {
      // Mock successful task fetch but missing transaction
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTask,
                  error: null
                })
              })
            })
          }
        }
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Transaction not found')
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectTaskCompletion('task-123', 'non-existent')

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('works without userId parameter', async () => {
      // Mock successful fetches
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTask,
                  error: null
                })
              })
            })
          }
        }
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTransaction,
                  error: null
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectTaskCompletion('task-123', 'txn-123')

      expect(mockProcessTriggeredRules).toHaveBeenCalledWith({
        transaction_id: 'txn-123',
        transaction: mockTransaction,
        trigger_data: {
          task: mockTask,
          trigger_type: 'task_completed'
        },
        user_id: undefined
      })
    })
  })

  describe('detectDocumentUpload', () => {
    it('detects document upload and triggers automation', async () => {
      // Mock successful document and transaction fetch
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'documents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockDocument,
                  error: null
                })
              })
            })
          }
        }
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTransaction,
                  error: null
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectDocumentUpload('doc-123', 'txn-123', 'user-789')

      expect(mockSupabase.from).toHaveBeenCalledWith('documents')
      expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
      expect(mockProcessTriggeredRules).toHaveBeenCalledWith({
        transaction_id: 'txn-123',
        transaction: mockTransaction,
        trigger_data: {
          document: mockDocument,
          trigger_type: 'document_uploaded'
        },
        user_id: 'user-789'
      })
    })

    it('handles missing document gracefully', async () => {
      // Mock document not found
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'documents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Document not found')
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectDocumentUpload('non-existent', 'txn-123')

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('handles missing transaction for document upload gracefully', async () => {
      // Mock successful document fetch but missing transaction
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'documents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockDocument,
                  error: null
                })
              })
            })
          }
        }
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Transaction not found')
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectDocumentUpload('doc-123', 'non-existent')

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })
  })

  describe('detectDateBasedTriggers', () => {
    it('processes date-based triggers for active transactions', async () => {
      const mockTransactions = [
        { ...mockTransaction, id: 'txn-1', status: 'active' },
        { ...mockTransaction, id: 'txn-2', status: 'intake' },
        { ...mockTransaction, id: 'txn-3', status: 'closed' } // Should be filtered out
      ]

      // Mock transaction fetch
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'transactions') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: mockTransactions.filter(t => ['intake', 'active'].includes(t.status)),
                error: null
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await detector.detectDateBasedTriggers()

      expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
      
      // Should process contract and closing date triggers for each active transaction
      expect(mockProcessTriggeredRules).toHaveBeenCalledTimes(4) // 2 transactions × 2 trigger types
      
      // Verify contract date triggers
      expect(mockProcessTriggeredRules).toHaveBeenCalledWith({
        transaction_id: 'txn-1',
        transaction: mockTransactions[0],
        trigger_data: {
          reference_date: mockTransactions[0].created_at,
          trigger_type: 'contract_date_offset'
        }
      })

      // Verify closing date triggers
      expect(mockProcessTriggeredRules).toHaveBeenCalledWith({
        transaction_id: 'txn-1',
        transaction: mockTransactions[0],
        trigger_data: {
          reference_date: mockTransactions[0].closing_date,
          trigger_type: 'closing_date_offset'
        }
      })
    })

    it('handles transactions without dates gracefully', async () => {
      const mockTransactionsWithoutDates = [
        { ...mockTransaction, created_at: null, closing_date: null },
        { ...mockTransaction, id: 'txn-2', created_at: '2024-01-01T00:00:00Z', closing_date: null },
        { ...mockTransaction, id: 'txn-3', created_at: null, closing_date: '2024-03-01T00:00:00Z' }
      ]

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockTransactionsWithoutDates,
            error: null
          })
        })
      }))

      await detector.detectDateBasedTriggers()

      // Should only process triggers for transactions with valid dates
      // txn-1: no triggers (both dates null)
      // txn-2: 1 trigger (contract date only)
      // txn-3: 1 trigger (closing date only)
      expect(mockProcessTriggeredRules).toHaveBeenCalledTimes(2)
    })

    it('handles database errors gracefully', async () => {
      // Mock database error
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          })
        })
      }))

      await detector.detectDateBasedTriggers()

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('handles empty transaction list', async () => {
      // Mock empty result
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }))

      await detector.detectDateBasedTriggers()

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })
  })

  describe('detectTimeBasedTriggers', () => {
    it('processes time-based triggers for active transactions', async () => {
      const mockTransactions = [
        { ...mockTransaction, id: 'txn-1', status: 'active' },
        { ...mockTransaction, id: 'txn-2', status: 'intake' },
        { ...mockTransaction, id: 'txn-3', status: 'closed' } // Should be filtered out
      ]

      // Mock current time for consistent testing
      const mockDate = new Date('2024-02-15T14:30:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      // Mock transaction fetch
      const activeTransactions = mockTransactions.filter(t => ['intake', 'active'].includes(t.status))
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: activeTransactions,
            error: null
          })
        })
      }))

      await detector.detectTimeBasedTriggers()

      expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
      expect(mockProcessTriggeredRules).toHaveBeenCalledTimes(2) // 2 active transactions

      // Verify time-based triggers were called with correct arguments
      expect(mockProcessTriggeredRules).toHaveBeenNthCalledWith(1, expect.objectContaining({
        transaction_id: 'txn-1',
        transaction: expect.objectContaining({ id: 'txn-1', status: 'active' }),
        trigger_data: expect.objectContaining({
          current_time: mockDate.toISOString(),
          trigger_type: 'time_based'
        })
      }))

      expect(mockProcessTriggeredRules).toHaveBeenNthCalledWith(2, expect.objectContaining({
        transaction_id: 'txn-2',
        transaction: expect.objectContaining({ id: 'txn-2', status: 'intake' }),
        trigger_data: expect.objectContaining({
          current_time: mockDate.toISOString(),
          trigger_type: 'time_based'
        })
      }))

      vi.useRealTimers()
    })

    it('handles database errors gracefully', async () => {
      // Mock database error
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          })
        })
      }))

      await detector.detectTimeBasedTriggers()

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('handles empty transaction list', async () => {
      // Mock empty result
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }))

      await detector.detectTimeBasedTriggers()

      expect(mockProcessTriggeredRules).not.toHaveBeenCalled()
    })

    it('handles automation engine errors gracefully', async () => {
      const mockTransactions = [{ ...mockTransaction, status: 'active' }]

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockTransactions,
            error: null
          })
        })
      }))

      // Mock automation engine error
      mockProcessTriggeredRules.mockRejectedValue(new Error('Automation failed'))

      // Should not throw error
      await expect(detector.detectTimeBasedTriggers()).resolves.toBeUndefined()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles undefined/null parameters gracefully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTransaction,
              error: null
            })
          })
        })
      }))

      // Test with undefined/null parameters
      await detector.detectStatusChange(undefined as any, null as any, '', null as any)
      await detector.detectTaskCompletion('', undefined as any, null as any)
      await detector.detectDocumentUpload(null as any, '', undefined as any)

      // Should still attempt to process but handle gracefully
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    it('handles concurrent trigger detection calls', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTransaction,
              error: null
            })
          })
        })
      }))

      // Run multiple trigger detections concurrently
      const promises = [
        detector.detectStatusChange('txn-1', 'pending', 'active'),
        detector.detectTaskCompletion('task-1', 'txn-1'),
        detector.detectDocumentUpload('doc-1', 'txn-1'),
        detector.detectDateBasedTriggers(),
        detector.detectTimeBasedTriggers()
      ]

      await Promise.all(promises)

      // All should complete without interference
      expect(mockProcessTriggeredRules).toHaveBeenCalled()
    })

    it('handles very long strings and special characters', async () => {
      const longString = 'a'.repeat(1000)
      const specialChars = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'

      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockTransaction, property_address: longString + specialChars },
              error: null
            })
          })
        })
      }))

      await detector.detectStatusChange('txn-special', 'pending', 'active')

      expect(mockProcessTriggeredRules).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: expect.objectContaining({
            property_address: longString + specialChars
          })
        })
      )
    })
  })

  // Helper function
  function mockDefaultSupabaseChain() {
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }),
        in: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    }
  }
})