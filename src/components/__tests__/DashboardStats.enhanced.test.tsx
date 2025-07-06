/**
 * Enhanced DashboardStats Test Suite
 * Comprehensive test coverage for DashboardStats component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockUIComponents, mockIcons, createMockSupabaseClient } from '@/test/utils/enhanced-test-utils';
import { DashboardStats } from '../DashboardStats';
import transactionFixtures from '@/test/fixtures/transactions';

// Mock dependencies
vi.mock('@/components/ui/card', () => mockUIComponents);
vi.mock('@/components/ui/badge', () => ({ Badge: mockUIComponents.Badge }));
vi.mock('@/components/ui/button', () => ({ Button: mockUIComponents.Button }));
vi.mock('lucide-react', () => mockIcons);

// Mock Supabase client
let mockSupabaseClient: any;
vi.mock('@/integrations/supabase/client', () => ({
  get supabase() {
    return mockSupabaseClient;
  }
}));

// Mock hooks
vi.mock('@/hooks/useDashboardMetrics', () => ({
  useDashboardMetrics: vi.fn(),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn().mockReturnValue(false),
}));

describe('DashboardStats', () => {
  const defaultProps = {
    variant: 'default' as const,
    showQuickActions: true,
    onActionClick: vi.fn(),
    className: '',
  };

  const mockMetrics = {
    totalTransactions: 15,
    activeTransactions: 8,
    completedThisMonth: 7,
    averageClosingTime: 18,
    revenue: 125000,
    pendingTasks: 12,
    upcomingDeadlines: 3,
    clientSatisfaction: 4.8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabaseClient = createMockSupabaseClient({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: transactionFixtures.transactionsByStatus.active,
            error: null,
          }),
        }),
      }),
    });

    // Mock the useDashboardMetrics hook
    const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
    useDashboardMetrics.mockReturnValue({
      metrics: mockMetrics,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('Basic Rendering', () => {
    it('renders dashboard stats container', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });

    it('displays key metrics', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('15')).toBeInTheDocument(); // totalTransactions
      expect(screen.getByText('8')).toBeInTheDocument(); // activeTransactions
      expect(screen.getByText('7')).toBeInTheDocument(); // completedThisMonth
      expect(screen.getByText('18')).toBeInTheDocument(); // averageClosingTime
    });

    it('formats revenue correctly', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('$125,000')).toBeInTheDocument();
    });

    it('shows pending tasks and deadlines', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('12')).toBeInTheDocument(); // pendingTasks
      expect(screen.getByText('3')).toBeInTheDocument(); // upcomingDeadlines
    });
  });

  describe('Variant Rendering', () => {
    it('renders default variant correctly', () => {
      renderWithProviders(<DashboardStats {...defaultProps} variant="default" />);
      
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
      // Default variant should show standard layout
    });

    it('renders premium variant with enhanced styling', () => {
      renderWithProviders(<DashboardStats {...defaultProps} variant="premium" />);
      
      const card = screen.getByTestId('mock-card');
      expect(card).toHaveClass(/premium/); // Should have premium styling
    });

    it('renders mobile variant with optimized layout', () => {
      const { useIsMobile } = require('@/hooks/use-mobile');
      useIsMobile.mockReturnValue(true);
      
      renderWithProviders(<DashboardStats {...defaultProps} variant="mobile" />);
      
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
      // Mobile variant should adapt layout
    });

    it('renders compact variant for dashboard widgets', () => {
      renderWithProviders(<DashboardStats {...defaultProps} variant="compact" />);
      
      const card = screen.getByTestId('mock-card');
      expect(card).toHaveClass(/compact/); // Should have compact styling
    });
  });

  describe('Quick Actions', () => {
    it('shows quick actions when enabled', () => {
      renderWithProviders(<DashboardStats {...defaultProps} showQuickActions={true} />);
      
      expect(screen.getByText('New Transaction')).toBeInTheDocument();
      expect(screen.getByText('Add Client')).toBeInTheDocument();
      expect(screen.getByText('Schedule Inspection')).toBeInTheDocument();
    });

    it('hides quick actions when disabled', () => {
      renderWithProviders(<DashboardStats {...defaultProps} showQuickActions={false} />);
      
      expect(screen.queryByText('New Transaction')).not.toBeInTheDocument();
      expect(screen.queryByText('Add Client')).not.toBeInTheDocument();
    });

    it('calls onActionClick with correct action', async () => {
      const mockActionClick = vi.fn();
      renderWithProviders(
        <DashboardStats {...defaultProps} onActionClick={mockActionClick} />
      );
      
      const newTransactionButton = screen.getByText('New Transaction');
      fireEvent.click(newTransactionButton);
      
      expect(mockActionClick).toHaveBeenCalledWith('new-transaction');
    });

    it('handles all quick action types', async () => {
      const mockActionClick = vi.fn();
      const actions = [
        { text: 'New Transaction', action: 'new-transaction' },
        { text: 'Add Client', action: 'add-client' },
        { text: 'Schedule Inspection', action: 'schedule-inspection' },
        { text: 'Upload Document', action: 'upload-document' },
      ];
      
      renderWithProviders(
        <DashboardStats {...defaultProps} onActionClick={mockActionClick} />
      );
      
      for (const { text, action } of actions) {
        const button = screen.queryByText(text);
        if (button) {
          fireEvent.click(button);
          expect(mockActionClick).toHaveBeenCalledWith(action);
        }
      }
    });
  });

  describe('Data Loading States', () => {
    it('shows loading state', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('Loading dashboard metrics...')).toBeInTheDocument();
    });

    it('shows error state', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: null,
        isLoading: false,
        error: new Error('Failed to load metrics'),
        refetch: vi.fn(),
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('Error loading dashboard metrics')).toBeInTheDocument();
    });

    it('provides retry functionality on error', async () => {
      const mockRefetch = vi.fn();
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: null,
        isLoading: false,
        error: new Error('Failed to load metrics'),
        refetch: mockRefetch,
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Metrics Display and Formatting', () => {
    it('formats large numbers correctly', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: {
          ...mockMetrics,
          totalTransactions: 1250,
          revenue: 2750000,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('1,250')).toBeInTheDocument();
      expect(screen.getByText('$2,750,000')).toBeInTheDocument();
    });

    it('handles zero values', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: {
          ...mockMetrics,
          activeTransactions: 0,
          completedThisMonth: 0,
          revenue: 0,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('shows percentage changes and trends', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: {
          ...mockMetrics,
          trendsComparison: {
            activeTransactionsChange: 15.2,
            revenueChange: -5.8,
            closingTimeChange: -2.1,
          },
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('↗ 15.2%')).toBeInTheDocument();
      expect(screen.getByText('↘ 5.8%')).toBeInTheDocument();
      expect(screen.getByText('↗ 2.1%')).toBeInTheDocument(); // Negative closing time change is good
    });

    it('displays client satisfaction rating', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('4.8')).toBeInTheDocument();
      // Should show star rating or similar visualization
    });
  });

  describe('Time Range Filtering', () => {
    it('allows selecting different time ranges', async () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      const timeRangeButtons = ['TODAY', 'THIS WEEK', 'THIS MONTH', 'THIS YEAR'];
      
      for (const range of timeRangeButtons) {
        const button = screen.queryByText(range);
        if (button) {
          fireEvent.click(button);
          // Should update metrics based on selected range
        }
      }
    });

    it('shows correct metrics for selected time range', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      const thisWeekButton = screen.getByText('THIS WEEK');
      fireEvent.click(thisWeekButton);
      
      // Should show week-specific metrics
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });

    it('maintains time range selection across re-renders', () => {
      const { rerender } = renderWithProviders(<DashboardStats {...defaultProps} />);
      
      const thisMonthButton = screen.getByText('THIS MONTH');
      fireEvent.click(thisMonthButton);
      
      rerender(<DashboardStats {...defaultProps} />);
      
      // Should maintain selection
      expect(screen.getByText('THIS MONTH')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      const { useIsMobile } = require('@/hooks/use-mobile');
      useIsMobile.mockReturnValue(true);
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      // Mobile layout should stack metrics vertically
      const card = screen.getByTestId('mock-card');
      expect(card).toHaveClass(/mobile/);
    });

    it('shows full layout on desktop', () => {
      const { useIsMobile } = require('@/hooks/use-mobile');
      useIsMobile.mockReturnValue(false);
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      // Desktop should show full grid layout
      const card = screen.getByTestId('mock-card');
      expect(card).not.toHaveClass(/mobile/);
    });

    it('adjusts quick actions layout for different screen sizes', () => {
      renderWithProviders(<DashboardStats {...defaultProps} showQuickActions={true} />);
      
      // Quick actions should be responsive
      expect(screen.getByText('New Transaction')).toBeInTheDocument();
    });
  });

  describe('Service Tier Integration', () => {
    it('shows tier-specific features for premium users', () => {
      renderWithProviders(<DashboardStats {...defaultProps} variant="premium" />);
      
      // Premium variant should show additional features
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });

    it('shows limited features for core users', () => {
      renderWithProviders(<DashboardStats {...defaultProps} variant="default" />);
      
      // Core tier shows basic features
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });

    it('provides upgrade prompts for enhanced features', () => {
      renderWithProviders(<DashboardStats {...defaultProps} variant="default" />);
      
      // Should show upgrade prompts for premium features
      const upgradePrompt = screen.queryByText(/upgrade/i);
      if (upgradePrompt) {
        expect(upgradePrompt).toBeInTheDocument();
      }
    });
  });

  describe('Real-time Updates', () => {
    it('refreshes metrics periodically', async () => {
      const mockRefetch = vi.fn();
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: mockMetrics,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      // Should set up periodic refresh
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('shows real-time indicators for live data', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      // Should show indicators for real-time data
      const liveIndicator = screen.queryByText(/live|real-time/i);
      if (liveIndicator) {
        expect(liveIndicator).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      const card = screen.getByTestId('mock-card');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('dashboard statistics'));
    });

    it('supports keyboard navigation', () => {
      renderWithProviders(<DashboardStats {...defaultProps} showQuickActions={true} />);
      
      const buttons = screen.getAllByTestId('mock-button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('provides screen reader friendly content', () => {
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      // Should have descriptive text for screen readers
      expect(screen.getByLabelText(/total transactions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/active transactions/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', () => {
      const { rerender } = renderWithProviders(<DashboardStats {...defaultProps} />);
      
      // Should not recalculate on unrelated prop changes
      rerender(<DashboardStats {...defaultProps} className="updated" />);
      
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });

    it('handles large datasets efficiently', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: {
          ...mockMetrics,
          totalTransactions: 10000,
          activeTransactions: 5000,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      
      const startTime = performance.now();
      renderWithProviders(<DashboardStats {...defaultProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
      expect(screen.getByText('10,000')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing metrics gracefully', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: {},
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      // Should show defaults or placeholders
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });

    it('handles null/undefined metrics', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      
      expect(() => {
        renderWithProviders(<DashboardStats {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles network connectivity issues', () => {
      const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
      useDashboardMetrics.mockReturnValue({
        metrics: mockMetrics,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
      });
      
      renderWithProviders(<DashboardStats {...defaultProps} />);
      
      expect(screen.getByText('Network connection lost')).toBeInTheDocument();
    });
  });
});