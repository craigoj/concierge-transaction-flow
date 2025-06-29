
-- Create agent_vendors table for storing agent vendor preferences
CREATE TABLE public.agent_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('lender', 'settlement', 'home_inspection', 'termite_inspection', 'photography', 'staging', 'cleaning', 'lawn_care')),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.agent_vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for agents to manage their own vendor data
CREATE POLICY "Agents can view their own vendors" 
  ON public.agent_vendors 
  FOR SELECT 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own vendors" 
  ON public.agent_vendors 
  FOR INSERT 
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own vendors" 
  ON public.agent_vendors 
  FOR UPDATE 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own vendors" 
  ON public.agent_vendors 
  FOR DELETE 
  USING (auth.uid() = agent_id);

-- Create unique constraint to ensure only one primary vendor per type per agent
CREATE UNIQUE INDEX unique_primary_vendor_per_type 
  ON public.agent_vendors (agent_id, vendor_type) 
  WHERE is_primary = true;

-- Create index for efficient queries
CREATE INDEX idx_agent_vendors_agent_type ON public.agent_vendors (agent_id, vendor_type);
