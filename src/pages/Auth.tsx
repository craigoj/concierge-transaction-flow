
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: error.message,
        });
      } else if (data.user) {
        toast({
          title: "Success!",
          description: "Signed in successfully. Redirecting...",
        });
        // AuthGuard will handle navigation automatically
      }
    } catch (error) {
      console.error('Sign in error:', error);
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
    if (loading) return;
    
    setLoading(true);

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

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Up Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
                disabled={loading}
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
