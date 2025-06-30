
import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Create MSW server
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());

// Mock Supabase client with proper argument handling
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn((fields: string = '*') => ({
        eq: vi.fn((field: string, value: any) => ({
          data: [],
          error: null,
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          limit: vi.fn((count: number) => ({
            data: [],
            error: null
          }))
        })),
        limit: vi.fn((count: number) => ({
          data: [],
          error: null
        })),
        order: vi.fn((field: string, options?: any) => ({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn((data: any) => ({
        data: { id: 'mock-id' },
        error: null,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null })
      })),
      update: vi.fn((data: any) => ({
        eq: vi.fn((field: string, value: any) => ({
          data: { id: 'mock-id' },
          error: null,
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null })
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn((field: string, value: any) => ({
          data: null,
          error: null
        }))
      }))
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })),
    },
    channel: vi.fn((name: string) => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  }
}));

// Mock crypto for testing environment
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});
