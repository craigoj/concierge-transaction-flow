-- Enhanced Transaction Management Schema
-- This migration enhances the existing transaction system with comprehensive property and client management

-- Create property type enum
CREATE TYPE property_type AS ENUM (
  'single_family',
  'condo',
  'townhouse', 
  'multi_family',
  'commercial',
  'land'
);

-- Create property status enum
CREATE TYPE property_status AS ENUM (
  'active',
  'pending',
  'under_contract',
  'sold',
  'off_market'
);

-- Create financing type enum
CREATE TYPE financing_type AS ENUM (
  'cash',
  'conventional',
  'fha',
  'va',
  'usda',
  'other'
);

-- Create client role enum
CREATE TYPE client_role AS ENUM (
  'buyer',
  'seller',
  'agent'
);

-- Create client type enum
CREATE TYPE client_type AS ENUM (
  'primary',
  'secondary'
);

-- Create milestone type enum
CREATE TYPE milestone_type AS ENUM (
  'contract_signed',
  'inspection_scheduled',
  'inspection_completed',
  'appraisal_ordered',
  'appraisal_completed',
  'loan_approved',
  'final_walkthrough',
  'closing_scheduled',
  'closing_completed'
);

-- Enhanced properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  mls_number TEXT,
  property_type property_type NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  lot_size DECIMAL(10,2),
  year_built INTEGER,
  listing_price DECIMAL(12,2),
  property_status property_status DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced transaction_clients table (separate from main clients table for transaction-specific data)
CREATE TABLE IF NOT EXISTS public.transaction_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  client_type client_type NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role client_role NOT NULL,
  communication_preference TEXT DEFAULT 'email' CHECK (communication_preference IN ('email', 'phone', 'text', 'app')),
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction milestones table for progress tracking
CREATE TABLE IF NOT EXISTS public.transaction_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  milestone_type milestone_type NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance existing transactions table with new columns
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id),
ADD COLUMN IF NOT EXISTS transaction_type_enum TEXT CHECK (transaction_type_enum IN ('listing', 'buyer', 'dual')) DEFAULT 'buyer',
ADD COLUMN IF NOT EXISTS expected_closing_date DATE,
ADD COLUMN IF NOT EXISTS contract_date DATE,
ADD COLUMN IF NOT EXISTS listing_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS financing_type financing_type,
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'standard' CHECK (priority_level IN ('standard', 'urgent', 'rush')),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS pre_approval_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lender_info TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_address ON public.properties(address_street, address_city, address_state);
CREATE INDEX IF NOT EXISTS idx_properties_mls ON public.properties(mls_number);
CREATE INDEX IF NOT EXISTS idx_properties_type_status ON public.properties(property_type, property_status);
CREATE INDEX IF NOT EXISTS idx_transaction_clients_transaction ON public.transaction_clients(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_clients_email ON public.transaction_clients(email);
CREATE INDEX IF NOT EXISTS idx_transaction_milestones_transaction ON public.transaction_milestones(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_milestones_status ON public.transaction_milestones(status);
CREATE INDEX IF NOT EXISTS idx_transactions_property ON public.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent_status ON public.transactions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_closing_date ON public.transactions(expected_closing_date);

-- Enable RLS on new tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties
CREATE POLICY "Agents can view all properties" ON public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'agent')
    )
  );

CREATE POLICY "Agents can create properties" ON public.properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'agent')
    )
  );

CREATE POLICY "Agents can update properties" ON public.properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'agent')
    )
  );

-- RLS Policies for transaction_clients
CREATE POLICY "Agents can view clients for their transactions" ON public.transaction_clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_clients.transaction_id AND agent_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Agents can create clients for their transactions" ON public.transaction_clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_clients.transaction_id AND agent_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Agents can update clients for their transactions" ON public.transaction_clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_clients.transaction_id AND agent_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

-- RLS Policies for transaction_milestones
CREATE POLICY "Agents can view milestones for their transactions" ON public.transaction_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_milestones.transaction_id AND agent_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Agents can create milestones for their transactions" ON public.transaction_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_milestones.transaction_id AND agent_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Agents can update milestones for their transactions" ON public.transaction_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE id = transaction_milestones.transaction_id AND agent_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

-- Enhanced RLS policies for transactions to include admin access
DROP POLICY IF EXISTS "Agents can view their assigned transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can update their assigned transactions" ON public.transactions;
DROP POLICY IF EXISTS "Agents can create transactions" ON public.transactions;

CREATE POLICY "Users can view transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = agent_id OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Users can update transactions" ON public.transactions
  FOR UPDATE USING (
    auth.uid() = agent_id OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    auth.uid() = agent_id OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    )
  );

-- Create function to automatically create default milestones for new transactions
CREATE OR REPLACE FUNCTION create_default_milestones()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default milestones based on transaction type
  IF NEW.transaction_type_enum = 'buyer' OR NEW.transaction_type_enum = 'dual' THEN
    INSERT INTO public.transaction_milestones (transaction_id, milestone_type) VALUES
      (NEW.id, 'contract_signed'),
      (NEW.id, 'inspection_scheduled'),
      (NEW.id, 'inspection_completed'),
      (NEW.id, 'appraisal_ordered'),
      (NEW.id, 'appraisal_completed'),
      (NEW.id, 'loan_approved'),
      (NEW.id, 'final_walkthrough'),
      (NEW.id, 'closing_scheduled'),
      (NEW.id, 'closing_completed');
  ELSIF NEW.transaction_type_enum = 'listing' THEN
    INSERT INTO public.transaction_milestones (transaction_id, milestone_type) VALUES
      (NEW.id, 'contract_signed'),
      (NEW.id, 'inspection_scheduled'),
      (NEW.id, 'inspection_completed'),
      (NEW.id, 'appraisal_ordered'),
      (NEW.id, 'appraisal_completed'),
      (NEW.id, 'closing_scheduled'),
      (NEW.id, 'closing_completed');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create milestones
CREATE TRIGGER create_default_milestones_trigger
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION create_default_milestones();