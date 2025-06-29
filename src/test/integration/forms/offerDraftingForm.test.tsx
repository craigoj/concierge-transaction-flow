
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/testUtils';
import { OfferDraftingForm } from '@/components/forms/OfferDraftingForm';
import { mockOfferRequest } from '@/test/utils/testUtils';

// Mock the hooks
vi.mock('@/hooks/queries/useOfferRequests', () => ({
  useCreateOfferRequest: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null
  })
}));

vi.mock('@/hooks/useAdvancedFormValidation', () => ({
  useAdvancedFormValidation: () => ({
    validateFieldProgressive: vi.fn().mockResolvedValue(null),
    validateAllFields: vi.fn().mockResolvedValue(true),
    clearValidation: vi.fn(),
    metrics: { totalValidations: 0, errorRate: 0, averageValidationTime: 0, popularErrors: {} }
  })
}));

describe('OfferDraftingForm Integration', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form sections', () => {
    render(<OfferDraftingForm {...defaultProps} />);
    
    expect(screen.getByText('Property Information')).toBeInTheDocument();
    expect(screen.getByText('Offer Terms')).toBeInTheDocument();
    expect(screen.getByText('Buyer Information')).toBeInTheDocument();
    expect(screen.getByText('Financing Details')).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const mockOnSuccess = vi.fn();
    render(<OfferDraftingForm {...defaultProps} onSuccess={mockOnSuccess} />);
    
    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/property address/i), {
      target: { value: mockOfferRequest.property_address }
    });
    
    fireEvent.change(screen.getByLabelText(/buyer names/i), {
      target: { value: mockOfferRequest.buyer_names }
    });
    
    fireEvent.change(screen.getByLabelText(/purchase price/i), {
      target: { value: mockOfferRequest.purchase_price.toString() }
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit offer request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCcalled();
    });
  });

  it('should show validation errors for invalid data', async () => {
    render(<OfferDraftingForm {...defaultProps} />);
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /submit offer request/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/property address is required/i)).toBeInTheDocument();
    });
  });

  it('should handle form cancellation', () => {
    const mockOnCancel = vi.fn();
    render(<OfferDraftingForm {...defaultProps} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should auto-save form data', async () => {
    render(<OfferDraftingForm {...defaultProps} />);
    
    const input = screen.getByLabelText(/property address/i);
    fireEvent.change(input, { target: { value: '123 Test St' } });
    
    // Wait for auto-save to trigger
    await waitFor(() => {
      expect(localStorage.getItem).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('should show loading state during submission', async () => {
    // Mock pending state
    vi.mocked(vi.importMock('@/hooks/queries/useOfferRequests')).useCreateOfferRequest.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null
    });
    
    render(<OfferDraftingForm {...defaultProps} />);
    
    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    // Mock error state
    vi.mocked(vi.importMock('@/hooks/queries/useOfferRequests')).useCreateOfferRequest.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new Error('Network error')
    });
    
    render(<OfferDraftingForm {...defaultProps} />);
    
    expect(screen.getByText(/error submitting offer/i)).toBeInTheDocument();
  });
});
