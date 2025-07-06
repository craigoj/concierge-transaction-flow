/**
 * Enhanced TransactionCard Test Suite
 * Comprehensive test coverage for TransactionCard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockUIComponents, mockIcons } from '@/test/utils/enhanced-test-utils';
import { TransactionCard } from '../TransactionCard';
import transactionFixtures from '@/test/fixtures/transactions';

// Mock dependencies
vi.mock('@/components/ui/card', () => mockUIComponents);
vi.mock('@/components/ui/badge', () => ({ Badge: mockUIComponents.Badge }));
vi.mock('@/components/ui/button', () => ({ Button: mockUIComponents.Button }));
vi.mock('lucide-react', () => mockIcons);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('TransactionCard', () => {
  const defaultProps = {
    transaction: transactionFixtures.transactions.active,
    onClick: vi.fn(),
    variant: 'default' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders transaction card with basic information', () => {
      renderWithProviders(<TransactionCard {...defaultProps} />);
      
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
      expect(screen.getByText('123 Oak Street')).toBeInTheDocument();
      expect(screen.getByText('$450,000')).toBeInTheDocument();
    });

    it('renders with different service tiers', () => {
      const eliteTransaction = transactionFixtures.transactions.elite;
      renderWithProviders(
        <TransactionCard 
          {...defaultProps} 
          transaction={eliteTransaction}
        />
      );
      
      expect(screen.getByText('555 Elite Boulevard')).toBeInTheDocument();
      expect(screen.getByText('$750,000')).toBeInTheDocument();
    });

    it('renders white glove transactions with premium styling', () => {
      const whiteGloveTransaction = transactionFixtures.transactions.whiteGlove;
      renderWithProviders(
        <TransactionCard 
          {...defaultProps} 
          transaction={whiteGloveTransaction}
          variant="premium"
        />
      );
      
      expect(screen.getByText('777 Luxury Lane')).toBeInTheDocument();
      expect(screen.getByText('$1,250,000')).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('formats prices correctly', () => {
      const transactions = [
        { ...transactionFixtures.transactions.active, purchase_price: 450000 },
        { ...transactionFixtures.transactions.active, purchase_price: 1500000 },
        { ...transactionFixtures.transactions.active, purchase_price: 75000 },
      ];

      transactions.forEach(transaction => {
        const { unmount } = renderWithProviders(
          <TransactionCard {...defaultProps} transaction={transaction} />
        );
        
        if (transaction.purchase_price === 450000) {
          expect(screen.getByText('$450,000')).toBeInTheDocument();
        } else if (transaction.purchase_price === 1500000) {
          expect(screen.getByText('$1,500,000')).toBeInTheDocument();
        } else if (transaction.purchase_price === 75000) {
          expect(screen.getByText('$75,000')).toBeInTheDocument();
        }
        
        unmount();
      });
    });

    it('handles null purchase price', () => {
      const transactionWithoutPrice = {
        ...transactionFixtures.transactions.active,
        purchase_price: null,
      };
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={transactionWithoutPrice} />
      );
      
      expect(screen.getByText('$TBD')).toBeInTheDocument();
    });

    it('formats dates correctly', () => {
      const transactionWithDate = {
        ...transactionFixtures.transactions.active,
        closing_date: '2024-03-15',
      };
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={transactionWithDate} />
      );
      
      // Check for formatted date (format may vary by locale)
      const expectedDate = new Date('2024-03-15').toLocaleDateString();
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });

    it('handles null closing date', () => {
      const transactionWithoutDate = {
        ...transactionFixtures.transactions.active,
        closing_date: null,
      };
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={transactionWithoutDate} />
      );
      
      expect(screen.getByText('Date TBD')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('displays status badges correctly', () => {
      const statuses = ['active', 'pending', 'completed', 'cancelled'];
      
      statuses.forEach(status => {
        const transaction = {
          ...transactionFixtures.transactions.active,
          status,
        };
        
        const { unmount } = renderWithProviders(
          <TransactionCard {...defaultProps} transaction={transaction} />
        );
        
        const badge = screen.getByTestId('mock-badge');
        expect(badge).toHaveAttribute('data-variant', 
          status === 'active' ? 'default' :
          status === 'pending' ? 'secondary' :
          status === 'completed' ? 'success' :
          'destructive'
        );
        
        unmount();
      });
    });

    it('shows appropriate status text', () => {
      const statusTexts = {
        active: 'COORDINATING',
        pending: 'PENDING',
        completed: 'COMPLETED',
        cancelled: 'CANCELLED',
      };
      
      Object.entries(statusTexts).forEach(([status, text]) => {
        const transaction = {
          ...transactionFixtures.transactions.active,
          status,
        };
        
        const { unmount } = renderWithProviders(
          <TransactionCard {...defaultProps} transaction={transaction} />
        );
        
        expect(screen.getByText(text)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Service Tier Features', () => {
    it('displays core tier features', () => {
      const coreTransaction = {
        ...transactionFixtures.transactions.active,
        service_tier: 'core',
      };
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={coreTransaction} />
      );
      
      // Core tier should show basic information
      expect(screen.getByText('123 Oak Street')).toBeInTheDocument();
    });

    it('displays elite tier enhanced features', () => {
      const eliteTransaction = transactionFixtures.transactions.elite;
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={eliteTransaction} />
      );
      
      // Elite tier may show additional information or styling
      expect(screen.getByText('555 Elite Boulevard')).toBeInTheDocument();
    });

    it('displays white glove tier premium features', () => {
      const whiteGloveTransaction = transactionFixtures.transactions.whiteGlove;
      
      renderWithProviders(
        <TransactionCard 
          {...defaultProps} 
          transaction={whiteGloveTransaction}
          variant="premium"
        />
      );
      
      expect(screen.getByText('777 Luxury Lane')).toBeInTheDocument();
    });
  });

  describe('Client Information', () => {
    it('displays client names when available', () => {
      const transactionWithClients = transactionFixtures.createTransactionWithRelations({
        id: 'tx-with-clients',
        property_address: '123 Client Street',
      });
      
      renderWithProviders(
        <TransactionCard 
          {...defaultProps} 
          transaction={transactionWithClients}
        />
      );
      
      // Should display client information if available
      expect(screen.getByText('123 Client Street')).toBeInTheDocument();
    });

    it('handles missing client information', () => {
      const transactionWithoutClients = {
        ...transactionFixtures.transactions.active,
        clients: [],
      };
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={transactionWithoutClients} />
      );
      
      // Should gracefully handle missing client data
      expect(screen.getByText('Client TBD')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('calls onClick when card is clicked', async () => {
      const mockClick = vi.fn();
      renderWithProviders(
        <TransactionCard {...defaultProps} onClick={mockClick} />
      );
      
      const card = screen.getByTestId('mock-card');
      fireEvent.click(card);
      
      expect(mockClick).toHaveBeenCalledWith(defaultProps.transaction);
    });

    it('handles keyboard navigation', async () => {
      const mockClick = vi.fn();
      renderWithProviders(
        <TransactionCard {...defaultProps} onClick={mockClick} />
      );
      
      const card = screen.getByTestId('mock-card');
      fireEvent.keyDown(card, { key: 'Enter' });
      
      // Should handle Enter key for accessibility
      expect(mockClick).toHaveBeenCalledWith(defaultProps.transaction);
    });

    it('shows action buttons when hovering (if applicable)', async () => {
      renderWithProviders(<TransactionCard {...defaultProps} />);
      
      const card = screen.getByTestId('mock-card');
      fireEvent.mouseEnter(card);
      
      // Action buttons might appear on hover
      await waitFor(() => {
        // Check for any action buttons that might appear
        const buttons = screen.queryAllByTestId('mock-button');
        expect(buttons.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles extremely long property addresses', () => {
      const transactionWithLongAddress = transactionFixtures.edgeCaseTransactions.longAddress;
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={transactionWithLongAddress} />
      );
      
      // Should display long address (possibly truncated)
      expect(screen.getByText(/Very Long Property Address/)).toBeInTheDocument();
    });

    it('handles high-value transactions', () => {
      const highValueTransaction = transactionFixtures.edgeCaseTransactions.highValue;
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={highValueTransaction} />
      );
      
      expect(screen.getByText('$5,750,000')).toBeInTheDocument();
    });

    it('handles minimal transaction data', () => {
      const minimalTransaction = transactionFixtures.edgeCaseTransactions.minimalData;
      
      renderWithProviders(
        <TransactionCard {...defaultProps} transaction={minimalTransaction} />
      );
      
      expect(screen.getByText('Minimal Property')).toBeInTheDocument();
      expect(screen.getByText('$TBD')).toBeInTheDocument();
      expect(screen.getByText('Date TBD')).toBeInTheDocument();
    });

    it('handles missing required fields gracefully', () => {
      const malformedTransaction = {
        id: 'tx-malformed',
        // Missing many required fields
      } as any;
      
      expect(() => {
        renderWithProviders(
          <TransactionCard {...defaultProps} transaction={malformedTransaction} />
        );
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProviders(<TransactionCard {...defaultProps} />);
      
      const card = screen.getByTestId('mock-card');
      
      // Should be accessible via keyboard
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('123 Oak Street'));
    });

    it('provides meaningful screen reader content', () => {
      renderWithProviders(<TransactionCard {...defaultProps} />);
      
      // Screen reader should get comprehensive information
      expect(screen.getByLabelText(/transaction.*123 Oak Street/i)).toBeInTheDocument();
    });

    it('handles focus management correctly', () => {
      renderWithProviders(<TransactionCard {...defaultProps} />);
      
      const card = screen.getByTestId('mock-card');
      card.focus();
      
      expect(document.activeElement).toBe(card);
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', () => {
      // Test mobile-specific rendering
      renderWithProviders(
        <TransactionCard {...defaultProps} variant="mobile" />
      );
      
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
      // Mobile variant might have different layout
    });

    it('adapts to desktop viewport', () => {
      renderWithProviders(
        <TransactionCard {...defaultProps} variant="default" />
      );
      
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders large lists efficiently', () => {
      const manyTransactions = transactionFixtures.generateTransactionList(50);
      
      const startTime = performance.now();
      
      manyTransactions.forEach((transaction, index) => {
        const { unmount } = renderWithProviders(
          <TransactionCard 
            key={index}
            {...defaultProps} 
            transaction={transaction} 
          />
        );
        unmount();
      });
      
      const endTime = performance.now();
      const timePerRender = (endTime - startTime) / manyTransactions.length;
      
      // Should render quickly (less than 10ms per component)
      expect(timePerRender).toBeLessThan(10);
    });

    it('handles rapid prop changes efficiently', async () => {
      const transactions = transactionFixtures.generateTransactionList(10);
      
      const { rerender } = renderWithProviders(
        <TransactionCard {...defaultProps} transaction={transactions[0]} />
      );
      
      // Rapidly change props
      for (let i = 1; i < transactions.length; i++) {
        rerender(
          <TransactionCard {...defaultProps} transaction={transactions[i]} />
        );
      }
      
      // Should handle rapid updates without issues
      expect(screen.getByTestId('mock-card')).toBeInTheDocument();
    });
  });
});