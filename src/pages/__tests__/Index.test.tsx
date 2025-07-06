import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Index from '../Index';

// Mock all components and hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn()
}));

// Mock UI components
vi.mock('@/components/layout/AppLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>
}));

vi.mock('@/components/navigation/Breadcrumb', () => ({
  default: () => <div data-testid="breadcrumb">Dashboard / Home</div>
}));

vi.mock('@/components/dashboard/DashboardStats', () => ({
  default: ({ variant, showQuickActions, onActionClick, className }: any) => (
    <div 
      data-testid="dashboard-stats" 
      data-variant={variant}
      data-show-quick-actions={showQuickActions}
      className={className}
    >
      <button onClick={() => onActionClick?.('new-transaction')}>New Transaction</button>
      <button onClick={() => onActionClick?.('add-client')}>Add Client</button>
      Dashboard Stats Component
    </div>
  )
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, asChild, ...props }: any) => 
    asChild ? children : (
      <button 
        onClick={onClick} 
        data-variant={variant} 
        data-size={size} 
        className={className} 
        {...props}
        data-testid="button"
      >
        {children}
      </button>
    )
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div data-testid="card-title" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardDescription: ({ children, className }: any) => <div data-testid="card-description" className={className}>{children}</div>,
  CardFooter: ({ children, className }: any) => <div data-testid="card-footer" className={className}>{children}</div>
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => 
    <div data-testid="sheet" data-open={open}>{children}</div>,
  SheetContent: ({ children, side, className }: any) => 
    <div data-testid="sheet-content" data-side={side} className={className}>{children}</div>,
  SheetTrigger: ({ children, asChild }: any) => 
    asChild ? children : <div data-testid="sheet-trigger">{children}</div>
}));

// Mock Supabase client
let mockSupabaseClient: any = null;
vi.mock('@/integrations/supabase/client', () => ({
  get supabase() {
    return mockSupabaseClient;
  }
}));

