
-- Create transaction phases definition table
CREATE TABLE public.transaction_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_name VARCHAR(100) NOT NULL,
  phase_order INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  service_tier TEXT,
  description TEXT,
  expected_duration_days INTEGER,
  required_milestones JSONB DEFAULT '[]'::jsonb,
  automation_triggers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create phase status enum
CREATE TYPE phase_status_enum AS ENUM (
  'not_started',
  'in_progress', 
  'blocked',
  'at_risk',
  'completed',
  'skipped'
);

-- Create risk level enum
CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- Create real-time progress tracking table
CREATE TABLE public.transaction_phase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.transaction_phases(id) ON DELETE CASCADE,
  status phase_status_enum DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expected_completion TIMESTAMP WITH TIME ZONE,
  milestones_completed JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(transaction_id, phase_id)
);

-- Create agent performance metrics cache table
CREATE TABLE public.agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  transactions_active INTEGER DEFAULT 0,
  avg_phase_duration JSONB DEFAULT '{}'::jsonb,
  completion_rate_by_phase JSONB DEFAULT '{}'::jsonb,
  bottleneck_phases JSONB DEFAULT '[]'::jsonb,
  service_tier_performance JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, metric_date)
);

-- Enhance existing transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS current_phase_id UUID REFERENCES public.transaction_phases(id),
ADD COLUMN IF NOT EXISTS phase_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_closing_date DATE,
ADD COLUMN IF NOT EXISTS risk_level risk_level_enum DEFAULT 'low';

-- Enhance existing tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS phase_id UUID REFERENCES public.transaction_phases(id),
ADD COLUMN IF NOT EXISTS milestone_id UUID;

-- Insert default phase data for different transaction types
INSERT INTO public.transaction_phases (phase_name, phase_order, transaction_type, service_tier, expected_duration_days, description, required_milestones) VALUES
-- Buyer Core phases
('Initial Consultation', 1, 'buying', 'buyer_core', 1, 'Initial client meeting and needs assessment', '["consultation_completed", "buyer_agreement_signed"]'),
('Property Search', 2, 'buying', 'buyer_core', 14, 'Active property search and showing coordination', '["search_criteria_defined", "showing_scheduled"]'),
('Offer Preparation', 3, 'buying', 'buyer_core', 3, 'Offer strategy and document preparation', '["market_analysis_completed", "offer_drafted"]'),
('Under Contract', 4, 'buying', 'buyer_core', 30, 'Contract negotiation through inspection period', '["contract_ratified", "inspections_scheduled", "financing_approved"]'),
('Closing Preparation', 5, 'buying', 'buyer_core', 7, 'Final preparations for settlement', '["final_walkthrough", "closing_documents_reviewed"]'),
('Closing', 6, 'buying', 'buyer_core', 1, 'Settlement day coordination', '["settlement_completed", "keys_delivered"]'),

-- Buyer Elite phases (enhanced)
('VIP Consultation', 1, 'buying', 'buyer_elite', 1, 'Premium consultation with market insights', '["consultation_completed", "buyer_agreement_signed", "market_report_delivered"]'),
('Curated Search', 2, 'buying', 'buyer_elite', 14, 'Curated property selection with private showings', '["search_criteria_defined", "private_showings_arranged", "market_updates_scheduled"]'),
('Strategic Offer', 3, 'buying', 'buyer_elite', 3, 'Advanced offer strategy with competitive analysis', '["competitive_analysis_completed", "offer_strategy_developed", "offer_drafted"]'),
('Contract Management', 4, 'buying', 'buyer_elite', 30, 'Enhanced contract oversight and coordination', '["contract_ratified", "inspection_concierge_assigned", "financing_expedited"]'),
('Concierge Closing', 5, 'buying', 'buyer_elite', 7, 'White-glove closing preparation', '["closing_concierge_assigned", "final_walkthrough_coordinated"]'),
('Elite Settlement', 6, 'buying', 'buyer_elite', 1, 'Premium settlement experience', '["settlement_completed", "welcome_package_delivered"]'),

