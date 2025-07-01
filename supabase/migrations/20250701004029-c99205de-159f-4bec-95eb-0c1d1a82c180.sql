
-- Add new tables for enhanced agent management features

-- Agent profile templates for quick setup
CREATE TABLE public.agent_profile_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enhanced communication settings
CREATE TABLE public.communication_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  notification_types JSONB NOT NULL DEFAULT '[]',
  template_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enhanced email templates with categories and variants
CREATE TABLE public.enhanced_email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  template_type TEXT NOT NULL DEFAULT 'agent_welcome',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Account lockout tracking
CREATE TABLE public.account_lockouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  locked_by UUID NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced activity logs for better audit trail
CREATE TABLE public.enhanced_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID,
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Temporary password tracking
CREATE TABLE public.temporary_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  password_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Communication history tracking
CREATE TABLE public.communication_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  communication_type TEXT NOT NULL,
  template_id UUID,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_agent_profile_templates_created_by ON public.agent_profile_templates(created_by);
CREATE INDEX idx_communication_settings_user_id ON public.communication_settings(user_id);
CREATE INDEX idx_enhanced_email_templates_category ON public.enhanced_email_templates(category);
CREATE INDEX idx_enhanced_email_templates_type ON public.enhanced_email_templates(template_type);
CREATE INDEX idx_account_lockouts_user_id ON public.account_lockouts(user_id);
CREATE INDEX idx_enhanced_activity_logs_user_id ON public.enhanced_activity_logs(user_id);
CREATE INDEX idx_enhanced_activity_logs_target_user ON public.enhanced_activity_logs(target_user_id);
CREATE INDEX idx_temporary_passwords_user_id ON public.temporary_passwords(user_id);
CREATE INDEX idx_communication_history_user_id ON public.communication_history(user_id);
CREATE INDEX idx_communication_history_recipient ON public.communication_history(recipient_id);

-- Enable RLS on all new tables
ALTER TABLE public.agent_profile_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent profile templates
CREATE POLICY "Coordinators can manage agent profile templates" ON public.agent_profile_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- RLS policies for communication settings
CREATE POLICY "Users can manage their own communication settings" ON public.communication_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Coordinators can view all communication settings" ON public.communication_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- RLS policies for enhanced email templates
CREATE POLICY "Coordinators can manage enhanced email templates" ON public.enhanced_email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- RLS policies for account lockouts
CREATE POLICY "Coordinators can manage account lockouts" ON public.account_lockouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- RLS policies for enhanced activity logs
CREATE POLICY "Users can view their own activity logs" ON public.enhanced_activity_logs
  FOR SELECT USING (user_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Coordinators can view all activity logs" ON public.enhanced_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

CREATE POLICY "System can insert activity logs" ON public.enhanced_activity_logs
  FOR INSERT WITH CHECK (true);

-- RLS policies for temporary passwords
CREATE POLICY "Coordinators can manage temporary passwords" ON public.temporary_passwords
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- RLS policies for communication history
CREATE POLICY "Users can view their own communication history" ON public.communication_history
  FOR SELECT USING (user_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Coordinators can view all communication history" ON public.communication_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

CREATE POLICY "System can insert communication history" ON public.communication_history
  FOR INSERT WITH CHECK (true);

-- Add functions for enhanced features
CREATE OR REPLACE FUNCTION public.lock_user_account(p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is coordinator
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF current_user_role != 'coordinator' THEN
    RAISE EXCEPTION 'Only coordinators can lock accounts';
  END IF;
  
  -- Insert lockout record
  INSERT INTO public.account_lockouts (
    user_id,
    locked_by,
    reason,
    is_active
  ) VALUES (
    p_user_id,
    auth.uid(),
    p_reason,
    true
  );
  
  -- Log the action
  INSERT INTO public.enhanced_activity_logs (
    user_id,
    target_user_id,
    action,
    category,
    description,
    entity_type,
    entity_id
  ) VALUES (
    auth.uid(),
    p_user_id,
    'account_lock',
    'security',
    'Account locked: ' || COALESCE(p_reason, 'No reason provided'),
    'profile',
    p_user_id
  );
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_user_account(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is coordinator
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF current_user_role != 'coordinator' THEN
    RAISE EXCEPTION 'Only coordinators can unlock accounts';
  END IF;
  
  -- Deactivate all active lockouts for this user
  UPDATE public.account_lockouts
  SET is_active = false, unlock_at = now()
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Log the action
  INSERT INTO public.enhanced_activity_logs (
    user_id,
    target_user_id,
    action,
    category,
    description,
    entity_type,
    entity_id
  ) VALUES (
    auth.uid(),
    p_user_id,
    'account_unlock',
    'security',
    'Account unlocked',
    'profile',
    p_user_id
  );
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_account_locked(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.account_lockouts
    WHERE user_id = p_user_id 
    AND is_active = true
    AND (unlock_at IS NULL OR unlock_at > now())
  );
END;
$$;

-- Add trigger for activity logging
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log significant profile changes
    IF OLD.invitation_status != NEW.invitation_status THEN
      INSERT INTO public.enhanced_activity_logs (
        user_id,
        target_user_id,
        action,
        category,
        description,
        entity_type,
        entity_id,
        metadata
      ) VALUES (
        auth.uid(),
        NEW.id,
        'status_change',
        'agent_management',
        'Status changed from ' || OLD.invitation_status || ' to ' || NEW.invitation_status,
        'profile',
        NEW.id,
        jsonb_build_object(
          'old_status', OLD.invitation_status,
          'new_status', NEW.invitation_status
        )
      );
    END IF;
  END IF;
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER profile_changes_audit_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_changes();

-- Insert some default email templates
INSERT INTO public.enhanced_email_templates (name, category, template_type, subject, body_html, variables, created_by) VALUES
('Agent Welcome', 'onboarding', 'agent_welcome', 'Welcome to Our Team, {{agent_name}}!', 
'<h1>Welcome {{agent_name}}!</h1><p>We are excited to have you join our team. Your account has been created and you can now access your dashboard.</p><p>Next steps:</p><ul><li>Complete your profile setup</li><li>Review your vendor preferences</li><li>Explore the platform features</li></ul><p>If you have any questions, please don''t hesitate to reach out.</p>', 
'["agent_name", "login_url", "support_email"]', 
(SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1)),

('Setup Reminder', 'reminders', 'setup_reminder', 'Complete Your Account Setup', 
'<h2>Hi {{agent_name}},</h2><p>We noticed you haven''t completed your account setup yet. Please take a few minutes to finish setting up your profile.</p><p><a href="{{setup_url}}">Complete Setup Now</a></p><p>This will only take a few minutes and will help us serve you better.</p>', 
'["agent_name", "setup_url", "days_since_invitation"]',
(SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1)),

('Account Activated', 'notifications', 'account_activated', 'Your Account is Now Active', 
'<h1>Account Activated!</h1><p>Great news {{agent_name}}! Your account has been activated and you now have full access to the platform.</p><p><a href="{{dashboard_url}}">Access Your Dashboard</a></p><p>Welcome to the team!</p>', 
'["agent_name", "dashboard_url", "activated_by"]',
(SELECT id FROM public.profiles WHERE role = 'coordinator' LIMIT 1));
