
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Building, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Phone, 
  Users, 
  Camera,
  Key,
  ClipboardCheck,
  MapPin
} from "lucide-react";

const PremiumQuickActions = () => {
  const primaryActions = [
    {
      icon: Building,
      label: "New Coordination",
      description: "Initiate transaction coordination",
      color: "bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background",
      featured: true
    },
    {
      icon: Calendar,
      label: "Schedule Inspection",
      description: "Coordinate property inspection",
      color: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    {
      icon: Key,
      label: "Lockbox Setup",
      description: "Arrange showing access",
      color: "bg-emerald-600 hover:bg-emerald-700 text-white"
    }
  ];

  const secondaryActions = [
    { icon: FileText, label: "Upload Documents", description: "Transaction paperwork" },
    { icon: MessageSquare, label: "Client Update", description: "Send progress notification" },
    { icon: Phone, label: "Schedule Call", description: "Coordination meeting" },
    { icon: Users, label: "Add Team Member", description: "Expand coordination team" },
    { icon: Camera, label: "Photo Coordination", description: "Schedule photography" },
    { icon: ClipboardCheck, label: "Task Review", description: "Checklist management" },
    { icon: MapPin, label: "Open House", description: "Event coordination" }
  ];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
      <div className="p-8">
        <h3 className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-8">
          Coordination Center
        </h3>
        
        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {primaryActions.map((action, index) => (
            <Button
              key={index}
              className={`h-auto p-6 flex flex-col items-center space-y-3 text-center group ${action.color} transition-all duration-300 hover:scale-105 shadow-brand-subtle hover:shadow-brand-elevation`}
            >
              <action.icon className="h-8 w-8 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <div className="font-brand-heading tracking-wide text-sm uppercase">{action.label}</div>
                <div className="text-xs opacity-80 font-brand-body">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center border-brand-taupe/30 hover:border-brand-taupe hover:bg-brand-background/50 transition-all duration-200 group"
            >
              <action.icon className="h-5 w-5 text-brand-charcoal/60 group-hover:text-brand-charcoal transition-colors" />
              <div>
                <div className="font-brand-heading text-xs tracking-wide text-brand-charcoal uppercase">{action.label}</div>
                <div className="text-xs text-brand-charcoal/60 font-brand-body">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-8 pt-6 border-t border-brand-taupe/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-charcoal">4</div>
              <div className="text-xs font-brand-heading tracking-wide text-brand-charcoal/60 uppercase">Pending Actions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-charcoal">12</div>
              <div className="text-xs font-brand-heading tracking-wide text-brand-charcoal/60 uppercase">Active Files</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-charcoal">98%</div>
              <div className="text-xs font-brand-heading tracking-wide text-brand-charcoal/60 uppercase">On Schedule</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PremiumQuickActions;
