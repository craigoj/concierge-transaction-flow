
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import { performanceMonitor } from '@/lib/performance-monitoring';

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
import AgentSetup from '@/pages/agent/AgentSetup';

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
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.trackPageView();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/agent/setup/:token" element={<AgentSetup />} />
            
            {/* Root route - redirects based on role */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Coordinator routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute requiredRole="coordinator">
                <AppLayout>
                  <Transactions />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions/:transactionId" element={
              <ProtectedRoute>
                <AppLayout>
                  <TransactionDetail />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/workflows" element={
              <ProtectedRoute requiredRole="coordinator">
                <AppLayout>
                  <Workflows />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/automation" element={
              <ProtectedRoute requiredRole="coordinator">
                <AppLayout>
                  <AutomationDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/templates" element={
              <ProtectedRoute requiredRole="coordinator">
                <AppLayout>
                  <Templates />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/documents" element={
              <ProtectedRoute>
                <AppLayout>
                  <Documents />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/clients" element={
              <ProtectedRoute>
                <AppLayout>
                  <Clients />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/clients/new" element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateClient />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/agents" element={
              <ProtectedRoute requiredRole="coordinator">
                <AppLayout>
                  <Agents />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/agent-intake" element={
              <ProtectedRoute>
                <AppLayout>
                  <AgentIntake />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/communications" element={
              <ProtectedRoute>
                <AppLayout>
                  <Communications />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/offer-drafting" element={
              <ProtectedRoute>
                <AppLayout>
                  <OfferDrafting />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions/:transactionId/service-tier" element={
              <ProtectedRoute>
                <AppLayout>
                  <ServiceTierSelection />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions/:transactionId/offer-drafting" element={
              <ProtectedRoute>
                <AppLayout>
                  <OfferDrafting />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Agent routes */}
            <Route path="/agent/dashboard" element={
              <ProtectedRoute requiredRole="agent">
                <AppLayout>
                  <AgentDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/agent/transactions" element={
              <ProtectedRoute requiredRole="agent">
                <AppLayout>
                  <AgentTransactions />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/agent/transactions/:id" element={
              <ProtectedRoute requiredRole="agent">
                <AppLayout>
                  <AgentTransactionDetail />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/agent/tasks" element={
              <ProtectedRoute requiredRole="agent">
                <AppLayout>
                  <AgentTasks />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/agent/clients" element={
              <ProtectedRoute requiredRole="agent">
                <AppLayout>
                  <AgentClients />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/agent/calendar" element={
              <ProtectedRoute requiredRole="agent">
                <AppLayout>
                  <AgentCalendar />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          </AuthProvider>
        </QueryClientProvider>
        <Analytics />
        <SpeedInsights />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
