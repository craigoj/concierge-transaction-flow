
import { useState } from "react";
import { CreateAgentDialog } from "@/components/agents/CreateAgentDialog";
import { AgentsList } from "@/components/agents/AgentsList";
import { Users } from "lucide-react";

const Agents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAgentCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-charcoal rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
                Agent Management
              </h1>
              <p className="text-brand-charcoal/60 font-brand-body mt-1">
                Create and manage agent accounts with white-glove onboarding
              </p>
            </div>
          </div>
          <CreateAgentDialog onAgentCreated={handleAgentCreated} />
        </div>
      </div>

      <AgentsList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Agents;
