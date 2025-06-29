
-- Create communication_logs table to track all interactions
CREATE TABLE public.communication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('client', 'agent', 'vendor')),
  contact_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'phone', 'text', 'meeting', 'note')),
  subject TEXT,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create communication_preferences table
CREATE TABLE public.communication_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('client', 'agent')),
  preferred_method TEXT NOT NULL CHECK (preferred_method IN ('email', 'phone', 'text')),
  preferred_time TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, contact_type)
);

-- Create activity_logs table for tracking user activities
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('transaction', 'client', 'task', 'document')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'viewed', 'completed')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add profile image and additional fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Update clients table to include more detailed information
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'text'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for communication_logs
CREATE POLICY "Users can view their own communication logs" 
  ON public.communication_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own communication logs" 
  ON public.communication_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communication logs" 
  ON public.communication_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for communication_preferences
CREATE POLICY "Users can view communication preferences for their contacts" 
  ON public.communication_preferences 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = communication_preferences.contact_id 
      AND communication_preferences.contact_type = 'client'
      AND EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE transactions.id = clients.transaction_id 
        AND transactions.agent_id = auth.uid()
      )
    )
    OR 
    (communication_preferences.contact_type = 'agent' AND communication_preferences.contact_id = auth.uid())
  );

CREATE POLICY "Users can manage communication preferences for their contacts" 
  ON public.communication_preferences 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.clients 
      WHERE clients.id = communication_preferences.contact_id 
      AND communication_preferences.contact_type = 'client'
      AND EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE transactions.id = clients.transaction_id 
        AND transactions.agent_id = auth.uid()
      )
    )
    OR 
    (communication_preferences.contact_type = 'agent' AND communication_preferences.contact_id = auth.uid())
  );

-- RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs" 
  ON public.activity_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" 
  ON public.activity_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_communication_logs_user_id ON public.communication_logs(user_id);
CREATE INDEX idx_communication_logs_contact ON public.communication_logs(contact_id, contact_type);
CREATE INDEX idx_communication_logs_transaction ON public.communication_logs(transaction_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_id, entity_type);
