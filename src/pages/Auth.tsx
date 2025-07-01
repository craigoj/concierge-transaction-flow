
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug logging
  const logDebug = (message: string, data?: any) => {
    console.log(`[Auth] ${message}`, data || '');
  };

  useEffect(() => {
    let mounted = true;

    const checkInitialAuth = async () => {
      try {
        logDebug('Checking initial auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          logDebug('Session check error:', error);
          setCheckingAuth(false);
          return;
        }

        if (session?.user) {
          logDebug('User already authenticated:', session.user.email);
          
          // Check user role for proper redirect
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            
            if (!mounted) return;

            if (profileError) {
              logDebug('Profile error, using default redirect:', profileError);
              navigate('/dashboard', { replace: true });
            } else {
              const role = profile?.role || 'agent';
              logDebug('User role found:', role);
              
              if (role === 'agent') {
                navigate('/agent/dashboard', { replace: true });
              } else {
                navigate('/dashboard', { replace: true });
              }
            }
          } catch (error) {
            logDebug('Error fetching user role:', error);
            navigate('/dashboard', { replace: true });
          }
        } else {
          logDebug('No active session found');
        }
      } catch (error) {
        logDebug('Auth check error:', error);
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkInitialAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    logDebug('Attempting sign in...', { email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      logDebug('Sign in response:', { data: !!data, error });

      if (error) {
        logDebug('Sign in error:', error);
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: error.message,
        });
      } else {
        logDebug('Sign in successful, user:', data.user?.email);
        // Navigation will be handled by AuthGuard
      }
    } catch (error) {
      logDebug('Sign in exception:', error);
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    logDebug('Attempting sign up...', { email });

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            brokerage: brokerage,
            role: 'agent'
          }
        }
      });

      logDebug('Sign up response:', { data: !!data, error });

      if (error) {
        logDebug('Sign up error:', error);
        toast({
          variant: "destructive",
          title: "Sign Up Error",
          description: error.message,
        });
      } else {
        logDebug('Sign up successful');
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      logDebug('Sign up exception:', error);
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-charcoal mx-auto mb-4"></div>
          <p className="text-brand-charcoal/60 font-brand-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-cream to-brand-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-brand-elevation mb-6 border border-brand-taupe/20">
            <img 
              src="/lovable-uploads/c4831673-bd4c-4354-9ab1-25fe70b2edb2.png"
              alt="The Agent Concierge Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-3">
            THE AGENT CONCIERGE
          </h1>
          <p className="text-brand-charcoal/70 font-brand-body text-lg tracking-wider">
            REALTOR SUPPORT & SUCCESS CO.
          </p>
          <div className="w-24 h-px bg-brand-taupe mx-auto mt-6"></div>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-brand-heading font-medium text-brand-charcoal tracking-brand-wide mb-2">
            {isSignUp ? 'JOIN YOUR CONCIERGE PORTAL' : 'WELCOME TO YOUR PORTAL'}
          </h2>
          <p className="text-brand-charcoal/60 font-brand-body italic">
            {isSignUp 
              ? 'Experience excellence through intentional service' 
              : 'Where excellence meets intention'
            }
          </p>
        </div>

        {/* Debug info for testing */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-semibold text-blue-800">Test Account:</p>
          <p className="text-blue-600">Email: admin@demo.com</p>
          <p className="text-blue-600">Password: (any password)</p>
        </div>

        {/* Authentication Card */}
        <Card className="card-brand border-0 shadow-brand-glass">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal">
              {isSignUp ? 'CREATE YOUR ACCOUNT' : 'SIGN IN TO CONTINUE'}
            </CardTitle>
            <CardDescription className="text-brand-charcoal/60 font-brand-body">
              {isSignUp 
                ? 'Begin your journey with white-glove service' 
                : 'Access your personalized transaction coordination'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="font-brand-body text-brand-charcoal">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="font-brand-body text-brand-charcoal">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-brand-body text-brand-charcoal">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brokerage" className="font-brand-body text-brand-charcoal">Brokerage</Label>
                    <Input
                      id="brokerage"
                      type="text"
                      value={brokerage}
                      onChange={(e) => setBrokerage(e.target.value)}
                      className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-brand-body text-brand-charcoal">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-brand-body text-brand-charcoal">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-brand text-base py-6 mt-8" 
                disabled={loading}
              >
                {loading ? 'PLEASE WAIT...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
              </Button>
            </form>

            <div className="text-center pt-6 border-t border-brand-taupe/20">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-brand-charcoal/70 hover:text-brand-charcoal font-brand-body italic transition-colors duration-300"
              >
                {isSignUp ? 'Already have an account? Sign in here' : "Don't have an account? Join our concierge service"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Brand Footer */}
        <div className="text-center mt-8 text-brand-charcoal/50 font-brand-body text-sm italic">
          "Excellence is Intentional."
        </div>
      </div>
    </div>
  );
};

export default Auth;
