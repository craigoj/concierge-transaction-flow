import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AutomationEngine } from '../AutomationEngine'
import type { 
  AutomationRule, 
  TriggerContext, 
  WorkflowExecution,
  ExecutionStatus,
  TriggerEvent 
} from '@/types/automation'

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

describe('AutomationEngine', () => {
  let engine: AutomationEngine
  let mockSupabase: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { supabase } = await import('@/integrations/supabase/client')
    mockSupabase = vi.mocked(supabase)
    
    // Get fresh instance for each test
    engine = AutomationEngine.getInstance()
    
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

  const mockRule: AutomationRule = {
    id: 'rule-123',
    name: 'Test Automation Rule',
    trigger_event: 'status_change' as TriggerEvent,
    trigger_condition: {
      type: 'status_change' as TriggerEvent,
      from_status: 'pending',
      to_status: 'active'
    },
    template_id: 'template-456',
    is_active: true,
    created_by: 'user-789',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  }

  const mockContext: TriggerContext = {
    transaction_id: 'txn-123',
    transaction: mockTransaction,
    trigger_data: {
      old_status: 'pending',
      new_status: 'active'
    },
    user_id: 'user-789'
  }

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = AutomationEngine.getInstance()
      const instance2 = AutomationEngine.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('processTriggeredRules', () => {
    it('processes matching rules successfully', async () => {
      // Mock successful rule finding
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'automation_rules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [mockRule],
                error: null
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      // Mock executeRule to avoid complex setup
      const executeRuleSpy = vi.spyOn(engine as any, 'executeRule').mockResolvedValue(undefined)

      await engine.processTriggeredRules(mockContext)

      expect(executeRuleSpy).toHaveBeenCalledWith(mockRule, mockContext)
    })

    it('handles errors in rule processing', async () => {
      // Mock error from supabase
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          })
        })
      }))

      await expect(engine.processTriggeredRules(mockContext)).rejects.toThrow('Database error')
    })

    it('processes multiple matching rules', async () => {
      const secondRule = { ...mockRule, id: 'rule-456', name: 'Second Rule' }
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'automation_rules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [mockRule, secondRule],
                error: null
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      const executeRuleSpy = vi.spyOn(engine as any, 'executeRule').mockResolvedValue(undefined)

      await engine.processTriggeredRules(mockContext)

      expect(executeRuleSpy).toHaveBeenCalledTimes(2)
      expect(executeRuleSpy).toHaveBeenCalledWith(mockRule, mockContext)
      expect(executeRuleSpy).toHaveBeenCalledWith(secondRule, mockContext)
    })
  })

  describe('Trigger Condition Evaluation', () => {
    it('evaluates status_change conditions correctly', async () => {
      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)

      // Positive case
      const result1 = await evaluateMethod(
        { type: 'status_change', from_status: 'pending', to_status: 'active' },
        mockContext
      )
      expect(result1).toBe(true)

      // Negative case - wrong from status
      const result2 = await evaluateMethod(
        { type: 'status_change', from_status: 'inactive', to_status: 'active' },
        mockContext
      )
      expect(result2).toBe(false)

      // Partial matching - only to_status specified
      const result3 = await evaluateMethod(
        { type: 'status_change', to_status: 'active' },
        mockContext
      )
      expect(result3).toBe(true)
    })

    it('evaluates contract_date_offset conditions correctly', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-02-01T10:00:00Z')) // Same day as contract

      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)

      // Same day trigger
      const result1 = await evaluateMethod(
        { type: 'contract_date_offset', offset_days: 0, offset_type: 'after' },
        mockContext
      )
      expect(result1).toBe(true)

      // Future day trigger
      vi.setSystemTime(new Date('2024-02-02T10:00:00Z')) // One day after
      const result2 = await evaluateMethod(
        { type: 'contract_date_offset', offset_days: 1, offset_type: 'after' },
        mockContext
      )
      expect(result2).toBe(true)

      vi.useRealTimers()
    })

    it('evaluates closing_date_offset conditions correctly', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-02-20T10:00:00Z')) // Same day as closing

      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)

      const result = await evaluateMethod(
        { type: 'closing_date_offset', offset_days: 0, offset_type: 'after' },
        mockContext
      )
      expect(result).toBe(true)

      vi.useRealTimers()
    })

    it('evaluates task_completed conditions correctly', async () => {
      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)
      
      const taskContext = {
        ...mockContext,
        trigger_data: {
          task: {
            title: 'Complete contract review',
            priority: 'high',
            is_completed: true
          }
        }
      }

      // Title contains match
      const result1 = await evaluateMethod(
        { type: 'task_completed', task_title_contains: 'contract' },
        taskContext
      )
      expect(result1).toBe(true)

      // Priority match
      const result2 = await evaluateMethod(
        { type: 'task_completed', task_priority: 'high' },
        taskContext
      )
      expect(result2).toBe(true)

      // No task data
      const result3 = await evaluateMethod(
        { type: 'task_completed' },
        mockContext
      )
      expect(result3).toBe(false)
    })

    it('evaluates document_uploaded conditions correctly', async () => {
      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)
      
      const docContext = {
        ...mockContext,
        trigger_data: {
          document: {
            file_name: 'contract-signed.pdf'
          }
        }
      }

      // Document type match
      const result1 = await evaluateMethod(
        { type: 'document_uploaded', document_type: 'contract' },
        docContext
      )
      expect(result1).toBe(true)

      // No document specified type matches
      const result2 = await evaluateMethod(
        { type: 'document_uploaded' },
        docContext
      )
      expect(result2).toBe(true)
    })

    it('evaluates time_based conditions correctly', async () => {
      vi.useFakeTimers()
      // Use local time instead of UTC to avoid timezone issues
      const monday = new Date(2024, 1, 5, 14, 30, 0) // Monday 2:30 PM in local time
      vi.setSystemTime(monday)

      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)

      // Day of week match (Monday = 1)
      const result1 = await evaluateMethod(
        { type: 'time_based', days_of_week: [1, 3, 5] },
        mockContext
      )
      expect(result1).toBe(true)

      // Time of day match (within 1 minute tolerance)
      const result2 = await evaluateMethod(
        { type: 'time_based', time_of_day: '14:30' },
        mockContext
      )
      expect(result2).toBe(true)

      vi.useRealTimers()
    })

    it('handles unknown trigger condition types', async () => {
      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)

      const result = await evaluateMethod(
        { type: 'unknown_type' as any },
        mockContext
      )
      expect(result).toBe(false)
    })

    it('handles errors in condition evaluation gracefully', async () => {
      const evaluateMethod = (engine as any).evaluateTriggerCondition.bind(engine)

      // Create context that will cause an error (missing transaction properties)
      const badContext = {
        ...mockContext,
        transaction: null
      }

      const result = await evaluateMethod(
        { type: 'contract_date_offset', offset_days: 1 },
        badContext
      )
      expect(result).toBe(false)
    })
  })

  describe('Rule Execution', () => {
    it('executes rule successfully', async () => {
      // Mock all required supabase calls
      setupMockForSuccessfulExecution()

      await engine.executeRule(mockRule, mockContext)

      // Verify workflow_executions insert was called
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_executions')
      
      // Verify template fetch was called
      expect(mockSupabase.from).toHaveBeenCalledWith('workflow_templates')
      
      // Verify RPC call was made
      expect(mockSupabase.rpc).toHaveBeenCalledWith('apply_workflow_template', {
        p_transaction_id: mockContext.transaction_id,
        p_template_id: mockRule.template_id,
        p_applied_by: mockContext.user_id
      })
    })

    it('handles template not found error', async () => {
      setupMockForTemplateNotFound()

      await expect(engine.executeRule(mockRule, mockContext)).rejects.toThrow('Template not found')
    })

    it('handles workflow application error', async () => {
      setupMockForWorkflowApplicationError()

      await expect(engine.executeRule(mockRule, mockContext)).rejects.toThrow('RPC error')
    })

    it('handles execution creation error', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'workflow_executions') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Insert failed')
                })
              })
            })
          }
        }
        return mockDefaultSupabaseChain()
      })

      await expect(engine.executeRule(mockRule, mockContext)).rejects.toThrow('Insert failed')
    })
  })

  describe('Error Handling and Retries', () => {
    it('schedules retry for failed execution under retry limit', async () => {
      const execution: WorkflowExecution = {
        id: 'exec-123',
        rule_id: mockRule.id,
        transaction_id: mockContext.transaction_id,
        status: 'failed' as ExecutionStatus,
        executed_at: '2024-02-01T10:00:00Z',
        retry_count: 1,
        metadata: {}
      }

      // Mock update and insert calls
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'workflow_executions') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { retry_count: 1 },
                  error: null
                })
              })
            })
          }
        }
        if (table === 'automation_audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return mockDefaultSupabaseChain()
      })

      const handleErrorMethod = (engine as any).handleExecutionError.bind(engine)
      const error = new Error('Test error')

      // Mock setTimeout to avoid actual delays
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn() // Execute immediately
        return 0 as any
      })

      await handleErrorMethod(execution, error)

      expect(setTimeoutSpy).toHaveBeenCalled()
      setTimeoutSpy.mockRestore()
    })

    it('marks execution as failed when retry limit exceeded', async () => {
      const execution: WorkflowExecution = {
        id: 'exec-123',
        rule_id: mockRule.id,
        transaction_id: mockContext.transaction_id,
        status: 'failed' as ExecutionStatus,
        executed_at: '2024-02-01T10:00:00Z',
        retry_count: 3, // At retry limit
        metadata: {}
      }

      const updateStatusSpy = vi.spyOn(engine as any, 'updateExecutionStatus').mockResolvedValue(undefined)
      const logAuditSpy = vi.spyOn(engine as any, 'logAuditEvent').mockResolvedValue(undefined)

      const handleErrorMethod = (engine as any).handleExecutionError.bind(engine)
      const error = new Error('Test error')

      await handleErrorMethod(execution, error)

      expect(updateStatusSpy).toHaveBeenCalledWith('exec-123', 'failed', 'Test error')
      expect(logAuditSpy).toHaveBeenCalledWith('exec-123', 'execution_failed', 'failed', {
        error: 'Test error',
        retry_count: 4
      })
    })
  })

  describe('Notifications', () => {
    it('sends notifications successfully', async () => {
      const execution: WorkflowExecution = {
        id: 'exec-123',
        rule_id: mockRule.id,
        transaction_id: mockContext.transaction_id,
        status: 'completed' as ExecutionStatus,
        executed_at: '2024-02-01T10:00:00Z',
        retry_count: 0,
        metadata: {}
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'notifications') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        if (table === 'automation_audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return mockDefaultSupabaseChain()
      })

      const sendNotificationsMethod = (engine as any).sendNotifications.bind(engine)
      
      await sendNotificationsMethod(mockRule, mockContext, execution)

      expect(mockSupabase.from).toHaveBeenCalledWith('notifications')
    })

    it('handles notification errors gracefully', async () => {
      const execution: WorkflowExecution = {
        id: 'exec-123',
        rule_id: mockRule.id,
        transaction_id: mockContext.transaction_id,
        status: 'completed' as ExecutionStatus,
        executed_at: '2024-02-01T10:00:00Z',
        retry_count: 0,
        metadata: {}
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'notifications') {
          return {
            insert: vi.fn().mockResolvedValue({ error: new Error('Notification failed') })
          }
        }
        if (table === 'automation_audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return mockDefaultSupabaseChain()
      })

      const sendNotificationsMethod = (engine as any).sendNotifications.bind(engine)
      
      // Should not throw, just log the error
      await expect(sendNotificationsMethod(mockRule, mockContext, execution)).resolves.toBeUndefined()
    })
  })

  describe('Audit Logging', () => {
    it('logs audit events successfully', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'automation_audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null })
          }
        }
        return mockDefaultSupabaseChain()
      })

      const logAuditMethod = (engine as any).logAuditEvent.bind(engine)
      
      await logAuditMethod('exec-123', 'test_action', 'success', { test: 'data' })

      expect(mockSupabase.from).toHaveBeenCalledWith('automation_audit_logs')
    })

    it('handles audit logging errors gracefully', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'automation_audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: new Error('Audit log failed') })
          }
        }
        return mockDefaultSupabaseChain()
      })

      const logAuditMethod = (engine as any).logAuditEvent.bind(engine)
      
      // Should not throw, just log the error
      await expect(logAuditMethod('exec-123', 'test_action', 'success', { test: 'data' })).resolves.toBeUndefined()
    })
  })

  // Helper functions
  function mockDefaultSupabaseChain() {
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    }
  }

  function setupMockForSuccessfulExecution() {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'workflow_executions') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'exec-123',
                  rule_id: mockRule.id,
                  transaction_id: mockContext.transaction_id,
                  status: 'pending',
                  retry_count: 0,
                  metadata: {}
                },
                error: null
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        }
      }
      if (table === 'workflow_templates') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'template-456', name: 'Test Template' },
                error: null
              })
            })
          })
        }
      }
      if (table === 'notifications') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null })
        }
      }
      if (table === 'automation_audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null })
        }
      }
      return mockDefaultSupabaseChain()
    })

    mockSupabase.rpc.mockResolvedValue({
      data: 'workflow-instance-123',
      error: null
    })
  }

  function setupMockForTemplateNotFound() {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'workflow_executions') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'exec-123',
                  rule_id: mockRule.id,
                  transaction_id: mockContext.transaction_id,
                  status: 'pending',
                  retry_count: 0,
                  metadata: {}
                },
                error: null
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        }
      }
      if (table === 'workflow_templates') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Template not found')
              })
            })
          })
        }
      }
      return mockDefaultSupabaseChain()
    })
  }

  function setupMockForWorkflowApplicationError() {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'workflow_executions') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'exec-123',
                  rule_id: mockRule.id,
                  transaction_id: mockContext.transaction_id,
                  status: 'pending',
                  retry_count: 0,
                  metadata: {}
                },
                error: null
              })
            })
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        }
      }
      if (table === 'workflow_templates') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'template-456', name: 'Test Template' },
                error: null
              })
            })
          })
        }
      }
      return mockDefaultSupabaseChain()
    })

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: new Error('RPC error')
    })
  }
})