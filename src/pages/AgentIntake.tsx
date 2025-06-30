
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { AgentIntakeForm } from '@/components/forms/AgentIntakeForm';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const AgentIntake = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/agent/dashboard');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <AgentIntakeForm onComplete={handleComplete} />
      </div>
    </AppLayout>
  );
};

export default AgentIntake;
