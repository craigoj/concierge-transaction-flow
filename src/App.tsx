
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
import CreateClient from "./pages/CreateClient";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Communications from "./pages/Communications";
import Templates from "./pages/Templates";
import Workflows from "./pages/Workflows";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

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
            path="/clients/new" 
            element={
              <AuthGuard>
                <CreateClient />
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
          <Route 
            path="/communications" 
            element={
              <AuthGuard>
                <Communications />
              </AuthGuard>
            } 
          />
          <Route 
            path="/templates" 
            element={
              <AuthGuard>
                <Templates />
              </AuthGuard>
            } 
          />
          <Route 
            path="/workflows" 
            element={
              <AuthGuard>
                <Workflows />
              </AuthGuard>
            } 
          />
          <Route 
            path="/documents" 
            element={
              <AuthGuard>
                <Documents />
              </AuthGuard>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <AuthGuard>
                <Analytics />
              </AuthGuard>
            } 
          />
          <Route 
            path="/search" 
            element={
              <AuthGuard>
                <Search />
              </AuthGuard>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <AuthGuard>
                <Settings />
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
