/**
 * Enhanced Test Utilities for Concierge Transaction Flow
 * Provides comprehensive testing utilities, mocks, and helpers
 */

import React from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Create a test query client with optimized settings
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock Supabase client factory
export const createMockSupabaseClient = (overrides: any = {}) => {
  const defaultMocks = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signIn: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        download: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    },
  };

  return {
    ...defaultMocks,
    ...overrides,
  };
};

// Enhanced wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ 
  children, 
  queryClient = createTestQueryClient(),
  routerProps = {}
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter {...routerProps}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// Enhanced render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient, routerProps, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper queryClient={queryClient} routerProps={routerProps}>
      {children}
    </TestWrapper>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Common UI component mocks
export const mockUIComponents = {
  Button: ({ children, onClick, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-testid="mock-button"
      {...props}
    >
      {children}
    </button>
  ),

  Card: ({ children, className }: any) => (
    <div data-testid="mock-card" className={className}>
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

  Badge: ({ children, className, variant }: any) => (
    <span 
      data-testid="mock-badge" 
      className={className}
      data-variant={variant}
    >
      {children}
    </span>
  ),

  Input: ({ className, ...props }: any) => (
    <input 
      data-testid="mock-input" 
      className={className}
      {...props}
    />
  ),

  Select: ({ children, ...props }: any) => (
    <select data-testid="mock-select" {...props}>
      {children}
    </select>
  ),

  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="mock-dialog" data-open={open}>
      {children}
    </div>
  ),

  DialogContent: ({ children, className }: any) => (
    <div data-testid="mock-dialog-content" className={className}>
      {children}
    </div>
  ),

  DialogHeader: ({ children }: any) => (
    <div data-testid="mock-dialog-header">
      {children}
    </div>
  ),

  DialogTitle: ({ children }: any) => (
    <div data-testid="mock-dialog-title">
      {children}
    </div>
  ),

  DialogDescription: ({ children }: any) => (
    <div data-testid="mock-dialog-description">
      {children}
    </div>
  ),

  DialogFooter: ({ children }: any) => (
    <div data-testid="mock-dialog-footer">
      {children}
    </div>
  ),

  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="mock-sheet" data-open={open}>
      {children}
    </div>
  ),

  SheetContent: ({ children, side, className }: any) => (
    <div 
      data-testid="mock-sheet-content" 
      data-side={side} 
      className={className}
    >
      {children}
    </div>
  ),

  SheetTrigger: ({ children, asChild }: any) => 
    asChild ? children : (
      <div data-testid="mock-sheet-trigger">
        {children}
      </div>
    ),

  Alert: ({ children, variant, className }: any) => (
    <div 
      data-testid="mock-alert" 
      data-variant={variant}
      className={className}
    >
      {children}
    </div>
  ),

  AlertDescription: ({ children }: any) => (
    <div data-testid="mock-alert-description">
      {children}
    </div>
  ),
};

