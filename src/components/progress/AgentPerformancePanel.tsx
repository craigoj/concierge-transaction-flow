
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Clock, CheckCircle, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { TransactionWithProgress } from '@/types/progress';

interface AgentPerformancePanelProps {
  agentId?: string;
  transactions: TransactionWithProgress[];
  className?: string;
}

type MetricType = 'efficiency' | 'quality' | 'volume';

export const AgentPerformancePanel: React.FC<AgentPerformancePanelProps> = ({
  agentId,
  transactions,
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('efficiency');

  // Calculate metrics using available data
  const activeTransactions = transactions.filter(t => t.status === 'active').length;
  const completedTransactions = transactions.filter(t => t.status === 'closed').length;
  const totalTransactions = transactions.length;
  
  const avgPhaseDuration = transactions.length > 0 
    ? Math.round(transactions.reduce((sum, t) => {
        const days = t.created_at 
          ? Math.floor((Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        return sum + days;
      }, 0) / transactions.length)
    : 0;

  const completionRate = totalTransactions > 0 
    ? Math.round((completedTransactions / totalTransactions) * 100)
    : 0;

  // Identify bottlenecks - using status as a proxy for risk
  const bottlenecks = transactions
    .filter(t => t.status === 'active') // Use active transactions as potential bottlenecks
    .slice(0, 3);

  const getMetricTrend = (value: number) => {
    // Mock trend calculation - in real app, compare with historical data
    const isPositive = Math.random() > 0.5;
    return {
      direction: isPositive ? 'up' as const : 'down' as const,
      percentage: Math.floor(Math.random() * 20) + 1
    };
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { direction: 'up' | 'down'; percentage: number };
  }> = ({ title, value, icon, trend }) => (
    <Card className="bg-gradient-to-br from-gray-50 to-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
          {trend && (
            <Badge 
              variant={trend.direction === 'up' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}%
            </Badge>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900 mt-2">
          {value}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`agent-performance-panel space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          {/* Metric Selector */}
          <div className="flex gap-1 mt-3">
            {['efficiency', 'quality', 'volume'].map((metric) => (
              <Button
                key={metric}
                variant={selectedMetric === metric ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric(metric as MetricType)}
                className="text-xs capitalize"
              >
                {metric}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="space-y-3">
            <MetricCard
              title="Active Transactions"
              value={activeTransactions}
              icon={<Building2 className="h-4 w-4 text-blue-600" />}
              trend={getMetricTrend(activeTransactions)}
            />
            
            <MetricCard
              title="Avg. Phase Duration"
              value={`${avgPhaseDuration} days`}
              icon={<Clock className="h-4 w-4 text-orange-600" />}
              trend={getMetricTrend(avgPhaseDuration)}
            />
            
            <MetricCard
              title="Completion Rate"
              value={`${completionRate}%`}
              icon={<CheckCircle className="h-4 w-4 text-green-600" />}
              trend={getMetricTrend(completionRate)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck Analysis */}
      {bottlenecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottlenecks.map((transaction, index) => (
                <div key={transaction.id} className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="destructive" className="text-xs">
                      active
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.property_address}
                    </p>
                    <p className="text-xs text-gray-600">
                      {transaction.clients?.[0]?.full_name || 'No client'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Tier Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Service Tier Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['buyer_core', 'buyer_elite', 'white_glove_buyer'].map((tier) => {
              const count = transactions.filter(t => t.service_tier === tier).length;
              const percentage = totalTransactions > 0 ? (count / totalTransactions) * 100 : 0;
              
              return (
                <div key={tier} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {tier.replace('buyer_', '').replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
