import { describe, it, expect, beforeEach } from 'vitest'
import { getTestDb } from '@/test/integration-setup'
import { seedTestData } from '@/test/db/sqlite-setup'

describe('SQLite Performance and Constraint Testing', () => {
  beforeEach(() => {
    const { db } = getTestDb()
    seedTestData(db)
  })

  describe('Query Performance Benchmarks', () => {
    it('tests large dataset query performance', async () => {
      const { db } = getTestDb()
      
      // Insert large dataset for performance testing
      const startSetup = performance.now()
      
      // Create 1000 transactions
      const insertTransaction = db.prepare(`
        INSERT INTO transactions (
          id, agent_id, property_address, city, state, zip_code,
          purchase_price, commission_rate, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (let i = 0; i < 1000; i++) {
        insertTransaction.run(
          `perf-txn-${i}`,
          'agent-1',
          `${i} Performance St`,
          'Norfolk',
          'VA',
          '23510',
          Math.floor(Math.random() * 1000000) + 100000,
          0.03,
          ['intake', 'active', 'closed'][i % 3],
          new Date(2024, 0, 1 + (i % 365)).toISOString()
        )
      }
      
      // Create 5000 tasks across transactions
      const insertTask = db.prepare(`
        INSERT INTO tasks (id, transaction_id, title, priority, is_completed, requires_agent_action)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      
      for (let i = 0; i < 5000; i++) {
        const txnIndex = i % 1000
        insertTask.run(
          `perf-task-${i}`,
          `perf-txn-${txnIndex}`,
          `Performance Task ${i}`,
          ['low', 'medium', 'high'][i % 3],
          Math.random() > 0.5 ? 1 : 0,
          Math.random() > 0.7 ? 1 : 0
        )
      }
      
      const setupTime = performance.now() - startSetup
      console.log(`Large dataset setup took ${setupTime.toFixed(2)}ms`)
      
      // Test various query patterns
      const queries = [
        {
          name: 'Simple SELECT with WHERE',
          query: 'SELECT COUNT(*) as count FROM transactions WHERE status = ?',
          params: ['active'],
          expectedTime: 50
        },
        {
          name: 'JOIN with aggregation',
          query: `
            SELECT 
              t.status,
              COUNT(ta.id) as task_count,
              AVG(t.purchase_price) as avg_price
            FROM transactions t
            LEFT JOIN tasks ta ON t.id = ta.transaction_id
            WHERE t.created_at >= ?
            GROUP BY t.status
            ORDER BY task_count DESC
          `,
          params: ['2024-01-01T00:00:00Z'],
          expectedTime: 100
        },
        {
          name: 'Complex aggregation with multiple JOINs',
          query: `
            SELECT 
              p.first_name || ' ' || p.last_name as agent_name,
              t.status,
              COUNT(DISTINCT t.id) as transaction_count,
              COUNT(DISTINCT ta.id) as task_count,
              SUM(t.purchase_price * t.commission_rate) as total_commission,
              AVG(t.purchase_price) as avg_price,
              SUM(CASE WHEN ta.is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks
            FROM profiles p
            JOIN transactions t ON p.id = t.agent_id
            LEFT JOIN tasks ta ON t.id = ta.transaction_id
            WHERE p.role = 'agent'
            GROUP BY p.id, agent_name, t.status
            HAVING transaction_count > 10
            ORDER BY total_commission DESC, transaction_count DESC
          `,
          params: [],
          expectedTime: 200
        }
      ]
      
      for (const testQuery of queries) {
        const queryStart = performance.now()
        const result = db.prepare(testQuery.query).all(...testQuery.params)
        const queryTime = performance.now() - queryStart
        
        console.log(`${testQuery.name} took ${queryTime.toFixed(2)}ms`)
        expect(queryTime).toBeLessThan(testQuery.expectedTime)
        expect(result.length).toBeGreaterThan(0)
      }
    })

    it('tests index effectiveness', async () => {
      const { db } = getTestDb()
      
      // First create additional agents for testing (avoid existing agent-1, agent-2)
      const insertAgent = db.prepare(`
        INSERT INTO profiles (id, first_name, last_name, email, role)
        VALUES (?, ?, ?, ?, ?)
      `)
      
      for (let i = 3; i <= 10; i++) {
        insertAgent.run(`agent-${i}`, `Agent${i}`, 'User', `agent${i}@example.com`, 'agent')
      }
      
      // Insert enough data to make indexes matter
      const insertTransaction = db.prepare(`
        INSERT INTO transactions (
          id, agent_id, property_address, city, state, zip_code,
          purchase_price, commission_rate, status, created_at, closing_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      for (let i = 0; i < 5000; i++) {
        insertTransaction.run(
          `idx-txn-${i}`,
          `agent-${(i % 10) + 1}`, // Use existing agent IDs (agent-1 to agent-10)
          `${i} Index St`,
          'Norfolk',
          'VA',
          '23510',
          Math.floor(Math.random() * 1000000),
          0.03,
          ['intake', 'active', 'closed', 'cancelled'][i % 4],
          new Date(2024, i % 12, (i % 28) + 1).toISOString(),
          new Date(2024, (i % 12) + 1, (i % 28) + 1).toISOString()
        )
      }
      
      // Test queries that should benefit from indexes
      const indexTests = [
        {
          name: 'agent_id index',
          query: 'SELECT COUNT(*) FROM transactions WHERE agent_id = ?',
          params: ['agent-1']
        },
        {
          name: 'status index', 
          query: 'SELECT COUNT(*) FROM transactions WHERE status = ?',
          params: ['active']
        },
        {
          name: 'created_at index',
          query: 'SELECT COUNT(*) FROM transactions WHERE created_at >= ?',
          params: ['2024-06-01T00:00:00Z']
        },
        {
          name: 'closing_date index',
          query: 'SELECT COUNT(*) FROM transactions WHERE closing_date BETWEEN ? AND ?',
          params: ['2024-06-01T00:00:00Z', '2024-12-31T23:59:59Z']
        }
      ]
      
      for (const indexTest of indexTests) {
        const start = performance.now()
        const result = db.prepare(indexTest.query).all(...indexTest.params)
        const time = performance.now() - start
        
        console.log(`${indexTest.name} query took ${time.toFixed(2)}ms`)
        expect(time).toBeLessThan(50) // Should be very fast with indexes
        expect(result[0]).toHaveProperty('COUNT(*)')
      }
    })

    it('tests concurrent query performance', async () => {
      const { db } = getTestDb()
      
      // Test multiple concurrent read operations
      const queries = [
        () => db.prepare('SELECT COUNT(*) FROM transactions WHERE status = ?').all('active'),
        () => db.prepare('SELECT COUNT(*) FROM tasks WHERE is_completed = ?').all(1),
        () => db.prepare('SELECT COUNT(*) FROM clients').all(),
        () => db.prepare('SELECT AVG(purchase_price) FROM transactions WHERE status = ?').all('closed'),
        () => db.prepare('SELECT COUNT(*) FROM automation_rules WHERE is_active = ?').all(1)
      ]
      
      const startTime = performance.now()
      
      // Run all queries concurrently (SQLite handles this internally)
      const results = await Promise.all(queries.map(query => 
        new Promise(resolve => {
          const start = performance.now()
          const result = query()
          const time = performance.now() - start
          resolve({ result, time })
        })
      ))
      
      const totalTime = performance.now() - startTime
      
      console.log(`5 concurrent queries took ${totalTime.toFixed(2)}ms total`)
      expect(totalTime).toBeLessThan(100) // Should complete quickly
      
      // Verify all queries returned results
      results.forEach((result: any, index) => {
        expect(result.result.length).toBeGreaterThan(0)
        expect(result.time).toBeLessThan(50)
        console.log(`  Query ${index + 1} took ${result.time.toFixed(2)}ms`)
      })
    })
  })

  describe('Database Constraint Testing', () => {
    it('enforces foreign key constraints correctly', async () => {
      const { db } = getTestDb()
      
      const foreignKeyTests = [
        {
          name: 'transactions.agent_id -> profiles.id',
          insertSql: `
            INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          params: ['fk-test-1', 'non-existent-agent', '123 FK Test St', 'Norfolk', 'VA', '23510', 'active']
        },
        {
          name: 'tasks.transaction_id -> transactions.id',
          insertSql: `
            INSERT INTO tasks (id, transaction_id, title, priority)
            VALUES (?, ?, ?, ?)
          `,
          params: ['fk-task-test', 'non-existent-txn', 'Test Task', 'medium']
        },
        {
          name: 'clients.transaction_id -> transactions.id',
          insertSql: `
            INSERT INTO clients (id, transaction_id, full_name, type)
            VALUES (?, ?, ?, ?)
          `,
          params: ['fk-client-test', 'non-existent-txn', 'Test Client', 'buyer']
        },
        {
          name: 'automation_rules.created_by -> profiles.id',
          insertSql: `
            INSERT INTO automation_rules (id, name, trigger_event, template_id, created_by, trigger_condition)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          params: ['fk-rule-test', 'Test Rule', 'status_change', 'template-1', 'non-existent-user', '{}']
        }
      ]
      
      for (const test of foreignKeyTests) {
        let errorThrown = false
        try {
          db.prepare(test.insertSql).run(...test.params)
        } catch (error) {
          errorThrown = true
          expect(error.message).toContain('FOREIGN KEY constraint failed')
        }
        expect(errorThrown).toBe(true, `${test.name} should enforce foreign key constraint`)
      }
    })

    it('enforces check constraints correctly', async () => {
      const { db } = getTestDb()
      
      const checkConstraintTests = [
        {
          name: 'transactions.status check constraint',
          insertSql: `
            INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          params: ['check-test-1', 'agent-1', '123 Check St', 'Norfolk', 'VA', '23510', 'invalid_status']
        },
        {
          name: 'tasks.priority check constraint',
          insertSql: `
            INSERT INTO tasks (id, transaction_id, title, priority)
            VALUES (?, ?, ?, ?)
          `,
          params: ['check-task-test', 'txn-1', 'Test Task', 'invalid_priority']
        },
        {
          name: 'profiles.role check constraint',
          insertSql: `
            INSERT INTO profiles (id, first_name, last_name, email, role)
            VALUES (?, ?, ?, ?, ?)
          `,
          params: ['check-profile-test', 'Test', 'User', 'test@example.com', 'invalid_role']
        }
      ]
      
      for (const test of checkConstraintTests) {
        let errorThrown = false
        try {
          db.prepare(test.insertSql).run(...test.params)
        } catch (error) {
          errorThrown = true
          expect(error.message).toContain('CHECK constraint failed')
        }
        expect(errorThrown).toBe(true, `${test.name} should enforce check constraint`)
      }
    })

    it('handles unique constraints correctly', async () => {
      const { db } = getTestDb()
      
      // Test primary key uniqueness
      let errorThrown = false
      try {
        // Try to insert duplicate transaction ID
        db.prepare(`
          INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run('txn-1', 'agent-1', '456 Duplicate St', 'Norfolk', 'VA', '23510', 'active')
      } catch (error) {
        errorThrown = true
        expect(error.message).toContain('UNIQUE constraint failed')
      }
      expect(errorThrown).toBe(true)
      
      // Test successful unique insertion
      const validInsert = db.prepare(`
        INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('unique-txn-test', 'agent-1', '789 Unique St', 'Norfolk', 'VA', '23510', 'active')
      
      expect(validInsert.changes).toBe(1)
    })

    it('tests database transaction rollback', async () => {
      const { db } = getTestDb()
      
      // Count initial records
      const initialCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get()
      
      // Test transaction rollback
      let errorOccurred = false
      try {
        db.transaction(() => {
          // Insert valid transaction
          db.prepare(`
            INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run('rollback-test-1', 'agent-1', '123 Rollback St', 'Norfolk', 'VA', '23510', 'active')
          
          // Insert invalid transaction (this should cause rollback)
          db.prepare(`
            INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run('rollback-test-2', 'non-existent-agent', '456 Rollback St', 'Norfolk', 'VA', '23510', 'active')
        })()
      } catch (error) {
        errorOccurred = true
        expect(error.message).toContain('FOREIGN KEY constraint failed')
      }
      
      expect(errorOccurred).toBe(true)
      
      // Verify no records were inserted due to rollback
      const finalCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get()
      expect(finalCount.count).toBe(initialCount.count)
    })
  })

  describe('Data Integrity and Consistency', () => {
    it('maintains referential integrity across complex operations', async () => {
      const { db } = getTestDb()
      
      // Create a complex data setup
      const profileId = 'integrity-agent-1'
      const transactionId = 'integrity-txn-1'
      const taskId = 'integrity-task-1'
      const clientId = 'integrity-client-1'
      
      // Insert related records in correct order
      db.prepare(`
        INSERT INTO profiles (id, first_name, last_name, email, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(profileId, 'Integrity', 'Agent', 'integrity@example.com', 'agent')
      
      db.prepare(`
        INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(transactionId, profileId, '123 Integrity St', 'Norfolk', 'VA', '23510', 'active')
      
      db.prepare(`
        INSERT INTO tasks (id, transaction_id, title, priority, is_completed)
        VALUES (?, ?, ?, ?, ?)
      `).run(taskId, transactionId, 'Integrity Task', 'high', 0)
      
      db.prepare(`
        INSERT INTO clients (id, transaction_id, full_name, type)
        VALUES (?, ?, ?, ?)
      `).run(clientId, transactionId, 'Integrity Client', 'buyer')
      
      // Verify all relationships are intact
      const integrityCheck = db.prepare(`
        SELECT 
          p.id as profile_id,
          p.first_name,
          t.id as transaction_id,
          t.property_address,
          ta.id as task_id,
          ta.title as task_title,
          c.id as client_id,
          c.full_name as client_name
        FROM profiles p
        JOIN transactions t ON p.id = t.agent_id
        JOIN tasks ta ON t.id = ta.transaction_id
        JOIN clients c ON t.id = c.transaction_id
        WHERE p.id = ?
      `).all(profileId)
      
      expect(integrityCheck.length).toBe(1)
      const result = integrityCheck[0]
      expect(result.profile_id).toBe(profileId)
      expect(result.transaction_id).toBe(transactionId)
      expect(result.task_id).toBe(taskId)
      expect(result.client_id).toBe(clientId)
    })

    it('tests cascading operations and cleanup', async () => {
      const { db } = getTestDb()
      
      // Test data cleanup patterns
      const agentId = 'cleanup-agent'
      const transactionIds = ['cleanup-txn-1', 'cleanup-txn-2', 'cleanup-txn-3']
      
      // Create agent with multiple transactions
      db.prepare(`
        INSERT INTO profiles (id, first_name, last_name, email, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(agentId, 'Cleanup', 'Agent', 'cleanup@example.com', 'agent')
      
      for (const txnId of transactionIds) {
        db.prepare(`
          INSERT INTO transactions (id, agent_id, property_address, city, state, zip_code, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(txnId, agentId, `${txnId} Cleanup St`, 'Norfolk', 'VA', '23510', 'active')
        
        // Add tasks for each transaction
        for (let i = 0; i < 3; i++) {
          db.prepare(`
            INSERT INTO tasks (id, transaction_id, title, priority)
            VALUES (?, ?, ?, ?)
          `).run(`${txnId}-task-${i}`, txnId, `Task ${i}`, 'medium')
        }
      }
      
      // Verify initial state
      const initialTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE agent_id = ?').get(agentId)
      const initialTasks = db.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE transaction_id IN (SELECT id FROM transactions WHERE agent_id = ?)
      `).get(agentId)
      
      expect(initialTransactions.count).toBe(3)
      expect(initialTasks.count).toBe(9)
      
      // Test cleanup by deleting tasks for one transaction
      const deletedTasks = db.prepare('DELETE FROM tasks WHERE transaction_id = ?').run('cleanup-txn-1')
      expect(deletedTasks.changes).toBe(3)
      
      // Verify partial cleanup
      const remainingTasks = db.prepare(`
        SELECT COUNT(*) as count FROM tasks 
        WHERE transaction_id IN (SELECT id FROM transactions WHERE agent_id = ?)
      `).get(agentId)
      expect(remainingTasks.count).toBe(6)
    })
  })
})