import { z } from 'zod';
import DOMPurify from 'dompurify';
import { logger } from './logger';

// Enhanced input sanitization utilities
export class SecurityUtils {
  // SQL injection prevention patterns
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+[\w\s]*\s*=\s*[\w\s]*)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bxp_cmdshell\b|\bsp_executesql\b)/gi,
    /(\bSELECT\b.*\bFROM\b.*\bWHERE\b.*\bOR\b.*=.*)/gi,
  ];

  // XSS prevention patterns
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)[^<]*)*<\/embed>/gi,
    /<applet\b[^<]*(?:(?!<\/applet>)[^<]*)*<\/applet>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
  ];

  // Path traversal prevention
  private static readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\./g,
    /\/\.\//g,
    /\\\.\\/g,
    /%2e%2e/gi,
    /%2f%2e%2f/gi,
    /%5c%2e%5c/gi,
  ];

  // Command injection prevention
  private static readonly COMMAND_INJECTION_PATTERNS = [
    /[;&|`$(){}[\]]/g,
    /\b(exec|system|shell_exec|passthru|eval|base64_decode)\b/gi,
    /\b(wget|curl|nc|netcat|telnet|ssh|ftp)\b/gi,
  ];

  /**
   * Comprehensive input sanitization
   */
  static sanitizeInput(
    input: string,
    options: {
      allowHtml?: boolean;
      allowUrls?: boolean;
      maxLength?: number;
      customPatterns?: RegExp[];
    } = {}
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Apply length limits
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
      logger.warn('Input truncated due to length limit', {
        originalLength: input.length,
        maxLength: options.maxLength,
        context: 'input_sanitization',
      });
    }

    // SQL injection prevention
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        logger.warn('Potential SQL injection attempt detected', {
          input: sanitized,
          pattern: pattern.source,
          context: 'security_threat',
        });
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // XSS prevention
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(sanitized)) {
        logger.warn('Potential XSS attempt detected', {
          input: sanitized,
          pattern: pattern.source,
          context: 'security_threat',
        });
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Path traversal prevention
    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(sanitized)) {
        logger.warn('Potential path traversal attempt detected', {
          input: sanitized,
          pattern: pattern.source,
          context: 'security_threat',
        });
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Command injection prevention
    for (const pattern of this.COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        logger.warn('Potential command injection attempt detected', {
          input: sanitized,
          pattern: pattern.source,
          context: 'security_threat',
        });
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Custom patterns
    if (options.customPatterns) {
      for (const pattern of options.customPatterns) {
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // HTML sanitization
    if (options.allowHtml) {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
        ALLOWED_ATTR: options.allowUrls ? ['href', 'target'] : [],
      });
    } else {
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    }

    return sanitized.trim();
  }

  /**
   * Validate and sanitize email addresses
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    const sanitized = this.sanitizeInput(email, { maxLength: 254 });

    // Additional email-specific validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      logger.warn('Invalid email format detected', {
        email: sanitized,
        context: 'email_validation',
      });
      return '';
    }

    return sanitized.toLowerCase();
  }

  /**
   * Validate and sanitize phone numbers
   */
  static sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-digit characters except +
    let sanitized = phone.replace(/[^\d+]/g, '');

    // Validate length
    if (sanitized.length < 10 || sanitized.length > 20) {
      logger.warn('Invalid phone number length', {
        phone: sanitized,
        length: sanitized.length,
        context: 'phone_validation',
      });
      return '';
    }

    // Add country code if missing
    if (!sanitized.startsWith('+') && sanitized.length === 10) {
      sanitized = '+1' + sanitized;
    }

    return sanitized;
  }

  /**
   * Validate and sanitize URLs
   */
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    const sanitized = this.sanitizeInput(url, { maxLength: 2048 });

    try {
      const parsed = new URL(sanitized);

      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        logger.warn('Invalid URL protocol detected', {
          url: sanitized,
          protocol: parsed.protocol,
          context: 'url_validation',
        });
        return '';
      }

      return parsed.toString();
    } catch (error) {
      logger.warn('Invalid URL format detected', {
        url: sanitized,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'url_validation',
      });
      return '';
    }
  }

  /**
   * Validate file uploads
   */
  static validateFileUpload(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): { isValid: boolean; error?: string } {
    const defaultOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
    };

    const config = { ...defaultOptions, ...options };

    // Check file size
    if (file.size > config.maxSize) {
      logger.warn('File upload rejected: size too large', {
        fileName: file.name,
        fileSize: file.size,
        maxSize: config.maxSize,
        context: 'file_upload_security',
      });
      return {
        isValid: false,
        error: `File size exceeds limit of ${Math.round(config.maxSize / 1024 / 1024)}MB`,
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      logger.warn('File upload rejected: invalid type', {
        fileName: file.name,
        fileType: file.type,
        allowedTypes: config.allowedTypes,
        context: 'file_upload_security',
      });
      return {
        isValid: false,
        error: 'File type not allowed',
      };
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!config.allowedExtensions.includes(extension)) {
      logger.warn('File upload rejected: invalid extension', {
        fileName: file.name,
        extension,
        allowedExtensions: config.allowedExtensions,
        context: 'file_upload_security',
      });
      return {
        isValid: false,
        error: 'File extension not allowed',
      };
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.sh$/i,
      /\.py$/i,
      /\.pl$/i,
      /\.rb$/i,
      /\.js$/i,
      /\.html$/i,
      /\.htm$/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        logger.warn('File upload rejected: suspicious filename', {
          fileName: file.name,
          pattern: pattern.source,
          context: 'file_upload_security',
        });
        return {
          isValid: false,
          error: 'File name contains suspicious elements',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Generate secure random tokens
   */
  static generateSecureToken(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      token += charset[randomIndex];
    }

    return token;
  }

  /**
   * Hash sensitive data for logging
   */
  static hashForLogging(data: string): string {
    if (!data || typeof data !== 'string') {
      return '';
    }

    // Simple hash for logging purposes (not cryptographic)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * Validate data integrity
   */
  static validateDataIntegrity(
    data: any,
    expectedSchema: z.ZodSchema
  ): {
    isValid: boolean;
    errors: string[];
    sanitizedData?: any;
  } {
    try {
      const sanitizedData = expectedSchema.parse(data);
      return {
        isValid: true,
        errors: [],
        sanitizedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        logger.warn('Data validation failed', {
          errors,
          context: 'data_validation',
        });
        return {
          isValid: false,
          errors,
        };
      }

      logger.error('Unexpected validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'data_validation',
      });

      return {
        isValid: false,
        errors: ['Validation failed due to unexpected error'],
      };
    }
  }
}

// Enhanced validation schemas with security
export const secureTextSchema = z
  .string()
  .min(1, 'Field is required')
  .max(1000, 'Text is too long')
  .transform((val) => SecurityUtils.sanitizeInput(val));

export const secureEmailSchema = z
  .string()
  .email('Invalid email format')
  .transform((val) => SecurityUtils.sanitizeEmail(val))
  .refine((val) => val.length > 0, 'Invalid email address');

export const securePhoneSchema = z
  .string()
  .min(10, 'Phone number is too short')
  .transform((val) => SecurityUtils.sanitizePhone(val))
  .refine((val) => val.length > 0, 'Invalid phone number');

export const secureUrlSchema = z
  .string()
  .url('Invalid URL format')
  .transform((val) => SecurityUtils.sanitizeUrl(val))
  .refine((val) => val.length > 0, 'Invalid URL');

export const secureHtmlSchema = z
  .string()
  .max(5000, 'Content is too long')
  .transform((val) => SecurityUtils.sanitizeInput(val, { allowHtml: true }));