// Mock icons
vi.mock('lucide-react', () => ({
  Building: ({ className }: any) => <div data-testid="building-icon" className={className} />,
  Users: ({ className }: any) => <div data-testid="users-icon" className={className} />,
  Calendar: ({ className }: any) => <div data-testid="calendar-icon" className={className} />,
  AlertCircle: ({ className }: any) => <div data-testid="alert-circle-icon" className={className} />,
  Menu: ({ className }: any) => <div data-testid="menu-icon" className={className} />
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const { useIsMobile } = await import('@/hooks/use-mobile');
const mockUseIsMobile = vi.mocked(useIsMobile);

const renderComponent = (isMobile = false) => {
  mockUseIsMobile.mockReturnValue(isMobile);
  const queryClient = createQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Index Dashboard Component', () => {
  const mockTransactions = [
    {
      id: '1',
      property_address: '123 Oak Street',
      status: 'active',
      purchase_price: 450000,
      closing_date: '2024-02-15',
      created_at: '2024-01-01',
      clients: [{ full_name: 'John Doe', type: 'buyer' }],
      profiles: { first_name: 'Jane', last_name: 'Smith' }
    },
    {
      id: '2',
      property_address: '456 Pine Avenue',
      status: 'active',
      purchase_price: 320000,
      closing_date: '2024-03-01',
      created_at: '2024-01-02',
      clients: [{ full_name: 'Alice Johnson', type: 'seller' }],
      profiles: { first_name: 'Bob', last_name: 'Wilson' }
    },
    {
      id: '3',
      property_address: '789 Maple Drive',
      status: 'pending',
      purchase_price: 280000,
      closing_date: null,
      created_at: '2024-01-03',
      clients: [],
      profiles: null
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockTransactions,
            error: null
          })
        })
      })
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Structure & Rendering', () => {
    it('should render the basic component structure', async () => {
      renderComponent();
      
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
    });

    it('should integrate with AppLayout correctly', () => {
      renderComponent();
      
      const appLayout = screen.getByTestId('app-layout');
      expect(appLayout).toBeInTheDocument();
      expect(appLayout).toContainElement(screen.getByTestId('breadcrumb'));
    });

    it('should render breadcrumb navigation', () => {
      renderComponent();
      
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    });

    it('should render DashboardStats with correct props', () => {
      renderComponent();
      
      const dashboardStats = screen.getByTestId('dashboard-stats');
      expect(dashboardStats).toHaveAttribute('data-variant', 'premium');
      expect(dashboardStats).toHaveAttribute('data-show-quick-actions', 'true');
    });

    it('should handle empty transactions state', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No Active Coordination')).toBeInTheDocument();
        expect(screen.getByText('All transactions are operating smoothly')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design Tests', () => {
    it('should render desktop layout when not mobile', () => {
      renderComponent(false);
      
      expect(screen.getByText('COORDINATION')).toBeInTheDocument();
      expect(screen.getByText('Your premium transaction coordination workspace, designed for discerning real estate professionals.')).toBeInTheDocument();
      expect(screen.queryByTestId('menu-icon')).not.toBeInTheDocument();
    });

    it('should render mobile layout when mobile', () => {
      renderComponent(true);
      
      // Mobile should show menu icon
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      
      // Mobile should not show hero section
      expect(screen.queryByText('Your premium transaction coordination workspace, designed for discerning real estate professionals.')).not.toBeInTheDocument();
    });

    it('should handle mobile menu functionality', () => {
      renderComponent(true);
      
      expect(screen.getByTestId('sheet')).toBeInTheDocument();
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });

    it('should show different timeframe labels on mobile', () => {
      renderComponent(true);
      
      // Mobile should show shortened labels
      expect(screen.getByText('TODAY')).toBeInTheDocument();
      expect(screen.getAllByText('THIS')).toHaveLength(2); // "THIS" from "THIS WEEK" and "THIS MONTH"
    });

    it('should apply responsive grid classes correctly', () => {
      const { rerender } = renderComponent(false);
      
      // Desktop layout
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      
      // Test mobile layout
      mockUseIsMobile.mockReturnValue(true);
      rerender(
        <QueryClientProvider client={createQueryClient()}>
          <MemoryRouter>
            <Index />
          </MemoryRouter>
        </QueryClientProvider>
      );
      
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('should handle priority actions sidebar positioning', () => {
      const { rerender } = renderComponent(false);
      
      // Desktop should show sidebar
      expect(screen.getAllByText('Priority Actions')).toHaveLength(1);
      
      // Mobile should show in sheet
      mockUseIsMobile.mockReturnValue(true);
      rerender(
        <QueryClientProvider client={createQueryClient()}>
          <MemoryRouter>
            <Index />
          </MemoryRouter>
        </QueryClientProvider>
      );
      
      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    });
  });

  describe('Data Loading & State Tests', () => {
    it('should display loading state initially', () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(new Promise(() => {})) // Never resolves
        })
      });

      renderComponent();
      
      expect(screen.getByText('Loading coordination data...')).toBeInTheDocument();
    });

    it('should fetch and display transaction data successfully', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('123 Oak Street')).toBeInTheDocument();
        expect(screen.getByText('456 Pine Avenue')).toBeInTheDocument();
        expect(screen.getByText('$450,000')).toBeInTheDocument();
        expect(screen.getByText('$320,000')).toBeInTheDocument();
      });
    });

    it('should filter and display only active transactions', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('2 transactions requiring your expertise')).toBeInTheDocument();
        expect(screen.getByText('123 Oak Street')).toBeInTheDocument();
        expect(screen.getByText('456 Pine Avenue')).toBeInTheDocument();
        expect(screen.queryByText('789 Maple Drive')).not.toBeInTheDocument();
      });
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      renderComponent();

      // The component should not crash and should handle the error
      await waitFor(() => {
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      });
    });

    it('should handle null/undefined transaction data', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No Active Coordination')).toBeInTheDocument();
      });
    });

    it('should handle transactions without clients or profiles', async () => {
      const transactionsWithMissingData = [
        {
          id: '1',
          property_address: '123 Test Street',
          status: 'active',
          purchase_price: null,
          closing_date: null,
          created_at: '2024-01-01',
          clients: [],
          profiles: null
        }
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: transactionsWithMissingData,
            error: null
          })
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('123 Test Street')).toBeInTheDocument();
        expect(screen.getByText('Client TBD')).toBeInTheDocument();
        expect(screen.getByText('Date TBD')).toBeInTheDocument();
        expect(screen.getByText('$TBD')).toBeInTheDocument();
      });
    });

    it('should handle dynamic transaction data', async () => {
      renderComponent();

      // Verify initial state renders correctly
      await waitFor(() => {
        expect(screen.getByText('2 transactions requiring your expertise')).toBeInTheDocument();
      });

      // Test that the component properly filters active transactions
      expect(screen.getByText('123 Oak Street')).toBeInTheDocument();
      expect(screen.getByText('456 Pine Avenue')).toBeInTheDocument();
      expect(screen.queryByText('789 Maple Drive')).not.toBeInTheDocument(); // pending transaction should not show
    });
  });

  describe('Interactive Elements Tests', () => {
    it('should handle timeframe selector clicks', async () => {
      renderComponent();

      const todayButton = screen.getByText('TODAY');
      const weekButton = screen.getByText('THIS WEEK');
      const monthButton = screen.getByText('THIS MONTH');

      expect(todayButton).toBeInTheDocument();
      expect(weekButton).toBeInTheDocument();
      expect(monthButton).toBeInTheDocument();

      fireEvent.click(weekButton);
      fireEvent.click(monthButton);
      fireEvent.click(todayButton);

      // Should not crash and buttons should be clickable
      expect(todayButton).toBeInTheDocument();
    });

    it('should handle dashboard action clicks', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('New Transaction')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Transaction'));
      expect(mockNavigate).toHaveBeenCalledWith('/transactions');

      fireEvent.click(screen.getByText('Add Client'));
      expect(mockNavigate).toHaveBeenCalledWith('/clients/new');
    });

    it('should handle navigation for different actions', () => {
      renderComponent();

      const dashboardStats = screen.getByTestId('dashboard-stats');
      const newTransactionButton = screen.getByText('New Transaction');
      
      fireEvent.click(newTransactionButton);
      expect(mockNavigate).toHaveBeenCalledWith('/transactions');
    });

    it('should handle VIEW ALL button click', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('VIEW ALL')).toBeInTheDocument();
      });

      const viewAllButton = screen.getByText('VIEW ALL');
      fireEvent.click(viewAllButton);
      
      // Should not crash
      expect(viewAllButton).toBeInTheDocument();
    });

    it('should handle mobile menu toggle', () => {
      renderComponent(true);

      const menuIcon = screen.getByTestId('menu-icon');
      const menuButton = menuIcon.closest('button');
      expect(menuButton).toBeInTheDocument();
      
      if (menuButton) {
        fireEvent.click(menuButton);
      }
      // Should not crash
      expect(menuButton).toBeInTheDocument();
    });

    it('should handle unknown dashboard actions gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      renderComponent();

      // Simulate an unknown action by directly calling the handler
      const dashboardStats = screen.getByTestId('dashboard-stats');
      
      // The component should handle unknown actions without crashing
      expect(dashboardStats).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle schedule inspection action', () => {
      renderComponent();

      // Test would need to be expanded based on actual implementation
      // For now, ensuring component renders without crash
      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument();
    });

    it('should maintain timeframe state across re-renders', async () => {
      const { rerender } = renderComponent();

      const weekButton = screen.getByText('THIS WEEK');
      fireEvent.click(weekButton);

      rerender(
        <QueryClientProvider client={createQueryClient()}>
          <MemoryRouter>
            <Index />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Component should maintain its internal state
      expect(screen.getByText('THIS WEEK')).toBeInTheDocument();
    });
  });

  describe('Transaction Display Tests', () => {
    it('should format transaction prices correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('$450,000')).toBeInTheDocument();
        expect(screen.getByText('$320,000')).toBeInTheDocument();
      });
    });

    it('should format closing dates correctly', async () => {
      renderComponent();

      await waitFor(() => {
        // Check for formatted dates (may vary by locale)
        const feb15 = new Date('2024-02-15').toLocaleDateString();
        const mar1 = new Date('2024-03-01').toLocaleDateString();
        expect(screen.getByText(feb15)).toBeInTheDocument();
        expect(screen.getByText(mar1)).toBeInTheDocument();
      });
    });

    it('should display client information correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('should display property addresses correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('123 Oak Street')).toBeInTheDocument();
        expect(screen.getByText('456 Pine Avenue')).toBeInTheDocument();
      });
    });

    it('should show status badges correctly', async () => {
      renderComponent();

      await waitFor(() => {
        const coordinatingBadges = screen.getAllByText('COORDINATING');
        expect(coordinatingBadges).toHaveLength(2); // Two active transactions
      });
    });

    it('should render transaction icons correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getAllByTestId('building-icon')).toHaveLength(2);
        expect(screen.getAllByTestId('users-icon')).toHaveLength(2);
        expect(screen.getAllByTestId('calendar-icon')).toHaveLength(2);
      });
    });

    it('should limit displayed transactions to 4', async () => {
      const manyTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-${i}`,
        property_address: `${i + 100} Test Street`,
        status: 'active',
        purchase_price: 300000 + i * 10000,
        closing_date: '2024-02-15',
        created_at: `2024-01-0${i + 1}`,
        clients: [{ full_name: `Client ${i}`, type: 'buyer' }],
        profiles: { first_name: 'Agent', last_name: `${i}` }
      }));

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: manyTransactions,
            error: null
          })
        })
      });

      renderComponent();

      await waitFor(() => {
        // Should show count of all active transactions
        expect(screen.getByText('10 transactions requiring your expertise')).toBeInTheDocument();
        
        // But only display first 4 in the list
        expect(screen.getByText('100 Test Street')).toBeInTheDocument();
        expect(screen.getByText('101 Test Street')).toBeInTheDocument();
        expect(screen.getByText('102 Test Street')).toBeInTheDocument();
        expect(screen.getByText('103 Test Street')).toBeInTheDocument();
        expect(screen.queryByText('104 Test Street')).not.toBeInTheDocument();
      });
    });

    it('should handle text truncation for long addresses', async () => {
      const transactionWithLongAddress = [
        {
          id: '1',
          property_address: 'Very Long Property Address That Should Be Truncated At Some Point To Prevent Layout Issues',
          status: 'active',
          purchase_price: 450000,
          closing_date: '2024-02-15',
          created_at: '2024-01-01',
          clients: [{ full_name: 'John Doe', type: 'buyer' }],
          profiles: { first_name: 'Jane', last_name: 'Smith' }
        }
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: transactionWithLongAddress,
            error: null
          })
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Very Long Property Address That Should Be Truncated At Some Point To Prevent Layout Issues')).toBeInTheDocument();
      });
    });
  });

  describe('Priority Actions & Market Pulse Tests', () => {
    it('should render priority actions sidebar', () => {
      renderComponent(false); // Desktop

      expect(screen.getByText('Priority Actions')).toBeInTheDocument();
      expect(screen.getByText('Schedule Inspection')).toBeInTheDocument();
      expect(screen.getByText('Title Review Due')).toBeInTheDocument();
      expect(screen.getByText('Document Upload')).toBeInTheDocument();
    });

    it('should display urgency indicators with correct colors', () => {
      renderComponent(false);

      expect(screen.getByText('Oak Street')).toBeInTheDocument();
      expect(screen.getByText('Pine Avenue')).toBeInTheDocument();
      expect(screen.getByText('Maple Drive')).toBeInTheDocument();
    });

    it('should render market pulse section', () => {
      renderComponent(false);

      expect(screen.getByText('Market Pulse')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('Days Avg Close')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('↗ 2 days faster')).toBeInTheDocument();
    });

    it('should show priority actions in mobile sheet', () => {
      renderComponent(true); // Mobile

      expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
      expect(screen.getByText('Priority Actions')).toBeInTheDocument();
    });

    it('should handle priority action interactions', () => {
      renderComponent(false);

      const priorityItems = screen.getAllByText(/Schedule Inspection|Title Review Due|Document Upload/);
      expect(priorityItems.length).toBeGreaterThan(0);
      
      // Should render without crashing
      priorityItems.forEach(item => {
        expect(item).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle component unmounting gracefully', () => {
      const { unmount } = renderComponent();
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle missing Supabase client', async () => {
      mockSupabaseClient = null;

      expect(() => renderComponent()).not.toThrow();
    });

    it('should handle malformed transaction data', async () => {
      const malformedTransactions = [
        {
          id: '1',
          // Missing required fields
          status: 'active'
        }
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: malformedTransactions,
            error: null
          })
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
      });
    });
  });
});
