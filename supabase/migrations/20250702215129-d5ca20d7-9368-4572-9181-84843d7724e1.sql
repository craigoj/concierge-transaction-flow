
-- Phase 1: Clean Up Transaction Table RLS Policies
-- Remove all existing conflicting policies on transactions table
DROP POLICY IF EXISTS "Agents can access their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can update their assigned transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can view their assigned transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Coordinators can access all transactions" ON public.transactions;

-- Create clean, non-conflicting policies
CREATE POLICY "Agents can manage their assigned transactions" ON public.transactions
  FOR ALL 
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

-- Ensure coordinators can access everything
CREATE POLICY "Coordinators have full access to all transactions" ON public.transactions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Clean up clients table policies
DROP POLICY IF EXISTS "Agents can manage clients for their transactions" ON public.clients;
DROP POLICY IF EXISTS "Agents can manage clients in their transactions" ON public.clients;
DROP POLICY IF EXISTS "Agents can view clients in their transactions" ON public.clients;
DROP POLICY IF EXISTS "Coordinators can manage all clients" ON public.clients;

-- Create clean clients policies
CREATE POLICY "Agents can manage clients in their transactions" ON public.clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = clients.transaction_id AND agent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = clients.transaction_id AND agent_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can manage all clients" ON public.clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Clean up tasks table policies
DROP POLICY IF EXISTS "Agents can manage tasks in their transactions" ON public.tasks;
DROP POLICY IF EXISTS "Agents can view tasks for their transactions" ON public.tasks;
DROP POLICY IF EXISTS "Agents can view tasks in their transactions" ON public.tasks;
DROP POLICY IF EXISTS "Coordinators can manage all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can access tasks of their transactions" ON public.tasks;

-- Create clean tasks policies
CREATE POLICY "Agents can manage tasks in their transactions" ON public.tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = tasks.transaction_id AND agent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = tasks.transaction_id AND agent_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can manage all tasks" ON public.tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Clean up documents table policies
DROP POLICY IF EXISTS "Agents can manage documents for their transactions" ON public.documents;
DROP POLICY IF EXISTS "Agents can manage documents in their transactions" ON public.documents;
DROP POLICY IF EXISTS "Agents can view agent-visible documents in their transactions" ON public.documents;
DROP POLICY IF EXISTS "Coordinators can manage all documents" ON public.documents;
DROP POLICY IF EXISTS "Users can access documents of their transactions" ON public.documents;

-- Create clean documents policies
CREATE POLICY "Agents can manage documents in their transactions" ON public.documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = documents.transaction_id AND agent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = documents.transaction_id AND agent_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can manage all documents" ON public.documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );
