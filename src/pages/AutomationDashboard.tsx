import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  BarChart3
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_event: string;
  trigger_condition: any;
  actions: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AutomationDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch automation rules
  const { data: automationRules, isLoading, error, refetch } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Toggle automation rule status
  const toggleAutomationStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: !currentStatus })
        .eq('id', ruleId);
      if (error) throw error;
      refetch(); // Refresh the data
    } catch (error: any) {
      console.error('Error toggling automation status:', error);
      alert('Failed to toggle automation status');
    }
  };

  if (isLoading) {
    return <div>Loading automations...</div>;
  }

  if (error) {
    return <div>Error loading automations: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Automation Dashboard
          </CardTitle>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>Overview</TabsTrigger>
              <TabsTrigger value="rules" onClick={() => setActiveTab('rules')}>Automation Rules</TabsTrigger>
              <TabsTrigger value="analytics" onClick={() => setActiveTab('analytics')}>Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Total Automations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{automationRules?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Total number of automation rules</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Active Automations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{automationRules?.filter(rule => rule.is_active).length || 0}</div>
                    <p className="text-sm text-muted-foreground">Number of currently active automations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Automation Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">85%</div>
                    <p className="text-sm text-muted-foreground">Average success rate of automations</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="rules">
              <h2 className="text-xl font-semibold mb-4">Automation Rules</h2>
              <div className="grid gap-4">
                {automationRules?.map(rule => (
                  <Card key={rule.id} className="border">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{rule.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="secondary">{rule.trigger_event}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAutomationStatus(rule.id, rule.is_active)}
                        >
                          {rule.is_active ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="analytics">
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <p>Detailed analytics and performance metrics for your automations.</p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Coming soon: Charts and graphs to visualize automation performance.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationDashboard;
