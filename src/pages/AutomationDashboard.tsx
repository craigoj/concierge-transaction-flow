import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAutomationRules, useWorkflowExecutions, useRetryExecution } from '@/hooks/queries/useAutomationEngine';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Clock, Settings, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/integrations/supabase/auth';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const AutomationDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { user } = useAuth();
  const { data: rules, isLoading: rulesLoading } = useAutomationRules();
  const { data: executions, isLoading: executionsLoading } = useWorkflowExecutions();
  const retryMutation = useRetryExecution();

  // Enable real-time notifications
  useRealtimeNotifications(user?.id);

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
      <div className="p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="mb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-brand-taupe/20 rounded-xl w-1/3"></div>
            <div className="h-6 bg-brand-taupe/20 rounded-lg w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeRulesCount = rules?.filter(rule => rule.is_active).length || 0;
  const recentExecutions = executions?.slice(0, 10) || [];
  const failedExecutions = executions?.filter(ex => ex.status === 'failed').length || 0;
  const successfulExecutions = executions?.filter(ex => ex.status === 'completed').length || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Premium Header Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
              Automation Dashboard
            </h1>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
              Monitor and manage intelligent workflow automation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.location.href = '/workflows'}
              className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3"
            >
              <Settings className="h-5 w-5" />
              MANAGE RULES
            </Button>
          </div>
        </div>
        <div className="w-24 h-px bg-brand-taupe"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-brand-heading font-medium text-brand-charcoal/70 tracking-wide uppercase">Active Rules</p>
                <p className="text-3xl font-brand-heading font-bold text-brand-charcoal">{activeRulesCount}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-brand-heading font-medium text-brand-charcoal/70 tracking-wide uppercase">Total Executions</p>
                <p className="text-3xl font-brand-heading font-bold text-brand-charcoal">{executions?.length || 0}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-brand-heading font-medium text-brand-charcoal/70 tracking-wide uppercase">Successful</p>
                <p className="text-3xl font-brand-heading font-bold text-green-600">{successfulExecutions}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-brand-heading font-medium text-brand-charcoal/70 tracking-wide uppercase">Failed</p>
                <p className="text-3xl font-brand-heading font-bold text-red-600">{failedExecutions}</p>
              </div>
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="font-brand-heading tracking-wide">OVERVIEW</TabsTrigger>
          <TabsTrigger value="executions" className="font-brand-heading tracking-wide">EXECUTIONS</TabsTrigger>
          <TabsTrigger value="rules" className="font-brand-heading tracking-wide">RULES</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentExecutions.slice(0, 5).map((execution) => {
                    const rule = rules?.find(r => r.id === execution.rule_id);
                    return (
                      <div key={execution.id} className="flex items-center justify-between p-4 border border-brand-taupe/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <h3 className="font-brand-heading font-medium text-brand-charcoal tracking-wide">{rule?.name || 'Unknown Rule'}</h3>
                            <p className="text-xs font-brand-body text-brand-charcoal/60">
                              {formatDistanceToNow(new Date(execution.executed_at))} ago
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(execution.status)} font-brand-heading tracking-wide text-xs`}>
                          {execution.status.toUpperCase()}
                        </Badge>
                      </div>
                    );
                  })}
                  {recentExecutions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-brand-taupe/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-8 w-8 text-brand-taupe" />
                      </div>
                      <p className="font-brand-body text-brand-charcoal/60">No automation activity yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-brand-heading text-brand-charcoal tracking-wide uppercase">Active Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules?.filter(rule => rule.is_active).slice(0, 5).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-brand-taupe/30 rounded-xl">
                      <div>
                        <h3 className="font-brand-heading font-medium text-brand-charcoal tracking-wide">{rule.name}</h3>
                        <p className="text-xs font-brand-body text-brand-charcoal/60 uppercase tracking-wide">
                          {rule.trigger_event.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 font-brand-heading tracking-wide text-xs">
                        ACTIVE
                      </Badge>
                    </div>
                  ))}
                  {activeRulesCount === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-brand-taupe/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Settings className="h-8 w-8 text-brand-taupe" />
                      </div>
                      <p className="font-brand-body text-brand-charcoal/60 mb-4">No active automation rules</p>
                      <Button
                        onClick={() => window.location.href = '/workflows'}
                        className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-6 py-2 rounded-xl"
                      >
                        CREATE RULE
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
      </Tabs>
    </div>
  );
};

export default AutomationDashboard;
