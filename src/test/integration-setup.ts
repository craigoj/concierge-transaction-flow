import { vi, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TestDatabase } from './db/sqlite-setup'

// Global test database instance
let testDb: TestDatabase | null = null

// Setup and teardown for each integration test
beforeEach(() => {
  // Create fresh database for each test
  testDb = createTestDatabase()
})

afterEach(() => {
  // Clean up database after each test
  if (testDb) {
    testDb.close()
    testDb = null
  }
})

// Export database getter for tests
export function getTestDb(): TestDatabase {
  if (!testDb) {
    throw new Error('Test database not initialized. Make sure tests are running in integration mode.')
  }
  return testDb
}

// Mock console methods to reduce noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})