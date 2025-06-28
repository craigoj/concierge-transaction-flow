
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatabasePerformanceMonitor } from '@/utils/databasePerformanceMonitor';
import { Database, Activity, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const DatabasePerformancePanel = () => {
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, number> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    try {
      const results = await DatabasePerformanceMonitor.benchmarkCommonQueries();
      setBenchmarkResults(results);
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getPerformanceColor = (time: number) => {
    if (time < 50) return 'bg-green-100 text-green-800';
    if (time < 200) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Monitor database query performance and index usage
          </p>
          <Button 
            onClick={runBenchmark} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Run Benchmark
              </>
            )}
          </Button>
        </div>

        {benchmarkResults && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Query Performance Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(benchmarkResults).map(([table, time]) => (
                <div key={table} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{table}</span>
                    <Badge className={getPerformanceColor(time)}>
                      {time.toFixed(2)}ms
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {time < 50 ? 'Excellent' : time < 200 ? 'Good' : 'Needs optimization'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Manual Index Creation Required
          </h4>
          <p className="text-sm text-amber-800 mb-3">
            Due to transaction block limitations, indexes must be created manually. 
            Run these commands individually in your Supabase SQL editor:
          </p>
          <div className="bg-white p-3 rounded border text-xs font-mono space-y-1">
            <div className="text-blue-600 mb-1">-- Core transaction indexes:</div>
            <div>CREATE INDEX CONCURRENTLY idx_transactions_agent_id ON transactions (agent_id);</div>
            <div>CREATE INDEX CONCURRENTLY idx_transactions_status ON transactions (status);</div>
            <div>CREATE INDEX CONCURRENTLY idx_transactions_created_at ON transactions (created_at DESC);</div>
            <div className="mt-2 text-blue-600">-- Task indexes:</div>
            <div>CREATE INDEX CONCURRENTLY idx_tasks_transaction_id ON tasks (transaction_id);</div>
            <div>CREATE INDEX CONCURRENTLY idx_tasks_is_completed ON tasks (is_completed);</div>
            <div className="mt-2 text-muted-foreground">... and continue with remaining indexes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabasePerformancePanel;
