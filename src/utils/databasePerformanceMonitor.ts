
import { supabase } from "@/integrations/supabase/client";

export interface IndexUsageStats {
  schemaname: string;
  tablename: string;
  indexname: string;
  idx_tup_read: number;
  idx_tup_fetch: number;
  idx_scan: number;
}

export interface SlowQueryStats {
  query: string;
  calls: number;
  total_time: number;
  mean_time: number;
  stddev_time: number;
}

export const DatabasePerformanceMonitor = {
  async getIndexUsageStats(): Promise<IndexUsageStats[]> {
    const { data, error } = await supabase
      .rpc('get_index_usage_stats');
    
    if (error) {
      console.error('Failed to fetch index usage stats:', error);
      return [];
    }
    
    return data || [];
  },

  async getSlowQueries(): Promise<SlowQueryStats[]> {
    const { data, error } = await supabase
      .rpc('get_slow_queries');
    
    if (error) {
      console.error('Failed to fetch slow queries:', error);
      return [];
    }
    
    return data || [];
  },

  async analyzeQueryPerformance(tableName: string) {
    console.log(`Analyzing performance for table: ${tableName}`);
    
    const startTime = performance.now();
    
    // Example performance test queries
    switch (tableName) {
      case 'transactions':
        await supabase
          .from('transactions')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10);
        break;
        
      case 'tasks':
        await supabase
          .from('tasks')
          .select('*')
          .eq('is_completed', false)
          .not('due_date', 'is', null)
          .order('due_date', { ascending: true })
          .limit(10);
        break;
        
      case 'documents':
        await supabase
          .from('documents')
          .select('*')
          .eq('is_agent_visible', true)
          .order('created_at', { ascending: false })
          .limit(10);
        break;
    }
    
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    
    console.log(`Query time for ${tableName}: ${queryTime.toFixed(2)}ms`);
    return queryTime;
  },

  async benchmarkCommonQueries() {
    console.log('Starting database performance benchmark...');
    
    const results = {
      transactions: await this.analyzeQueryPerformance('transactions'),
      tasks: await this.analyzeQueryPerformance('tasks'),
      documents: await this.analyzeQueryPerformance('documents'),
    };
    
    console.log('Benchmark Results:', results);
    return results;
  }
};
