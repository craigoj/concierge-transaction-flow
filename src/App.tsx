
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import CoordinatorRoutes from '@/components/routing/CoordinatorRoutes';
import AgentRoutes from '@/components/routing/AgentRoutes';

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
          <CoordinatorRoutes />
          
          {/* Protected agent routes */}
          <AgentRoutes />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
