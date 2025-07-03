
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

  // Simple role fetching with error handling
  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
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
    }
  };

  // Handle navigation after authentication
  const handlePostAuthNavigation = (session: Session | null, role: string | null) => {
    const currentPath = location.pathname;
    
    console.log('Navigation check:', { currentPath, hasSession: !!session, role });

    // No session - redirect to auth
    if (!session) {
      if (currentPath !== '/auth') {
        console.log('No session, redirecting to /auth');
        navigate('/auth', { replace: true });
      }
      return;
    }

    // Has session but on auth page - redirect based on role
    if (currentPath === '/auth') {
      const destination = role === 'agent' ? '/agent/dashboard' : '/dashboard';
      console.log(`Authenticated user on /auth, redirecting to ${destination}`);
      navigate(destination, { replace: true });
      return;
    }

    // Role-based access control for authenticated users
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
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session with error handling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          // Clear any corrupted session state
          await supabase.auth.signOut();
          if (mounted) {
            setSession(null);
            setUser(null);
            setUserRole(null);
            handlePostAuthNavigation(null, null);
          }
          return;
        }

        if (!mounted) return;

        console.log('Initial session check:', { 
          hasSession: !!session, 
          userEmail: session?.user?.email 
        });

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch role for authenticated users
          try {
            const role = await fetchUserRole(session.user.id);
            if (mounted) {
              setUserRole(role);
              handlePostAuthNavigation(session, role);
            }
          } catch (roleError) {
            console.error('Role fetch failed:', roleError);
            if (mounted) {
              setUserRole('agent'); // Default fallback
              handlePostAuthNavigation(session, 'agent');
            }
          }
        } else {
          setUserRole(null);
          handlePostAuthNavigation(null, null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          handlePostAuthNavigation(null, null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;

        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, signing out');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setUserRole(null);
          handlePostAuthNavigation(null, null);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const role = await fetchUserRole(session.user.id);
            if (mounted) {
              setUserRole(role);
              handlePostAuthNavigation(session, role);
            }
          } catch (roleError) {
            console.error('Role fetch failed during auth change:', roleError);
            if (mounted) {
              setUserRole('agent'); // Default fallback
              handlePostAuthNavigation(session, 'agent');
            }
          }
        } else {
          setUserRole(null);
          handlePostAuthNavigation(null, null);
        }
      }
    );

    initializeAuth();

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

  // Don't render children if not authenticated
  if (!session || !user) {
    return null;
  }

  // Render children when authenticated
  return <>{children}</>;
};

export default AuthGuard;
