/**
 * Database Testing Helpers
 * Utilities for testing database operations, migrations, and RLS policies
 */

import { vi } from 'vitest';
import type { Database } from '@/integrations/supabase/types';

// Database record type for testing
interface DatabaseRecord {
  id: string;
  [key: string]: unknown;
}

// Query filter interface
interface QueryFilter {
  [key: string]: unknown;
}

// Mock Supabase client for database testing
export class MockSupabaseClient {
  private mockData: Map<string, DatabaseRecord[]> = new Map();
  private mockError: Error | null = null;

  constructor() {
    this.reset();
  }

  // Reset all mock data
  reset() {
    this.mockData.clear();
    this.mockError = null;
  }

  // Set mock data for a table
  setMockData(table: string, data: DatabaseRecord[]) {
    this.mockData.set(table, data);
  }

  // Set mock error for next operation
  setMockError(error: Error) {
    this.mockError = error;
  }

  // Mock implementation of Supabase operations
  from(table: string) {
    return {
      select: (columns?: string) => this.createQueryBuilder(table),
      insert: (data: DatabaseRecord | DatabaseRecord[]) => ({
        select: (columns?: string) => this.createMutationBuilder('insert', table, data),
        ...this.createMutationBuilder('insert', table, data),
      }),
      update: (data: Partial<DatabaseRecord>) => ({
        eq: (column: string, value: unknown) =>
          this.createMutationBuilder('update', table, data, { [column]: value }),
        match: (query: QueryFilter) => this.createMutationBuilder('update', table, data, query),
      }),
      upsert: (data: DatabaseRecord | DatabaseRecord[]) => ({
        select: (columns?: string) => this.createMutationBuilder('upsert', table, data),
        ...this.createMutationBuilder('upsert', table, data),
      }),
      delete: () => ({
        eq: (column: string, value: unknown) =>
          this.createMutationBuilder('delete', table, null, { [column]: value }),
        match: (query: QueryFilter) => this.createMutationBuilder('delete', table, null, query),
      }),
    };
  }

