/**
 * Common type definitions for enhanced type safety
 * Provides proper interfaces and types to replace 'any' usage
 */

import { Database } from '@/integrations/supabase/types';
import { ApplicationError } from '@/lib/error-handling';

// ============================
// DATABASE TYPES
// ============================

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];
export type TransactionStatus = Database['public']['Enums']['transaction_status'];

// ============================
// ERROR TYPES
// ============================

export interface ErrorWithCode extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface SupabaseError extends ErrorWithCode {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface HttpError extends ErrorWithCode {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  request?: unknown;
  config?: {
    url?: string;
    method?: string;
  };
}

export type SafeError = Error | ErrorWithCode | SupabaseError | HttpError | ApplicationError;

// ============================
// API RESPONSE TYPES
// ============================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string | null;
  success: boolean;
  message?: string;
}

export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: SupabaseError | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  count: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

// ============================
// FORM TYPES
// ============================

export interface FormValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  touched: Record<string, boolean>;
}

export interface FormField<T = unknown> {
  name: string;
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
  disabled: boolean;
}

// ============================
// EVENT HANDLER TYPES
// ============================

export interface FormSubmitHandler<T = unknown> {
  (data: T, event?: React.FormEvent<HTMLFormElement>): void | Promise<void>;
}

export interface ButtonClickHandler {
  (event: React.MouseEvent<HTMLButtonElement>): void | Promise<void>;
}

export interface InputChangeHandler<T = string> {
  (value: T, event?: React.ChangeEvent<HTMLInputElement>): void;
}

export interface SelectChangeHandler<T = string> {
  (value: T, event?: React.ChangeEvent<HTMLSelectElement>): void;
}

// ============================
// VENDOR & BRANDING TYPES
// ============================

export interface VendorData {
  id: string;
  vendorType: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isPrimary: boolean;
  notes?: string;
}

export interface BrandingData {
  reviewLink: string;
  favoriteColor?: string;
  birthday?: string;
  drinksAlcohol?: boolean;
  drinksCoffee?: boolean;
  hasBrandedSign?: 'yes' | 'no' | 'unsure';
  signNotes?: string;
  hasCanvaTemplate?: 'yes' | 'no' | 'unsure';
  canvaTemplateUrl?: string;
  socialMediaPermission?: boolean;
}

export interface OfferRequestData {
  propertyAddress: string;
  buyerNames: string;
  buyerContacts: {
    email?: string;
    phone?: string;
  };
  purchasePrice: number;
  emdAmount: number;
  exchangeFee: number;
  projectedClosingDate: string;
  lendingCompany: string;
  loanType: string;
  settlementCompany: string;
  closingCostAssistance?: string;
  leadEifsSurvey?: string;
  occupancyNotes?: string;
  extras?: string;
  ficaDetails?: Record<string, unknown>;
  wdiInspectionDetails?: Record<string, unknown>;
}

// ============================
// AGENT CONCIERGE TYPES
// ============================

export interface AgentConciergeFormData {
  vendorData: VendorData[];
  brandingData: BrandingData;
  offerRequestData?: OfferRequestData;
}

export interface AgentIntakeSession {
  id: string;
  agentId: string;
  status: 'pending' | 'in_progress' | 'completed';
  completionPercentage?: number;
  vendorData?: VendorData[];
  brandingData?: BrandingData;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================
// NETWORK & ASYNC TYPES
// ============================

export interface NetworkState {
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  lastSync?: Date;
}

export interface AsyncOperationState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: SafeError | null;
  success: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
  retryCondition?: (error: SafeError) => boolean;
}

// ============================
// UTILITY TYPES
// ============================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NonNullable<T> = T extends null | undefined ? never : T;

// ============================
// TYPE GUARDS
// ============================

export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as SupabaseError).message === 'string'
  );
}

export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as HttpError).response === 'object'
  );
}

export function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    error instanceof Error && 'code' in error && typeof (error as ErrorWithCode).code === 'string'
  );
}

export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

export function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  );
}

// ============================
// VALIDATION TYPES
// ============================

export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
  message?: string;
}

export type ValidationSchema<T = Record<string, unknown>> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

export type ValidationResult<T = Record<string, unknown>> = {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  data: T;
};

// ============================
// HOOK TYPES
// ============================

export interface UseAsyncResult<T = unknown> {
  data: T | null;
  loading: boolean;
  error: SafeError | null;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

export interface UseFormStateOptions<T = Record<string, unknown>> {
  initialData?: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit?: FormSubmitHandler<T>;
  onChange?: (data: T) => void;
  debounceMs?: number;
}

export interface UseFormStateResult<T = Record<string, unknown>> {
  formState: FormState<T>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  setData: (data: T) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  reset: () => void;
  submit: () => Promise<void>;
  validate: () => ValidationResult<T>;
}
