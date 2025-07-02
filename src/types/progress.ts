
import { Database } from '@/integrations/supabase/types';

export type TransactionPhase = Database['public']['Tables']['transaction_phases']['Row'];
export type TransactionPhaseProgress = Database['public']['Tables']['transaction_phase_progress']['Row'];
export type AgentPerformanceMetrics = Database['public']['Tables']['agent_performance_metrics']['Row'];

export type PhaseStatus = 'not_started' | 'in_progress' | 'blocked' | 'at_risk' | 'completed' | 'skipped';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TransactionWithProgress extends Database['public']['Tables']['transactions']['Row'] {
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
