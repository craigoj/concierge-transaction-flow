
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  const logDebug = (message: string, data?: any) => {
    console.log(`[AuthGuard] ${message}`, data || '');
  };

  // Initialize authentication
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        logDebug('Initializing authentication...');
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          logDebug('Session error:', sessionError);
          setAuthState('unauthenticated');
          return;
        }

        if (session?.user) {
          logDebug('Session found, user:', session.user.email);
          setSession(session);
          setUser(session.user);
          
          // Fetch user role
          try {
            logDebug('Fetching user profile...');
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!mounted) return;

            if (profileError) {
              logDebug('Profile error, using fallback role:', profileError);
              setUserRole('agent'); // Default fallback
            } else {
              logDebug('Profile found, role:', profile?.role);
              setUserRole(profile?.role || 'agent');
            }
          } catch (err) {
            logDebug('Error fetching profile:', err);
            setUserRole('agent'); // Default fallback
          }
          
          setAuthState('authenticated');
        } else {
          logDebug('No session found');
          setAuthState('unauthenticated');
        }
      } catch (err) {
        logDebug('Auth initialization error:', err);
        if (mounted) {
          setAuthState('unauthenticated');
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Set up auth state listener
  useEffect(() => {
    logDebug('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logDebug('Auth state change:', { event, userEmail: session?.user?.email });
        
        if (event === 'SIGNED_OUT') {
          logDebug('User signed out');
          setSession(null);
          setUser(null);
          setUserRole(null);
          setAuthState('unauthenticated');
        } else if (event === 'SIGNED_IN' && session?.user) {
          logDebug('User signed in:', session.user.email);
          setSession(session);
          setUser(session.user);
          setAuthState('authenticated');
          
          // Fetch role for signed in user
          setTimeout(async () => {
            try {
              logDebug('Fetching role for signed in user...');
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                logDebug('Error fetching role:', error);
                setUserRole('agent');
              } else {
                logDebug('Role fetched:', profile?.role);
                setUserRole(profile?.role || 'agent');
              }
            } catch (err) {
              logDebug('Error in role fetch:', err);
              setUserRole('agent');
            }
          }, 100);
        }
      }
    );

    return () => {
      logDebug('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  // Handle navigation based on auth state and role
  useEffect(() => {
    if (authState === 'loading') return;

    logDebug('Navigation effect triggered', {
      authState,
      userRole,
      currentPath: location.pathname
    });

    if (authState === 'unauthenticated') {
      if (location.pathname !== '/auth') {
        logDebug('Redirecting to auth page');
        navigate('/auth', { replace: true });
      }
      return;
    }

    if (authState === 'authenticated' && userRole) {
      logDebug('User authenticated, checking role-based routing', {
        role: userRole,
        currentPath: location.pathname
      });

      // If user is on auth page and authenticated, redirect them
      if (location.pathname === '/auth') {
        logDebug('Authenticated user on auth page, redirecting');
        if (userRole === 'agent') {
          navigate('/agent/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      // Role-based route protection
      if (userRole === 'agent') {
        const coordinatorOnlyRoutes = ['/agents', '/templates', '/workflows', '/automation'];
        const isOnCoordinatorRoute = coordinatorOnlyRoutes.some(route => 
          location.pathname.startsWith(route)
        );
        
        if (isOnCoordinatorRoute) {
          logDebug('Agent on coordinator route, redirecting to agent dashboard');
          navigate('/agent/dashboard', { replace: true });
        }
      } else if (userRole === 'coordinator') {
        if (location.pathname.startsWith('/agent/')) {
          logDebug('Coordinator on agent route, redirecting to main dashboard');
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [authState, userRole, location.pathname, navigate]);

  // Loading state
  if (authState === 'loading') {
    logDebug('Showing loading state');
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-charcoal mx-auto mb-4" />
          <p className="text-brand-charcoal/60 font-brand-body">Loading...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state - don't render children
  if (authState === 'unauthenticated') {
    logDebug('User unauthenticated, not rendering children');
    return null;
  }

  // Authenticated state - render children
  logDebug('Rendering authenticated content');
  return <>{children}</>;
};

export default AuthGuard;
