
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AgentsList } from '@/components/agents/AgentsList';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const Agents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        
        <AgentsList refreshTrigger={refreshTrigger} />
      </div>
    </AppLayout>
  );
};

export default Agents;
