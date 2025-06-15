
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import AppHeader from "@/components/AppHeader";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import Clients from "./pages/Clients";
import CreateClient from "./pages/CreateClient";
import ClientDetail from "./pages/ClientDetail";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Communications from "./pages/Communications";
import Templates from "./pages/Templates";
import Workflows from "./pages/Workflows";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AgentSetup from "./pages/agent/AgentSetup";
import AgentDashboard from "./pages/agent/AgentDashboard";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/agent/setup/:token" element={<AgentSetup />} />
            
            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AppSidebar />
                      <div className="flex-1 flex flex-col">
                        <AppHeader />
                        <main className="flex-1">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/agent/dashboard" element={<AgentDashboard />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/transactions/:id" element={<TransactionDetail />} />
                            <Route path="/clients" element={<Clients />} />
                            <Route path="/clients/new" element={<CreateClient />} />
                            <Route path="/clients/:id" element={<ClientDetail />} />
                            <Route path="/agents" element={<Agents />} />
                            <Route path="/agents/:id" element={<AgentDetail />} />
                            <Route path="/communications" element={<Communications />} />
                            <Route path="/templates" element={<Templates />} />
                            <Route path="/workflows" element={<Workflows />} />
                            <Route path="/documents" element={<Documents />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
