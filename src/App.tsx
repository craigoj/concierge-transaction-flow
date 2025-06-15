
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { SidebarProvider } from "@/components/ui/sidebar";

// Landing Pages
import Home from "./pages/landing/Home";
import Services from "./pages/landing/Services";
import About from "./pages/landing/About";
import Contact from "./pages/landing/Contact";

// App Pages
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

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-taupe to-brand-taupe-dark rounded-2xl flex items-center justify-center shadow-brand-elevation mx-auto animate-pulse">
            <span className="text-brand-charcoal font-brand-heading font-bold text-2xl tracking-brand-wide">AC</span>
          </div>
          <p className="text-brand-charcoal/60 font-brand-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Landing Pages */}
            {!user && (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </>
            )}
            
            {/* Authentication */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected App Routes - Wrapped with SidebarProvider */}
            {user && (
              <Route path="/*" element={
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <Routes>
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
                    </Routes>
                  </div>
                </SidebarProvider>
              } />
            )}
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
