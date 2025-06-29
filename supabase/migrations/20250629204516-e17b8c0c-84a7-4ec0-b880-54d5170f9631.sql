
-- Create agent_intake_sessions table for tracking intake progress
CREATE TABLE public.agent_intake_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  vendor_data JSONB,
  branding_data JSONB,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.agent_intake_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for agents to manage their own intake sessions
CREATE POLICY "Agents can view their own intake sessions" 
  ON public.agent_intake_sessions 
  FOR SELECT 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own intake sessions" 
  ON public.agent_intake_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own intake sessions" 
  ON public.agent_intake_sessions 
  FOR UPDATE 
  USING (auth.uid() = agent_id);

-- Create unique constraint to ensure only one active session per agent
CREATE UNIQUE INDEX unique_active_agent_intake_session 
  ON public.agent_intake_sessions (agent_id) 
  WHERE status = 'in_progress';

-- Create index for efficient queries
CREATE INDEX idx_agent_intake_sessions_agent_id ON public.agent_intake_sessions (agent_id);
CREATE INDEX idx_agent_intake_sessions_status ON public.agent_intake_sessions (status);

-- Add trigger to update profiles table onboarding completion
CREATE OR REPLACE FUNCTION public.handle_intake_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profile onboarding_completed_at when intake is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles 
    SET onboarding_completed_at = now(),
        updated_at = now()
    WHERE id = NEW.agent_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_intake_completion
  AFTER UPDATE ON public.agent_intake_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_intake_completion();
