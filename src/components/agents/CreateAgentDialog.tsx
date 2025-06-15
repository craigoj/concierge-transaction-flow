
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createAgentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional(),
  brokerage: z.string().optional(),
});

type CreateAgentForm = z.infer<typeof createAgentSchema>;

interface CreateAgentDialogProps {
  onAgentCreated: () => void;
}

export const CreateAgentDialog = ({ onAgentCreated }: CreateAgentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      brokerage: "",
    },
  });

  const onSubmit = async (data: CreateAgentForm) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      console.log("Making request to create-agent-invitation with data:", data);

      const response = await supabase.functions.invoke('create-agent-invitation', {
        body: data,
      });

      console.log("Function response:", response);

      if (response.error) {
        throw new Error(response.error.message || "Failed to create agent invitation");
      }

      if (!response.data) {
        throw new Error("No response data received");
      }

      toast({
        title: "Agent Invitation Sent",
        description: `Welcome email sent to ${data.email}. The agent can now set up their account.`,
      });

      form.reset();
      setOpen(false);
      onAgentCreated();
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create agent invitation",
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
      <DialogContent className="sm:max-w-[500px] bg-white border-brand-taupe/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-brand-heading text-brand-charcoal">
            Create New Agent Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                "Create Agent Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
