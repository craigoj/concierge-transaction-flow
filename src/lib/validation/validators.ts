
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Enhanced validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must be less than 254 characters')
  .refine((email) => {
    // Additional email validation
    const parts = email.split('@');
    return parts.length === 2 && parts[1].includes('.');
  }, 'Invalid email domain');

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 characters')
  .transform((phone) => phone.replace(/[^\d+]/g, ''));

export const urlSchema = z.string()
  .url('Invalid URL format')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'URL must use HTTP or HTTPS protocol');

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

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
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

// Vendor validation schema
export const vendorValidationSchema = z.object({
  company_name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .transform(sanitizeInput),
  contact_name: z.string()
    .max(50, 'Contact name must be less than 50 characters')
    .transform(sanitizeInput)
    .optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .transform(sanitizeInput)
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
