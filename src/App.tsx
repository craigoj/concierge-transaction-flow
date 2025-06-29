import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/AuthGuard';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:transactionId" element={<TransactionDetail />} />
              <Route path="/transactions/:transactionId/service-tier" element={<ServiceTierSelection />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Add the new offer drafting route */}
              <Route path="/offer-drafting" element={<OfferDrafting />} />
              <Route path="/transactions/:transactionId/offer-drafting" element={<OfferDrafting />} />
            </Routes>
          </AppLayout>
        </AuthGuard>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
