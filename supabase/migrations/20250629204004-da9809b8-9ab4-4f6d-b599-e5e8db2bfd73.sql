
-- Create agent_branding table for storing agent branding preferences
CREATE TABLE public.agent_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_branded_sign TEXT CHECK (has_branded_sign IN ('yes', 'no', 'will_get_own')),
  sign_notes TEXT,
  review_link TEXT NOT NULL,
  has_canva_template TEXT CHECK (has_canva_template IN ('yes_will_share', 'no_prepare_one', 'no_dont_use')),
  canva_template_url TEXT,
  favorite_color TEXT,
  drinks_coffee BOOLEAN DEFAULT false,
  drinks_alcohol BOOLEAN DEFAULT false,
  birthday DATE,
  social_media_permission BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.agent_branding ENABLE ROW LEVEL SECURITY;

-- Create policies for agents to manage their own branding data
CREATE POLICY "Agents can view their own branding" 
  ON public.agent_branding 
  FOR SELECT 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own branding" 
  ON public.agent_branding 
  FOR INSERT 
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own branding" 
  ON public.agent_branding 
  FOR UPDATE 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own branding" 
  ON public.agent_branding 
  FOR DELETE 
  USING (auth.uid() = agent_id);

-- Create unique constraint to ensure only one branding record per agent
CREATE UNIQUE INDEX unique_agent_branding 
  ON public.agent_branding (agent_id);

-- Create index for efficient queries
CREATE INDEX idx_agent_branding_agent_id ON public.agent_branding (agent_id);
