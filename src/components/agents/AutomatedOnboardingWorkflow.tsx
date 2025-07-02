import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  FileText, 
  Calendar,
  Users,
  Activity
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dueDate?: string;
  completedAt?: string;
  automationType: 'email' | 'task' | 'reminder' | 'integration';
}

interface OnboardingWorkflow {
  id: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  steps: WorkflowStep[];
  createdAt: string;
}

export const AutomatedOnboardingWorkflow = () => {
  const [workflows, setWorkflows] = useState<OnboardingWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      // Load active onboarding workflows
      const { data: agents, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .in('invitation_status', ['sent', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate workflow data (in real implementation, this would come from database)
      const workflowData = agents.map(agent => ({
        id: `workflow-${agent.id}`,
        agentId: agent.id,
        agentName: `${agent.first_name} ${agent.last_name}`,
        status: 'active' as const,
        progress: calculateProgress(agent),
        steps: generateWorkflowSteps(agent),
        createdAt: agent.created_at,
      }));

      setWorkflows(workflowData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading workflows",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (agent: any) => {
    let completed = 0;
    const total = 5; // Total workflow steps

    if (agent.invitation_status === 'sent') completed += 1;
    if (agent.email) completed += 1;
    if (agent.phone_number) completed += 1;
    if (agent.brokerage) completed += 1;
    if (agent.onboarding_completed_at) completed += 1;

    return Math.round((completed / total) * 100);
  };

  const generateWorkflowSteps = (agent: any): WorkflowStep[] => {
    const baseSteps: WorkflowStep[] = [
      {
        id: 'invitation-sent',
        name: 'Welcome Email Sent',
        description: 'Initial welcome email with setup instructions',
        status: agent.invitation_status === 'sent' ? 'completed' : 'pending',
        automationType: 'email',
      },
      {
        id: 'profile-setup',
        name: 'Profile Setup Reminder',
        description: 'Remind agent to complete profile information',
        status: (agent.phone_number && agent.brokerage) ? 'completed' : 'pending',
        automationType: 'reminder',
      },
      {
        id: 'document-upload',
        name: 'Document Upload Request',
        description: 'Request license and certification documents',
        status: 'pending' as const,
        automationType: 'task',
      },
      {
        id: 'calendar-integration',
        name: 'Calendar Integration',
        description: 'Set up calendar sync and availability',
        status: 'pending' as const,
        automationType: 'integration',
      },
      {
        id: 'onboarding-complete',
        name: 'Onboarding Complete',
        description: 'Final confirmation and activation',
        status: agent.onboarding_completed_at ? 'completed' : 'pending',
        automationType: 'email',
      },
    ];

    return baseSteps;
  };

  const executeWorkflowStep = async (workflowId: string, stepId: string) => {
    try {
      // In real implementation, this would trigger the actual automation
      toast({
        title: "Automation Triggered",
        description: "Workflow step has been executed successfully.",
      });

      // Update local state
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedSteps = workflow.steps.map(step => {
            if (step.id === stepId) {
              return { ...step, status: 'in_progress' as const };
            }
            return step;
          });
          return { ...workflow, steps: updatedSteps };
        }
        return workflow;
      }));

      // Simulate completion after delay
      setTimeout(() => {
        setWorkflows(prev => prev.map(workflow => {
          if (workflow.id === workflowId) {
            const updatedSteps = workflow.steps.map(step => {
              if (step.id === stepId) {
                return { 
                  ...step, 
                  status: 'completed' as const,
                  completedAt: new Date().toISOString()
                };
              }
              return step;
            });
            return { ...workflow, steps: updatedSteps };
          }
          return workflow;
        }));
      }, 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Automation Failed",
        description: error.message,
      });
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.automationType) {
      case 'email': return <Send className="h-4 w-4" />;
      case 'task': return <FileText className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'integration': return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Workflows...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeWorkflows = workflows.filter(w => w.status === 'active');
  const completedWorkflows = workflows.filter(w => w.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows.length}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedWorkflows.filter(w => {
                const today = new Date().toDateString();
                return new Date(w.createdAt).toDateString() === today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Workflows completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 days</div>
            <p className="text-xs text-muted-foreground">Average time to complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'active' ? 'default' : 'outline'}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeWorkflows.length})
        </Button>
        <Button
          variant={activeTab === 'completed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({completedWorkflows.length})
        </Button>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activeWorkflows : completedWorkflows).map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.agentName}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Started {new Date(workflow.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'}>
                    {workflow.status}
                  </Badge>
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-1">
                      Progress: {workflow.progress}%
                    </div>
                    <Progress value={workflow.progress} className="w-32" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflow.steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(step.status)}
                      <div className="flex items-center space-x-2">
                        {getStepIcon(step)}
                        <div>
                          <p className={`font-medium ${getStatusColor(step.status)}`}>
                            {step.name}
                          </p>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {step.completedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(step.completedAt).toLocaleString()}
                        </span>
                      )}
                      {step.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => executeWorkflowStep(workflow.id, step.id)}
                        >
                          Execute
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(activeTab === 'active' ? activeWorkflows : completedWorkflows).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} workflows
            </h3>
            <p className="text-gray-500">
              {activeTab === 'active' 
                ? "All agents have completed their onboarding process."
                : "No workflows have been completed yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
