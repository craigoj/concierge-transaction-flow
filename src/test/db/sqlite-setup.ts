import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface TestDatabase {
  db: Database.Database
  close: () => void
  reset: () => void
}

export function createTestDatabase(): TestDatabase {
  // Create in-memory database for speed
  const db = new Database(':memory:')
  
  // Enable foreign key constraints
  db.exec('PRAGMA foreign_keys = ON')
  
  // Read and execute schema
  const schemaPath = join(__dirname, 'sqlite-schema.sql')
  const schema = readFileSync(schemaPath, 'utf-8')
  db.exec(schema)

  return {
    db,
    close: () => db.close(),
    reset: () => {
      // Clear all tables but keep schema
      const tables = [
        'automation_audit_logs',
        'workflow_executions',
        'workflow_instances',
        'notifications',
        'documents',
        'tasks',
        'clients',
        'transactions',
        'automation_rules',
        'workflow_templates',
        'profiles'
      ]
      
      for (const table of tables) {
        db.prepare(`DELETE FROM ${table}`).run()
      }
    }
  }
}

// Test data seeders
export function seedTestData(db: Database.Database) {
  // Insert test profiles
  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, first_name, last_name, email, role, created_at) 
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  insertProfile.run('agent-1', 'John', 'Doe', 'john@example.com', 'agent', '2024-01-01T10:00:00Z')
  insertProfile.run('agent-2', 'Jane', 'Smith', 'jane@example.com', 'agent', '2024-01-01T10:00:00Z')
  insertProfile.run('coordinator-1', 'Admin', 'User', 'admin@example.com', 'coordinator', '2024-01-01T10:00:00Z')

  // Insert test transactions
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (
      id, agent_id, property_address, city, state, zip_code, 
      purchase_price, commission_rate, closing_date, status, 
      transaction_type, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  insertTransaction.run(
    'txn-1', 'agent-1', '123 Main St', 'Norfolk', 'VA', '23510',
    500000, 0.03, '2024-02-20T10:00:00Z', 'active', 'buyer', '2024-02-01T10:00:00Z'
  )
  insertTransaction.run(
    'txn-2', 'agent-1', '456 Oak Ave', 'Virginia Beach', 'VA', '23451',
    750000, 0.025, '2024-03-01T10:00:00Z', 'intake', 'seller', '2024-02-10T10:00:00Z'
  )
  insertTransaction.run(
    'txn-3', 'agent-2', '789 Pine Rd', 'Chesapeake', 'VA', '23320',
    600000, 0.03, '2024-01-30T10:00:00Z', 'closed', 'buyer', '2024-01-15T10:00:00Z'
  )
  insertTransaction.run(
    'txn-4', 'agent-1', '321 Elm St', 'Norfolk', 'VA', '23511',
    450000, 0.035, '2024-02-18T10:00:00Z', 'active', 'seller', '2024-02-05T10:00:00Z'
  )

  // Insert test clients
  const insertClient = db.prepare(`
    INSERT INTO clients (id, transaction_id, full_name, email, type) 
    VALUES (?, ?, ?, ?, ?)
  `)
  
  insertClient.run('client-1', 'txn-1', 'Bob Johnson', 'bob@example.com', 'buyer')
  insertClient.run('client-2', 'txn-2', 'Alice Brown', 'alice@example.com', 'seller')
  insertClient.run('client-3', 'txn-3', 'Charlie Davis', 'charlie@example.com', 'buyer')

  // Insert test tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, transaction_id, title, priority, is_completed, requires_agent_action) 
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  insertTask.run('task-1', 'txn-1', 'Complete contract review', 'high', 0, 1)
  insertTask.run('task-2', 'txn-1', 'Schedule inspection', 'medium', 1, 0)
  insertTask.run('task-3', 'txn-2', 'Prepare listing documents', 'high', 0, 0)
  insertTask.run('task-4', 'txn-3', 'Final walkthrough', 'low', 0, 1)

  // Insert test automation rules
  const insertRule = db.prepare(`
    INSERT INTO automation_rules (id, name, trigger_event, trigger_condition, template_id, created_by) 
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  insertRule.run(
    'rule-1', 
    'Status Change Automation', 
    'status_change',
    JSON.stringify({ type: 'status_change', from_status: 'pending', to_status: 'active' }),
    'template-1',
    'coordinator-1'
  )

  // Insert test workflow templates
  const insertTemplate = db.prepare(`
    INSERT INTO workflow_templates (id, name, type, created_by) 
    VALUES (?, ?, ?, ?)
  `)
  
  insertTemplate.run('template-1', 'Standard Buyer Workflow', 'buyer', 'coordinator-1')
}

// Supabase-like query builder for SQLite
export class SQLiteQueryBuilder {
  private db: Database.Database
  private tableName: string
  private selectFields = '*'
  private whereConditions: Array<{ field: string; operator: string; value: any }> = []
  private orderByField?: string
  private orderDirection = 'ASC'
  private limitCount?: number

  constructor(db: Database.Database, tableName: string) {
    this.db = db
    this.tableName = tableName
  }

  select(fields = '*') {
    this.selectFields = fields
    return this
  }

  eq(field: string, value: any) {
    // Convert boolean values to SQLite integers
    let sqliteValue = value
    if (typeof value === 'boolean') {
      sqliteValue = value ? 1 : 0
    }
    this.whereConditions.push({ field, operator: '=', value: sqliteValue })
    return this
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderByField = field
    this.orderDirection = options.ascending === false ? 'DESC' : 'ASC'
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  async single() {
    const result = await this.execute()
    return {
      data: result.length > 0 ? result[0] : null,
      error: null
    }
  }

  async execute() {
    let query = `SELECT ${this.selectFields} FROM ${this.tableName}`
    const params: any[] = []

    if (this.whereConditions.length > 0) {
      const conditions = this.whereConditions.map(({ field, operator }) => `${field} ${operator} ?`)
      query += ` WHERE ${conditions.join(' AND ')}`
      params.push(...this.whereConditions.map(({ value }) => value))
    }

    if (this.orderByField) {
      query += ` ORDER BY ${this.orderByField} ${this.orderDirection}`
    }

    if (this.limitCount) {
      query += ` LIMIT ${this.limitCount}`
    }

    try {
      const stmt = this.db.prepare(query)
      const result = stmt.all(...params)
      return result
    } catch (error) {
      throw error
    }
  }

  // Resolve method to match Supabase's Promise-like interface
  then(onFulfilled?: (value: { data: any[]; error: null }) => any, onRejected?: (reason: any) => any) {
    return this.execute()
      .then(data => ({ data, error: null }))
      .then(onFulfilled, onRejected)
  }

  // Insert operation
  insert(values: Record<string, any> | Record<string, any>[]) {
    const valuesToInsert = Array.isArray(values) ? values : [values]
    
    try {
      const results = []
      for (const value of valuesToInsert) {
        // Filter out undefined values and serialize objects to JSON
        const cleanValue: Record<string, any> = {}
        for (const [key, val] of Object.entries(value)) {
          if (val !== undefined) {
            // Convert objects/arrays to JSON strings for SQLite
            if (typeof val === 'object' && val !== null) {
              cleanValue[key] = JSON.stringify(val)
            } else {
              cleanValue[key] = val
            }
          }
        }
        
        const fields = Object.keys(cleanValue)
        const placeholders = fields.map(() => '?').join(', ')
        const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`
        
        const stmt = this.db.prepare(query)
        const result = stmt.run(...fields.map(field => cleanValue[field]))
        results.push({ ...cleanValue, id: cleanValue.id || result.lastInsertRowid })
      }
      
      // Return an object that supports chaining .select()
      return {
        data: Array.isArray(values) ? results : results[0],
        error: null,
        select: (fields = '*') => {
          return {
            single: () => {
              const lastResult = results[results.length - 1]
              return Promise.resolve({
                data: lastResult,
                error: null
              })
            }
          }
        }
      }
    } catch (error) {
      return {
        data: null,
        error: error,
        select: () => ({
          single: () => Promise.resolve({ data: null, error: error })
        })
      }
    }
  }

  // Update operation
  update(values: Record<string, any>) {
    // Clean and serialize values similar to insert
    const cleanValues: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val !== undefined) {
        if (typeof val === 'object' && val !== null) {
          cleanValues[key] = JSON.stringify(val)
        } else {
          cleanValues[key] = val
        }
      }
    }

    // Return an object that supports chaining .eq()
    return {
      eq: (field: string, value: any) => {
        try {
          const fields = Object.keys(cleanValues)
          const setClause = fields.map(field => `${field} = ?`).join(', ')
          
          // Convert boolean values for SQLite
          let sqliteValue = value
          if (typeof value === 'boolean') {
            sqliteValue = value ? 1 : 0
          }
          
          const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${field} = ?`
          const params = [...fields.map(field => cleanValues[field]), sqliteValue]

          const stmt = this.db.prepare(query)
          const result = stmt.run(...params)
          
          return Promise.resolve({
            data: { changes: result.changes },
            error: null
          })
        } catch (error) {
          return Promise.resolve({
            data: null,
            error: error
          })
        }
      }
    }
  }
}

// Mock Supabase client for SQLite
export function createMockSupabaseClient(db: Database.Database) {
  return {
    from: (tableName: string) => new SQLiteQueryBuilder(db, tableName),
    rpc: (functionName: string, params: any) => {
      // Mock RPC functions
      if (functionName === 'apply_workflow_template') {
        // Simulate applying a workflow template
        const { p_transaction_id, p_template_id, p_applied_by } = params
        
        // Insert a workflow instance record
        const insertWorkflowInstance = db.prepare(`
          INSERT INTO workflow_instances (id, transaction_id, template_id, applied_by, status) 
          VALUES (?, ?, ?, ?, ?)
        `)
        
        const instanceId = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        insertWorkflowInstance.run(instanceId, p_transaction_id, p_template_id, p_applied_by || null, 'active')
        
        return Promise.resolve({
          data: instanceId,
          error: null
        })
      }
      
      return Promise.resolve({
        data: null,
        error: new Error(`Unknown RPC function: ${functionName}`)
      })
    }
  }
}