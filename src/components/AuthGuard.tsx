
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

  // Clear all auth state and redirect to login
  const clearAuthAndRedirect = () => {
    console.log('Clearing auth state and redirecting to login');
    setSession(null);
    setUser(null);
    setUserRole(null);
    setLoading(false);
    navigate('/auth', { replace: true });
  };

  // Fetch user role with timeout
  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      console.log('Fetching role for user:', userId);
      
      // Set a timeout for the query
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
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
  const handleNavigation = (session: Session | null, role: string | null) => {
    const currentPath = location.pathname;
    
    console.log('Navigation check:', { currentPath, hasSession: !!session, role });

    if (!session) {
      if (currentPath !== '/auth') {
        navigate('/auth', { replace: true });
      }
      return;
    }

    // If we're on auth page and have session, redirect based on role
    if (currentPath === '/auth') {
      const destination = role === 'agent' ? '/agent/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
      return;
    }

    // Role-based access control
    if (role === 'coordinator') {
      if (currentPath.startsWith('/agent/')) {
        navigate('/dashboard', { replace: true });
        return;
      }
      if (currentPath === '/') {
        navigate('/dashboard', { replace: true });
        return;
      }
    } else if (role === 'agent') {
      const coordinatorOnlyRoutes = ['/agents', '/templates', '/workflows', '/automation'];
      const isCoordinatorRoute = coordinatorOnlyRoutes.some(route => currentPath.startsWith(route));
      
      if (isCoordinatorRoute) {
        navigate('/agent/dashboard', { replace: true });
        return;
      }
      if (currentPath === '/') {
        navigate('/agent/dashboard', { replace: true });
        return;
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set a maximum timeout for initialization
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.log('Auth initialization timeout, clearing state');
            clearAuthAndRedirect();
          }
        }, 10000); // 10 second timeout

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            clearAuthAndRedirect();
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
          try {
            const role = await fetchUserRole(session.user.id);
            if (mounted) {
              setUserRole(role);
              handleNavigation(session, role);
            }
          } catch (roleError) {
            console.error('Role fetch failed:', roleError);
            if (mounted) {
              setUserRole('agent');
              handleNavigation(session, 'agent');
            }
          }
        } else {
          setUserRole(null);
          handleNavigation(null, null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          clearAuthAndRedirect();
        }
      } finally {
        if (mounted) {
          clearTimeout(initTimeout);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;

        // Handle specific auth events
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing auth');
          clearAuthAndRedirect();
          return;
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          clearAuthAndRedirect();
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && event === 'SIGNED_IN') {
          try {
            const role = await fetchUserRole(session.user.id);
            if (mounted) {
              setUserRole(role);
              handleNavigation(session, role);
            }
          } catch (roleError) {
            console.error('Role fetch failed during auth change:', roleError);
            if (mounted) {
              setUserRole('agent');
              handleNavigation(session, 'agent');
            }
          }
        } else if (!session) {
          setUserRole(null);
          handleNavigation(null, null);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  // Show loading state with timeout
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
