
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ServiceError } from '@/types';

// Mock calendar event interface
interface CalendarEvent {
  id?: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}

interface CalendarServiceResponse {
  success: boolean;
  eventId?: string;
  error?: string;
}

// Mock calendar service
class CalendarService {
  private isAvailable = true;
  private events: CalendarEvent[] = [];

  setAvailability(available: boolean) {
    this.isAvailable = available;
  }

  async createEvent(event: CalendarEvent): Promise<CalendarServiceResponse> {
    if (!this.isAvailable) {
      throw new Error('Calendar service unavailable');
    }

    if (!event.title || !event.start || !event.end) {
      throw new Error('Failed to create event: missing required fields');
    }

    // Simulate network issues
    if (Math.random() < 0.15) { // 15% chance of network error
      throw new Error('Network error');
    }

    const eventId = `cal_${Date.now()}`;
    this.events.push({ ...event, id: eventId });

    return {
      success: true,
      eventId
    };
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarServiceResponse> {
    if (!this.isAvailable) {
      throw new Error('Calendar service unavailable');
    }

    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    this.events[eventIndex] = { ...this.events[eventIndex], ...updates };

    return {
      success: true,
      eventId
    };
  }

  async deleteEvent(eventId: string): Promise<CalendarServiceResponse> {
    if (!this.isAvailable) {
      throw new Error('Calendar service unavailable');
    }

    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    this.events.splice(eventIndex, 1);

    return {
      success: true,
      eventId
    };
  }
}

// Calendar utilities with error handling
export const calendarUtils = {
  service: new CalendarService(),

  async createEventWithRetry(event: CalendarEvent, maxRetries = 3): Promise<CalendarServiceResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.service.createEvent(event);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }

    throw lastError!;
  },

  async handleCalendarError(error: Error): Promise<ServiceError> {
    if (error.message.includes('service unavailable')) {
      return {
        message: 'Calendar service is temporarily unavailable. Please try again later.',
        code: 'SERVICE_UNAVAILABLE',
        details: { retryAfter: 300 }
      };
    }

    if (error.message.includes('Network error')) {
      return {
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        details: { canRetry: true }
      };
    }

    if (error.message.includes('Failed to create event')) {
      return {
        message: 'Failed to create calendar event. Please check the event details.',
        code: 'VALIDATION_ERROR',
        details: { canRetry: false }
      };
    }

    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  },

  validateEvent(event: CalendarEvent): string[] {
    const errors: string[] = [];

    if (!event.title?.trim()) {
      errors.push('Event title is required');
    }

    if (!event.start) {
      errors.push('Start time is required');
    }

    if (!event.end) {
      errors.push('End time is required');
    }

    if (event.start && event.end && new Date(event.start) >= new Date(event.end)) {
      errors.push('End time must be after start time');
    }

    return errors;
  }
};

describe('Calendar Utils Tests', () => {
  beforeEach(() => {
    calendarUtils.service.setAvailability(true);
    vi.clearAllMocks();
  });

  it('should create calendar event successfully', async () => {
    const event: CalendarEvent = {
      title: 'Test Meeting',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z',
      description: 'Test description'
    };

    const result = await calendarUtils.service.createEvent(event);

    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
  });

  it('should handle "Failed to create event" error', async () => {
    const invalidEvent: CalendarEvent = {
      title: '',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z'
    };

    await expect(
      calendarUtils.service.createEvent(invalidEvent)
    ).rejects.toThrow('Failed to create event: missing required fields');
  });

  it('should handle "Calendar service unavailable" error', async () => {
    calendarUtils.service.setAvailability(false);

    const event: CalendarEvent = {
      title: 'Test Event',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z'
    };

    await expect(
      calendarUtils.service.createEvent(event)
    ).rejects.toThrow('Calendar service unavailable');
  });

  it('should retry on network error and eventually succeed', async () => {
    let attempts = 0;
    const originalCreate = calendarUtils.service.createEvent;
    
    calendarUtils.service.createEvent = vi.fn().mockImplementation(async (event) => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Network error');
      }
      return originalCreate.apply(calendarUtils.service, [event]);
    });

    const event: CalendarEvent = {
      title: 'Retry Test',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z'
    };

    const result = await calendarUtils.createEventWithRetry(event);
    
    expect(result.success).toBe(true);
    expect(attempts).toBe(2);
  });

  it('should validate event data properly', () => {
    const validEvent: CalendarEvent = {
      title: 'Valid Event',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z'
    };

    const invalidEvent: CalendarEvent = {
      title: '',
      start: '',
      end: '2024-01-15T10:00:00Z'
    };

    expect(calendarUtils.validateEvent(validEvent)).toHaveLength(0);
    expect(calendarUtils.validateEvent(invalidEvent)).toContain('Event title is required');
    expect(calendarUtils.validateEvent(invalidEvent)).toContain('Start time is required');
  });

  it('should handle service error mapping correctly', async () => {
    const networkError = new Error('Network error');
    const serviceError = await calendarUtils.handleCalendarError(networkError);

    expect(serviceError.code).toBe('NETWORK_ERROR');
    expect(serviceError.details?.canRetry).toBe(true);

    const validationError = new Error('Failed to create event: missing fields');
    const mappedValidationError = await calendarUtils.handleCalendarError(validationError);

    expect(mappedValidationError.code).toBe('VALIDATION_ERROR');
    expect(mappedValidationError.details?.canRetry).toBe(false);
  });

  it('should update events correctly', async () => {
    // First create an event
    const event: CalendarEvent = {
      title: 'Original Title',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z'
    };

    const createResult = await calendarUtils.service.createEvent(event);
    expect(createResult.success).toBe(true);

    // Then update it
    const updateResult = await calendarUtils.service.updateEvent(createResult.eventId!, {
      title: 'Updated Title'
    });

    expect(updateResult.success).toBe(true);
  });
});
