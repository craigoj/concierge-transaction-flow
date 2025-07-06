
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'coordinator' | 'agent';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-charcoal mx-auto mb-4" />
          <p className="text-brand-charcoal/60 font-brand-body">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin users have access to everything - no redirects needed
  if (userRole === 'admin') {
    return <>{children}</>;
  }

  // Simple role-based redirects
  if (userRole === 'coordinator' && requiredRole === 'agent') {
    return <Navigate to="/dashboard" replace />;
  }

  if (userRole === 'agent' && requiredRole === 'coordinator') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  // Default role-based redirects for root access
  if (userRole === 'agent' && window.location.pathname === '/dashboard') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  if (userRole === 'coordinator' && window.location.pathname.startsWith('/agent/')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
