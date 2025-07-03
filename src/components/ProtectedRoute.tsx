
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'coordinator' | 'agent';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading, error } = useAuth();

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-charcoal mb-2">Authentication Error</h2>
          <p className="text-brand-charcoal/60 font-brand-body mb-4">{error}</p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-charcoal mx-auto mb-4" />
          <p className="text-brand-charcoal/60 font-brand-body">Loading authentication...</p>
          <p className="text-brand-charcoal/40 font-brand-body text-sm mt-2">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to auth page
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Simple role-based redirects
  if (userRole === 'coordinator' && requiredRole === 'agent') {
    console.log('ProtectedRoute: Coordinator accessing agent route, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (userRole === 'agent' && requiredRole === 'coordinator') {
    console.log('ProtectedRoute: Agent accessing coordinator route, redirecting to agent dashboard');
    return <Navigate to="/agent/dashboard" replace />;
  }

  // Default role-based redirects for root access
  if (userRole === 'agent' && window.location.pathname === '/dashboard') {
    console.log('ProtectedRoute: Agent on coordinator dashboard, redirecting to agent dashboard');
    return <Navigate to="/agent/dashboard" replace />;
  }

  if (userRole === 'coordinator' && window.location.pathname.startsWith('/agent/')) {
    console.log('ProtectedRoute: Coordinator on agent route, redirecting to coordinator dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute: Access granted for user role:', userRole);
  return <>{children}</>;
};

export default ProtectedRoute;
