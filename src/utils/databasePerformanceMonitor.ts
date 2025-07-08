
import { supabase } from '@/integrations/supabase/client';

export class DatabasePerformanceMonitor {
  static async benchmarkCommonQueries(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    
    try {
      // Benchmark transaction queries
      const transactionStart = performance.now();
      await supabase
        .from('transactions')
        .select('id, property_address, status, agent_id')
        .limit(100);
      results.transactions = performance.now() - transactionStart;

      // Benchmark task queries
      const taskStart = performance.now();
      await supabase
        .from('tasks')
        .select('id, title, is_completed, transaction_id')
        .eq('is_completed', false)
        .limit(100);
      results.tasks = performance.now() - taskStart;

      // Benchmark client queries
      const clientStart = performance.now();
      await supabase
        .from('clients')
        .select('id, full_name, email, transaction_id')
        .limit(100);
      results.clients = performance.now() - clientStart;

      // Benchmark document queries
      const documentStart = performance.now();
      await supabase
        .from('documents')
        .select('id, file_name, transaction_id, is_agent_visible')
        .eq('is_agent_visible', true)
        .limit(100);
      results.documents = performance.now() - documentStart;

      // Benchmark notification queries
      const notificationStart = performance.now();
      await supabase
        .from('notifications')
        .select('id, message, is_read, user_id')
        .eq('is_read', false)
        .limit(100);
      results.notifications = performance.now() - notificationStart;

    } catch (error) {
      console.error('Benchmark failed:', error);
    }

    return results;
  }

  static async getTableStats(): Promise<Record<string, number | null>> {
    try {
      const { data: transactionCount } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true });

      const { data: taskCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true });

      const { data: clientCount } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true });

      return {
        transactions: transactionCount,
        tasks: taskCount,
        clients: clientCount
      };
    } catch (error) {
      console.error('Failed to get table stats:', error);
      return {};
    }
  }

  static getRecommendedIndexes(): string[] {
    return [
      // Core transaction indexes
      'CREATE INDEX CONCURRENTLY idx_transactions_agent_id ON transactions (agent_id);',
      'CREATE INDEX CONCURRENTLY idx_transactions_status ON transactions (status);',
      'CREATE INDEX CONCURRENTLY idx_transactions_created_at ON transactions (created_at DESC);',
      'CREATE INDEX CONCURRENTLY idx_transactions_agent_status ON transactions (agent_id, status);',
      
      // Task indexes
      'CREATE INDEX CONCURRENTLY idx_tasks_transaction_id ON tasks (transaction_id);',
      'CREATE INDEX CONCURRENTLY idx_tasks_is_completed ON tasks (is_completed);',
      'CREATE INDEX CONCURRENTLY idx_tasks_due_date ON tasks (due_date) WHERE is_completed = false;',
      'CREATE INDEX CONCURRENTLY idx_tasks_agent_action ON tasks (requires_agent_action) WHERE requires_agent_action = true;',
      
      // Client indexes
      'CREATE INDEX CONCURRENTLY idx_clients_transaction_id ON clients (transaction_id);',
      'CREATE INDEX CONCURRENTLY idx_clients_search ON clients USING gin(to_tsvector(\'english\', full_name || \' \' || COALESCE(email, \'\')));',
      
      // Document indexes
      'CREATE INDEX CONCURRENTLY idx_documents_transaction_id ON documents (transaction_id);',
      'CREATE INDEX CONCURRENTLY idx_documents_agent_visible ON documents (is_agent_visible) WHERE is_agent_visible = true;',
      
      // Notification indexes
      'CREATE INDEX CONCURRENTLY idx_notifications_user_id ON notifications (user_id);',
      'CREATE INDEX CONCURRENTLY idx_notifications_unread ON notifications (user_id, is_read) WHERE is_read = false;',
      
      // Agent-specific indexes
      'CREATE INDEX CONCURRENTLY idx_agent_vendors_agent_type ON agent_vendors (agent_id, vendor_type);',
      'CREATE INDEX CONCURRENTLY idx_offer_requests_agent_status ON offer_requests (agent_id, status);'
    ];
  }
}
