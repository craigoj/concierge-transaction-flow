
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
  
  // Prevent multiple navigation calls and role fetching
  const navigationInProgress = useRef(false);
  const roleCache = useRef<{ [userId: string]: string }>({});
  const authInitialized = useRef(false);

  const logDebug = (message: string, data?: any) => {
    console.log(`[AuthGuard] ${message}`, data || '');
  };

  // Centralized role fetching with caching
  const fetchUserRole = async (userId: string): Promise<string> => {
    // Check cache first
    if (roleCache.current[userId]) {
      logDebug('Using cached role:', roleCache.current[userId]);
      return roleCache.current[userId];
    }

    try {
      logDebug('Fetching role for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        logDebug('Error fetching role:', error);
        const defaultRole = 'agent';
        roleCache.current[userId] = defaultRole;
        return defaultRole;
      }

      const role = profile?.role || 'agent';
      roleCache.current[userId] = role;
      logDebug('Fetched role:', role);
      return role;
    } catch (error) {
      logDebug('Exception fetching role:', error);
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
    logDebug('Handling navigation', { 
      hasSession: !!session, 
      role, 
      currentPath,
      userId: session?.user?.id
    });

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

  // Clear auth state completely
  const clearAuthState = () => {
    logDebug('Clearing auth state');
    setSession(null);
    setUser(null);
    setUserRole(null);
    roleCache.current = {};
    setAuthState('unauthenticated');
  };

  // Process auth state change
  const processAuthState = async (session: Session | null) => {
    if (!session?.user) {
      clearAuthState();
      await handleNavigation(null, null);
      return;
    }

    logDebug('Processing auth state for user:', session.user.email);
    
    // Set session and user immediately
    setSession(session);
    setUser(session.user);

    // Fetch role
    try {
      const role = await fetchUserRole(session.user.id);
      setUserRole(role);
      setAuthState('authenticated');
      
      // Handle navigation after we have both session and role
      await handleNavigation(session, role);
    } catch (error) {
      logDebug('Error processing auth state:', error);
      clearAuthState();
      await handleNavigation(null, null);
    }
  };

  // Initialize auth state and set up listener
  useEffect(() => {
    if (authInitialized.current) {
      logDebug('Auth already initialized, skipping');
      return;
    }

    authInitialized.current = true;
    logDebug('Initializing authentication...');

    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logDebug('Auth state change:', { event, userEmail: session?.user?.email });
        
        // Handle different auth events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          clearAuthState();
          await handleNavigation(null, null);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await processAuthState(session);
          return;
        }

        // For other events, just process the session
        await processAuthState(session);
      }
    );

    // Then get initial session
    const initializeSession = async () => {
      try {
        logDebug('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logDebug('Initial session error:', error);
          // If it's a refresh token error, clear auth state
          if (error.message?.includes('refresh') || error.message?.includes('token')) {
            await supabase.auth.signOut();
            clearAuthState();
            await handleNavigation(null, null);
            return;
          }
        }

        await processAuthState(session);
      } catch (error) {
        logDebug('Exception getting initial session:', error);
        clearAuthState();
        await handleNavigation(null, null);
      }
    };

    initializeSession();

    return () => {
      logDebug('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

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
