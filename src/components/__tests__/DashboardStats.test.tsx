import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { DashboardStats } from '../DashboardStats';

describe('DashboardStats', () => {
  it('renders all stat cards', () => {
    render(<DashboardStats />);

    // Check that all four stat cards are rendered
    expect(screen.getByText('Active Transactions')).toBeInTheDocument();
    expect(screen.getByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<DashboardStats />);

    // Verify the values are displayed correctly
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText('$12,450')).toBeInTheDocument();
    expect(screen.getByText('96%')).toBeInTheDocument();
  });

  it('shows percentage changes', () => {
    render(<DashboardStats />);

    // Check that all percentage changes are shown
    expect(screen.getByText('+12% from last month')).toBeInTheDocument();
    expect(screen.getByText('+8% from last month')).toBeInTheDocument();
    expect(screen.getByText('+23% from last month')).toBeInTheDocument();
    expect(screen.getByText('+2% from last month')).toBeInTheDocument();
  });

  it('applies correct styling for positive changes', () => {
    render(<DashboardStats />);

    const changeElements = screen.getAllByText(/\+\d+% from last month/);

    // All changes in the component are positive, so should have green color
    changeElements.forEach((element) => {
      expect(element).toHaveClass('text-green-600');
    });
  });

  it('renders the correct number of cards', () => {
    render(<DashboardStats />);

    // Should render 4 stat cards by checking for stat titles
    expect(screen.getByText('Active Transactions')).toBeInTheDocument();
    expect(screen.getByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();

    // Alternative: check for the presence of all values
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText('$12,450')).toBeInTheDocument();
    expect(screen.getByText('96%')).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    const { container } = render(<DashboardStats />);

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('sm:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-4');
  });
});
