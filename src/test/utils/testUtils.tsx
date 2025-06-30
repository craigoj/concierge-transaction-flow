
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Mock user for authentication tests
export const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: {
    role: 'agent',
    full_name: 'Test Agent'
  }
};

// Mock form data
export const mockOfferRequest = {
  property_address: '123 Test St, Hampton, VA 23661',
  buyer_names: 'John Doe, Jane Doe',
  buyer_contacts: {
    phones: ['+1234567890'],
    emails: ['buyer@example.com']
  },
  purchase_price: 350000,
  loan_type: 'conventional',
  lending_company: 'Test Lender',
  emd_amount: 5000,
  exchange_fee: 500,
  settlement_company: 'Test Settlement',
  projected_closing_date: new Date('2024-06-01'),
};

// Export all testing library functions
export * from '@testing-library/react';
export { screen, fireEvent, waitFor };