  private createQueryBuilder(
    table: string,
    filters: QueryFilter = {},
    modifiers: string[] = []
  ): any {
    const builder = {
      // Filter methods
      eq: (column: string, value: unknown) =>
        this.createQueryBuilder(table, { ...filters, [column]: value }, modifiers),
      neq: (column: string, value: unknown) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__neq`]: value }, modifiers),
      gt: (column: string, value: unknown) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__gt`]: value }, modifiers),
      gte: (column: string, value: unknown) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__gte`]: value }, modifiers),
      lt: (column: string, value: unknown) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__lt`]: value }, modifiers),
      lte: (column: string, value: unknown) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__lte`]: value }, modifiers),
      like: (column: string, pattern: string) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__like`]: pattern }, modifiers),
      in: (column: string, values: unknown[]) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__in`]: values }, modifiers),
      is: (column: string, value: unknown) =>
        this.createQueryBuilder(table, { ...filters, [`${column}__is`]: value }, modifiers),

      // Ordering and limits
      order: (column: string, options?: { ascending?: boolean }) =>
        this.createQueryBuilder(table, filters, [
          ...modifiers,
          `order_${column}_${options?.ascending ? 'asc' : 'desc'}`,
        ]),
      limit: (count: number) =>
        this.createQueryBuilder(table, filters, [...modifiers, `limit_${count}`]),
      range: (from: number, to: number) =>
        this.createQueryBuilder(table, filters, [...modifiers, `range_${from}_${to}`]),

      // Result modifiers
      single: () => this.createQueryBuilder(table, filters, [...modifiers, 'single']),

      // Promise interface
      then: (
        resolve: (value: {
          data: DatabaseRecord[] | DatabaseRecord | null;
          error: Error | null;
        }) => void,
        reject?: (reason?: unknown) => void
      ) => {
        return this.executeQuery(table, filters, modifiers, resolve, reject);
      },
    };

    return builder;
  }

  private executeQuery(
    table: string,
    filters: QueryFilter,
    modifiers: string[],
    resolve: (value: {
      data: DatabaseRecord[] | DatabaseRecord | null;
      error: Error | null;
    }) => void,
    reject?: (reason?: unknown) => void
  ) {
    if (this.mockError) {
      const error = this.mockError;
      this.mockError = null;
      const result = { data: null, error };
      resolve(result);
      return Promise.resolve(result);
    }

    let data: DatabaseRecord[] = this.mockData.get(table) || [];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key.includes('__neq')) {
        const column = key.replace('__neq', '');
        data = data.filter((item) => item[column] !== value);
      } else if (key.includes('__gt')) {
        const column = key.replace('__gt', '');
        data = data.filter((item) => item[column] > value);
      } else if (key.includes('__gte')) {
        const column = key.replace('__gte', '');
        data = data.filter((item) => item[column] >= value);
      } else if (key.includes('__lt')) {
        const column = key.replace('__lt', '');
        data = data.filter((item) => item[column] < value);
      } else if (key.includes('__lte')) {
        const column = key.replace('__lte', '');
        data = data.filter((item) => item[column] <= value);
      } else if (key.includes('__like')) {
        const column = key.replace('__like', '');
        const pattern = String(value).replace(/%/g, '.*');
        data = data.filter((item) => new RegExp(pattern, 'i').test(String(item[column])));
      } else if (key.includes('__in')) {
        const column = key.replace('__in', '');
        data = data.filter((item) => Array.isArray(value) && value.includes(item[column]));
      } else if (key.includes('__is')) {
        const column = key.replace('__is', '');
        data = data.filter((item) => item[column] === value);
      } else {
        data = data.filter((item) => item[key] === value);
      }
    });

    // Apply modifiers in order
    modifiers.forEach((modifier) => {
      if (modifier.startsWith('order_')) {
        const parts = modifier.split('_');
        const column = parts[1];
        const direction = parts[2];
        data.sort((a, b) => {
          const aVal = a[column];
          const bVal = b[column];
          if (direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
          }
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
      } else if (modifier.startsWith('limit_')) {
        const limit = parseInt(modifier.split('_')[1]);
        data = data.slice(0, limit);
      } else if (modifier.startsWith('range_')) {
        const parts = modifier.split('_');
        const from = parseInt(parts[1]);
        const to = parseInt(parts[2]);
        data = data.slice(from, to + 1);
      }
    });

    let resultData: DatabaseRecord[] | DatabaseRecord | null = data;

    // Apply single modifier at the end
    if (modifiers.includes('single')) {
      resultData = data.length > 0 ? data[0] : null;
    }

    const result = {
      data: resultData,
      error: null,
    };

    resolve(result);
    return Promise.resolve(result);
  }

  private createMutationBuilder(
    operation: string,
    table: string,
    data: DatabaseRecord | DatabaseRecord[] | Partial<DatabaseRecord> | null,
    filters?: QueryFilter
  ) {
    return {
      then: (
        resolve: (value: { data: DatabaseRecord[] | null; error: Error | null }) => void,
        reject?: (reason?: unknown) => void
      ) => {
        if (this.mockError) {
          const error = this.mockError;
          this.mockError = null;
          // Return error in result format instead of rejecting
          const result = { data: null, error };
          resolve(result);
          return Promise.resolve(result);
        }

        let result: { data: DatabaseRecord[] | null; error: Error | null };
        switch (operation) {
          case 'insert':
            result = {
              data: Array.isArray(data) ? (data as DatabaseRecord[]) : [data as DatabaseRecord],
              error: null,
            };
            break;
          case 'update':
            result = {
              data: [{ ...(data as Partial<DatabaseRecord>), ...filters } as DatabaseRecord],
              error: null,
            };
            break;
          case 'upsert':
            result = {
              data: Array.isArray(data) ? (data as DatabaseRecord[]) : [data as DatabaseRecord],
              error: null,
            };
            break;
          case 'delete':
            result = { data: [], error: null };
            break;
          default:
            result = { data: null, error: null };
        }

        resolve(result);
        return Promise.resolve(result);
      },
    };
  }

  // Authentication mock
  auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  };

  // Storage mock
  storage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

// RLS Policy Testing Helpers
export const RLSTestHelpers = {
  // Test that RLS denies access when user is not authenticated
  testUnauthenticatedAccess: async (mockClient: MockSupabaseClient, table: string) => {
    mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mockClient.setMockError(new Error('Row Level Security policy violation'));

    const { error } = await mockClient
      .from(table)
      .select()
      .then(
        (result) => result,
        (error) => ({ data: null, error })
      );

    expect(error).toBeTruthy();
    expect(error.message).toContain('Row Level Security');
  },

  // Test that RLS allows access for authenticated users with correct role
  testAuthorizedAccess: async (
    mockClient: MockSupabaseClient,
    table: string,
    userData: { id: string; role?: string; [key: string]: unknown }
  ) => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: userData },
      error: null,
    });

    const testData: DatabaseRecord[] = [{ id: '1', name: 'Test Record' }];
    mockClient.setMockData(table, testData);

    const { data, error } = await mockClient.from(table).select();

    expect(error).toBeNull();
    expect(data).toEqual(testData);
  },

  // Test that RLS denies access for wrong user/agent
  testWrongUserAccess: async (
    mockClient: MockSupabaseClient,
    table: string,
    wrongUser: { id: string; role?: string; [key: string]: unknown }
  ) => {
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: wrongUser },
      error: null,
    });
    mockClient.setMockError(new Error('Access denied: insufficient privileges'));

    const result = await mockClient.from(table).select();
    expect(result.error).toBeTruthy();
    expect(result.error.message).toContain('Access denied');
  },
};

// Migration Testing Helpers
export const MigrationTestHelpers = {
  // Test that a migration creates expected tables
  testTableCreation: (expectedTables: string[]) => {
    return {
      tables: expectedTables,
      validate: (actualTables: string[]) => {
        expectedTables.forEach((table) => {
          expect(actualTables).toContain(table);
        });
      },
    };
  },

  // Test that columns exist with correct types
  testColumnDefinitions: (table: string, expectedColumns: Record<string, string>) => {
    return {
      table,
      columns: expectedColumns,
      validate: (actualColumns: Record<string, string>) => {
        Object.entries(expectedColumns).forEach(([column, type]) => {
          expect(actualColumns[column]).toBe(type);
        });
      },
    };
  },

  // Test that indexes are created
  testIndexCreation: (expectedIndexes: string[]) => {
    return {
      indexes: expectedIndexes,
      validate: (actualIndexes: string[]) => {
        expectedIndexes.forEach((index) => {
          expect(actualIndexes).toContain(index);
        });
      },
    };
  },

  // Test that foreign key constraints exist
  testForeignKeyConstraints: (
    expectedConstraints: Array<{ table: string; column: string; references: string }>
  ) => {
    return {
      constraints: expectedConstraints,
      validate: (
        actualConstraints: Array<{ table: string; column: string; references: string }>
      ) => {
        expectedConstraints.forEach((expected) => {
          expect(actualConstraints).toContainEqual(expected);
        });
      },
    };
  },
};

// Performance Testing Helpers
export const PerformanceTestHelpers = {
  // Test query performance
  measureQueryTime: async (queryFn: () => Promise<any>): Promise<number> => {
    const start = performance.now();
    await queryFn();
    const end = performance.now();
    return end - start;
  },

  // Test that query completes within time limit
  expectQueryWithinTime: async (queryFn: () => Promise<any>, maxTime: number) => {
    const time = await PerformanceTestHelpers.measureQueryTime(queryFn);
    expect(time).toBeLessThan(maxTime);
  },

  // Test bulk operations performance
  testBulkOperationPerformance: async (
    mockClient: MockSupabaseClient,
    table: string,
    recordCount: number,
    maxTimePerRecord: number = 10 // ms
  ) => {
    const records = Array.from({ length: recordCount }, (_, i) => ({
      id: `record-${i}`,
      name: `Test Record ${i}`,
    }));

    const time = await PerformanceTestHelpers.measureQueryTime(async () => {
      await mockClient.from(table).insert(records);
    });

    const timePerRecord = time / recordCount;
    expect(timePerRecord).toBeLessThan(maxTimePerRecord);
  },
};

// Database Test Suite Factory
export const createDatabaseTestSuite = (tableName: string) => {
  let mockClient: MockSupabaseClient;

  return {
    setup: () => {
      mockClient = new MockSupabaseClient();
      return mockClient;
    },

    cleanup: () => {
      mockClient.reset();
    },

    testCRUDOperations: () => ({
      create: async (data: DatabaseRecord) => {
        const result = await mockClient.from(tableName).insert(data);
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        return result;
      },

      read: async (filters: QueryFilter = {}) => {
        const query = mockClient.from(tableName).select();
        Object.entries(filters).forEach(([key, value]) => {
          query.eq(key, value);
        });
        const result = await query;
        expect(result.error).toBeNull();
        return result;
      },

      update: async (id: string, data: Partial<DatabaseRecord>) => {
        const result = await mockClient.from(tableName).update(data).eq('id', id);
        expect(result.error).toBeNull();
        return result;
      },

      delete: async (id: string) => {
        const result = await mockClient.from(tableName).delete().eq('id', id);
        expect(result.error).toBeNull();
        return result;
      },
    }),

    testRLSPolicies: (userRoles: string[]) => ({
      unauthenticated: () => RLSTestHelpers.testUnauthenticatedAccess(mockClient, tableName),
      authorized: (role: string) =>
        RLSTestHelpers.testAuthorizedAccess(mockClient, tableName, { role }),
      unauthorized: (role: string) =>
        RLSTestHelpers.testWrongUserAccess(mockClient, tableName, { role }),
    }),

    mockClient: () => mockClient,
  };
};

export default {
  MockSupabaseClient,
  RLSTestHelpers,
  MigrationTestHelpers,
  PerformanceTestHelpers,
  createDatabaseTestSuite,
};
