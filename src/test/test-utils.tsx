import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Export everything from testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Common test utilities
export const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'agent',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockTransaction = (overrides = {}) => ({
  id: '456',
  client_id: '789',
  agent_id: '123',
  property_address: '123 Test St',
  transaction_type: 'purchase',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockClient = (overrides = {}) => ({
  id: '789',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  preferred_contact: 'email',
  service_tier: 'premium',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Mock functions for common scenarios
export const mockNavigate = vi.fn()
export const mockUseNavigate = vi.fn(() => mockNavigate)

// Utility to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock IntersectionObserver for components that use it
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.IntersectionObserver = mockIntersectionObserver
}