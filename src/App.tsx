
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/integrations/supabase/auth';
import AuthGuard from '@/components/AuthGuard';

// Main pages
import Index from '@/pages/Index';
import Transactions from '@/pages/Transactions';
import TransactionDetail from '@/pages/TransactionDetail';
import Clients from '@/pages/Clients';
import ClientDetail from '@/pages/ClientDetail';
import CreateClient from '@/pages/CreateClient';
import Agents from '@/pages/Agents';
import AgentDetail from '@/pages/AgentDetail';
import Communications from '@/pages/Communications';
import Documents from '@/pages/Documents';
import Analytics from '@/pages/Analytics';
import Templates from '@/pages/Templates';
import Workflows from '@/pages/Workflows';
import WorkflowTemplates from '@/pages/WorkflowTemplates';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import Search from '@/pages/Search';
import DemoSetup from '@/pages/DemoSetup';
import AutomationDashboard from '@/pages/AutomationDashboard';
import AgentIntake from '@/pages/AgentIntake';

// Agent portal pages
import AgentDashboard from '@/pages/agent/AgentDashboard';
import AgentSetup from '@/pages/agent/AgentSetup';
import AgentTransactionDetail from '@/pages/agent/TransactionDetail';

// Landing pages
import LandingHome from '@/pages/landing/Home';
import About from '@/pages/landing/About';
import Services from '@/pages/landing/Services';
import Contact from '@/pages/landing/Contact';

// Auth and error pages
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Landing pages - public */}
              <Route path="/landing" element={<LandingHome />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Authentication */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Main dashboard - protected */}
              <Route path="/" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              
              {/* Transactions - protected */}
              <Route path="/transactions" element={
                <AuthGuard>
                  <Transactions />
                </AuthGuard>
              } />
              <Route path="/transactions/:id" element={
                <AuthGuard>
                  <TransactionDetail />
                </AuthGuard>
              } />
              
              {/* Clients - protected */}
              <Route path="/clients" element={
                <AuthGuard>
                  <Clients />
                </AuthGuard>
              } />
              <Route path="/clients/new" element={
                <AuthGuard>
                  <CreateClient />
                </AuthGuard>
              } />
              <Route path="/clients/:id" element={
                <AuthGuard>
                  <ClientDetail />
                </AuthGuard>
              } />
              
              {/* Agents - protected */}
              <Route path="/agents" element={
                <AuthGuard>
                  <Agents />
                </AuthGuard>
              } />
              <Route path="/agents/:id" element={
                <AuthGuard>
                  <AgentDetail />
                </AuthGuard>
              } />
              
              {/* Agent Intake - protected */}
              <Route path="/agent-intake" element={
                <AuthGuard>
                  <AgentIntake />
                </AuthGuard>
              } />
              
              {/* Communications - protected */}
              <Route path="/communications" element={
                <AuthGuard>
                  <Communications />
                </AuthGuard>
              } />
              
              {/* Documents - protected */}
              <Route path="/documents" element={
                <AuthGuard>
                  <Documents />
                </AuthGuard>
              } />
              
              {/* Analytics - protected */}
              <Route path="/analytics" element={
                <AuthGuard>
                  <Analytics />
                </AuthGuard>
              } />
              
              {/* Templates - protected */}
              <Route path="/templates" element={
                <AuthGuard>
                  <Templates />
                </AuthGuard>
              } />
              
              {/* Workflows - protected */}
              <Route path="/workflows" element={
                <AuthGuard>
                  <Workflows />
                </AuthGuard>
              } />
              <Route path="/workflow-templates" element={
                <AuthGuard>
                  <WorkflowTemplates />
                </AuthGuard>
              } />
              
              {/* Automation - protected */}
              <Route path="/automation" element={
                <AuthGuard>
                  <AutomationDashboard />
                </AuthGuard>
              } />
              
              {/* Settings and Profile - protected */}
              <Route path="/settings" element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              } />
              
              {/* Search - protected */}
              <Route path="/search" element={
                <AuthGuard>
                  <Search />
                </AuthGuard>
              } />
              
              {/* Demo Setup - protected */}
              <Route path="/demo-setup" element={
                <AuthGuard>
                  <DemoSetup />
                </AuthGuard>
              } />
              
              {/* Agent Portal - protected */}
              <Route path="/agent/dashboard" element={
                <AuthGuard>
                  <AgentDashboard />
                </AuthGuard>
              } />
              <Route path="/agent/setup" element={
                <AuthGuard>
                  <AgentSetup />
                </AuthGuard>
              } />
              <Route path="/agent/transactions/:id" element={
                <AuthGuard>
                  <AgentTransactionDetail />
                </AuthGuard>
              } />
              
              {/* 404 - Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
