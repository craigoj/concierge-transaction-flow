
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatabasePerformanceMonitor } from '@/utils/databasePerformanceMonitor';
import { Database, Activity, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const DatabaseOptimizationPanel = () => {
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, number> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showIndexes, setShowIndexes] = useState(false);

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

  const getPerformanceIcon = (time: number) => {
    if (time < 50) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (time < 200) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const recommendedIndexes = DatabasePerformanceMonitor.getRecommendedIndexes();

  return (
    <div className="space-y-6">
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
              Monitor database query performance and optimization status
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
                      <div className="flex items-center gap-2">
                        {getPerformanceIcon(time)}
                        <Badge className={getPerformanceColor(time)}>
                          {time.toFixed(2)}ms
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {time < 50 ? 'Excellent' : time < 200 ? 'Good' : 'Needs optimization'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Phase 6 Database Optimizations Applied:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>✅ Row Level Security policies added for all tables</li>
                <li>✅ Agent/Coordinator access controls implemented</li>
                <li>✅ Helper functions for complex queries created</li>
                <li>⚠️ Performance indexes require manual creation (see below)</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Performance Indexes</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIndexes(!showIndexes)}
              >
                {showIndexes ? 'Hide' : 'Show'} Recommended Indexes
              </Button>
            </div>

            {showIndexes && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h5 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Manual Index Creation Required
                </h5>
                <p className="text-sm text-amber-800 mb-3">
                  Due to transaction block limitations, indexes must be created manually. 
                  Run these commands individually in your Supabase SQL editor:
                </p>
                <div className="bg-white p-3 rounded border text-xs font-mono space-y-1 max-h-60 overflow-y-auto">
                  {recommendedIndexes.map((index, i) => (
                    <div key={i} className="text-blue-600">{index}</div>
                  ))}
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  💡 These indexes will significantly improve query performance for common operations.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RLS Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-green-700">✅ Secured Tables</h5>
              <div className="text-sm space-y-1">
                <div>• Profiles (Agent/Coordinator access)</div>
                <div>• Email Templates (All users read, coordinators manage)</div>
                <div>• Workflow Templates (All users read, coordinators manage)</div>
                <div>• Notifications (User-specific access)</div>
                <div>• Task Templates (All users read, coordinators manage)</div>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-blue-700">🔒 Access Controls</h5>
              <div className="text-sm space-y-1">
                <div>• Agent: Own data + assigned transactions</div>
                <div>• Coordinator: Full system access</div>
                <div>• System: Automated operations allowed</div>
                <div>• Guest: No database access</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseOptimizationPanel;
