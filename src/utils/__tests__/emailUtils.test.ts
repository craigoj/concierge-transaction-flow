
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  sendTemplateEmail, 
  sendWelcomeEmail, 
  sendTaskCompletedEmail, 
  sendActionRequiredEmail,
  type EmailVariables 
} from '../emailUtils'

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}))

describe('emailUtils', () => {
  let mockInvoke: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { supabase } = await import('@/integrations/supabase/client')
    mockInvoke = vi.mocked(supabase.functions.invoke)
  })

  describe('sendTemplateEmail', () => {
    const mockVariables: EmailVariables = {
      agent_name: 'John Doe',
      property_address: '123 Main St',
      transaction_status: 'under-contract',
      task_title: 'Review Documents',
      task_description: 'Review and sign purchase agreement',
      priority: 'high',
      due_date: '2024-02-15',
      transaction_url: 'https://app.example.com/transactions/123',
      portal_url: 'https://app.example.com'
    }

    it('successfully sends email with template and variables', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, messageId: 'email-123' },
        error: null
      })

      const result = await sendTemplateEmail(
        'task-assignment',
        'agent@example.com',
        mockVariables,
        'Agent Name'
      )

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          templateName: 'task-assignment',
          recipientEmail: 'agent@example.com',
          variables: mockVariables,
          recipientName: 'Agent Name'
        }
      })

      expect(result).toEqual({
        success: true,
        messageId: 'email-123'
      })
    })

    it('sends email without recipient name when not provided', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, messageId: 'email-456' },
        error: null
      })

      const result = await sendTemplateEmail(
        'status-update',
        'client@example.com',
        { transaction_status: 'closed' }
      )

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          templateName: 'status-update',
          recipientEmail: 'client@example.com',
          variables: { transaction_status: 'closed' },
          recipientName: undefined
        }
      })

      expect(result).toEqual({
        success: true,
        messageId: 'email-456'
      })
    })

    it('sends email with empty variables object when not provided', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, messageId: 'email-789' },
        error: null
      })

      const result = await sendTemplateEmail(
        'welcome',
        'newuser@example.com'
      )

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          templateName: 'welcome',
          recipientEmail: 'newuser@example.com',
          variables: {},
          recipientName: undefined
        }
      })

      expect(result).toEqual({
        success: true,
        messageId: 'email-789'
      })
    })

    it('handles email sending errors gracefully', async () => {
      const error = new Error('Email service unavailable')
      mockInvoke.mockResolvedValue({
        data: null,
        error: error
      })

      // According to the implementation, errors are thrown, not returned
      await expect(sendTemplateEmail(
        'task-assignment',
        'agent@example.com',
        mockVariables
      )).rejects.toThrow('Email service unavailable')
    })

    it('handles network/function invocation errors', async () => {
      const networkError = new Error('Network timeout')
      mockInvoke.mockRejectedValue(networkError)

      // According to the implementation, errors are thrown, not returned
      await expect(sendTemplateEmail(
        'reminder',
        'user@example.com',
        { due_date: '2024-02-20' }
      )).rejects.toThrow('Network timeout')
    })

    it('handles malformed response from email service', async () => {
      mockInvoke.mockResolvedValue({
        data: { malformed: 'response' },
        error: null
      })

      const result = await sendTemplateEmail(
        'notification',
        'test@example.com'
      )

      // Should handle gracefully even if response format is unexpected
      expect(result).toEqual({
        malformed: 'response'
      })
    })
  })

  describe('sendWelcomeEmail', () => {
    // Mock window.location.origin
    const originalLocation = window.location
    
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://app.example.com' },
        writable: true
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      })
    })

    it('sends welcome email with correct template and variables', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, messageId: 'welcome-123' },
        error: null
      })

      const result = await sendWelcomeEmail('newagent@example.com', 'Alice Johnson')

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          templateName: 'agent-welcome',
          recipientEmail: 'newagent@example.com',
          variables: {
            agent_name: 'Alice Johnson',
            portal_url: 'https://app.example.com'
          },
          recipientName: undefined
        }
      })

      expect(result).toEqual({
        success: true,
        messageId: 'welcome-123'
      })
    })
  })

  describe('sendTaskCompletedEmail', () => {
    const originalLocation = window.location
    
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://app.example.com' },
        writable: true
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      })
    })

    it('sends task completed email with correct variables', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, messageId: 'completed-456' },
        error: null
      })

      const result = await sendTaskCompletedEmail(
        'agent@example.com',
        'Document Review',
        '123 Main Street',
        'Bob Wilson',
        'txn-789'
      )

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          templateName: 'task-completed',
          recipientEmail: 'agent@example.com',
          variables: {
            task_title: 'Document Review',
            property_address: '123 Main Street',
            agent_name: 'Bob Wilson',
            transaction_status: 'Active',
            transaction_url: 'https://app.example.com/transactions/txn-789'
          },
          recipientName: undefined
        }
      })

      expect(result).toEqual({
        success: true,
        messageId: 'completed-456'
      })
    })
  })

  describe('sendActionRequiredEmail', () => {
    const originalLocation = window.location
    
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://app.example.com' },
        writable: true
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      })
    })

    it('sends action required email with all parameters', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, messageId: 'action-789' },
        error: null
      })

      const result = await sendActionRequiredEmail(
        'agent@example.com',
        '456 Oak Avenue',
        'Final Walkthrough',
        'Conduct final walkthrough with buyer before closing',
        'high',
        '2024-02-28',
        'txn-456'
      )

      expect(mockInvoke).toHaveBeenCalledWith('send-email', {
        body: {
          templateName: 'action-required',
          recipientEmail: 'agent@example.com',
          variables: {
            property_address: '456 Oak Avenue',
            task_title: 'Final Walkthrough',
            task_description: 'Conduct final walkthrough with buyer before closing',
            priority: 'high',
            due_date: '2024-02-28',
            transaction_url: 'https://app.example.com/transactions/txn-456'
          },
          recipientName: undefined
        }
      })

      expect(result).toEqual({
        success: true,
        messageId: 'action-789'
      })
    })
  })
})
