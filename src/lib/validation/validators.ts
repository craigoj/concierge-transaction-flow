
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';
import { SecurityUtils, secureTextSchema, secureEmailSchema, securePhoneSchema, secureUrlSchema } from '../security-utils';
import { logger } from '../logger';

// Enhanced validation schemas with security
export const emailSchema = secureEmailSchema.refine((email) => {
  // Additional email validation
  const parts = email.split('@');
  return parts.length === 2 && parts[1].includes('.');
}, 'Invalid email domain');

export const phoneSchema = securePhoneSchema;

export const urlSchema = secureUrlSchema;

export const currencySchema = z.number()
  .positive('Amount must be positive')
  .max(99999999, 'Amount exceeds maximum limit')
  .refine((value) => Number.isFinite(value), 'Invalid currency amount');

export const futureDateSchema = z.date()
  .refine((date) => date > new Date(), 'Date must be in the future');

export const businessHoursSchema = z.object({
  date: z.date(),
  allowWeekends: z.boolean().default(false)
}).refine(({ date, allowWeekends }) => {
  const day = date.getDay();
  if (!allowWeekends && (day === 0 || day === 6)) {
    return false;
  }
  const hour = date.getHours();
  return hour >= 9 && hour <= 17; // Business hours 9 AM - 5 PM
}, 'Date must be during business hours (9 AM - 5 PM, weekdays only)');

// Input sanitization utilities (enhanced with security)
export const sanitizeInput = (input: string): string => {
  return SecurityUtils.sanitizeInput(input);
};

export const sanitizeHtml = (html: string): string => {
  return SecurityUtils.sanitizeInput(html, { allowHtml: true });
};

// Cross-field validation schemas
export const offerRequestCrossValidation = z.object({
  purchase_price: currencySchema,
  emd_amount: currencySchema,
  exchange_fee: currencySchema,
  projected_closing_date: futureDateSchema,
  loan_type: z.string().min(1, 'Loan type is required'),
  buyer_contacts: z.object({
    emails: z.array(emailSchema).min(1, 'At least one email required'),
    phones: z.array(phoneSchema).min(1, 'At least one phone required')
  })
}).refine((data) => {
  // EMD should be reasonable percentage of purchase price
  return data.emd_amount <= (data.purchase_price * 0.1);
}, {
  message: 'EMD amount should not exceed 10% of purchase price',
  path: ['emd_amount']
}).refine((data) => {
  // Closing date should be reasonable (not too far in future)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  return data.projected_closing_date <= maxDate;
}, {
  message: 'Closing date should be within 6 months',
  path: ['projected_closing_date']
});

// Vendor validation schema (enhanced with security)
export const vendorValidationSchema = z.object({
  company_name: secureTextSchema
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  contact_name: secureTextSchema
    .max(50, 'Contact name must be less than 50 characters')
    .optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: secureTextSchema
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .transform(sanitizeHtml)
    .optional(),
  vendor_type: z.enum([
    'lender', 'settlement', 'home_inspection', 'termite_inspection',
    'photography', 'staging', 'cleaning', 'lawn_care', 'title_company',
    'insurance', 'attorney', 'appraiser', 'surveyor', 'contractor'
  ]),
  is_primary: z.boolean().default(false)
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  action: z.string(),
  timestamp: z.date(),
  userId: z.string()
});

export const validateRateLimit = (
  submissions: Array<{ timestamp: Date }>,
  maxSubmissions: number = 5,
  windowMinutes: number = 15
): boolean => {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
  const recentSubmissions = submissions.filter(s => s.timestamp > cutoff);
  return recentSubmissions.length < maxSubmissions;
};

// Server validation functions
export const createUniqueValidation = (table: string, field: string) => {
  return async (value: any, context?: Record<string, any>): Promise<string | null> => {
    if (!value) return null;

    try {
      const { data, error } = await supabase
        .from(table as any)
        .select('id')
        .eq(field, value)
        .limit(1);

      if (error) {
        logger.error('Unique validation error', { error, table, field, value: SecurityUtils.hashForLogging(String(value)) });
        return null; // Don't fail validation due to server errors
      }

      return data && data.length > 0 ? `This ${field} is already in use` : null;
    } catch (error) {
      logger.error('Unique validation error', { error, table, field, value: SecurityUtils.hashForLogging(String(value)) });
      return null;
    }
  };
};

export const createBusinessRuleValidation = (
  rule: (value: any, context?: Record<string, any>) => boolean,
  errorMessage: string
) => {
  return async (value: any, context?: Record<string, any>): Promise<string | null> => {
    try {
      return rule(value, context) ? null : errorMessage;
    } catch (error) {
      logger.error('Business rule validation error', { error, errorMessage, value: SecurityUtils.hashForLogging(String(value)) });
      return null;
    }
  };
};