-- White Glove Buyer phases (luxury)
('Executive Consultation', 1, 'buying', 'white_glove_buyer', 1, 'Executive-level consultation with full market intelligence', '["executive_meeting_completed", "luxury_agreement_signed", "concierge_assigned"]'),
('Private Market Access', 2, 'buying', 'white_glove_buyer', 14, 'Exclusive access to premium and off-market properties', '["private_network_activated", "exclusive_previews_arranged", "luxury_showings_coordinated"]'),
('Investment Strategy', 3, 'buying', 'white_glove_buyer', 3, 'Sophisticated offer strategy with investment analysis', '["investment_analysis_completed", "strategy_presentation", "executive_offer_crafted"]'),
('Premium Contract', 4, 'buying', 'white_glove_buyer', 30, 'Dedicated contract management with luxury service', '["contract_executed", "luxury_inspections_arranged", "concierge_coordination"]'),
('Luxury Preparation', 5, 'buying', 'white_glove_buyer', 7, 'Premium closing preparation with personal concierge', '["luxury_preparation_complete", "executive_walkthrough"]'),
('Executive Closing', 6, 'buying', 'white_glove_buyer', 1, 'Executive closing experience with celebration', '["executive_settlement", "luxury_welcome_experience"]');

-- Add RLS policies for new tables
ALTER TABLE public.transaction_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_phase_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for transaction_phases (readable by all, manageable by coordinators)
CREATE POLICY "Anyone can view transaction phases" ON public.transaction_phases
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Coordinators can manage transaction phases" ON public.transaction_phases
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coordinator'));

-- RLS policies for transaction_phase_progress
CREATE POLICY "Users can view progress for their transactions" ON public.transaction_phase_progress
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.transactions t 
    WHERE t.id = transaction_phase_progress.transaction_id 
    AND (t.agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coordinator'))
  )
);

CREATE POLICY "Users can manage progress for their transactions" ON public.transaction_phase_progress
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.transactions t 
    WHERE t.id = transaction_phase_progress.transaction_id 
    AND (t.agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coordinator'))
  )
);

-- RLS policies for agent_performance_metrics
CREATE POLICY "Agents can view their own metrics" ON public.agent_performance_metrics
FOR SELECT TO authenticated
USING (agent_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coordinator'));

CREATE POLICY "System can manage performance metrics" ON public.agent_performance_metrics
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coordinator'));

-- Enable realtime for progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_phase_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Create indexes for performance
CREATE INDEX idx_transaction_phase_progress_transaction_id ON public.transaction_phase_progress(transaction_id);
CREATE INDEX idx_transaction_phase_progress_phase_id ON public.transaction_phase_progress(phase_id);
CREATE INDEX idx_transaction_phase_progress_status ON public.transaction_phase_progress(status);
CREATE INDEX idx_transactions_current_phase ON public.transactions(current_phase_id);
CREATE INDEX idx_transactions_risk_level ON public.transactions(risk_level);
CREATE INDEX idx_agent_performance_metrics_agent_date ON public.agent_performance_metrics(agent_id, metric_date);

-- Function to initialize phase progress for new transactions
CREATE OR REPLACE FUNCTION public.initialize_transaction_phases()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert phase progress records for the transaction based on type and service tier
  INSERT INTO public.transaction_phase_progress (transaction_id, phase_id, status)
  SELECT 
    NEW.id,
    tp.id,
    'not_started'
  FROM public.transaction_phases tp
  WHERE tp.transaction_type = COALESCE(NEW.transaction_type, 'buying')
    AND (tp.service_tier IS NULL OR tp.service_tier = COALESCE(NEW.service_tier, 'buyer_core'))
  ORDER BY tp.phase_order;
  
  -- Set the first phase as current
  UPDATE public.transactions 
  SET current_phase_id = (
    SELECT tp.id 
    FROM public.transaction_phases tp 
    WHERE tp.transaction_type = COALESCE(NEW.transaction_type, 'buying')
      AND (tp.service_tier IS NULL OR tp.service_tier = COALESCE(NEW.service_tier, 'buyer_core'))
    ORDER BY tp.phase_order 
    LIMIT 1
  ),
  phase_started_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize phases for new transactions
CREATE TRIGGER trigger_initialize_transaction_phases
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_transaction_phases();
