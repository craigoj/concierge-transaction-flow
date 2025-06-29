
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/AuthGuard';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Index';
import Transactions from '@/pages/Transactions';
import TransactionDetail from '@/pages/TransactionDetail';
import Tasks from '@/pages/Workflows';
import Documents from '@/pages/Documents';
import Clients from '@/pages/Clients';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import OfferDrafting from '@/pages/OfferDrafting';
import ServiceTierSelection from '@/pages/ServiceTierSelection';
import AgentDashboard from '@/pages/agent/AgentDashboard';
import AgentTransactionDetail from '@/pages/agent/TransactionDetail';
import NotFound from '@/pages/NotFound';

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
          
          {/* Protected coordinator routes */}
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
          <Route path="/tasks" element={
            <AuthGuard>
              <AppLayout>
                <Tasks />
              </AppLayout>
            </AuthGuard>
          } />
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
          
          {/* Protected agent routes */}
          <Route path="/agent/dashboard" element={
            <AuthGuard>
              <AppLayout>
                <AgentDashboard />
              </AppLayout>
            </AuthGuard>
          } />
          <Route path="/agent/transactions/:transactionId" element={
            <AuthGuard>
              <AppLayout>
                <AgentTransactionDetail />
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
