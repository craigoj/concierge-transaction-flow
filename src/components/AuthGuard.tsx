
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user role
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!mounted) return;

            if (!profileError && profile) {
              setUserRole(profile.role);
              
              // Handle role-based routing
              if (profile.role === 'agent' && !location.pathname.startsWith('/agent/')) {
                navigate('/agent/dashboard', { replace: true });
              } else if (profile.role === 'coordinator' && location.pathname.startsWith('/agent/')) {
                navigate('/dashboard', { replace: true });
              }
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setUserRole(null);
          navigate('/auth', { replace: true });
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Fetch role on sign in
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!mounted) return;

            if (!error && profile) {
              setUserRole(profile.role);
              
              // Navigate based on role
              if (profile.role === 'agent') {
                navigate('/agent/dashboard', { replace: true });
              } else {
                navigate('/dashboard', { replace: true });
              }
            }
          } catch (error) {
            console.error('Error fetching user role on sign in:', error);
          }
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to avoid infinite loops

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user && !session) {
      navigate('/auth', { replace: true });
    }
  }, [loading, user, session, navigate]);

  // Show loading spinner while checking auth
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
  if (!user || !session) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
