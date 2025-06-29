import { describe, it, expect, vi, beforeEach } from 'vitest'
import { syncTransactionDeadlines, createCalendarEvent, CalendarEvent } from '../calendarUtils'

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}))

import { supabase } from '@/integrations/supabase/client'

describe('calendarUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCalendarEvent', () => {
    it('successfully creates a calendar event', async () => {
      const mockEvent: CalendarEvent = {
        transactionId: '123',
        eventType: 'closing',
        eventDate: '2024-02-15',
        title: 'Closing Day',
        description: 'Final closing'
      }

      const mockResponse = { id: 'event-123', success: true }
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null
      })

      const result = await createCalendarEvent(mockEvent)

      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-calendar-event', {
        body: mockEvent
      })
      expect(result).toEqual(mockResponse)
    })

    it('throws error when calendar event creation fails', async () => {
      const mockEvent: CalendarEvent = {
        transactionId: '123',
        eventType: 'closing',
        eventDate: '2024-02-15',
        title: 'Closing Day'
      }

      const mockError = new Error('Failed to create event')
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(createCalendarEvent(mockEvent)).rejects.toThrow('Failed to create event')
    })

    it('handles function invoke rejection', async () => {
      const mockEvent: CalendarEvent = {
        transactionId: '123',
        eventType: 'closing',
        eventDate: '2024-02-15',
        title: 'Closing Day'
      }

      vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('Network error'))

      await expect(createCalendarEvent(mockEvent)).rejects.toThrow('Network error')
    })
  })

  describe('syncTransactionDeadlines', () => {
    it('returns early when no closing date provided', async () => {
      await syncTransactionDeadlines('123')
      expect(supabase.functions.invoke).not.toHaveBeenCalled()

      await syncTransactionDeadlines('123', '')
      expect(supabase.functions.invoke).not.toHaveBeenCalled()
    })

    it('creates multiple deadline events for a transaction', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null
      })

      await syncTransactionDeadlines('123', '2024-02-15')

      // Should create 3 events: closing, walkthrough, financing
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(3)
    })

    it('creates closing day event with correct date', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null
      })

      await syncTransactionDeadlines('123', '2024-02-15')

      // Check closing event
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-calendar-event', {
        body: expect.objectContaining({
          transactionId: '123',
          eventType: 'closing',
          eventDate: '2024-02-15',
          title: 'Closing Day',
          description: 'Final closing and property transfer'
        })
      })
    })

    it('creates walkthrough event 7 days before closing', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null
      })

      await syncTransactionDeadlines('123', '2024-02-15')

      // Walkthrough should be 7 days before (2024-02-08)
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-calendar-event', {
        body: expect.objectContaining({
          transactionId: '123',
          eventType: 'inspection',
          eventDate: '2024-02-08',
          title: 'Final Walkthrough',
          description: 'Pre-closing property inspection'
        })
      })
    })

    it('creates financing deadline 14 days before closing', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null
      })

      await syncTransactionDeadlines('123', '2024-02-15')

      // Financing should be 14 days before (2024-02-01)
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-calendar-event', {
        body: expect.objectContaining({
          transactionId: '123',
          eventType: 'financing',
          eventDate: '2024-02-01',
          title: 'Financing Deadline',
          description: 'Secure final loan approval'
        })
      })
    })

    it('continues creating events even if one fails', async () => {
      // Mock the first call to fail, subsequent ones to succeed
      vi.mocked(supabase.functions.invoke)
        .mockResolvedValueOnce({ data: null, error: new Error('Failed') })
        .mockResolvedValue({ data: { success: true }, error: null })

      // Should not throw error, should continue with other events
      await expect(syncTransactionDeadlines('123', '2024-02-15')).resolves.toBeUndefined()
      
      // Should still attempt all 3 events
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(3)
    })

    it('handles date calculations correctly for edge cases', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null
      })

      // Test with start of month
      await syncTransactionDeadlines('123', '2024-02-01')

      // Financing deadline should be 14 days before (2024-01-18)
      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-calendar-event', {
        body: expect.objectContaining({
          eventDate: '2024-01-18'
        })
      })
    })
  })
})