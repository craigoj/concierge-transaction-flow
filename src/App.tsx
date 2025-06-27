
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import CreateClient from "./pages/CreateClient";
import Communications from "./pages/Communications";
import Documents from "./pages/Documents";
import Analytics from "./pages/Analytics";
import Agents from "./pages/Agents";
import AgentDetail from "./pages/AgentDetail";
import Workflows from "./pages/Workflows";
import WorkflowTemplates from "./pages/WorkflowTemplates";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DemoSetup from "./pages/DemoSetup";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentSetup from "./pages/agent/AgentSetup";
import AgentTransactionDetail from "./pages/agent/TransactionDetail";
import Home from "./pages/landing/Home";
import About from "./pages/landing/About";
import Services from "./pages/landing/Services";
import Contact from "./pages/landing/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing pages */}
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Agent portal */}
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/setup" element={<AgentSetup />} />
          <Route path="/agent/transaction/:id" element={<AgentTransactionDetail />} />
          
          {/* Main app with sidebar */}
          <Route path="/*" element={
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/transactions/:id" element={<TransactionDetail />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                    <Route path="/create-client" element={<CreateClient />} />
                    <Route path="/communications" element={<Communications />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/agent/:id" element={<AgentDetail />} />
                    <Route path="/workflows" element={<Workflows />} />
                    <Route path="/workflow-templates" element={<WorkflowTemplates />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/demo-setup" element={<DemoSetup />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
