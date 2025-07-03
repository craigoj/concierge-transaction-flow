
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
  const [roleLoading, setRoleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Simple role fetching with better error handling
  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      setRoleLoading(true);
      console.log('Fetching role for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Role fetch error:', error);
        return 'agent'; // Default fallback
      }
      
      const role = profile?.role || 'agent';
      console.log('Role fetched successfully:', role);
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'agent'; // Default fallback
    } finally {
      setRoleLoading(false);
    }
  };

  // Simplified navigation logic - single decision tree
  const handleNavigation = (session: Session | null, role: string | null, currentPath: string) => {
    console.log('Navigation decision:', { currentPath, hasSession: !!session, role, roleLoading });

    // No session - redirect to auth
    if (!session) {
      if (currentPath !== '/auth') {
        console.log('No session, redirecting to /auth');
        navigate('/auth', { replace: true });
      }
      return;
    }

    // Has session but on auth page - redirect to appropriate dashboard
    if (currentPath === '/auth') {
      const destination = role === 'agent' ? '/agent/dashboard' : '/dashboard';
      console.log(`Authenticated user on /auth, redirecting to ${destination}`);
      navigate(destination, { replace: true });
      return;
    }

    // Has session and role, enforce role-based access
    if (role) {
      if (role === 'coordinator') {
        // Coordinators can't access agent routes
        if (currentPath.startsWith('/agent/')) {
          console.log('Coordinator accessing agent route, redirecting to /dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
        // Redirect root to dashboard
        if (currentPath === '/') {
          navigate('/dashboard', { replace: true });
          return;
        }
      } else if (role === 'agent') {
        // Agents can't access coordinator-only routes
        const coordinatorOnlyRoutes = ['/agents', '/templates', '/workflows', '/automation'];
        const isCoordinatorRoute = coordinatorOnlyRoutes.some(route => currentPath.startsWith(route));
        
        if (isCoordinatorRoute) {
          console.log('Agent accessing coordinator route, redirecting to /agent/dashboard');
          navigate('/agent/dashboard', { replace: true });
          return;
        }
        // Redirect root to agent dashboard
        if (currentPath === '/') {
          navigate('/agent/dashboard', { replace: true });
          return;
        }
      }
    } else {
      // Has session but no role yet - allow access but default behavior
      if (currentPath === '/') {
        // Default to dashboard while waiting for role
        navigate('/dashboard', { replace: true });
        return;
      }
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
          // Clear corrupted session
          await supabase.auth.signOut();
        }

        if (!mounted) return;

        console.log('Initial session check:', { 
          hasSession: !!session, 
          userEmail: session?.user?.email 
        });

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch role but don't block rendering
          fetchUserRole(session.user.id).then(role => {
            if (mounted) {
              setUserRole(role);
              // Re-check navigation after role is loaded
              handleNavigation(session, role, location.pathname);
            }
          });
          
          // Initial navigation check without waiting for role
          handleNavigation(session, null, location.pathname);
        } else {
          setUserRole(null);
          handleNavigation(null, null, location.pathname);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          handleNavigation(null, null, location.pathname);
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

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch role asynchronously
          fetchUserRole(session.user.id).then(role => {
            if (mounted) {
              setUserRole(role);
              handleNavigation(session, role, location.pathname);
            }
          });
          
          // Immediate navigation check
          handleNavigation(session, null, location.pathname);
        } else {
          setUserRole(null);
          handleNavigation(null, null, location.pathname);
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  // Show loading state only during initial load
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

  // Don't render children if not authenticated (but not loading)
  if (!session || !user) {
    return null;
  }

  // Render children when authenticated
  return <>{children}</>;
};

export default AuthGuard;
