import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Users, Calendar, BarChart3, Settings, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
}

const EnhancedQuickActions = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const quickActions: QuickAction[] = [
    {
      title: 'New Transaction',
      description: 'Start a new transaction',
      icon: Plus,
      onClick: () => setShowCreateDialog(true),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Create Client',
      description: 'Add a new client',
      icon: Users,
      onClick: () => navigate('/clients/new'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'View Documents',
      description: 'Manage documents',
      icon: FileText,
      onClick: () => navigate('/documents'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Schedule Meeting',
      description: 'Book a meeting',
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'View Reports',
      description: 'Analyze performance',
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      title: 'Settings',
      description: 'Configure preferences',
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color} text-white border-none hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <Icon className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-80">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CreateTransactionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          // Handle success if needed
        }}
      />
    </>
  );
};

export default EnhancedQuickActions;
