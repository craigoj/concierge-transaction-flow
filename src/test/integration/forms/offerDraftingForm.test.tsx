
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfferDraftingForm } from '@/components/forms/OfferDraftingForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockSupabase = supabase as any;

describe('OfferDraftingForm', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' },
      userRole: 'agent'
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        data: null,
        error: null
      })
    });

    // Clear localStorage
    localStorage.clear();
  });

  it('renders the first step by default', () => {
    render(<OfferDraftingForm />);
    
    expect(screen.getByText('Property Details')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 6: Property Details')).toBeInTheDocument();
  });

  it('allows navigation between steps', async () => {
    render(<OfferDraftingForm />);
    
    // Click Next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should move to step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 6: Offer Terms')).toBeInTheDocument();
    });
    
    // Click Previous button
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    
    // Should go back to step 1
    await waitFor(() => {
      expect(screen.getByText('Step 1 of 6: Property Details')).toBeInTheDocument();
    });
  });

  it('shows submit button on final step', async () => {
    render(<OfferDraftingForm />);
    
    // Navigate to final step
    for (let i = 0; i < 5; i++) {
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      await waitFor(() => {}); // Wait for state update
    }
    
    expect(screen.getByText('Submit Offer Request')).toBeInTheDocument();
  });

  it('auto-saves form data to localStorage', async () => {
    render(<OfferDraftingForm />);
    
    const propertyAddressInput = screen.getByLabelText(/property address/i);
    fireEvent.change(propertyAddressInput, { target: { value: '123 Main St' } });
    
    // Wait for auto-save
    await waitFor(() => {
      const savedData = localStorage.getItem('offerDraftFormData');
      expect(savedData).toBeTruthy();
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.property_address).toBe('123 Main St');
    }, { timeout: 3000 });
  });

  it('loads saved data from localStorage on mount', () => {
    const savedData = {
      property_address: '456 Oak Ave',
      buyer_names: 'John Doe',
      purchase_price: '500000'
    };
    localStorage.setItem('offerDraftFormData', JSON.stringify(savedData));
    
    render(<OfferDraftingForm />);
    
    const propertyAddressInput = screen.getByLabelText(/property address/i) as HTMLInputElement;
    expect(propertyAddressInput.value).toBe('456 Oak Ave');
  });
});
