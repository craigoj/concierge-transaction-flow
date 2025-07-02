
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createAgentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional(),
  brokerage: z.string().optional(),
  password: z.string().optional(),
});

type CreateAgentForm = z.infer<typeof createAgentSchema>;

interface StreamlinedCreateAgentDialogProps {
  onAgentCreated: () => void;
}

export const StreamlinedCreateAgentDialog = ({ onAgentCreated }: StreamlinedCreateAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      brokerage: "",
      password: "",
    },
  });

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const generatePassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    form.setValue("password", password);
    setGeneratedPassword(password);
    setShowPassword(true);
  };

  const onSubmit = async (data: CreateAgentForm) => {
    clearMessages();
    setIsLoading(true);
    
    try {
      console.log('Creating agent with manual creation method...');
      
      const { data: response, error } = await supabase.functions.invoke('create-manual-agent', {
        body: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || null,
          brokerage: data.brokerage || null,
          password: data.password || null,
        },
      });

      console.log('Edge function response:', { response, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || "Failed to create agent");
      }

      if (!response?.success) {
        console.error('Edge function returned failure:', response);
        throw new Error(response?.error || "Failed to create agent");
      }

      setSuccess(`Agent ${data.firstName} ${data.lastName} has been created and activated successfully!`);
      
      toast({
        title: "Agent Created Successfully",
        description: `${data.firstName} ${data.lastName} has been created and activated.`,
      });

      // Show password if generated
      if (response.data?.temporary_password) {
        setGeneratedPassword(response.data.temporary_password);
        toast({
          title: "Temporary Password Generated",
          description: "Please share the temporary password with the agent securely.",
        });
      }

      // Reset form and close dialog after successful creation
      setTimeout(() => {
        form.reset();
        setOpen(false);
        setSuccess(null);
        setGeneratedPassword(null);
        onAgentCreated();
      }, 3000);
      
    } catch (error: any) {
      console.error("Error creating agent:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error Creating Agent",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-brand-subtle font-brand-heading font-medium tracking-wide">
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white border-brand-taupe/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-brand-heading text-brand-charcoal">
            Create New Agent Account
          </DialogTitle>
          <DialogDescription>
            Create and activate a new agent account immediately.
          </DialogDescription>
        </DialogHeader>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-brand-body text-brand-charcoal">
                First Name *
              </Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                className="border-brand-taupe/30 focus:border-brand-charcoal"
                disabled={isLoading}
                onChange={(e) => {
                  form.setValue("firstName", e.target.value);
                  clearMessages();
                }}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-brand-body text-brand-charcoal">
                Last Name *
              </Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                className="border-brand-taupe/30 focus:border-brand-charcoal"
                disabled={isLoading}
                onChange={(e) => {
                  form.setValue("lastName", e.target.value);
                  clearMessages();
                }}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-brand-body text-brand-charcoal">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="border-brand-taupe/30 focus:border-brand-charcoal"
              disabled={isLoading}
              onChange={(e) => {
                form.setValue("email", e.target.value);
                clearMessages();
              }}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-brand-body text-brand-charcoal">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                {...form.register("phoneNumber")}
                className="border-brand-taupe/30 focus:border-brand-charcoal"
                disabled={isLoading}
                onChange={(e) => {
                  form.setValue("phoneNumber", e.target.value);
                  clearMessages();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brokerage" className="font-brand-body text-brand-charcoal">
                Brokerage
              </Label>
              <Input
                id="brokerage"
                {...form.register("brokerage")}
                className="border-brand-taupe/30 focus:border-brand-charcoal"
                disabled={isLoading}
                onChange={(e) => {
                  form.setValue("brokerage", e.target.value);
                  clearMessages();
                }}
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <Label className="text-base font-medium text-brand-charcoal">Initial Password</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    className="border-brand-taupe/30 focus:border-brand-charcoal pr-10"
                    disabled={isLoading}
                    placeholder="Leave empty to auto-generate"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  disabled={isLoading}
                >
                  Generate
                </Button>
              </div>
              {generatedPassword && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <strong>Generated Password:</strong> {generatedPassword}
                  <br />
                  <em className="text-green-700">Make sure to share this with the agent securely.</em>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setError(null);
                setSuccess(null);
              }}
              disabled={isLoading}
              className="border-brand-taupe/30 text-brand-charcoal hover:bg-brand-taupe/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-charcoal hover:bg-brand-charcoal/90 text-white rounded-xl font-brand-heading font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Activate Agent"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
