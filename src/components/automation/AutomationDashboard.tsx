
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAutomationRules, useWorkflowExecutions, useRetryExecution } from '@/hooks/queries/useAutomationEngine';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AutomationDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('rules');
  const { data: rules, isLoading: rulesLoading } = useAutomationRules();
  const { data: executions, isLoading: executionsLoading } = useWorkflowExecutions();
  const retryMutation = useRetryExecution();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'running':
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'retrying':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRetry = (executionId: string) => {
    retryMutation.mutate(executionId);
  };

  if (rulesLoading || executionsLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Automation Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage workflow automations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeRulesCount = rules?.filter(rule => rule.is_active).length || 0;
  const recentExecutions = executions?.slice(0, 10) || [];
  const failedExecutions = executions?.filter(ex => ex.status === 'failed').length || 0;
  const successfulExecutions = executions?.filter(ex => ex.status === 'completed').length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Automation Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage workflow automations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{activeRulesCount}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">{executions?.length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successfulExecutions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedExecutions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules?.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Trigger: {rule.trigger_event.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(rule.created_at))} ago
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Toggle rule active status
                          console.log('Toggle rule:', rule.id);
                        }}
                      >
                        {rule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
                {(!rules || rules.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No automation rules configured yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExecutions.map((execution) => {
                  const rule = rules?.find(r => r.id === execution.rule_id);
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <h3 className="font-medium">{rule?.name || 'Unknown Rule'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Transaction: {execution.transaction_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(execution.executed_at))} ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        {execution.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(execution.id)}
                            disabled={retryMutation.isPending}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {recentExecutions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No executions found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationDashboard;
