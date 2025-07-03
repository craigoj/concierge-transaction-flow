
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/testUtils';
import { SmartValidatedInput } from '@/components/validation/SmartValidatedInput';
import { z } from 'zod';

describe('SmartValidatedInput', () => {
  const defaultProps = {
    fieldName: 'test-field',
    value: '',
    onChange: vi.fn(),
    formContext: {},
    className: '',
    placeholder: 'Test placeholder',
    type: 'text' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with placeholder', () => {
    render(<SmartValidatedInput {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('should call onChange when input value changes', async () => {
    const mockOnChange = vi.fn();
    render(<SmartValidatedInput {...defaultProps} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('should show validation error for short input', async () => {
    const { rerender } = render(<SmartValidatedInput {...defaultProps} />);
    
    // Simulate validation error by re-rendering with short value
    rerender(<SmartValidatedInput {...defaultProps} value="a" />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    
    await waitFor(() => {
      expect(input).toHaveClass('border-red-300');
    });
  });

  it('should show success state for valid input', async () => {
    render(<SmartValidatedInput {...defaultProps} value="valid input" />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    
    await waitFor(() => {
      expect(input).toHaveClass('border-green-300');
    });
  });

  it('should show loading state during validation', async () => {
    const { rerender } = render(<SmartValidatedInput {...defaultProps} />);
    
    // Change value to trigger validation
    rerender(<SmartValidatedInput {...defaultProps} value="testing" />);
    
    // Should show loading state briefly
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toHaveClass('border-yellow-300');
    });
  });

  it('should handle empty value', () => {
    render(<SmartValidatedInput {...defaultProps} value="" />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    expect(input).toHaveValue('');
  });

  it('should accept custom className', () => {
    render(<SmartValidatedInput {...defaultProps} className="custom-class" />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    expect(input).toHaveClass('custom-class');
  });

  it('should handle different input types', () => {
    render(<SmartValidatedInput {...defaultProps} type="email" />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    expect(input).toHaveAttribute('type', 'email');
  });
});
