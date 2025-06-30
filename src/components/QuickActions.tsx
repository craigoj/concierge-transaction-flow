import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MessageSquare, FileText, Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();
  
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
    <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
      <CardHeader>
        <CardTitle className="text-lg font-brand-heading tracking-brand-wide text-brand-charcoal uppercase">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          
          {/* Add new offer drafting button */}
          <button
            onClick={() => navigate('/offer-drafting')}
            className="flex flex-col items-center p-4 rounded-xl border-2 border-brand-taupe/30 hover:border-brand-taupe hover:bg-brand-taupe/5 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-brand-heading tracking-wide text-brand-charcoal">
              DRAFT OFFER
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
