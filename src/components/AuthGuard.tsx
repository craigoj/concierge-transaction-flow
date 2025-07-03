
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Simple role fetching
  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      return profile?.role || 'agent';
    } catch (error) {
      console.error('Error fetching role:', error);
      return 'agent';
    }
  };

  // Handle navigation based on auth state and role
  const handleNavigation = (session: Session | null, role: string | null) => {
    const currentPath = location.pathname;
    console.log('Navigation check:', { currentPath, hasSession: !!session, role });

    // If no session, redirect to auth (unless already there)
    if (!session) {
      if (currentPath !== '/auth') {
        console.log('No session, redirecting to /auth');
        navigate('/auth', { replace: true });
      }
      return;
    }

    // If session exists but no role yet, wait for role to load
    if (!role) {
      console.log('Session exists but role not loaded yet');
      return;
    }

    // Redirect from auth page when logged in
    if (currentPath === '/auth') {
      const destination = role === 'agent' ? '/agent/dashboard' : '/dashboard';
      console.log(`Logged in, redirecting from /auth to ${destination}`);
      navigate(destination, { replace: true });
      return;
    }

    // Redirect from root
    if (currentPath === '/') {
      const destination = role === 'agent' ? '/agent/dashboard' : '/dashboard';
      console.log(`At root, redirecting to ${destination}`);
      navigate(destination, { replace: true });
      return;
    }

    // Role-based route protection
    if (role === 'agent') {
      // Agents should only access agent routes
      const coordinatorOnlyRoutes = ['/agents', '/templates', '/workflows', '/automation'];
      const isRestrictedRoute = coordinatorOnlyRoutes.some(route => currentPath.startsWith(route));
      
      if (isRestrictedRoute || (currentPath.startsWith('/') && !currentPath.startsWith('/agent/'))) {
        if (currentPath !== '/dashboard' && currentPath !== '/transactions' && currentPath !== '/clients') {
          console.log(`Agent accessing restricted route ${currentPath}, redirecting to agent dashboard`);
          navigate('/agent/dashboard', { replace: true });
        }
      }
    } else if (role === 'coordinator' && currentPath.startsWith('/agent/')) {
      // Coordinators shouldn't access agent-only routes
      console.log(`Coordinator accessing agent route ${currentPath}, redirecting to dashboard`);
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // Clear any corrupted session data
          await supabase.auth.signOut();
        }

        if (!mounted) return;

        console.log('Initial session check:', { hasSession: !!session, userEmail: session?.user?.email });

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Fetch role
          const role = await fetchUserRole(session.user.id);
          if (mounted) {
            setUserRole(role);
            console.log('User role fetched:', role);
            handleNavigation(session, role);
          }
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
          handleNavigation(null, null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          handleNavigation(null, null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          const role = await fetchUserRole(session.user.id);
          if (mounted) {
            setUserRole(role);
            console.log('Auth state change - role:', role);
            handleNavigation(session, role);
          }
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
          handleNavigation(null, null);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove location.pathname dependency to prevent unnecessary re-renders

  // Show loading state
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

  // Don't render children if not authenticated
  if (!session || !user) {
    return null;
  }

  // Render children when authenticated
  return <>{children}</>;
};

export default AuthGuard;
