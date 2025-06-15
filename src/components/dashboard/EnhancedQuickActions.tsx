
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, MessageSquare, FileText, Users, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog';

const EnhancedQuickActions = () => {
  const navigate = useNavigate();
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false);

  const primaryActions = [
    {
      icon: Plus,
      label: "New Transaction",
      description: "Start a new transaction coordination",
      variant: "default" as const,
      action: () => setCreateTransactionOpen(true)
    },
    {
      icon: Users,
      label: "Add Client",
      description: "Register a new client",
      variant: "outline" as const,
      action: () => navigate('/clients/new')
    }
  ];

  const secondaryActions = [
    {
      icon: Calendar,
      label: "Schedule Meeting",
      description: "Book consultation or review",
      variant: "outline" as const,
      action: () => navigate('/calendar/new')
    },
    {
      icon: MessageSquare,
      label: "Send Update",
      description: "Notify clients of progress",
      variant: "outline" as const,
      action: () => navigate('/communications/compose')
    },
    {
      icon: FileText,
      label: "Upload Document",
      description: "Add transaction paperwork",
      variant: "outline" as const,
      action: () => navigate('/documents/upload')
    },
    {
      icon: Search,
      label: "Search Transactions",
      description: "Find specific transactions",
      variant: "outline" as const,
      action: () => navigate('/search')
    }
  ];

  const settingsActions = [
    {
      icon: Settings,
      label: "Preferences",
      description: "Update your settings",
      variant: "ghost" as const,
      action: () => navigate('/settings')
    }
  ];

  const handleTransactionCreate = () => {
    setCreateTransactionOpen(false);
    navigate('/transactions');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Primary</h4>
            <div className="grid grid-cols-1 gap-3">
              {primaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  className="h-auto p-4 flex flex-col items-start space-y-2 text-left hover:scale-105 transition-transform"
                  onClick={action.action}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <action.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs opacity-75">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Common Tasks</h4>
            <div className="grid grid-cols-2 gap-2">
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  className="h-auto p-3 flex flex-col items-center space-y-1 text-center hover:scale-105 transition-transform"
                  onClick={action.action}
                >
                  <action.icon className="h-4 w-4" />
                  <div className="text-xs font-medium">{action.label}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-1 gap-2">
              {settingsActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  className="justify-start gap-2"
                  onClick={action.action}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateTransactionDialog
        open={createTransactionOpen}
        onOpenChange={setCreateTransactionOpen}
        onSuccess={handleTransactionCreate}
      />
    </>
  );
};

export default EnhancedQuickActions;
