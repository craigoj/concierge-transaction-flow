-- Base schema initialization for concierge transaction flow
-- This creates the foundational tables needed by the application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Service tier enumeration
CREATE TYPE service_tier_type AS ENUM (
  'buyer_core',
  'buyer_elite', 
  'white_glove_buyer',
  'listing_core',
  'listing_elite',
  'white_glove_listing'
);

-- Transaction status enumeration  
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'active',
  'under_contract',
  'closing',
  'completed',
  'cancelled'
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'coordinator', 'agent')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  onboarding_completed_at TIMESTAMP WITH TIME ZONE
);

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id),
  property_address TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buying', 'selling')),
  service_tier service_tier_type NOT NULL DEFAULT 'buyer_core',
  status transaction_status DEFAULT 'pending',
  purchase_price DECIMAL(12,2),
  commission_rate DECIMAL(5,4),
  commission_amount DECIMAL(12,2),
  closing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  conditions JSONB,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  service_tier service_tier_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID REFERENCES public.automation_rules(id),
  transaction_id UUID REFERENCES public.transactions(id),
  trigger_data JSONB,
  execution_status TEXT CHECK (execution_status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
  result_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  service_tier service_tier_type
);

-- Email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL,
  service_tier service_tier_type,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for clients (agents can access all clients)
CREATE POLICY "Agents can view all clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'agent')
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Agents can view their assigned transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update their assigned transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Agents can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- RLS Policies for tasks
CREATE POLICY "Agents can view tasks for their transactions" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = tasks.transaction_id AND agent_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Agents can view documents for their transactions" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = documents.transaction_id AND agent_id = auth.uid()
    )
  );

-- Insert some default automation rules and email templates
INSERT INTO public.email_templates (name, subject, content, template_type, service_tier) VALUES
('Welcome Email', 'Welcome to Concierge Transaction Flow', 'Welcome to our premium real estate transaction service!', 'welcome', 'buyer_core'),
('Contract Submitted', 'Your Contract Has Been Submitted', 'Your offer has been successfully submitted.', 'notification', 'buyer_core'),
('Inspection Reminder', 'Home Inspection Reminder', 'Don''t forget about your upcoming home inspection.', 'reminder', 'buyer_elite');

-- Insert default automation rules
INSERT INTO public.automation_rules (name, description, trigger_event, actions, service_tier) VALUES
('Welcome New Client', 'Send welcome email to new clients', 'client_created', '{"send_email": {"template": "welcome"}}', 'buyer_core'),
('Contract Status Update', 'Notify client of contract status changes', 'contract_status_changed', '{"send_email": {"template": "contract_submitted"}}', 'buyer_core'),
('Inspection Reminder', 'Send inspection reminders', 'inspection_scheduled', '{"send_email": {"template": "inspection_reminder"}}', 'buyer_elite');