import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"

import { Toaster } from '@/components/ui/toaster';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import TransactionsPage from '@/pages/Transactions';
import TransactionDetailsPage from '@/pages/TransactionDetails';
import TasksPage from '@/pages/Tasks';
import DocumentsPage from '@/pages/Documents';
import ClientsPage from '@/pages/Clients';
import SettingsPage from '@/pages/Settings';
import IntegrationsPage from '@/pages/Integrations';
import EmailTemplatesPage from '@/pages/EmailTemplates';
import EmailTemplateDetailsPage from '@/pages/EmailTemplateDetails';
import AutomationDashboard from '@/pages/AutomationDashboard';
import Workflows from '@/pages/Workflows';

function App() {
  return (
    <QueryClient>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={
              <AuthGuard>
                <AppLayout>
                  <TransactionsPage />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/transactions" element={
              <AuthGuard>
                <AppLayout>
                  <TransactionsPage />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/transactions/:id" element={
              <AuthGuard>
                <AppLayout>
                  <TransactionDetailsPage />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/tasks/:transactionId" element={
              <AuthGuard>
                <AppLayout>
                  <TasksPage />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/documents/:transactionId" element={
              <AuthGuard>
                <AppLayout>
                  <DocumentsPage />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/clients/:transactionId" element={
              <AuthGuard>
                <AppLayout>
                  <ClientsPage />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </AuthGuard>
            } />
             <Route path="/integrations" element={
              <AuthGuard>
                <AppLayout>
                  <IntegrationsPage />
                </AppLayout>
              </AuthGuard>
            } />
            <Route path="/email-templates" element={
              <AuthGuard>
                <AppLayout>
                  <EmailTemplatesPage />
                </AppLayout>
              </AuthGuard>
            } />
             <Route path="/email-templates/:id" element={
              <AuthGuard>
                <AppLayout>
                  <EmailTemplateDetailsPage />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/automation" element={
              <AuthGuard>
                <AppLayout>
                  <AutomationDashboard />
                </AppLayout>
              </AuthGuard>
            } />
            
            <Route path="/workflows" element={
              <AuthGuard>
                <AppLayout>
                  <Workflows />
                </AppLayout>
              </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClient>
  );
}

export default App;
