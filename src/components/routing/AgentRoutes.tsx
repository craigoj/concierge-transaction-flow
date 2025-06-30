
import React from 'react';
import { Route } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import AgentDashboard from '@/pages/agent/AgentDashboard';
import AgentTransactionDetail from '@/pages/agent/TransactionDetail';
import AgentTransactions from '@/pages/agent/AgentTransactions';
import AgentTasks from '@/pages/agent/AgentTasks';
import AgentClients from '@/pages/agent/AgentClients';
import AgentCalendar from '@/pages/agent/AgentCalendar';

const AgentRoutes = () => {
  return (
    <>
      <Route path="/agent/dashboard" element={
        <AuthGuard>
          <AppLayout>
            <AgentDashboard />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/agent/transactions" element={
        <AuthGuard>
          <AppLayout>
            <AgentTransactions />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/agent/transactions/:id" element={
        <AuthGuard>
          <AppLayout>
            <AgentTransactionDetail />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/agent/tasks" element={
        <AuthGuard>
          <AppLayout>
            <AgentTasks />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/agent/clients" element={
        <AuthGuard>
          <AppLayout>
            <AgentClients />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/agent/calendar" element={
        <AuthGuard>
          <AppLayout>
            <AgentCalendar />
          </AppLayout>
        </AuthGuard>
      } />
    </>
  );
};

export default AgentRoutes;
