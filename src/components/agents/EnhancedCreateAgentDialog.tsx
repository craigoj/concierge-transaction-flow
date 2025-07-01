
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
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
      sendEmail: true,
      skipEmailVerification: false,
      accountStatus: "invited",
      setupMethod: "email_invitation",
      adminNotes: "",
    },
  });

  // Fetch agent profile templates
  const { data: templates } = useQuery({
    queryKey: ['agent-profile-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_profile_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const watchSendEmail = form.watch("sendEmail");
  const watchSetupMethod = form.watch("setupMethod");

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const applyTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (!template) return;

    const templateData = template.template_data as any;
    
    // Apply template data to form
    if (templateData.firstName) form.setValue("firstName", templateData.firstName);
    if (templateData.lastName) form.setValue("lastName", templateData.lastName);
    if (templateData.email) form.setValue("email", templateData.email);
    if (templateData.phoneNumber) form.setValue("phoneNumber", templateData.phoneNumber);
    if (templateData.brokerage) form.setValue("brokerage", templateData.brokerage);
    if (templateData.setupMethod) form.setValue("setupMethod", templateData.setupMethod);
    if (templateData.adminNotes) form.setValue("adminNotes", templateData.adminNotes);

    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to the form.`,
    });
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
      console.log('Starting agent creation process...');
      console.log('Form data:', {
        ...data,
        password: data.password ? '[REDACTED]' : null
      });

      if (data.setupMethod === "manual_creation") {
        console.log('Using manual creation method...');
        
        // Use the enhanced edge function for manual creation
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

      } else {
        console.log('Using email invitation method...');
        
        // Use existing email invitation method
        const { data: response, error } = await supabase.functions.invoke('create-agent-invitation', {
          body: {
            ...data,
            isResend: false,
          },
        });

        if (error) {
          console.error('Invitation function error:', error);
          throw error;
        }

        if (!response?.success) {
          throw new Error(response?.error || "Failed to create agent invitation");
        }

        const message = data.sendEmail 
          ? `Invitation email sent to ${data.email}` 
          : `Agent account created for ${data.email}. No email was sent.`;

        setSuccess(message);
        
        toast({
          title: "Agent Invitation Created",
          description: message,
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
          Add New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-brand-taupe/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-brand-heading text-brand-charcoal">
            Create New Agent Account
          </DialogTitle>
          <DialogDescription>
            Create a new agent account with the selected setup method.
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Template Selection */}
          {templates && templates.length > 0 && (
            <div className="space-y-2">
              <Label className="font-brand-body text-brand-charcoal">
                Apply Template (Optional)
              </Label>
              <Select value={selectedTemplate} onValueChange={(value) => {
                setSelectedTemplate(value);
                if (value) applyTemplate(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template to pre-fill form..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.description && (
                        <span className="text-xs text-gray-500 ml-2">
                          - {template.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          {/* Setup Method Selection */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Label className="text-base font-medium text-brand-charcoal">Setup Method</Label>
            <Select 
              value={watchSetupMethod}
              onValueChange={(value) => {
                form.setValue("setupMethod", value as any);
                clearMessages();
              }}
              disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <Label htmlFor="sendEmail">Send invitation email</Label>
                </div>

                {watchSendEmail && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="skipEmailVerification"
                      checked={form.watch("skipEmailVerification")}
                      onCheckedChange={(checked) => form.setValue("skipEmailVerification", checked)}
                      disabled={isLoading}
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
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                      <strong>Generated Password:</strong> {generatedPassword}
                      <br />
                      <em className="text-green-700">Make sure to share this with the agent securely.</em>
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
                watchSetupMethod === "manual_creation" ? "Create & Activate Agent" : "Create Agent"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
