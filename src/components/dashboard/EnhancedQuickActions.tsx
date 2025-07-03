
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FileText, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateTransactionDialog } from '@/components/transactions/CreateTransactionDialog';

const EnhancedQuickActions = () => {
  const navigate = useNavigate();
  const [showCreateTransaction, setShowCreateTransaction] = useState(false);

  const quickActions = [
    {
      title: 'New Transaction',
      description: 'Start a new real estate transaction',
      icon: Plus,
      action: () => setShowCreateTransaction(true),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Offer Request',
      description: 'Create a new offer request',
      icon: FileText,
      action: () => navigate('/offer-drafting'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Client Portal',
      description: 'Access client information',
      icon: Users,
      action: () => navigate('/clients'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Agent Setup',
      description: 'Configure your preferences',
      icon: Settings,
      action: () => navigate('/agent/setup'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              onClick={action.action}
              className={`${action.color} text-white h-auto p-4 flex flex-col items-center justify-center space-y-2`}
              variant="default"
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {showCreateTransaction && (
        <CreateTransactionDialog 
          onSuccess={() => setShowCreateTransaction(false)}
        />
      )}
    </>
  );
};

export default EnhancedQuickActions;
