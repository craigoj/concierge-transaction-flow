
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Calendar } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
  documents: Tables<'documents'>[];
};

interface TransactionTimelineProps {
  transaction: Transaction;
}

const TransactionTimeline = ({ transaction }: TransactionTimelineProps) => {
  // Generate timeline milestones based on transaction type and service tier
  const generateMilestones = () => {
    const baseMilestones = [
      { title: 'Transaction Created', date: transaction.created_at, status: 'completed' },
      { title: 'Client Onboarding', status: 'active' },
      { title: 'Property Search/Listing', status: 'pending' },
      { title: 'Offer Negotiation', status: 'pending' },
      { title: 'Under Contract', status: 'pending' },
      { title: 'Inspections & Appraisal', status: 'pending' },
      { title: 'Final Walkthrough', status: 'pending' },
      { title: 'Closing', date: transaction.closing_date, status: 'pending' },
    ];

    // Customize based on transaction type
    if (transaction.transaction_type === 'buyer') {
      baseMilestones[2] = { title: 'Property Search', status: 'pending' };
    } else if (transaction.transaction_type === 'seller') {
      baseMilestones[2] = { title: 'Property Listing', status: 'pending' };
    }

    return baseMilestones;
  };

  const milestones = generateMilestones();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {getStatusIcon(milestone.status)}
                  {index < milestones.length - 1 && (
                    <div className="w-px h-12 bg-gray-200 mt-2" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground">{milestone.title}</h3>
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {milestone.date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {milestone.status === 'completed' 
                        ? `Completed: ${new Date(milestone.date).toLocaleDateString()}`
                        : `Due: ${new Date(milestone.date).toLocaleDateString()}`
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Transaction created</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {transaction.clients?.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Client {transaction.clients[0].full_name} added
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            {transaction.tasks?.filter(task => task.is_completed).map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Task completed: {task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.completed_at && new Date(task.completed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionTimeline;
