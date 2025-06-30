
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/testUtils';
import { SmartValidatedInput } from '@/components/validation/SmartValidatedInput';
import { z } from 'zod';

// Mock the advanced validation hook
vi.mock('@/hooks/useAdvancedFormValidation', () => ({
  useAdvancedFormValidation: () => ({
    validateFieldProgressive: vi.fn().mockResolvedValue(null),
    addToBatch: vi.fn(),
    getValidationSuggestions: vi.fn().mockResolvedValue(['suggestion1', 'suggestion2']),
    getContextualValidation: vi.fn().mockReturnValue(null),
    storeSuccessfulValue: vi.fn(),
    metrics: {
      totalValidations: 10,
      errorRate: 0.1,
      averageValidationTime: 250,
      popularErrors: {}
    }
  })
}));

describe('SmartValidatedInput', () => {
  const defaultProps = {
    name: 'test-field',
    label: 'Test Field',
    value: '',
    onChange: vi.fn(),
    schema: z.string().min(1, 'Field is required'),
    formId: 'test-form'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label and input', () => {
    render(<SmartValidatedInput {...defaultProps} />);
    
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    render(<SmartValidatedInput {...defaultProps} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should call onChange when input value changes', async () => {
    const mockOnChange = vi.fn();
    render(<SmartValidatedInput {...defaultProps} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('should show validation error', async () => {
    const { rerender } = render(<SmartValidatedInput {...defaultProps} />);
    
    // Simulate validation error by re-rendering with error state
    // In a real scenario, this would come from the validation hook
    rerender(<SmartValidatedInput {...defaultProps} value="invalid" />);
    
    // The component should show error styling
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(input).toHaveClass('border-red-500');
    });
  });

  it('should show success state for valid input', async () => {
    render(<SmartValidatedInput {...defaultProps} value="valid input" />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(input).toHaveClass('border-green-500');
    });
  });

  it('should show security indicator for maximum security level', () => {
    render(<SmartValidatedInput {...defaultProps} securityLevel="maximum" />);
    
    // Should show shield icon for maximum security
    expect(document.querySelector('[data-lucide="shield"]')).toBeInTheDocument();
  });

  it('should display validation quality badge', async () => {
    render(<SmartValidatedInput {...defaultProps} value="test" />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test value' } });
    
    await waitFor(() => {
      expect(screen.getByText('excellent')).toBeInTheDocument();
    });
  });

  it('should handle suggestions popover', async () => {
    render(<SmartValidatedInput {...defaultProps} enableSuggestions />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'te' } });
    
    await waitFor(() => {
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });
  });

  it('should show description when provided', () => {
    const description = 'This is a helpful description';
    render(<SmartValidatedInput {...defaultProps} description={description} />);
    
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('should handle accessibility attributes', () => {
    render(<SmartValidatedInput {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-field-description');
    expect(input).toHaveAttribute('id', 'test-field');
  });
});
