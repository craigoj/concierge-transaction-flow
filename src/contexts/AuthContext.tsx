
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LOADING_TIMEOUT = 10000; // 10 seconds timeout

  const fetchUserRole = async (userId: string): Promise<string> => {
    console.log('AuthContext: Fetching user role for:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('AuthContext: Profile fetch error:', error);
        return 'agent'; // Default role
      }
      
      const role = profile?.role || 'agent';
      console.log('AuthContext: User role fetched:', role);
      return role;
    } catch (error) {
      console.error('AuthContext: Error fetching user role:', error);
      return 'agent'; // Default role
    }
  };

  const signOut = async () => {
    console.log('AuthContext: Signing out user');
    await supabase.auth.signOut();
  };

  const handleSession = async (newSession: Session | null) => {
    console.log('AuthContext: Handling session change:', !!newSession);
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    if (newSession?.user) {
      try {
        const role = await fetchUserRole(newSession.user.id);
        setUserRole(role);
        setError(null);
      } catch (err) {
        console.error('AuthContext: Error handling session:', err);
        setError('Failed to load user data');
        setUserRole('agent'); // Default fallback
      }
    } else {
      setUserRole(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    console.log('AuthContext: Initializing authentication');
    
    // Set up a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('AuthContext: Loading timeout reached, setting loading to false');
      setLoading(false);
      setError('Authentication timeout - please refresh the page');
    }, LOADING_TIMEOUT);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, !!session);
        
        clearTimeout(loadingTimeout); // Clear timeout since we got a response
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          setError(null);
          return;
        }
        
        await handleSession(session);
      }
    );

    // Check for existing session
    console.log('AuthContext: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(loadingTimeout); // Clear timeout since we got a response
      
      if (error) {
        console.error('AuthContext: Session check error:', error);
        setError('Failed to check authentication status');
        setLoading(false);
        return;
      }
      
      console.log('AuthContext: Existing session found:', !!session);
      handleSession(session);
    }).catch((err) => {
      clearTimeout(loadingTimeout);
      console.error('AuthContext: Session check failed:', err);
      setError('Authentication check failed');
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Additional debug logging
  useEffect(() => {
    console.log('AuthContext: State update -', {
      loading,
      hasUser: !!user,
      userRole,
      hasError: !!error
    });
  }, [loading, user, userRole, error]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        loading,
        error,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
