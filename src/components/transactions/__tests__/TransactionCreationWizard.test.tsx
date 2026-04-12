import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionCreationWizard } from '../TransactionCreationWizard';
import { AuthContext } from '@/contexts/AuthContext';

// Mock the auth context
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockAuthContext = {
  user: mockUser,
  loading: false,
  signOut: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
};

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  ArrowRight: () => <div>ArrowRight</div>,
  CheckCircle: () => <div>CheckCircle</div>,
  Building2: () => <div>Building2</div>,
  Home: () => <div>Home</div>,
  MapPin: () => <div>MapPin</div>,
  DollarSign: () => <div>DollarSign</div>,
  User: () => <div>User</div>,
  Users: () => <div>Users</div>,
  X: () => <div>X</div>,
  Plus: () => <div>Plus</div>,
  Trash2: () => <div>Trash2</div>,
  Mail: () => <div>Mail</div>,
  Phone: () => <div>Phone</div>,
  MessageSquare: () => <div>MessageSquare</div>,
  Smartphone: () => <div>Smartphone</div>,
  Settings: () => <div>Settings</div>,
  Crown: () => <div>Crown</div>,
  Star: () => <div>Star</div>,
  Shield: () => <div>Shield</div>,
  Calendar: () => <div>Calendar</div>,
  Clock: () => <div>Clock</div>,
  AlertTriangle: () => <div>AlertTriangle</div>,
  AlertCircle: () => <div>AlertCircle</div>,
}));

// Mock UI components that might cause issues
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="mock-card" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="mock-card-content" className={className}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className }: any) => (
    <div data-testid="mock-card-description" className={className}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div data-testid="mock-card-footer" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="mock-card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="mock-card-title" className={className}>
      {children}
    </div>
  ),
}));
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: { onSelect: (date: Date) => void }) => (
    <div data-testid="calendar" onClick={() => onSelect(new Date())}>
      Mock Calendar
    </div>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
        })),
      })),
    })),
  },
}));

const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthContext.Provider value={mockAuthContext}>{component}</AuthContext.Provider>);
};

describe('TransactionCreationWizard', () => {
  const mockProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the wizard dialog when open', () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    expect(screen.getByText('Create New Transaction')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByText('Property Details')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    // Check for progress elements
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays step indicators', () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    expect(screen.getByText('Property Details')).toBeInTheDocument();
    expect(screen.getByText('Transaction type & property information')).toBeInTheDocument();
  });

  it('allows navigation to next step when data is valid', async () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    // Fill required fields in step 1
    const streetInput = screen.getByPlaceholderText('123 Main Street');
    const cityInput = screen.getByPlaceholderText('City');
    const stateInput = screen.getByPlaceholderText('State');
    const zipInput = screen.getByPlaceholderText('12345');

    fireEvent.change(streetInput, { target: { value: '123 Test Street' } });
    fireEvent.change(cityInput, { target: { value: 'Test City' } });
    fireEvent.change(stateInput, { target: { value: 'TS' } });
    fireEvent.change(zipInput, { target: { value: '12345' } });

    // Click Next button
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    });
  });

  it('shows validation errors for empty required fields', () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('shows cancel button that calls onOpenChange', () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('displays property type selection options', () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    expect(screen.getByText('Single Family')).toBeInTheDocument();
    expect(screen.getByText('Condominium')).toBeInTheDocument();
    expect(screen.getByText('Townhouse')).toBeInTheDocument();
    expect(screen.getByText('Multi-Family')).toBeInTheDocument();
    expect(screen.getByText('Commercial')).toBeInTheDocument();
    expect(screen.getByText('Land')).toBeInTheDocument();
  });

  it('allows property type selection', async () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} />);

    const condoOption = screen.getByText('Condominium');
    fireEvent.click(condoOption);

    // Verify the selection is applied (button should have active styling)
    const condoButton = condoOption.closest('button');
    expect(condoButton).toHaveClass('border-primary');
  });

  it('does not render when closed', () => {
    renderWithAuth(<TransactionCreationWizard {...mockProps} open={false} />);

    expect(screen.queryByText('Create New Transaction')).not.toBeInTheDocument();
  });
});
