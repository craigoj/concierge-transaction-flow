
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize authentication
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setAuthState('error');
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user role
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!mounted) return;

            if (profileError) {
              console.warn('Profile error:', profileError);
              // Default to 'agent' if profile not found
              setUserRole('agent');
            } else {
              setUserRole(profile?.role || 'agent');
            }
          } catch (err) {
            console.warn('Error fetching profile:', err);
            setUserRole('agent'); // Default fallback
          }
          
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError('Authentication failed');
          setAuthState('error');
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setAuthState('unauthenticated');
        } else if (event === 'SIGNED_IN' && session?.user) {
          setSession(session);
          setUser(session.user);
          setAuthState('authenticated');
          
          // Fetch role for signed in user
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              setUserRole(profile?.role || 'agent');
            } catch (err) {
              console.warn('Error fetching role on sign in:', err);
              setUserRole('agent');
            }
          }, 100);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation based on auth state and role
  useEffect(() => {
    if (authState === 'unauthenticated') {
      if (location.pathname !== '/auth') {
        navigate('/auth', { replace: true });
      }
      return;
    }

    if (authState === 'authenticated' && userRole) {
      // Handle role-based routing
      if (userRole === 'agent' && !location.pathname.startsWith('/agent/')) {
        navigate('/agent/dashboard', { replace: true });
      } else if (userRole === 'coordinator' && location.pathname.startsWith('/agent/')) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [authState, userRole, location.pathname, navigate]);

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

  // Error state
  if (authState === 'error') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-brand-body mb-4">Authentication Error</p>
          <p className="text-brand-charcoal/60 font-brand-body">{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="mt-4 px-4 py-2 bg-brand-charcoal text-white rounded"
          >
            Go to Login
          </button>
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
