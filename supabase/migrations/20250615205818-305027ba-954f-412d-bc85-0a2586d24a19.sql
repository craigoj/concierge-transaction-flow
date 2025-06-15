
-- Add new columns to support agent action requirements and document visibility
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS requires_agent_action boolean DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS agent_action_prompt text;

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_agent_visible boolean DEFAULT false;

-- Create RLS policies for transactions table
DROP POLICY IF EXISTS "Agents can view their assigned transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can update their assigned transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can create transactions" ON public.transactions;

CREATE POLICY "Agents can view their assigned transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update their assigned transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can create transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = agent_id);

-- Create RLS policies for clients table
DROP POLICY IF EXISTS "Agents can view clients in their transactions" ON public.clients;
DROP POLICY IF EXISTS "Agents can manage clients in their transactions" ON public.clients;

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

-- Create RLS policies for tasks table
DROP POLICY IF EXISTS "Agents can view tasks in their transactions" ON public.tasks;
DROP POLICY IF EXISTS "Agents can manage tasks in their transactions" ON public.tasks;

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

-- Create RLS policies for documents table with agent visibility control
DROP POLICY IF EXISTS "Agents can view documents in their transactions" ON public.documents;
DROP POLICY IF EXISTS "Agents can manage documents in their transactions" ON public.documents;

CREATE POLICY "Agents can view agent-visible documents in their transactions" 
  ON public.documents 
  FOR SELECT 
  USING (
    is_agent_visible = true AND
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = documents.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

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
