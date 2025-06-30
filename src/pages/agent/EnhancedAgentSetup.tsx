
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const setupSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SetupForm = z.infer<typeof setupSchema>;

const EnhancedAgentSetup = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [agentInfo, setAgentInfo] = useState<{ firstName: string; email: string; setupMethod: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast({
          variant: "destructive",
          title: "Invalid Link",
          description: "This setup link is invalid.",
        });
        navigate("/auth");
        return;
      }

      try {
        // Check if it's a setup link token
        const { data: invitationData, error: invitationError } = await supabase
          .from("agent_invitations")
          .select(`
            agent_id,
            email,
            expires_at,
            status,
            creation_method,
            profiles!agent_invitations_agent_id_fkey(first_name, last_name, setup_method)
          `)
          .eq("setup_link_token", token)
          .single();

        if (invitationError || !invitationData) {
          // Fallback to check invitation token in profiles
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("first_name, email, invitation_status, onboarding_completed_at, setup_method")
            .eq("invitation_token", token)
            .eq("role", "agent")
            .single();

          if (profileError || !profileData) {
            throw new Error("Invalid or expired setup link");
          }

          if (profileData.onboarding_completed_at) {
            toast({
              title: "Account Already Active",
              description: "This setup link has already been used. Please sign in.",
            });
            navigate("/auth");
            return;
          }

          setAgentInfo({
            firstName: profileData.first_name || "Agent",
            email: profileData.email || "",
            setupMethod: profileData.setup_method || "email_invitation",
          });
        } else {
          // Setup link token found
          if (invitationData.expires_at && new Date(invitationData.expires_at) < new Date()) {
            throw new Error("Setup link has expired");
          }

          const profileData = Array.isArray(invitationData.profiles) 
            ? invitationData.profiles[0] 
            : invitationData.profiles;

          setAgentInfo({
            firstName: profileData?.first_name || "Agent",
            email: invitationData.email,
            setupMethod: profileData?.setup_method || "assisted_setup",
          });
        }
      } catch (error: any) {
        console.error("Token validation error:", error);
        toast({
          variant: "destructive",
          title: "Invalid Setup Link",
          description: error.message || "This setup link is invalid or has expired.",
        });
        navigate("/auth");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, navigate, toast]);

  const onSubmit = async (data: SetupForm) => {
    if (!token || !agentInfo) return;

    setIsLoading(true);
    try {
      let agentId: string;

      // Get agent ID from setup link or profile token
      const { data: invitationData } = await supabase
        .from("agent_invitations")
        .select("agent_id")
        .eq("setup_link_token", token)
        .single();

      if (invitationData) {
        agentId = invitationData.agent_id;
      } else {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("invitation_token", token)
          .single();

        if (profileError || !profileData) {
          throw new Error("Invalid setup token");
        }
        agentId = profileData.id;
      }

      // Set password using manual setup function
      const { data: setupResponse, error: setupError } = await supabase.functions.invoke('manual-agent-setup', {
        body: {
          agentId,
          password: data.password,
          skipOnboarding: false,
        },
      });

      if (setupError || !setupResponse?.success) {
        throw new Error(setupResponse?.error || "Failed to complete setup");
      }

      // Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: agentInfo.email,
        password: data.password,
      });

      if (signInError || !signInData.user) {
        throw new Error("Setup completed but failed to sign in. Please try signing in manually.");
      }

      toast({
        title: "Setup Complete!",
        description: "Your account has been activated successfully.",
      });

      // Redirect based on setup method
      if (agentInfo.setupMethod === "manual_creation") {
        navigate("/agent/dashboard");
      } else {
        navigate("/agent/intake");
      }
    } catch (error: any) {
      console.error("Setup error:", error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Failed to complete account setup",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-charcoal mx-auto mb-4" />
            <p className="text-brand-charcoal/60 font-brand-body">Validating setup link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agentInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-brand-elevation border border-brand-taupe/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-brand-charcoal rounded-xl flex items-center justify-center mx-auto mb-4">
              <img 
                src="/lovable-uploads/5daf1e7a-db5b-46d0-bd10-afb6f64213b2.png"
                alt="The Agent Concierge Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
              Welcome, {agentInfo.firstName}
            </CardTitle>
            <p className="text-brand-charcoal/60 font-brand-body">
              Complete your account setup to get started
            </p>
            {agentInfo.setupMethod === "manual_creation" && (
              <div className="flex items-center justify-center space-x-2 mt-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Admin-assisted setup</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-brand-body text-brand-charcoal">
                  Create Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    className="border-brand-taupe/30 focus:border-brand-charcoal pr-10"
                    disabled={isLoading}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-brand-body text-brand-charcoal">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...form.register("confirmPassword")}
                    className="border-brand-taupe/30 focus:border-brand-charcoal pr-10"
                    disabled={isLoading}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl font-brand-heading font-medium py-3 h-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing Setup...
                  </>
                ) : (
                  "Complete Account Setup"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-brand-charcoal/40 font-brand-body">
                © 2024 The Agent Concierge Co. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAgentSetup;
