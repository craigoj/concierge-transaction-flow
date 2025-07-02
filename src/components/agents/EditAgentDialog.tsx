
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

const editAgentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional(),
  brokerage: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsExperience: z.number().min(0).max(50).optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  specialties: z.string().optional(),
});

type EditAgentForm = z.infer<typeof editAgentSchema> & {
  yearsExperience: number | "";
};

interface EditAgentDialogProps {
  agent: any;
  open: boolean;
  onClose: () => void;
  onAgentUpdated: () => void;
}

export const EditAgentDialog = ({ agent, open, onClose, onAgentUpdated }: EditAgentDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<EditAgentForm>({
    resolver: zodResolver(editAgentSchema),
    defaultValues: {
      firstName: agent?.first_name || "",
      lastName: agent?.last_name || "",
      email: agent?.email || "",
      phoneNumber: agent?.phone_number || "",
      brokerage: agent?.brokerage || "",
      licenseNumber: agent?.license_number || "",
      yearsExperience: agent?.years_experience || "",
      bio: agent?.bio || "",
      specialties: agent?.specialties?.join(", ") || "",
    },
  });

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const onSubmit = async (data: EditAgentForm) => {
    clearMessages();
    setIsLoading(true);
    
    try {
      // Process specialties - convert comma-separated string to array
      const specialtiesArray = data.specialties 
        ? data.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phoneNumber || null,
          brokerage: data.brokerage || null,
          license_number: data.licenseNumber || null,
          years_experience: data.yearsExperience || null,
          bio: data.bio || null,
          specialties: specialtiesArray,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agent.id);

      if (error) throw error;

      setSuccess(`Agent ${data.firstName} ${data.lastName} has been updated successfully!`);
      
      toast({
        title: "Agent Updated Successfully",
        description: `${data.firstName} ${data.lastName} has been updated.`,
      });

      // Close dialog after successful update
      setTimeout(() => {
        onClose();
        setSuccess(null);
        onAgentUpdated();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error updating agent:", error);
      
      const errorMessage = error.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error Updating Agent",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when agent changes
  useEffect(() => {
    if (agent) {
      form.reset({
        firstName: agent.first_name || "",
        lastName: agent.last_name || "",
        email: agent.email || "",
        phoneNumber: agent.phone_number || "",
        brokerage: agent.brokerage || "",
        licenseNumber: agent.license_number || "",
        yearsExperience: agent.years_experience || "",
        bio: agent.bio || "",
        specialties: agent.specialties?.join(", ") || "",
      });
    }
  }, [agent, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-brand-taupe/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-brand-heading text-brand-charcoal">
            Edit Agent Profile
          </DialogTitle>
          <DialogDescription>
            Update agent information and professional details.
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="font-brand-body text-brand-charcoal">
                License Number
              </Label>
              <Input
                id="licenseNumber"
                {...form.register("licenseNumber")}
                className="border-brand-taupe/30 focus:border-brand-charcoal"
                disabled={isLoading}
                onChange={(e) => {
                  form.setValue("licenseNumber", e.target.value);
                  clearMessages();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience" className="font-brand-body text-brand-charcoal">
                Years of Experience
              </Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                max="50"
                {...form.register("yearsExperience", { 
                  setValueAs: (value) => value === "" ? "" : parseInt(value) 
                })}
                className="border-brand-taupe/30 focus:border-brand-charcoal"
                disabled={isLoading}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : parseInt(e.target.value);
                  form.setValue("yearsExperience", value);
                  clearMessages();
                }}
              />
              {form.formState.errors.yearsExperience && (
                <p className="text-sm text-red-500">{form.formState.errors.yearsExperience.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties" className="font-brand-body text-brand-charcoal">
              Specialties <span className="text-sm text-gray-500">(comma-separated)</span>
            </Label>
            <Input
              id="specialties"
              {...form.register("specialties")}
              placeholder="e.g., Luxury Homes, First-Time Buyers, Commercial"
              className="border-brand-taupe/30 focus:border-brand-charcoal"
              disabled={isLoading}
              onChange={(e) => {
                form.setValue("specialties", e.target.value);
                clearMessages();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="font-brand-body text-brand-charcoal">
              Bio <span className="text-sm text-gray-500">(max 500 characters)</span>
            </Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder="Professional bio and background..."
              className="border-brand-taupe/30 focus:border-brand-charcoal min-h-[100px]"
              disabled={isLoading}
              maxLength={500}
              onChange={(e) => {
                form.setValue("bio", e.target.value);
                clearMessages();
              }}
            />
            {form.formState.errors.bio && (
              <p className="text-sm text-red-500">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
                  Updating...
                </>
              ) : (
                "Update Agent"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
