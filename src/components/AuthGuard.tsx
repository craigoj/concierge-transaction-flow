
import { useEffect, useState, useRef } from 'react';
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
  
  // Prevent multiple navigation calls
  const navigationInProgress = useRef(false);
  const roleCache = useRef<{ [userId: string]: string }>({});

  const logDebug = (message: string, data?: any) => {
    console.log(`[AuthGuard] ${message}`, data || '');
  };

  // Centralized role fetching with caching
  const fetchUserRole = async (userId: string): Promise<string> => {
    // Check cache first
    if (roleCache.current[userId]) {
      return roleCache.current[userId];
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      const role = profile?.role || 'agent';
      // Cache the role
      roleCache.current[userId] = role;
      return role;
    } catch (error) {
      logDebug('Error fetching role, using default:', error);
      const defaultRole = 'agent';
      roleCache.current[userId] = defaultRole;
      return defaultRole;
    }
  };

  // Centralized navigation handler
  const handleNavigation = async (session: Session | null, role: string | null) => {
    if (navigationInProgress.current) {
      logDebug('Navigation already in progress, skipping');
      return;
    }

    const currentPath = location.pathname;
    logDebug('Handling navigation', { session: !!session, role, currentPath });

    // If no session, redirect to auth (but not if already on auth)
    if (!session) {
      if (currentPath !== '/auth') {
        logDebug('No session, redirecting to auth');
        navigationInProgress.current = true;
        navigate('/auth', { replace: true });
        setTimeout(() => {
          navigationInProgress.current = false;
        }, 100);
      }
      return;
    }

    // If session exists and we have role, handle role-based routing
    if (role) {
      navigationInProgress.current = true;
      
      try {
        // If on auth page with session, redirect based on role
        if (currentPath === '/auth') {
          logDebug('User on auth page with session, redirecting based on role');
          const destination = role === 'agent' ? '/agent/dashboard' : '/dashboard';
          navigate(destination, { replace: true });
          return;
        }

        // Handle root path redirection
        if (currentPath === '/') {
          logDebug('User on root path, redirecting based on role');
          const destination = role === 'agent' ? '/agent/dashboard' : '/dashboard';
          navigate(destination, { replace: true });
          return;
        }

        // Role-based route protection
        if (role === 'agent') {
          const coordinatorOnlyRoutes = ['/agents', '/templates', '/workflows', '/automation'];
          const isOnCoordinatorRoute = coordinatorOnlyRoutes.some(route => 
            currentPath.startsWith(route)
          );
          
          if (isOnCoordinatorRoute) {
            logDebug('Agent on coordinator route, redirecting to agent dashboard');
            navigate('/agent/dashboard', { replace: true });
          }
        } else if (role === 'coordinator') {
          if (currentPath.startsWith('/agent/')) {
            logDebug('Coordinator on agent route, redirecting to main dashboard');
            navigate('/dashboard', { replace: true });
          }
        }
      } finally {
        // Reset navigation flag after a short delay
        setTimeout(() => {
          navigationInProgress.current = false;
        }, 100);
      }
    }
  };

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        logDebug('Initializing authentication...');

        // Get initial session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          logDebug('Session error:', error);
          setAuthState('unauthenticated');
          await handleNavigation(null, null);
          return;
        }

        // Set initial state
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          if (mounted) {
            setUserRole(role);
            setAuthState('authenticated');
            await handleNavigation(session, role);
          }
        } else {
          if (mounted) {
            setAuthState('unauthenticated');
            await handleNavigation(null, null);
          }
        }

        // Set up auth listener after initial state is set
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            logDebug('Auth state change:', { event, userEmail: session?.user?.email });
            
            // Update session and user state
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Fetch role for the user
              const role = await fetchUserRole(session.user.id);
              if (mounted) {
                setUserRole(role);
                setAuthState('authenticated');
                // Handle navigation after role is set
                await handleNavigation(session, role);
              }
            } else {
              if (mounted) {
                setUserRole(null);
                setAuthState('unauthenticated');
                // Clear role cache on logout
                roleCache.current = {};
                await handleNavigation(null, null);
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        logDebug('Auth initialization error:', error);
        if (mounted) {
          setAuthState('unauthenticated');
          await handleNavigation(null, null);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Loading state
  if (authState === 'loading') {
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
    return null;
  }

  // Authenticated state - render children
  return <>{children}</>;
};

export default AuthGuard;
