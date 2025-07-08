import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AutomationEngine } from '../AutomationEngine'
import type { 
  AutomationRule, 
  TriggerContext, 
  TriggerEvent 
} from '@/types/automation'

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}))

// Mock the RuleMatcher and ExecutionManager
vi.mock('../automation/RuleMatcher', () => ({
  RuleMatcher: vi.fn().mockImplementation(() => ({
    findMatchingRules: vi.fn().mockResolvedValue([])
  }))
}))

vi.mock('../automation/ExecutionManager', () => ({
  ExecutionManager: vi.fn().mockImplementation(() => ({
    executeRule: vi.fn().mockResolvedValue(undefined)
  }))
}))

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe('AutomationEngine', () => {
  let engine: AutomationEngine
  let mockRuleMatcher: any
  let mockExecutionManager: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Import the mocked classes and get their instances
    const { RuleMatcher } = await import('../automation/RuleMatcher')
    const { ExecutionManager } = await import('../automation/ExecutionManager')
    
    engine = AutomationEngine.getInstance()
    
    // Get the mock instances
    mockRuleMatcher = (engine as any).ruleMatcher
    mockExecutionManager = (engine as any).executionManager
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
      mockRuleMatcher.findMatchingRules.mockResolvedValue([mockRule])
      mockExecutionManager.executeRule.mockResolvedValue(undefined)

      await engine.processTriggeredRules(mockContext)

      expect(mockRuleMatcher.findMatchingRules).toHaveBeenCalledWith(mockContext)
      expect(mockExecutionManager.executeRule).toHaveBeenCalledWith(mockRule, mockContext)
    })

    it('handles no matching rules', async () => {
      // Mock no matching rules
      mockRuleMatcher.findMatchingRules.mockResolvedValue([])

      await engine.processTriggeredRules(mockContext)

      expect(mockRuleMatcher.findMatchingRules).toHaveBeenCalledWith(mockContext)
      expect(mockExecutionManager.executeRule).not.toHaveBeenCalled()
    })

    it('processes multiple matching rules', async () => {
      const secondRule = { ...mockRule, id: 'rule-456', name: 'Second Rule' }
      
      mockRuleMatcher.findMatchingRules.mockResolvedValue([mockRule, secondRule])
      mockExecutionManager.executeRule.mockResolvedValue(undefined)

      await engine.processTriggeredRules(mockContext)

      expect(mockRuleMatcher.findMatchingRules).toHaveBeenCalledWith(mockContext)
      expect(mockExecutionManager.executeRule).toHaveBeenCalledTimes(2)
      expect(mockExecutionManager.executeRule).toHaveBeenCalledWith(mockRule, mockContext)
      expect(mockExecutionManager.executeRule).toHaveBeenCalledWith(secondRule, mockContext)
    })

    it('handles errors in rule processing', async () => {
      const testError = new Error('Rule processing failed')
      mockRuleMatcher.findMatchingRules.mockRejectedValue(testError)

      await expect(engine.processTriggeredRules(mockContext)).rejects.toThrow('Rule processing failed')
    })

    it('handles errors in rule execution', async () => {
      const testError = new Error('Rule execution failed')
      mockRuleMatcher.findMatchingRules.mockResolvedValue([mockRule])
      mockExecutionManager.executeRule.mockRejectedValue(testError)

      await expect(engine.processTriggeredRules(mockContext)).rejects.toThrow('Rule execution failed')
    })
  })

  describe('Error Handling', () => {
    it('logs errors appropriately', async () => {
      const { logger } = await import('@/lib/logger')
      const testError = new Error('Test error')
      
      mockRuleMatcher.findMatchingRules.mockRejectedValue(testError)

      await expect(engine.processTriggeredRules(mockContext)).rejects.toThrow('Test error')
      
      expect(logger.error).toHaveBeenCalledWith('Error processing triggered rules', {
        error: 'Test error',
        transactionId: mockContext.transaction_id,
        context: 'automation_engine'
      })
    })

    it('logs successful processing', async () => {
      const { logger } = await import('@/lib/logger')
      
      mockRuleMatcher.findMatchingRules.mockResolvedValue([mockRule])
      mockExecutionManager.executeRule.mockResolvedValue(undefined)

      await engine.processTriggeredRules(mockContext)

      expect(logger.info).toHaveBeenCalledWith('Processing triggered rules for context', {
        transactionId: mockContext.transaction_id,
        triggerData: mockContext.trigger_data,
        context: 'automation_engine'
      })
      
      expect(logger.info).toHaveBeenCalledWith('Completed processing triggered rules', {
        transactionId: mockContext.transaction_id,
        processedRules: 1,
        context: 'automation_engine'
      })
    })
  })
})