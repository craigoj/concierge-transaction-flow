
import { Database } from '@/integrations/supabase/types';

// Base transaction type from database
export type Transaction = Database['public']['Tables']['transactions']['Row'];

// Use existing database types and extend them as needed
export type TransactionPhase = {
  id: string;
  phase_name: string;
  phase_order: number;
  transaction_type: string;
  service_tier?: string | null;
  description?: string | null;
  expected_duration_days?: number | null;
  required_milestones?: Record<string, unknown>;
  automation_triggers?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TransactionPhaseProgress = {
  id: string;
  transaction_id: string;
  phase_id: string;
  status: PhaseStatus;
  started_at?: string | null;
  completed_at?: string | null;
  expected_completion?: string | null;
  milestones_completed?: Record<string, unknown>;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  phase?: TransactionPhase;
};

export type AgentPerformanceMetrics = {
  id: string;
  agent_id: string;
  metric_date: string;
  transactions_active: number;
  avg_phase_duration?: Record<string, number>;
  completion_rate_by_phase?: Record<string, number>;
  bottleneck_phases?: string[];
  service_tier_performance?: Record<string, Record<string, number>>;
  calculated_at: string;
};

export type PhaseStatus = 'not_started' | 'in_progress' | 'blocked' | 'at_risk' | 'completed' | 'skipped';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Extended transaction type with progress information
export interface TransactionWithProgress extends Transaction {
  clients: Database['public']['Tables']['clients']['Row'][];
  tasks: Database['public']['Tables']['tasks']['Row'][];
  phaseProgress: TransactionPhaseProgress[];
  currentPhase?: TransactionPhase;
}

export interface ServiceTierConfig {
  className: string;
  primaryColor: string;
  accentColor: string;
  cardStyle: string;
  features: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

export interface ProgressFilters {
  serviceFilter?: string[];
  statusFilter?: string[];
  riskFilter?: RiskLevel[];
  searchQuery?: string;
}

export interface BottleneckAnalysis {
  phaseId: string;
  phaseName: string;
  avgDuration: number;
  transactionsAffected: number;
  severity: number;
}

export type ViewMode = 'grid' | 'list' | 'kanban';
export type SortBy = 'priority' | 'closing_date' | 'risk_level' | 'created_at';
