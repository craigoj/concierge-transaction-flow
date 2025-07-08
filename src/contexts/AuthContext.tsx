
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
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

  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      console.log('Fetching user role for:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000); // 10 second timeout
      });
      
      const queryPromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'agent';
      }
      
      const role = profile?.role || 'agent';
      console.log('User role fetched:', role);
      return role;
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      return 'agent';
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSession = async (newSession: Session | null) => {
    console.log('Handling session:', newSession?.user?.id || 'null');
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    if (newSession?.user) {
      try {
        const role = await fetchUserRole(newSession.user.id);
        setUserRole(role);
      } catch (error) {
        console.error('Error in handleSession:', error);
        setUserRole('agent'); // Default fallback
      }
    } else {
      setUserRole(null);
    }
    
    console.log('Setting loading to false');
    setLoading(false);
  };

  useEffect(() => {
    // Set up maximum loading timeout as failsafe
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout reached - forcing loading to false');
      setLoading(false);
    }, 15000); // 15 second absolute maximum

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          clearTimeout(loadingTimeout);
          return;
        }
        
        await handleSession(session);
        clearTimeout(loadingTimeout);
      }
    );

    // Check for existing session with proper error handling
    try {
      if (supabase?.auth?.getSession) {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          console.log('Initial session check:', session?.user?.id || 'null', error?.message || 'no error');
          if (error) {
            console.error('Session error:', error);
            setLoading(false);
            clearTimeout(loadingTimeout);
            return;
          }
          handleSession(session).finally(() => {
            clearTimeout(loadingTimeout);
          });
        }).catch((error) => {
          console.error('Failed to get session:', error);
          setLoading(false);
          clearTimeout(loadingTimeout);
        });
      } else {
        console.warn('Supabase client not properly initialized');
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    } catch (error) {
      console.error('Error accessing supabase auth:', error);
      setLoading(false);
      clearTimeout(loadingTimeout);
    }

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
