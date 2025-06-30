
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
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
  sendEmail: z.boolean().default(true),
  skipEmailVerification: z.boolean().default(false),
  accountStatus: z.enum(["active", "pending", "invited"]).default("invited"),
  setupMethod: z.enum(["email_invitation", "manual_creation", "assisted_setup"]).default("email_invitation"),
  adminNotes: z.string().optional(),
});

type CreateAgentForm = z.infer<typeof createAgentSchema>;

interface EnhancedCreateAgentDialogProps {
  onAgentCreated: () => void;
}

export const EnhancedCreateAgentDialog = ({ onAgentCreated }: EnhancedCreateAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
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
      sendEmail: true,
      skipEmailVerification: false,
      accountStatus: "invited",
      setupMethod: "email_invitation",
      adminNotes: "",
    },
  });

  const watchSendEmail = form.watch("sendEmail");
  const watchSetupMethod = form.watch("setupMethod");

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    form.setValue("password", password);
    setGeneratedPassword(password);
    setShowPassword(true);
  };

  const onSubmit = async (data: CreateAgentForm) => {
    setIsLoading(true);
    try {
      if (data.setupMethod === "manual_creation") {
        // Use the new manual creation function
        const { data: response, error } = await supabase.rpc('create_manual_agent', {
          p_email: data.email,
          p_first_name: data.firstName,
          p_last_name: data.lastName,
          p_phone: data.phoneNumber || null,
          p_brokerage: data.brokerage || null,
          p_password: data.password || null,
        });

        if (error) throw error;

        toast({
          title: "Agent Created Successfully",
          description: `${data.firstName} ${data.lastName} has been created and activated. ${response.temporary_password ? `Temporary password: ${response.temporary_password}` : ''}`,
        });

        if (response.temporary_password) {
          setGeneratedPassword(response.temporary_password);
        }
      } else {
        // Use existing email invitation method
        const { data: response, error } = await supabase.functions.invoke('create-agent-invitation', {
          body: {
            ...data,
            isResend: false,
          },
        });

        if (error) throw error;

        if (!response?.success) {
          throw new Error(response?.error || "Failed to create agent invitation");
        }

        const message = data.sendEmail 
          ? `Invitation email sent to ${data.email}` 
          : `Agent account created for ${data.email}. No email was sent.`;

        toast({
          title: "Agent Invitation Created",
          description: message,
        });
      }

      form.reset();
      setOpen(false);
      onAgentCreated();
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create agent",
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
          Add New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-brand-taupe/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-brand-heading text-brand-charcoal">
            Create New Agent Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              />
            </div>
          </div>

          {/* Setup Method Selection */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Label className="text-base font-medium text-brand-charcoal">Setup Method</Label>
            <Select 
              value={watchSetupMethod}
              onValueChange={(value) => form.setValue("setupMethod", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email_invitation">Email Invitation (Standard)</SelectItem>
                <SelectItem value="manual_creation">Manual Creation (Immediate)</SelectItem>
                <SelectItem value="assisted_setup">Assisted Setup (Guided)</SelectItem>
              </SelectContent>
            </Select>

            {watchSetupMethod === "email_invitation" && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendEmail"
                    checked={watchSendEmail}
                    onCheckedChange={(checked) => form.setValue("sendEmail", checked)}
                  />
                  <Label htmlFor="sendEmail">Send invitation email</Label>
                </div>

                {watchSendEmail && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="skipEmailVerification"
                      checked={form.watch("skipEmailVerification")}
                      onCheckedChange={(checked) => form.setValue("skipEmailVerification", checked)}
                    />
                    <Label htmlFor="skipEmailVerification">Skip email verification</Label>
                  </div>
                )}
              </div>
            )}

            {watchSetupMethod === "manual_creation" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-brand-body text-brand-charcoal">
                    Initial Password (optional)
                  </Label>
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
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <strong>Generated Password:</strong> {generatedPassword}
                      <br />
                      <em>Make sure to share this with the agent securely.</em>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes" className="font-brand-body text-brand-charcoal">
              Admin Notes (optional)
            </Label>
            <Textarea
              id="adminNotes"
              {...form.register("adminNotes")}
              className="border-brand-taupe/30 focus:border-brand-charcoal"
              disabled={isLoading}
              rows={3}
              placeholder="Internal notes about this agent..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
                watchSetupMethod === "manual_creation" ? "Create & Activate Agent" : "Create Agent"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
