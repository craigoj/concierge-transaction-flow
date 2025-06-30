
import { useState } from "react";
import { EnhancedCreateAgentDialog } from "@/components/agents/EnhancedCreateAgentDialog";
import { EnhancedAgentsList } from "@/components/agents/EnhancedAgentsList";
import { Users, Settings, UserPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Breadcrumb from "@/components/navigation/Breadcrumb";

const Agents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAgentCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-charcoal rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
                Enhanced Agent Management
              </h1>
              <p className="text-brand-charcoal/60 font-brand-body mt-1">
                Create, manage, and onboard agent accounts with flexible setup options
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-brand-taupe/30">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="border-brand-taupe/30">
              <Settings className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <EnhancedCreateAgentDialog onAgentCreated={handleAgentCreated} />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">All registered agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">--</div>
            <p className="text-xs text-muted-foreground">Fully activated accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">--</div>
            <p className="text-xs text-muted-foreground">Awaiting setup</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">--</div>
            <p className="text-xs text-muted-foreground">New this month</p>
          </CardContent>
        </Card>
      </div>

      <EnhancedAgentsList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Agents;
