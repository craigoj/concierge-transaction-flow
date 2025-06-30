
import React from 'react';
import { Route } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Index';
import Transactions from '@/pages/Transactions';
import TransactionDetail from '@/pages/TransactionDetail';
import Workflows from '@/pages/Workflows';
import AutomationDashboard from '@/pages/AutomationDashboard';
import Templates from '@/pages/Templates';
import Documents from '@/pages/Documents';
import Clients from '@/pages/Clients';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import OfferDrafting from '@/pages/OfferDrafting';
import ServiceTierSelection from '@/pages/ServiceTierSelection';
import Agents from '@/pages/Agents';
import AgentIntake from '@/pages/AgentIntake';

const CoordinatorRoutes = () => {
  return (
    <>
      {/* Main coordinator routes */}
      <Route path="/" element={
        <AuthGuard>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/dashboard" element={
        <AuthGuard>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </AuthGuard>
      } />
      
      {/* Transaction routes */}
      <Route path="/transactions" element={
        <AuthGuard>
          <AppLayout>
            <Transactions />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/transactions/:transactionId" element={
        <AuthGuard>
          <AppLayout>
            <TransactionDetail />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/transactions/:transactionId/service-tier" element={
        <AuthGuard>
          <AppLayout>
            <ServiceTierSelection />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/transactions/:transactionId/offer-drafting" element={
        <AuthGuard>
          <AppLayout>
            <OfferDrafting />
          </AppLayout>
        </AuthGuard>
      } />
      
      {/* Workflow and automation routes */}
      <Route path="/workflows" element={
        <AuthGuard>
          <AppLayout>
            <Workflows />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/automation" element={
        <AuthGuard>
          <AppLayout>
            <AutomationDashboard />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/templates" element={
        <AuthGuard>
          <AppLayout>
            <Templates />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/tasks" element={
        <AuthGuard>
          <AppLayout>
            <Workflows />
          </AppLayout>
        </AuthGuard>
      } />
      
      {/* Management routes */}
      <Route path="/documents" element={
        <AuthGuard>
          <AppLayout>
            <Documents />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/clients" element={
        <AuthGuard>
          <AppLayout>
            <Clients />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/agents" element={
        <AuthGuard>
          <AppLayout>
            <Agents />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/agent-intake" element={
        <AuthGuard>
          <AppLayout>
            <AgentIntake />
          </AppLayout>
        </AuthGuard>
      } />
      
      {/* Settings and profile routes */}
      <Route path="/settings" element={
        <AuthGuard>
          <AppLayout>
            <Settings />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/profile" element={
        <AuthGuard>
          <AppLayout>
            <Profile />
          </AppLayout>
        </AuthGuard>
      } />
      <Route path="/offer-drafting" element={
        <AuthGuard>
          <AppLayout>
            <OfferDrafting />
          </AppLayout>
        </AuthGuard>
      } />
    </>
  );
};

export default CoordinatorRoutes;
