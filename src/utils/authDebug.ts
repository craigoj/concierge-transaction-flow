
export const clearAuthDebugData = () => {
  try {
    // Clear all authentication-related data
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    
    // Clear any cached data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[AuthDebug] Cleared all auth data');
  } catch (error) {
    console.error('[AuthDebug] Error clearing auth data:', error);
  }
};

export const logAuthState = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('[AuthDebug] Current auth state:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      sessionError: error,
      localStorage: {
        supabaseKeys: Object.keys(localStorage).filter(key => key.includes('supabase'))
      }
    });
    
    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      console.log('[AuthDebug] User profile:', {
        profile,
        profileError
      });
    }
  } catch (error) {
    console.error('[AuthDebug] Error checking auth state:', error);
  }
};

// Make debug functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).__authDebug = {
    clearAuthData: clearAuthDebugData,
    logAuthState: logAuthState
  };
}