// Mock icon components
export const mockIcons = {
  Building: ({ className }: any) => (
    <div data-testid="mock-building-icon" className={className} />
  ),
  Users: ({ className }: any) => (
    <div data-testid="mock-users-icon" className={className} />
  ),
  Calendar: ({ className }: any) => (
    <div data-testid="mock-calendar-icon" className={className} />
  ),
  AlertCircle: ({ className }: any) => (
    <div data-testid="mock-alert-circle-icon" className={className} />
  ),
  Menu: ({ className }: any) => (
    <div data-testid="mock-menu-icon" className={className} />
  ),
  Check: ({ className }: any) => (
    <div data-testid="mock-check-icon" className={className} />
  ),
  CheckCircle: ({ className }: any) => (
    <div data-testid="mock-check-circle-icon" className={className} />
  ),
  X: ({ className }: any) => (
    <div data-testid="mock-x-icon" className={className} />
  ),
  Plus: ({ className }: any) => (
    <div data-testid="mock-plus-icon" className={className} />
  ),
  Edit: ({ className }: any) => (
    <div data-testid="mock-edit-icon" className={className} />
  ),
  Trash: ({ className }: any) => (
    <div data-testid="mock-trash-icon" className={className} />
  ),
  Loader2: ({ className }: any) => (
    <div data-testid="mock-loader-icon" className={className} />
  ),
  ArrowRight: ({ className }: any) => (
    <div data-testid="mock-arrow-right-icon" className={className} />
  ),
  ArrowLeft: ({ className }: any) => (
    <div data-testid="mock-arrow-left-icon" className={className} />
  ),
  Search: ({ className }: any) => (
    <div data-testid="mock-search-icon" className={className} />
  ),
  Filter: ({ className }: any) => (
    <div data-testid="mock-filter-icon" className={className} />
  ),
  Settings: ({ className }: any) => (
    <div data-testid="mock-settings-icon" className={className} />
  ),
  Home: ({ className }: any) => (
    <div data-testid="mock-home-icon" className={className} />
  ),
  User: ({ className }: any) => (
    <div data-testid="mock-user-icon" className={className} />
  ),
  Mail: ({ className }: any) => (
    <div data-testid="mock-mail-icon" className={className} />
  ),
  Phone: ({ className }: any) => (
    <div data-testid="mock-phone-icon" className={className} />
  ),
  FileText: ({ className }: any) => (
    <div data-testid="mock-file-text-icon" className={className} />
  ),
  Upload: ({ className }: any) => (
    <div data-testid="mock-upload-icon" className={className} />
  ),
  Download: ({ className }: any) => (
    <div data-testid="mock-download-icon" className={className} />
  ),
  Eye: ({ className }: any) => (
    <div data-testid="mock-eye-icon" className={className} />
  ),
  EyeOff: ({ className }: any) => (
    <div data-testid="mock-eye-off-icon" className={className} />
  ),
  Bell: ({ className }: any) => (
    <div data-testid="mock-bell-icon" className={className} />
  ),
  Star: ({ className }: any) => (
    <div data-testid="mock-star-icon" className={className} />
  ),
  Heart: ({ className }: any) => (
    <div data-testid="mock-heart-icon" className={className} />
  ),
  Info: ({ className }: any) => (
    <div data-testid="mock-info-icon" className={className} />
  ),
  Warning: ({ className }: any) => (
    <div data-testid="mock-warning-icon" className={className} />
  ),
  Error: ({ className }: any) => (
    <div data-testid="mock-error-icon" className={className} />
  ),
  Success: ({ className }: any) => (
    <div data-testid="mock-success-icon" className={className} />
  ),
};

// Test utility functions
export const waitForLoadingToFinish = () => 
  screen.findByText(/loading/i).then(() => 
    screen.findByText(/loading/i, {}, { timeout: 100 }).catch(() => {})
  );

export const getByTestId = (testId: string) => screen.getByTestId(testId);
export const queryByTestId = (testId: string) => screen.queryByTestId(testId);
export const findByTestId = (testId: string) => screen.findByTestId(testId);

// Form testing utilities
export const fillForm = async (fields: Record<string, string>) => {
  const user = userEvent.setup();
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i')) ||
                  screen.getByPlaceholderText(new RegExp(fieldName, 'i')) ||
                  screen.getByDisplayValue('');
    
    await user.clear(field);
    await user.type(field, value);
  }
};

export const submitForm = async () => {
  const user = userEvent.setup();
  const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
  await user.click(submitButton);
};

// Mock hook factories
export const createMockNavigate = () => vi.fn();

export const createMockUseIsMobile = (isMobile = false) => 
  vi.fn().mockReturnValue(isMobile);

// Test data generators
export const generateMockData = {
  transaction: (overrides = {}) => ({
    id: 'tx-123',
    property_address: '123 Test St',
    status: 'active',
    purchase_price: 450000,
    closing_date: '2024-03-15',
    ...overrides,
  }),

  client: (overrides = {}) => ({
    id: 'client-123',
    full_name: 'John Doe',
    email: 'john@example.com',
    type: 'buyer',
    ...overrides,
  }),

  profile: (overrides = {}) => ({
    id: 'profile-123',
    first_name: 'Agent',
    last_name: 'Smith',
    role: 'agent',
    ...overrides,
  }),
};

// Assertion helpers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string | RegExp) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react';
export { userEvent };

// Export render function with different name to avoid conflicts
export { renderWithProviders as render };