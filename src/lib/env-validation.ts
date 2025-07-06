/**
 * Environment Variable Validation Utility
 * 
 * This utility validates that all required environment variables are present
 * and properly formatted before the application starts.
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // Supabase Configuration (Required)
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL format'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Application Configuration
  VITE_APP_NAME: z.string().default('Concierge Transaction Flow'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  
  // Feature Flags (Optional)
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_DEBUG: z.string().transform(val => val === 'true').default('true'),
  VITE_ENABLE_SENTRY: z.string().transform(val => val === 'true').default('false'),
});

// Additional schema for server-side validation (Edge Functions)
const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url('Invalid Supabase URL format'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required').optional(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
export type ServerEnvConfig = z.infer<typeof serverEnvSchema>;

/**
 * Validates client-side environment variables (VITE_ prefixed)
 */
export function validateClientEnv(): EnvConfig {
  try {
    // Extract only VITE_ prefixed variables from import.meta.env
    const viteEnv = Object.keys(import.meta.env)
      .filter(key => key.startsWith('VITE_') || key === 'NODE_ENV')
      .reduce((acc, key) => {
        acc[key] = import.meta.env[key];
        return acc;
      }, {} as Record<string, any>);

    return envSchema.parse(viteEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(
        `Environment validation failed:\n${errorMessages}\n\n` +
        `Please check your .env file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

/**
 * Validates server-side environment variables (for Edge Functions)
 */
export function validateServerEnv(env: Record<string, string | undefined>): ServerEnvConfig {
  try {
    return serverEnvSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(
        `Server environment validation failed:\n${errorMessages}\n\n` +
        `Please check your Supabase Edge Function environment variables.`
      );
    }
    throw error;
  }
}

/**
 * Gets a validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  return validateClientEnv();
}

/**
 * Development helper to check for missing environment variables
 */
export function checkEnvironmentHealth(): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    const config = validateClientEnv();
    
    // Check for development-specific warnings
    if (config.NODE_ENV === 'development') {
      if (!config.VITE_ENABLE_DEBUG) {
        warnings.push('Debug mode is disabled in development');
      }
    }
    
    // Check for production-specific requirements
    if (config.NODE_ENV === 'production') {
      if (config.VITE_ENABLE_DEBUG) {
        warnings.push('Debug mode should be disabled in production');
      }
      
      if (!config.VITE_ENABLE_SENTRY) {
        warnings.push('Sentry monitoring is disabled in production');
      }
    }
    
    return {
      isValid: true,
      warnings,
      errors
    };
    
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown validation error');
    
    return {
      isValid: false,
      warnings,
      errors
    };
  }
}

/**
 * Development helper to log environment status
 */
export function logEnvironmentStatus(): void {
  const health = checkEnvironmentHealth();
  
  if (health.isValid) {
    console.log('✅ Environment validation passed');
    
    if (health.warnings.length > 0) {
      console.warn('⚠️  Environment warnings:');
      health.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  } else {
    console.error('❌ Environment validation failed:');
    health.errors.forEach(error => console.error(`  - ${error}`));
  }
}

// Auto-validate environment on import in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  try {
    validateClientEnv();
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      logEnvironmentStatus();
    }
  } catch (error) {
    console.error('Environment validation failed:', error);
  }
}