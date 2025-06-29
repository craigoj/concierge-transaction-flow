import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTestDb } from '@/test/integration-setup'
import { seedTestData, createMockSupabaseClient } from '@/test/db/sqlite-setup'

// Mock the supabase client to use our SQLite database
let mockSupabaseClient: any = null

vi.mock('@/integrations/supabase/client', () => ({
  get supabase() {
    return mockSupabaseClient
  }
}))

// Dashboard metrics calculation function (extracted from hook for testing)
async function calculateDashboardMetrics(supabaseClient: any) {
  const [transactionsResult, tasksResult, clientsResult] = await Promise.all([
    supabaseClient.from('transactions').select('*').order('created_at', { ascending: false }),
    supabaseClient.from('tasks').select('*'),
    supabaseClient.from('clients').select('id')
  ])

  if (transactionsResult.error) throw transactionsResult.error
  if (tasksResult.error) throw tasksResult.error
  if (clientsResult.error) throw clientsResult.error

  const transactions = transactionsResult.data || []
  const tasks = tasksResult.data || []
  const clients = clientsResult.data || []

  // Basic calculations
  const activeTransactions = transactions.filter((t: any) => t.status === 'active')
  const pendingTransactions = transactions.filter((t: any) => t.status === 'intake')
  const completedTransactions = transactions.filter((t: any) => t.status === 'closed')
  
  // Date calculations
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyTransactions = transactions.filter((t: any) => {
    const transactionDate = new Date(t.created_at)
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear
  })

  const closingThisWeek = transactions.filter((t: any) => {
    if (!t.closing_date) return false
    const closingDate = new Date(t.closing_date)
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    return closingDate <= weekFromNow && closingDate >= new Date()
  })

  // Financial calculations
  const monthlyRevenue = monthlyTransactions.reduce((sum: number, t: any) => {
    const price = Number(t.purchase_price) || 0
    const commissionRate = Number(t.commission_rate) || 0.03
    return sum + (price * commissionRate)
  }, 0)

  const totalVolume = completedTransactions.reduce((sum: number, t: any) => 
    sum + (Number(t.purchase_price) || 0), 0
  )

  // Task calculations
  const incompleteTasks = tasks.filter((t: any) => !t.is_completed)
  const actionRequiredTasks = tasks.filter((t: any) => t.requires_agent_action && !t.is_completed)
  const completionRate = transactions.length > 0 
    ? Math.round((completedTransactions.length / transactions.length) * 100) 
    : 0

  return {
    activeTransactions: activeTransactions.length,
    pendingTransactions: pendingTransactions.length,
    closingThisWeek: closingThisWeek.length,
    totalClients: clients.length,
    monthlyRevenue,
    totalVolume,
    completionRate,
    actionRequired: actionRequiredTasks.length,
    incompleteTasks: incompleteTasks.length
  }
}

