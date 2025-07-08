
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CSRFTokenManager,
  FormRateLimiter,
  FieldEncryption,
  secureFileValidation
} from '@/lib/validation/securityUtils';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input: string) => input.replace(/<[^>]*>/g, ''))
  }
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

describe('CSRF Token Manager', () => {
  beforeEach(() => {
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
  });

  it('should generate and store CSRF token', () => {
    const token = CSRFTokenManager.generateToken();
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
  });

  it('should validate correct CSRF token', () => {
    const token = 'test-token';
    mockSessionStorage.getItem.mockReturnValueOnce(token);
    mockSessionStorage.getItem.mockReturnValueOnce(String(Date.now() + 1000000));
    
    const isValid = CSRFTokenManager.validateToken(token);
    expect(isValid).toBe(true);
  });

  it('should reject expired CSRF token', () => {
    const token = 'test-token';
    mockSessionStorage.getItem.mockReturnValueOnce(token);
    mockSessionStorage.getItem.mockReturnValueOnce(String(Date.now() - 1000000));
    
    const isValid = CSRFTokenManager.validateToken(token);
    expect(isValid).toBe(false);
  });
});

describe('Form Rate Limiter', () => {
  it('should allow submissions within rate limit', () => {
    const formId = 'test-form';
    
    expect(FormRateLimiter.canSubmit(formId)).toBe(true);
    expect(FormRateLimiter.canSubmit(formId)).toBe(true);
  });

  it('should block submissions exceeding rate limit', () => {
    const formId = 'rate-test-form';
    
    // Make maximum allowed submissions
    for (let i = 0; i < 5; i++) {
      expect(FormRateLimiter.canSubmit(formId, 5, 60000)).toBe(true);
    }
    
    // Next submission should be blocked
    expect(FormRateLimiter.canSubmit(formId, 5, 60000)).toBe(false);
  });

  it('should return correct remaining attempts', () => {
    const formId = 'remaining-test-form';
    const maxSubmissions = 3;
    
    expect(FormRateLimiter.getRemainingAttempts(formId, maxSubmissions)).toBe(3);
    
    FormRateLimiter.canSubmit(formId, maxSubmissions);
    expect(FormRateLimiter.getRemainingAttempts(formId, maxSubmissions)).toBe(2);
  });
});

describe('Field Encryption', () => {
  it('should encrypt and decrypt sensitive data', () => {
    const sensitiveData = '123-45-6789';
    
    const encrypted = FieldEncryption.encrypt(sensitiveData);
    expect(encrypted).not.toBe(sensitiveData);
    expect(encrypted.length).toBeGreaterThan(0);
    
    const decrypted = FieldEncryption.decrypt(encrypted);
    expect(decrypted).toBe(sensitiveData);
  });

  it('should identify sensitive field names', () => {
    expect(FieldEncryption.shouldEncrypt('ssn')).toBe(true);
    expect(FieldEncryption.shouldEncrypt('social_security')).toBe(true);
    expect(FieldEncryption.shouldEncrypt('bank_account')).toBe(true);
    expect(FieldEncryption.shouldEncrypt('company_name')).toBe(false);
    expect(FieldEncryption.shouldEncrypt('email')).toBe(false);
  });
});

describe('Secure File Validation', () => {
  it('should validate allowed file types', () => {
    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = secureFileValidation.validateFile(pdfFile);
    
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject dangerous file types', () => {
    const exeFile = new File(['content'], 'malware.exe', { type: 'application/x-executable' });
    const result = secureFileValidation.validateFile(exeFile);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('should enforce file size limits', () => {
    // Create a more efficient large file simulation by creating a buffer
    const largeBuffer = new ArrayBuffer(12 * 1024 * 1024); // 12MB
    const largeFile = new File([largeBuffer], 'large.pdf', { type: 'application/pdf' });
    const result = secureFileValidation.validateFile(largeFile);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceeds limit');
  });

  it('should sanitize file names', () => {
    const dirtyName = '<script>alert("xss")</script>test.pdf';
    const cleanName = secureFileValidation.sanitizeFileName(dirtyName);
    
    expect(cleanName).not.toContain('<script>');
    expect(cleanName).toContain('test.pdf');
  });
});
