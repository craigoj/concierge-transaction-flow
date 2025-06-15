
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MessageSquare, FileText, Users } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: Plus,
      label: "New Transaction",
      description: "Start a new transaction coordination",
      variant: "default" as const
    },
    {
      icon: Calendar,
      label: "Schedule Meeting",
      description: "Book consultation or review",
      variant: "outline" as const
    },
    {
      icon: MessageSquare,
      label: "Send Update",
      description: "Notify clients of progress",
      variant: "outline" as const
    },
    {
      icon: FileText,
      label: "Upload Document",
      description: "Add transaction paperwork",
      variant: "outline" as const
    },
    {
      icon: Users,
      label: "Manage Clients",
      description: "View and update client info",
      variant: "outline" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
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
      </CardContent>
    </Card>
  );
};

export default QuickActions;
