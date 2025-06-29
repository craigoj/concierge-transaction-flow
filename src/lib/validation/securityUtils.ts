import { z } from 'zod';
import DOMPurify from 'dompurify';
import CryptoJS from 'crypto-js';

// CSRF Token Management
export class CSRFTokenManager {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_EXPIRY = 'csrf_token_expiry';

  static generateToken(): string {
    const token = CryptoJS.lib.WordArray.random(32).toString();
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour
    
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.TOKEN_EXPIRY, expiry.toString());
    
    return token;
  }

  static getToken(): string | null {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY);
    
    if (!token || !expiry || Date.now() > parseInt(expiry)) {
      this.clearToken();
      return null;
    }
    
    return token;
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token;
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_EXPIRY);
  }
}

// Rate Limiting for Forms
export class FormRateLimiter {
  private static submissions = new Map<string, number[]>();

  static canSubmit(formId: string, maxSubmissions = 5, windowMs = 300000): boolean {
    const now = Date.now();
    const submissions = this.submissions.get(formId) || [];
    
    // Clean old submissions
    const validSubmissions = submissions.filter(time => now - time < windowMs);
    
    if (validSubmissions.length >= maxSubmissions) {
      return false;
    }

    validSubmissions.push(now);
    this.submissions.set(formId, validSubmissions);
    return true;
  }

  static getRemainingAttempts(formId: string, maxSubmissions = 5): number {
    const submissions = this.submissions.get(formId) || [];
    return Math.max(0, maxSubmissions - submissions.length);
  }

  static getTimeUntilReset(formId: string, windowMs = 300000): number {
    const submissions = this.submissions.get(formId) || [];
    if (submissions.length === 0) return 0;
    
    const oldestSubmission = Math.min(...submissions);
    const resetTime = oldestSubmission + windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

// Secure Field Encryption
export class FieldEncryption {
  private static readonly SECRET_KEY = 'concierge_field_encryption';

  static encrypt(value: string): string {
    try {
      return CryptoJS.AES.encrypt(value, this.SECRET_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return value; // Fallback to unencrypted
    }
  }

  static decrypt(encryptedValue: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedValue; // Fallback to original value
    }
  }

  static shouldEncrypt(fieldName: string): boolean {
    const sensitiveFields = [
      'ssn', 'social_security', 'tax_id', 'bank_account',
      'routing_number', 'credit_card', 'password'
    ];
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field)
    );
  }
}

// File Upload Security
export const secureFileValidation = {
  allowedTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`
      };
    }

    // Check for malicious extensions
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.com', '.js'];
    
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      return {
        isValid: false,
        error: 'File extension is not allowed for security reasons'
      };
    }

    return { isValid: true };
  },

  sanitizeFileName(fileName: string): string {
    return DOMPurify.sanitize(fileName)
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 255);
  }
};
