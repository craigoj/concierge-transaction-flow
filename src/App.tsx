
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthGuard from "./components/AuthGuard";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/" 
            element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <AuthGuard>
                <Transactions />
              </AuthGuard>
            } 
          />
          <Route 
            path="/transactions/:id" 
            element={
              <AuthGuard>
                <TransactionDetail />
              </AuthGuard>
            } 
          />
          <Route 
            path="/clients" 
            element={
              <AuthGuard>
                <Clients />
              </AuthGuard>
            } 
          />
          <Route 
            path="/clients/:id" 
            element={
              <AuthGuard>
                <ClientDetail />
              </AuthGuard>
            } 
          />
          <Route 
            path="/agents" 
            element={
              <AuthGuard>
                <Agents />
              </AuthGuard>
            } 
          />
          <Route 
            path="/agents/:id" 
            element={
              <AuthGuard>
                <AgentDetail />
              </AuthGuard>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
