
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import AuthGuard from '@/components/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';

// Import debug utility
import '@/utils/authDebug';

// Import all page components
import Dashboard from '@/pages/Index';
import Transactions from '@/pages/Transactions';
import TransactionDetail from '@/pages/TransactionDetail';
import Workflows from '@/pages/Workflows';
import AutomationDashboard from '@/pages/AutomationDashboard';
import Templates from '@/pages/Templates';
import Documents from '@/pages/Documents';
import Clients from '@/pages/Clients';
import CreateClient from '@/pages/CreateClient';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import OfferDrafting from '@/pages/OfferDrafting';
import ServiceTierSelection from '@/pages/ServiceTierSelection';
import Agents from '@/pages/Agents';
import AgentIntake from '@/pages/AgentIntake';
import Communications from '@/pages/Communications';

// Import agent pages
import AgentDashboard from '@/pages/agent/AgentDashboard';
import AgentTransactionDetail from '@/pages/agent/TransactionDetail';
import AgentTransactions from '@/pages/agent/AgentTransactions';
import AgentTasks from '@/pages/agent/AgentTasks';
import AgentClients from '@/pages/agent/AgentClients';
import AgentCalendar from '@/pages/agent/AgentCalendar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Public auth route */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Coordinator routes */}
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
          <Route path="/transactions/new" element={
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
          <Route path="/clients/new" element={
            <AuthGuard>
              <AppLayout>
                <CreateClient />
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
          
          {/* Communications and Calendar routes */}
          <Route path="/communications" element={
            <AuthGuard>
              <AppLayout>
                <Communications />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/calendar" element={
            <AuthGuard>
              <AppLayout>
                <AgentCalendar />
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
          
          {/* Agent routes */}
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
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
