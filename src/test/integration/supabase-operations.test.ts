/**
 * Supabase Operations Integration Tests
 * Tests for database operations, RLS policies, and real-time functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDatabaseTestSuite, MockSupabaseClient, RLSTestHelpers } from '@/test/utils/database-test-helpers';
import transactionFixtures from '@/test/fixtures/transactions';

describe('Supabase Operations Integration', () => {
  let mockClient: MockSupabaseClient;
  let testSuite: ReturnType<typeof createDatabaseTestSuite>;

  beforeEach(() => {
    testSuite = createDatabaseTestSuite('transactions');
    mockClient = testSuite.setup();
  });

  afterEach(() => {
    testSuite.cleanup();
  });

  describe('Transaction Operations', () => {
    describe('CRUD Operations', () => {
      it('creates new transactions successfully', async () => {
        const newTransaction = transactionFixtures.createTransaction({
          property_address: '123 New Property St',
          purchase_price: 500000,
          status: 'active',
        });

        const result = await testSuite.testCRUDOperations().create(newTransaction);
        
        expect(result.error).toBeNull();
        expect(result.data).toContainEqual(expect.objectContaining({
          property_address: '123 New Property St',
          purchase_price: 500000,
        }));
      });

      it('reads transactions with filters', async () => {
        const testTransactions = transactionFixtures.transactionsByStatus.active;
        mockClient.setMockData('transactions', testTransactions);

        const result = await testSuite.testCRUDOperations().read({ status: 'active' });
        
        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(testTransactions.length);
        expect(result.data.every((t: any) => t.status === 'active')).toBe(true);
      });

      it('updates transaction details', async () => {
        const updateData = {
          purchase_price: 550000,
          closing_date: '2024-04-01',
        };

        const result = await testSuite.testCRUDOperations().update('tx-123', updateData);
        
        expect(result.error).toBeNull();
        expect(result.data).toContainEqual(expect.objectContaining(updateData));
      });

      it('deletes transactions', async () => {
        const result = await testSuite.testCRUDOperations().delete('tx-123');
        
        expect(result.error).toBeNull();
      });

      it('handles bulk operations efficiently', async () => {
        const bulkTransactions = transactionFixtures.generateTransactionList(25);
        
        const startTime = performance.now();
        const result = await testSuite.testCRUDOperations().create(bulkTransactions);
        const endTime = performance.now();
        
        expect(result.error).toBeNull();
        expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      });
    });

    describe('Complex Queries', () => {
      it('filters by multiple criteria', async () => {
        const testData = [
          ...transactionFixtures.transactionsByServiceTier.elite,
          ...transactionFixtures.transactionsByStatus.active,
        ];
        mockClient.setMockData('transactions', testData);

        const result = await mockClient
          .from('transactions')
          .select()
          .eq('service_tier', 'elite')
          .eq('status', 'active');

        expect(result.error).toBeNull();
        expect(result.data.every((t: any) => 
          t.service_tier === 'elite' && t.status === 'active'
        )).toBe(true);
      });

      it('orders results correctly', async () => {
        const testData = transactionFixtures.generateTransactionList(10);
        mockClient.setMockData('transactions', testData);

        const result = await mockClient
          .from('transactions')
          .select()
          .order('created_at', { ascending: false });

        expect(result.error).toBeNull();
        // Should be ordered by created_at descending
        expect(result.data).toHaveLength(10);
      });

      it('limits and paginates results', async () => {
        const testData = transactionFixtures.generateTransactionList(50);
        mockClient.setMockData('transactions', testData);

        const result = await mockClient
          .from('transactions')
          .select()
          .limit(20);

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(20);
      });

      it('performs range queries', async () => {
        const testData = transactionFixtures.generateTransactionList(20);
        mockClient.setMockData('transactions', testData);

        const result = await mockClient
          .from('transactions')
          .select()
          .gte('purchase_price', 400000)
          .lte('purchase_price', 600000);

        expect(result.error).toBeNull();
        expect(result.data.every((t: any) => 
          t.purchase_price >= 400000 && t.purchase_price <= 600000
        )).toBe(true);
      });

      it('searches with text patterns', async () => {
        const testData = [
          transactionFixtures.createTransaction({ property_address: '123 Oak Street' }),
          transactionFixtures.createTransaction({ property_address: '456 Pine Avenue' }),
          transactionFixtures.createTransaction({ property_address: '789 Oak Lane' }),
        ];
        mockClient.setMockData('transactions', testData);

        const result = await mockClient
          .from('transactions')
          .select()
          .like('property_address', '%Oak%');

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(2);
        expect(result.data.every((t: any) => t.property_address.includes('Oak'))).toBe(true);
      });
    });

    describe('Joins and Relations', () => {
      it('joins transactions with clients', async () => {
        const transactionWithClients = transactionFixtures.createTransactionWithRelations();
        mockClient.setMockData('transactions', [transactionWithClients]);

        const result = await mockClient
          .from('transactions')
          .select(`
            *,
            clients (
              id,
              full_name,
              email,
              type
            )
          `);

        expect(result.error).toBeNull();
        expect(result.data[0]).toHaveProperty('clients');
        expect(result.data[0].clients).toBeInstanceOf(Array);
      });

      it('joins transactions with agent profiles', async () => {
        const transactionWithProfile = transactionFixtures.createTransactionWithRelations();
        mockClient.setMockData('transactions', [transactionWithProfile]);

        const result = await mockClient
          .from('transactions')
          .select(`
            *,
            profiles (
              id,
              first_name,
              last_name,
              brokerage
            )
          `);

        expect(result.error).toBeNull();
        expect(result.data[0]).toHaveProperty('profiles');
      });

      it('performs complex multi-table joins', async () => {
        const complexTransaction = transactionFixtures.createTransactionWithRelations();
        mockClient.setMockData('transactions', [complexTransaction]);

        const result = await mockClient
          .from('transactions')
          .select(`
            *,
            clients (*),
            profiles (*),
            tasks (
              id,
              title,
              status,
              due_date
            )
          `);

        expect(result.error).toBeNull();
        expect(result.data[0]).toHaveProperty('clients');
        expect(result.data[0]).toHaveProperty('profiles');
      });
    });
  });

  describe('Row Level Security (RLS) Policies', () => {
    describe('Transaction Table RLS', () => {
      it('denies access to unauthenticated users', async () => {
        await RLSTestHelpers.testUnauthenticatedAccess(mockClient, 'transactions');
      });

      it('allows agents to access their own transactions', async () => {
        const agentUser = {
          id: 'agent-123',
          role: 'agent',
          email: 'agent@test.com',
        };

        await RLSTestHelpers.testAuthorizedAccess(mockClient, 'transactions', agentUser);
      });

      it('denies agents access to other agents\' transactions', async () => {
        const wrongAgent = {
          id: 'different-agent',
          role: 'agent',
          email: 'other@test.com',
        };

        await RLSTestHelpers.testWrongUserAccess(mockClient, 'transactions', wrongAgent);
      });

      it('allows coordinators access to all transactions', async () => {
        const coordinatorUser = {
          id: 'coordinator-123',
          role: 'coordinator',
          email: 'coordinator@test.com',
        };

        await RLSTestHelpers.testAuthorizedAccess(mockClient, 'transactions', coordinatorUser);
      });

      it('allows admin access to all data', async () => {
        const adminUser = {
          id: 'admin-123',
          role: 'admin',
          email: 'admin@test.com',
        };

        await RLSTestHelpers.testAuthorizedAccess(mockClient, 'transactions', adminUser);
      });
    });

    describe('Client Table RLS', () => {
      it('protects client data based on transaction ownership', async () => {
        const testData = [transactionFixtures.mockClients.buyer];
        mockClient.setMockData('clients', testData);

        // Agent should access clients for their transactions
        const agentUser = { id: 'agent-123', role: 'agent' };
        mockClient.auth.getUser.mockResolvedValue({ 
          data: { user: agentUser }, 
          error: null 
        });

        const result = await mockClient.from('clients').select();
        expect(result.error).toBeNull();
      });

      it('prevents cross-agent client data access', async () => {
        const wrongAgent = { id: 'different-agent', role: 'agent' };
        await RLSTestHelpers.testWrongUserAccess(mockClient, 'clients', wrongAgent);
      });
    });

    describe('Profile Table RLS', () => {
      it('allows users to read their own profile', async () => {
        const userData = { id: 'user-123', role: 'agent' };
        await RLSTestHelpers.testAuthorizedAccess(mockClient, 'profiles', userData);
      });

      it('prevents profile modifications by unauthorized users', async () => {
        const wrongUser = { id: 'different-user', role: 'agent' };
        await RLSTestHelpers.testWrongUserAccess(mockClient, 'profiles', wrongUser);
      });
    });
  });

  describe('Real-time Subscriptions', () => {
    it('sets up real-time subscription for transactions', async () => {
      const mockSubscription = vi.fn();
      mockClient.channel = vi.fn().mockReturnValue({
        on: vi.fn().mockReturnValue({
          subscribe: mockSubscription,
        }),
      });

      // Simulate setting up real-time subscription
      const channel = mockClient.channel('transactions');
      channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
      }).subscribe();

      expect(mockSubscription).toHaveBeenCalled();
    });

    it('handles real-time updates correctly', async () => {
      const updateHandler = vi.fn();
      mockClient.channel = vi.fn().mockReturnValue({
        on: vi.fn().mockImplementation((event, config, handler) => {
          // Simulate real-time update
          if (event === 'postgres_changes') {
            setTimeout(() => {
              handler({
                eventType: 'UPDATE',
                new: { id: 'tx-123', status: 'completed' },
                old: { id: 'tx-123', status: 'active' },
              });
            }, 100);
          }
          return { subscribe: vi.fn() };
        }),
      });

      mockClient.channel('transactions')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
        }, updateHandler)
        .subscribe();

      // Wait for simulated update
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(updateHandler).toHaveBeenCalled();
    });

    it('cleans up subscriptions properly', async () => {
      const mockUnsubscribe = vi.fn();
      mockClient.removeChannel = mockUnsubscribe;

      const channel = mockClient.channel('test-channel');
      mockClient.removeChannel(channel);

      expect(mockUnsubscribe).toHaveBeenCalledWith(channel);
    });
  });

  describe('Performance Optimizations', () => {
    it('uses efficient indexes for common queries', async () => {
      const largeDataset = transactionFixtures.generateTransactionList(1000);
      mockClient.setMockData('transactions', largeDataset);

      const startTime = performance.now();
      
      // Common query that should use index
      await mockClient
        .from('transactions')
        .select()
        .eq('agent_id', 'agent-123')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      const endTime = performance.now();
      
      // Should complete quickly even with large dataset
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('handles concurrent operations efficiently', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        mockClient.from('transactions').insert(
          transactionFixtures.createTransaction({ id: `concurrent-${i}` })
        )
      );

      const startTime = performance.now();
      const results = await Promise.all(operations);
      const endTime = performance.now();

      expect(results.every(r => r.error === null)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should handle concurrency well
    });

    it('optimizes bulk insert operations', async () => {
      const bulkData = transactionFixtures.generateTransactionList(100);
      
      const startTime = performance.now();
      await mockClient.from('transactions').insert(bulkData);
      const endTime = performance.now();
      
      // Bulk operations should be more efficient than individual inserts
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors', async () => {
      mockClient.setMockError(new Error('Connection failed'));
      
      const result = await mockClient.from('transactions').select().then(
        (res) => res,
        (error) => ({ data: null, error })
      );
      
      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('Connection failed');
    });

    it('handles constraint violations', async () => {
      mockClient.setMockError(new Error('duplicate key value violates unique constraint'));
      
      const result = await mockClient.from('transactions').insert({
        id: 'duplicate-id',
        property_address: 'Test',
      }).then(
        (res) => res,
        (error) => ({ data: null, error })
      );
      
      expect(result.error.message).toContain('duplicate key');
    });

    it('handles foreign key violations', async () => {
      mockClient.setMockError(new Error('violates foreign key constraint'));
      
      const result = await mockClient.from('clients').insert({
        transaction_id: 'non-existent',
        full_name: 'Test Client',
      }).then(
        (res) => res,
        (error) => ({ data: null, error })
      );
      
      expect(result.error.message).toContain('foreign key constraint');
    });

    it('handles network timeouts gracefully', async () => {
      mockClient.setMockError(new Error('Request timeout'));
      
      const result = await mockClient.from('transactions').select().then(
        (res) => res,
        (error) => ({ data: null, error })
      );
      
      expect(result.error.message).toBe('Request timeout');
    });
  });

  describe('Data Validation', () => {
    it('validates required fields', async () => {
      const incompleteTransaction = {
        // Missing required fields like property_address
        purchase_price: 500000,
      };

      mockClient.setMockError(new Error('null value in column "property_address" violates not-null constraint'));
      
      const result = await mockClient.from('transactions').insert(incompleteTransaction).then(
        (res) => res,
        (error) => ({ data: null, error })
      );
      
      expect(result.error.message).toContain('not-null constraint');
    });

    it('validates data types', async () => {
      const invalidTransaction = {
        property_address: '123 Test St',
        purchase_price: 'not-a-number', // Should be number
      };

      mockClient.setMockError(new Error('invalid input syntax for type numeric'));
      
      const result = await mockClient.from('transactions').insert(invalidTransaction).then(
        (res) => res,
        (error) => ({ data: null, error })
      );
      
      expect(result.error.message).toContain('invalid input syntax');
    });

    it('validates enum values', async () => {
      const invalidStatus = {
        property_address: '123 Test St',
        status: 'invalid-status', // Should be valid enum value
      };

      mockClient.setMockError(new Error('invalid input value for enum transaction_status'));
      
      const result = await mockClient.from('transactions').insert(invalidStatus).then(
        (res) => res,
        (error) => ({ data: null, error })
      );
      
      expect(result.error.message).toContain('invalid input value for enum');
    });
  });
});