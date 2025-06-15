
-- First, let's add RLS policies for the transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view transactions they're assigned to
CREATE POLICY "Agents can view their assigned transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = agent_id);

-- Policy for agents to update their assigned transactions
CREATE POLICY "Agents can update their assigned transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = agent_id);

-- Policy for agents to create new transactions
CREATE POLICY "Agents can create transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = agent_id);

-- Add RLS policies for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view clients in their transactions
CREATE POLICY "Agents can view clients in their transactions" 
  ON public.clients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = clients.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

-- Policy for agents to manage clients in their transactions
CREATE POLICY "Agents can manage clients in their transactions" 
  ON public.clients 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = clients.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

-- Add RLS policies for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view tasks in their transactions
CREATE POLICY "Agents can view tasks in their transactions" 
  ON public.tasks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = tasks.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

-- Policy for agents to manage tasks in their transactions
CREATE POLICY "Agents can manage tasks in their transactions" 
  ON public.tasks 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = tasks.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

-- Add RLS policies for documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view documents in their transactions
CREATE POLICY "Agents can view documents in their transactions" 
  ON public.documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = documents.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

-- Policy for agents to manage documents in their transactions
CREATE POLICY "Agents can manage documents in their transactions" 
  ON public.documents 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = documents.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

-- Add service tier information to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS service_tier TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT;

-- Create an enum for service tiers if it doesn't exist
DO $$ BEGIN
    CREATE TYPE service_tier_type AS ENUM (
        'buyer_core',
        'buyer_elite', 
        'white_glove_buyer',
        'listing_core',
        'listing_elite',
        'white_glove_listing'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the service_tier column to use the enum
ALTER TABLE public.transactions ALTER COLUMN service_tier TYPE service_tier_type USING service_tier::service_tier_type;

-- Create an enum for transaction types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('buyer', 'seller', 'dual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the transaction_type column to use the enum
ALTER TABLE public.transactions ALTER COLUMN transaction_type TYPE transaction_type_enum USING transaction_type::transaction_type_enum;
