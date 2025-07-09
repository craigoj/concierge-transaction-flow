import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { createTestDatabase, type TestDatabase } from './db/sqlite-setup';

// Global test database instance
let testDb: TestDatabase | null = null;

// Setup and teardown for each integration test
beforeEach(() => {
  // Create fresh database for each test
  testDb = createTestDatabase();
});

afterEach(() => {
  // Clean up database after each test
  if (testDb) {
    testDb.close();
    testDb = null;
  }
  // Clean up React components
  cleanup();
});

// Export database getter for tests
export function getTestDb(): TestDatabase {
  if (!testDb) {
    throw new Error(
      'Test database not initialized. Make sure tests are running in integration mode.'
    );
  }
  return testDb;
}

// Mock window.matchMedia for userEvent compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for userEvent compatibility
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for userEvent compatibility
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods to reduce noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
