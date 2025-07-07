/**
 * Dashboard and Analytics Type Definitions
 * Comprehensive type safety for dashboard components, metrics, and visualizations
 */

import { LucideIcon } from 'lucide-react';
import { ServiceTierType } from './serviceTiers';

// ==================== CORE DASHBOARD TYPES ====================

export interface DashboardMetrics {
  activeTransactions: number;
  pendingTransactions: number;
  closingThisWeek: number;
  totalClients: number;
  monthlyRevenue: number;
  totalVolume: number;
  completionRate: number;
  actionRequired: number;
  incompleteTasks: number;
}

export interface DashboardStatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: LucideIcon;
  color: string;
  gradient?: string;
  bgColor?: string;
  iconBg?: string;
  iconColor?: string;
  href?: string;
  highlight?: boolean;
}

export interface DashboardQuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  variant?: 'default' | 'outline' | 'ghost';
  color?: string;
  featured?: boolean;
  action: string;
}

// ==================== TRANSACTION TYPES ====================

export interface TransactionWithDetails {
  id: string;
  property_address: string;
  closing_date?: string;
  status: string;
  purchase_price?: number;
  commission_rate?: number;
  city?: string;
  created_at: string;
  agent_id: string;
  service_tier?: ServiceTierType;
  clients?: {
    id: string;
    full_name: string;
    type: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
  tasks?: TaskDetails[];
  transaction_service_details?: TransactionServiceDetails[];
}

export interface TaskDetails {
  id: string;
  title: string;
  due_date?: string;
  priority?: string;
  is_completed: boolean;
  requires_agent_action?: boolean;
  transaction_id: string;
}

export interface TransactionServiceDetails {
  id: string;
  total_service_cost: number;
  transaction_id: string;
}

// ==================== MILESTONE TYPES ====================

export interface TransactionMilestone {
  type: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MilestoneCalculationInput {
  id: string;
  closing_date?: string;
  property_address: string;
}

// ==================== ANALYTICS TYPES ====================

export interface BusinessIntelligenceData {
  totalTransactions: number;
  totalRevenue: number;
  avgTransactionValue: number;
  conversionRate: number;
  projectedRevenue: number;
  marketShare: number;
  clientSatisfaction: number;
  monthlyTrends: MonthlyTrendData[];
  tierPerformance: ServiceTierPerformance[];
  geoData: GeographicData[];
}

export interface MonthlyTrendData {
  month: string;
  transactions: number;
  revenue: number;
  leads: number;
  conversions: number;
  completionRate?: number;
}

export interface ServiceTierPerformance {
  tier: string;
  count: number;
  revenue: number;
  avgClosingTime?: number;
}

export interface GeographicData {
  city: string;
  count: number;
  revenue: number;
}

// ==================== KPI CARD TYPES ====================

export interface KPICard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: LucideIcon;
  color: string;
  bgColor?: string;
}

export interface AnalyticsKPICard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

// ==================== CHART DATA TYPES ====================

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface LineChartData {
  month: string;
  [metric: string]: string | number;
}

export interface BarChartData {
  category: string;
  value: number;
  [additionalMetric: string]: string | number;
}

// ==================== AGENT ANALYTICS TYPES ====================

export interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  pendingAgents: number;
  completionRate: number;
  avgOnboardingTime: number;
  topBrokerages: BrokerageMetrics[];
  registrationTrend: RegistrationTrendData[];
  statusBreakdown: AgentStatusData[];
}

export interface BrokerageMetrics {
  name: string;
  count: number;
  percentage: number;
}

export interface RegistrationTrendData {
  month: string;
  count: number;
}

export interface AgentStatusData {
  name: string;
  value: number;
  color: string;
}

export interface AgentProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  brokerage?: string;
  role: string;
  invitation_status?: string;
  created_at: string;
  onboarding_completed_at?: string;
}

// ==================== ADVANCED ANALYTICS TYPES ====================

export interface AdvancedAnalyticsData {
  totalTransactions: number;
  activeTransactions: number;
  closedTransactions: number;
  completionRate: number;
  avgClosingTime: number;
  taskCompletionRate: number;
  totalRevenue: number;
  monthlyData: MonthlyPerformanceData[];
  tierData: ServiceTierDistribution[];
}

export interface MonthlyPerformanceData {
  month: string;
  transactions: number;
  revenue: number;
  completionRate: number;
}

export interface ServiceTierDistribution {
  name: string;
  value: number;
  color: string;
}

// ==================== PERFORMANCE INSIGHTS TYPES ====================

export interface PerformanceInsight {
  type: 'strength' | 'opportunity' | 'warning';
  title: string;
  description: string;
  badgeColor: string;
  badgeText: string;
}

export interface PerformanceMetrics {
  completionRate: number;
  avgClosingTime: number;
  taskCompletionRate: number;
  revenueGrowth: number;
  clientSatisfaction: number;
}

// ==================== DASHBOARD FILTER TYPES ====================

export interface DashboardFilters {
  dateRange: string;
  serviceTier: 'all' | ServiceTierType;
  status?: string;
  agentId?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

// ==================== EXPORT TYPES ====================

export interface ReportExportConfig {
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  dateRange: string;
  sections: string[];
}

export interface ExportableData {
  title: string;
  data: Record<string, unknown>[];
  metadata: {
    generated: string;
    dateRange: string;
    filters: DashboardFilters;
  };
}

// ==================== UTILITY TYPES ====================

export type DashboardVariant = 'basic' | 'premium' | 'enhanced' | 'agent';

export type MetricTrend = 'up' | 'down' | 'stable';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';

export type TimeRange = '7days' | '30days' | '3months' | '6months' | '1year';

// ==================== COMPONENT PROP TYPES ====================

export interface DashboardComponentProps {
  variant?: DashboardVariant;
  showQuickActions?: boolean;
  className?: string;
  onActionClick?: (action: string) => void;
}

export interface AnalyticsComponentProps {
  agentId?: string;
  dateRange?: TimeRange;
  filters?: DashboardFilters;
}

export interface ChartComponentProps {
  data: ChartDataPoint[];
  config?: Record<string, unknown>;
  height?: number;
  className?: string;
}
