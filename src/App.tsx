
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"

import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/integrations/supabase/auth';
import AuthGuard from '@/components/AuthGuard';
import Transactions from '@/pages/Transactions';
import Settings from '@/pages/Settings';
import AutomationDashboard from '@/pages/AutomationDashboard';
import Workflows from '@/pages/Workflows';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <AuthGuard>
                  <Transactions />
                </AuthGuard>
              } />
              <Route path="/transactions" element={
                <AuthGuard>
                  <Transactions />
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              } />
              <Route path="/automation" element={
                <AuthGuard>
                  <AutomationDashboard />
                </AuthGuard>
              } />
              <Route path="/workflows" element={
                <AuthGuard>
                  <Workflows />
                </AuthGuard>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