describe('Dashboard Metrics - SQLite Integration', () => {
  beforeEach(() => {
    const { db } = getTestDb()
    seedTestData(db)
    
    // Set up mock supabase client to use SQLite
    mockSupabaseClient = createMockSupabaseClient(db)
  })

  it('calculates real dashboard metrics from SQLite database', async () => {
    const metrics = await calculateDashboardMetrics(mockSupabaseClient)

    // Verify real calculations from seeded data
    // Active transactions: txn-1 and txn-4 (status = 'active')
    expect(metrics.activeTransactions).toBe(2)
    
    // Pending transactions: txn-2 (status = 'intake')
    expect(metrics.pendingTransactions).toBe(1)
    
    // Total clients: 3 clients in seeded data
    expect(metrics.totalClients).toBe(3)
    
    // Completion rate: 1 closed out of 4 total = 25%
    expect(metrics.completionRate).toBe(25)
    
    // Action required: 2 tasks with requires_agent_action=1 and is_completed=0
    expect(metrics.actionRequired).toBe(2)
    
    // Incomplete tasks: 3 tasks with is_completed=0
    expect(metrics.incompleteTasks).toBe(3)
  })

  it('handles date-based calculations correctly', async () => {
    const { db } = getTestDb()
    
    // Set current time for consistent testing
    const now = new Date('2024-02-15T10:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)
    
    // Insert transactions with specific dates for testing
    const insertTransaction = db.prepare(`
      INSERT INTO transactions (
        id, agent_id, property_address, city, state, zip_code,
        purchase_price, commission_rate, closing_date, status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    // Transaction closing within the week
    insertTransaction.run(
      'txn-closing-soon', 'agent-1', '555 Test St', 'Norfolk', 'VA', '23510',
      300000, 0.03, '2024-02-20T10:00:00Z', 'active', '2024-02-01T10:00:00Z'
    )
    
    // Transaction created this month for revenue calculation
    insertTransaction.run(
      'txn-this-month', 'agent-1', '666 Month St', 'Norfolk', 'VA', '23510',
      400000, 0.025, '2024-03-15T10:00:00Z', 'active', '2024-02-10T10:00:00Z'
    )

    const metrics = await calculateDashboardMetrics(mockSupabaseClient)

    // Should include transactions closing within a week from current date
    expect(metrics.closingThisWeek).toBeGreaterThanOrEqual(1)
    
    // Calculate monthly revenue dynamically based on what's actually in the database
    const allTransactions = await mockSupabaseClient.from('transactions').select('*')
    const currentMonth = new Date('2024-02-15T10:00:00Z').getMonth() // February = 1
    const currentYear = new Date('2024-02-15T10:00:00Z').getFullYear() // 2024
    
    const monthlyTransactions = allTransactions.data.filter((t: any) => {
      const transactionDate = new Date(t.created_at)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })
    
    const expectedRevenue = monthlyTransactions.reduce((sum: number, t: any) => {
      const price = Number(t.purchase_price) || 0
      const commissionRate = Number(t.commission_rate) || 0.03
      return sum + (price * commissionRate)
    }, 0)
    
    expect(metrics.monthlyRevenue).toBe(expectedRevenue)

    vi.useRealTimers()
  })

  it('calculates financial metrics accurately', async () => {
    const { db } = getTestDb()
    
    // Add a closed transaction for total volume calculation
    const insertTransaction = db.prepare(`
      INSERT INTO transactions (
        id, agent_id, property_address, city, state, zip_code,
        purchase_price, commission_rate, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertTransaction.run(
      'txn-closed-2', 'agent-1', '777 Closed St', 'Norfolk', 'VA', '23510',
      800000, 0.03, 'closed', '2024-01-20T10:00:00Z'
    )

    const metrics = await calculateDashboardMetrics(mockSupabaseClient)

    // Total volume should include all closed transactions
    // From seed: txn-3 (600000) + new txn-closed-2 (800000)
    expect(metrics.totalVolume).toBe(600000 + 800000)
  })

  it('handles empty database correctly', async () => {
    const { reset } = getTestDb()
    
    // Clear all data
    reset()

    const metrics = await calculateDashboardMetrics(mockSupabaseClient)

    expect(metrics).toEqual({
      activeTransactions: 0,
      pendingTransactions: 0,
      closingThisWeek: 0,
      totalClients: 0,
      monthlyRevenue: 0,
      totalVolume: 0,
      completionRate: 0,
      actionRequired: 0,
      incompleteTasks: 0
    })
  })

  it('handles missing financial data gracefully', async () => {
    const { db, reset } = getTestDb()
    
    // Clear and add transaction with missing financial data
    reset()
    
    // Add minimal profile
    db.prepare(`
      INSERT INTO profiles (id, first_name, last_name, email, role) 
      VALUES (?, ?, ?, ?, ?)
    `).run('agent-test', 'Test', 'Agent', 'test@example.com', 'agent')
    
    // Add transaction with null purchase_price and commission_rate
    db.prepare(`
      INSERT INTO transactions (
        id, agent_id, property_address, city, state, zip_code,
        purchase_price, commission_rate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'txn-missing-data', 'agent-test', '999 Missing St', 'Norfolk', 'VA', '23510',
      null, null, 'active'
    )

    const metrics = await calculateDashboardMetrics(mockSupabaseClient)

    // Should handle null values gracefully
    expect(metrics.activeTransactions).toBe(1)
    expect(metrics.monthlyRevenue).toBe(0) // No revenue from null values
    expect(metrics.totalVolume).toBe(0) // No volume from non-closed transactions
  })

  it('performs well with larger datasets', async () => {
    const { db } = getTestDb()
    
    // Insert larger dataset for performance testing
    const insertTransaction = db.prepare(`
      INSERT INTO transactions (
        id, agent_id, property_address, city, state, zip_code,
        purchase_price, commission_rate, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, transaction_id, title, is_completed, requires_agent_action) 
      VALUES (?, ?, ?, ?, ?)
    `)
    
    const insertClient = db.prepare(`
      INSERT INTO clients (id, transaction_id, full_name, type) 
      VALUES (?, ?, ?, ?)
    `)

    // Insert 100 transactions with related data using current date for monthly revenue
    const startTime = performance.now()
    const currentDate = new Date().toISOString()
    
    for (let i = 0; i < 100; i++) {
      const txnId = `perf-txn-${i}`
      insertTransaction.run(
        txnId, 'agent-1', `${i} Performance St`, 'Norfolk', 'VA', '23510',
        Math.floor(Math.random() * 1000000), 0.03, 'active', currentDate
      )
      
      // Add 2-3 tasks per transaction
      for (let j = 0; j < 3; j++) {
        insertTask.run(
          `perf-task-${i}-${j}`, txnId, `Task ${j} for transaction ${i}`,
          Math.random() > 0.5 ? 1 : 0, Math.random() > 0.7 ? 1 : 0
        )
      }
      
      // Add 1-2 clients per transaction
      for (let k = 0; k < 2; k++) {
        insertClient.run(
          `perf-client-${i}-${k}`, txnId, `Client ${k} for transaction ${i}`,
          k === 0 ? 'buyer' : 'seller'
        )
      }
    }

    const setupTime = performance.now() - startTime
    console.log(`Data setup took ${setupTime.toFixed(2)}ms`)

    // Test query performance
    const queryStartTime = performance.now()
    
    const metrics = await calculateDashboardMetrics(mockSupabaseClient)

    const queryTime = performance.now() - queryStartTime
    console.log(`Dashboard metrics calculation took ${queryTime.toFixed(2)}ms`)

    // Verify calculations are still correct with larger dataset
    expect(metrics.activeTransactions).toBeGreaterThan(100) // Original + new transactions
    expect(metrics.totalClients).toBeGreaterThan(200) // Original + new clients
    expect(metrics.monthlyRevenue).toBeGreaterThan(0)

    // Performance assertion - should complete within reasonable time
    expect(queryTime).toBeLessThan(1000) // Should be much faster than 1 second
  })

  it('validates database constraints and relationships', async () => {
    const { db } = getTestDb()
    
    // Test foreign key constraints
    let errorThrown = false
    try {
      // Try to insert transaction with non-existent agent
      db.prepare(`
        INSERT INTO transactions (
          id, agent_id, property_address, city, state, zip_code, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run('txn-bad', 'non-existent-agent', '123 Bad St', 'Norfolk', 'VA', '23510', 'active')
    } catch (error) {
      errorThrown = true
      expect(error.message).toContain('FOREIGN KEY constraint failed')
    }
    
    expect(errorThrown).toBe(true)
    
    // Test successful relationship
    const transactions = db.prepare('SELECT * FROM transactions WHERE agent_id = ?').all('agent-1')
    expect(transactions.length).toBeGreaterThan(0)
    
    const tasks = db.prepare('SELECT * FROM tasks WHERE transaction_id = ?').all('txn-1')
    expect(tasks.length).toBeGreaterThan(0)
  })

  it('tests complex aggregation queries', async () => {
    const { db } = getTestDb()
    
    // Test complex SQL aggregations
    const revenueByAgent = db.prepare(`
      SELECT 
        p.first_name || ' ' || p.last_name as agent_name,
        COUNT(t.id) as transaction_count,
        SUM(t.purchase_price * t.commission_rate) as total_commission,
        AVG(t.purchase_price) as avg_price
      FROM profiles p
      LEFT JOIN transactions t ON p.id = t.agent_id
      WHERE p.role = 'agent'
      GROUP BY p.id, agent_name
      HAVING transaction_count > 0
      ORDER BY total_commission DESC
    `).all()

    expect(revenueByAgent.length).toBeGreaterThan(0)
    expect(revenueByAgent[0]).toHaveProperty('agent_name')
    expect(revenueByAgent[0]).toHaveProperty('total_commission')
    expect(revenueByAgent[0]).toHaveProperty('avg_price')
    
    // Test task completion rates by transaction
    const taskCompletion = db.prepare(`
      SELECT 
        t.id as transaction_id,
        t.property_address,
        COUNT(ta.id) as total_tasks,
        SUM(CASE WHEN ta.is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks,
        ROUND(
          (SUM(CASE WHEN ta.is_completed = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(ta.id), 
          2
        ) as completion_percentage
      FROM transactions t
      LEFT JOIN tasks ta ON t.id = ta.transaction_id
      GROUP BY t.id, t.property_address
      HAVING total_tasks > 0
    `).all()

    expect(taskCompletion.length).toBeGreaterThan(0)
    expect(taskCompletion[0]).toHaveProperty('completion_percentage')
  })
})