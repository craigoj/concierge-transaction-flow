
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ServiceError } from '@/types';

// Mock email service
interface EmailServiceResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private isAvailable = true;

  setAvailability(available: boolean) {
    this.isAvailable = available;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<EmailServiceResponse> {
    if (!this.isAvailable) {
      throw new Error('Email service unavailable');
    }

    if (!to || !subject) {
      throw new Error('Missing required fields');
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      success: true,
      messageId: `msg_${Date.now()}`
    };
  }

  async sendTemplateEmail(templateId: string, to: string, variables: Record<string, any>): Promise<EmailServiceResponse> {
    if (!this.isAvailable) {
      throw new Error('Email service unavailable');
    }

    if (Math.random() < 0.1) { // 10% chance of network error
      throw new Error('Network error');
    }

    return {
      success: true,
      messageId: `template_msg_${Date.now()}`
    };
  }
}

// Email utilities with error handling
export const emailUtils = {
  service: new EmailService(),

  async sendEmailWithRetry(to: string, subject: string, body: string, maxRetries = 3): Promise<EmailServiceResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.service.sendEmail(to, subject, body);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError!;
  },

  async handleEmailError(error: Error): Promise<ServiceError> {
    if (error.message.includes('service unavailable')) {
      return {
        message: 'Email service is temporarily unavailable. Please try again later.',
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

    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }
};

describe('Email Utils Tests', () => {
  beforeEach(() => {
    emailUtils.service.setAvailability(true);
    vi.clearAllMocks();
  });

  it('should send email successfully', async () => {
    const result = await emailUtils.service.sendEmail(
      'test@example.com',
      'Test Subject',
      'Test Body'
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('should handle "Email service unavailable" error', async () => {
    emailUtils.service.setAvailability(false);

    await expect(
      emailUtils.service.sendEmail('test@example.com', 'Subject', 'Body')
    ).rejects.toThrow('Email service unavailable');
  });

  it('should retry on failure and eventually succeed', async () => {
    let attempts = 0;
    const originalSend = emailUtils.service.sendEmail;
    
    emailUtils.service.sendEmail = vi.fn().mockImplementation(async (...args) => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Network error');
      }
      return originalSend.apply(emailUtils.service, args);
    });

    const result = await emailUtils.sendEmailWithRetry('test@example.com', 'Subject', 'Body');
    
    expect(result.success).toBe(true);
    expect(attempts).toBe(3);
  });

  it('should handle network errors with proper error mapping', async () => {
    const networkError = new Error('Network error');
    const serviceError = await emailUtils.handleEmailError(networkError);

    expect(serviceError.code).toBe('NETWORK_ERROR');
    expect(serviceError.details?.canRetry).toBe(true);
  });

  it('should handle service unavailable errors', async () => {
    const serviceError = new Error('Email service unavailable');
    const mappedError = await emailUtils.handleEmailError(serviceError);

    expect(mappedError.code).toBe('SERVICE_UNAVAILABLE');
    expect(mappedError.details?.retryAfter).toBe(300);
  });

  it('should validate email parameters', async () => {
    await expect(
      emailUtils.service.sendEmail('', 'Subject', 'Body')
    ).rejects.toThrow('Missing required fields');

    await expect(
      emailUtils.service.sendEmail('test@example.com', '', 'Body')
    ).rejects.toThrow('Missing required fields');
  });

  it('should handle template email failures', async () => {
    // Mock Math.random to force network error
    const originalRandom = Math.random;
    Math.random = vi.fn().mockReturnValue(0.05); // Force network error

    await expect(
      emailUtils.service.sendTemplateEmail('template-1', 'test@example.com', {})
    ).rejects.toThrow('Network error');

    Math.random = originalRandom;
  });
});
