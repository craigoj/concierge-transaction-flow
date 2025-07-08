
import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  phoneSchema,
  urlSchema,
  currencySchema,
  futureDateSchema,
  sanitizeInput,
  sanitizeHtml,
  offerRequestCrossValidation,
  vendorValidationSchema
} from '@/lib/validation/validators';

describe('Email Validation', () => {
  it('should validate correct email formats', () => {
    expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    expect(() => emailSchema.parse('user.name@domain.co.uk')).not.toThrow();
  });

  it('should reject invalid email formats', () => {
    expect(() => emailSchema.parse('invalid-email')).toThrow();
    expect(() => emailSchema.parse('test@')).toThrow();
    expect(() => emailSchema.parse('@domain.com')).toThrow();
  });

  it('should enforce length limits', () => {
    expect(() => emailSchema.parse('a@b')).toThrow(); // Too short
    expect(() => emailSchema.parse('a'.repeat(250) + '@example.com')).toThrow(); // Too long
  });
});

describe('Phone Validation', () => {
  it('should validate and format phone numbers', () => {
    const result = phoneSchema.parse('(555) 123-4567');
    expect(result).toBe('+15551234567');
  });

  it('should handle international formats', () => {
    const result = phoneSchema.parse('+1-555-123-4567');
    expect(result).toBe('+15551234567');
  });

  it('should reject invalid phone formats', () => {
    expect(() => phoneSchema.parse('123')).toThrow(); // Too short
    expect(() => phoneSchema.parse('abc-def-ghij')).toThrow(); // Invalid characters
  });
});

describe('URL Validation', () => {
  it('should validate HTTPS URLs', () => {
    expect(() => urlSchema.parse('https://example.com')).not.toThrow();
    expect(() => urlSchema.parse('http://localhost:3000')).not.toThrow();
  });

  it('should reject non-HTTP protocols', () => {
    expect(() => urlSchema.parse('ftp://example.com')).toThrow();
    expect(() => urlSchema.parse('javascript:alert(1)')).toThrow();
  });
});

describe('Currency Validation', () => {
  it('should validate positive currency amounts', () => {
    expect(() => currencySchema.parse(100.50)).not.toThrow();
    expect(() => currencySchema.parse(1000000)).not.toThrow();
  });

  it('should reject negative or invalid amounts', () => {
    expect(() => currencySchema.parse(-100)).toThrow();
    expect(() => currencySchema.parse(0)).toThrow();
    expect(() => currencySchema.parse(Infinity)).toThrow();
  });
});

describe('Input Sanitization', () => {
  it('should sanitize HTML input', () => {
    const dirty = '<script>alert("xss")</script>Hello';
    const clean = sanitizeInput(dirty);
    expect(clean).toBe('Hello');
  });

  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const clean = sanitizeHtml(input);
    expect(clean).toBe('<p>Hello <strong>world</strong></p>');
  });
});

describe('Cross-field Validation', () => {
  it('should validate offer request with reasonable EMD', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    
    const validOffer = {
      purchase_price: 300000,
      emd_amount: 15000, // 5% - reasonable
      exchange_fee: 500,
      projected_closing_date: futureDate,
      loan_type: 'conventional',
      buyer_contacts: {
        emails: ['buyer@example.com'],
        phones: ['+1234567890']
      }
    };
    
    expect(() => offerRequestCrossValidation.parse(validOffer)).not.toThrow();
  });

  it('should reject offer request with excessive EMD', () => {
    const invalidOffer = {
      purchase_price: 300000,
      emd_amount: 35000, // 11.7% - too high
      exchange_fee: 500,
      projected_closing_date: new Date('2024-12-01'),
      loan_type: 'conventional',
      buyer_contacts: {
        emails: ['buyer@example.com'],
        phones: ['+1234567890']
      }
    };
    
    expect(() => offerRequestCrossValidation.parse(invalidOffer)).toThrow();
  });
});

describe('Vendor Validation', () => {
  it('should validate complete vendor data', () => {
    const vendor = {
      company_name: 'Test Lender Inc.',
      contact_name: 'John Smith',
      email: 'john@testlender.com',
      phone: '+1234567890',
      address: '123 Business St, Hampton, VA',
      notes: 'Preferred lender for VA loans',
      vendor_type: 'lender' as const,
      is_primary: true
    };
    
    expect(() => vendorValidationSchema.parse(vendor)).not.toThrow();
  });

  it('should sanitize vendor input data', () => {
    const vendor = {
      company_name: '<script>alert("xss")</script>Clean Company',
      vendor_type: 'lender' as const,
      is_primary: false
    };
    
    const result = vendorValidationSchema.parse(vendor);
    expect(result.company_name).toBe('Clean Company');
  });
});
