
-- Create workflow_templates table to store main templates
CREATE TABLE public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Listing', 'Buyer', 'General')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create template_tasks table to store individual tasks within templates
CREATE TABLE public.template_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description_notes TEXT,
  due_date_rule JSONB NOT NULL,
  phase TEXT,
  is_agent_visible BOOLEAN NOT NULL DEFAULT false,
  email_template_id UUID REFERENCES public.email_templates(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security policies
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for workflow_templates
CREATE POLICY "Users can view workflow templates" 
  ON public.workflow_templates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Coordinators can manage workflow templates" 
  ON public.workflow_templates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Policies for template_tasks
CREATE POLICY "Users can view template tasks" 
  ON public.template_tasks 
  FOR SELECT 
  USING (true);

CREATE POLICY "Coordinators can manage template tasks" 
  ON public.template_tasks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Create a function to apply workflow templates to transactions
CREATE OR REPLACE FUNCTION public.apply_workflow_template(
  p_transaction_id UUID,
  p_template_id UUID,
  p_applied_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_record RECORD;
  task_record RECORD;
  new_task_id UUID;
  workflow_instance_id UUID;
  transaction_record RECORD;
  calculated_due_date DATE;
  due_rule JSONB;
BEGIN
  -- Get template
  SELECT * INTO template_record FROM workflow_templates WHERE id = p_template_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;

  -- Get transaction for date calculations
  SELECT * INTO transaction_record FROM transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Create workflow instance
  INSERT INTO workflow_instances (transaction_id, template_id, applied_by)
  VALUES (p_transaction_id, p_template_id, p_applied_by)
  RETURNING id INTO workflow_instance_id;

  -- Create tasks from template
  FOR task_record IN 
    SELECT * FROM template_tasks 
    WHERE template_id = p_template_id 
    ORDER BY sort_order, created_at
  LOOP
    due_rule := task_record.due_date_rule;
    calculated_due_date := NULL;

    -- Calculate due date based on rule type
    IF due_rule->>'type' = 'days_from_event' THEN
      CASE due_rule->>'event'
        WHEN 'ratified_date' THEN
          IF transaction_record.created_at IS NOT NULL THEN
            calculated_due_date := (transaction_record.created_at::DATE) + INTERVAL '1 day' * (due_rule->>'days')::INTEGER;
          END IF;
        WHEN 'closing_date' THEN
          IF transaction_record.closing_date IS NOT NULL THEN
            calculated_due_date := transaction_record.closing_date + INTERVAL '1 day' * (due_rule->>'days')::INTEGER;
          END IF;
        ELSE
          -- Default to creation date if event not recognized
          calculated_due_date := (transaction_record.created_at::DATE) + INTERVAL '1 day' * (due_rule->>'days')::INTEGER;
      END CASE;
    ELSIF due_rule->>'type' = 'specific_date' THEN
      calculated_due_date := (due_rule->>'date')::DATE;
    END IF;

    -- Insert the task
    INSERT INTO tasks (
      transaction_id,
      title,
      description,
      due_date,
      requires_agent_action,
      agent_action_prompt,
      priority
    ) VALUES (
      p_transaction_id,
      task_record.subject,
      task_record.description_notes,
      calculated_due_date,
      task_record.is_agent_visible,
      CASE WHEN task_record.email_template_id IS NOT NULL 
           THEN 'Send email using template: ' || (SELECT name FROM email_templates WHERE id = task_record.email_template_id)
           ELSE NULL END,
      'medium'::task_priority
    ) RETURNING id INTO new_task_id;

  END LOOP;

  RETURN workflow_instance_id;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_template_tasks_template_id ON public.template_tasks(template_id);
CREATE INDEX idx_template_tasks_sort_order ON public.template_tasks(template_id, sort_order);
CREATE INDEX idx_workflow_templates_type ON public.workflow_templates(type) WHERE is_active = true;
