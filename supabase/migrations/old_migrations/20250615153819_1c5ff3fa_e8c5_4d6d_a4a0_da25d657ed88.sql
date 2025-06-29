
-- Create email_templates table for managing reusable email templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  category TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create communications table for unified inbox
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id),
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'portal_message')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_rules table for workflow automation
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN ('task_completed', 'status_changed', 'document_signed')),
  trigger_condition JSONB,
  template_id UUID REFERENCES public.email_templates(id) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_executions table to track automation runs
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.automation_rules(id) NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB
);

-- Add e-signature columns to existing documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS e_sign_provider TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS e_sign_request_id TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS e_sign_status TEXT CHECK (e_sign_status IN ('draft', 'sent', 'completed', 'voided'));

-- Enable RLS on new tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_templates
CREATE POLICY "Users can view email templates" 
  ON public.email_templates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Coordinators can manage email templates" 
  ON public.email_templates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'coordinator'
    )
  );

-- RLS policies for communications
CREATE POLICY "Users can view their communications" 
  ON public.communications 
  FOR SELECT 
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'coordinator'
    )
  );

CREATE POLICY "Users can create communications" 
  ON public.communications 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their communications" 
  ON public.communications 
  FOR UPDATE 
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'coordinator'
    )
  );

-- RLS policies for automation_rules
CREATE POLICY "Coordinators can manage automation rules" 
  ON public.automation_rules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'coordinator'
    )
  );

-- RLS policies for workflow_executions
CREATE POLICY "Users can view workflow executions" 
  ON public.workflow_executions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('coordinator', 'agent')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_email_templates_created_by ON public.email_templates(created_by);
CREATE INDEX idx_communications_transaction_id ON public.communications(transaction_id);
CREATE INDEX idx_communications_sender_recipient ON public.communications(sender_id, recipient_id);
CREATE INDEX idx_automation_rules_trigger_event ON public.automation_rules(trigger_event);
CREATE INDEX idx_workflow_executions_rule_transaction ON public.workflow_executions(rule_id, transaction_id);
CREATE INDEX idx_documents_e_sign_status ON public.documents(e_sign_status);

-- Enable realtime for communications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.communications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_executions;
