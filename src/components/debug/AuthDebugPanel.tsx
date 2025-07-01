
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clearAuthDebugData, logAuthState } from '@/utils/authDebug';

const AuthDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthState = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      let profileData = null;
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        profileData = { profile, profileError };
      }
      
      setDebugInfo({
        session: session ? {
          user: session.user,
          expires_at: session.expires_at,
          access_token: session.access_token ? 'present' : 'missing'
        } : null,
        sessionError: error,
        profileData,
        localStorage: Object.keys(localStorage).filter(key => key.includes('supabase'))
      });
    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    try {
      console.log('Testing sign in with admin@demo.com...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@demo.com',
        password: 'password123'
      });
      
      console.log('Sign in result:', { data, error });
    } catch (error) {
      console.error('Sign in test error:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkAuthState} disabled={loading}>
            Check Auth State
          </Button>
          <Button onClick={logAuthState} variant="outline">
            Log to Console
          </Button>
          <Button onClick={clearAuthDebugData} variant="outline">
            Clear Auth Data
          </Button>
          <Button onClick={testSignIn} variant="outline">
            Test Sign In
          </Button>
        </div>
        
        {debugInfo && (
          <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugPanel;
