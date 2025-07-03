
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
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

const AgentSetup = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [agentInfo, setAgentInfo] = useState<{ firstName: string; email: string } | null>(null);
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
          description: "This invitation link is invalid.",
        });
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, email, invitation_status, onboarding_completed_at")
          .eq("invitation_token", token)
          .eq("role", "agent")
          .single();

        if (error || !data) {
          throw new Error("Invalid invitation token");
        }

        if (data.onboarding_completed_at) {
          toast({
            title: "Account Already Active",
            description: "This invitation has already been used. Please sign in.",
          });
          navigate("/auth");
          return;
        }

        setAgentInfo({
          firstName: data.first_name || "Agent",
          email: data.email || "",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "This invitation link is invalid or has expired.",
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
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("invitation_token", token)
        .single();

      if (profileError || !profileData) {
        throw new Error("Invalid invitation");
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: data.password,
      });

      if (signInError) {
        throw new Error("Failed to sign in with new password");
      }

      const { error: completeError } = await supabase
        .from("profiles")
        .update({
          onboarding_completed_at: new Date().toISOString(),
          invitation_status: "completed",
          invitation_token: null,
        })
        .eq("id", profileData.id);

      if (completeError) {
        throw new Error("Failed to complete setup");
      }

      toast({
        title: "Welcome to The Agent Concierge!",
        description: "Your account has been set up successfully.",
      });

      navigate("/agent/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Failed to complete account setup",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: "Weak", color: "text-red-500" };
      case 2:
      case 3:
        return { text: "Medium", color: "text-yellow-500" };
      case 4:
      case 5:
        return { text: "Strong", color: "text-green-500" };
      default:
        return { text: "", color: "" };
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-charcoal mx-auto mb-4" />
          <p className="text-brand-charcoal/60 font-brand-body">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!agentInfo) {
    return null;
  }

  const passwordStrength = getPasswordStrength(form.watch("password") || "");
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-brand-elevation border border-brand-taupe/20 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-charcoal rounded-xl flex items-center justify-center mx-auto mb-4">
              <img 
                src="/lovable-uploads/5daf1e7a-db5b-46d0-bd10-afb6f64213b2.png"
                alt="The Agent Concierge Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-2xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide mb-2">
              Welcome, {agentInfo.firstName}
            </h1>
            <p className="text-brand-charcoal/60 font-brand-body">
              Let's secure your account to complete setup
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-brand-body text-brand-charcoal">
                Password
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
              {form.watch("password") && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 w-6 rounded ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
              )}
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
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-brand-charcoal/40 font-brand-body">
              © 2024 The Agent Concierge Co. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSetup;
