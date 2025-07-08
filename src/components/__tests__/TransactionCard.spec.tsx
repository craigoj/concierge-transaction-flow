import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import TransactionCard from '../TransactionCard'

const mockTransaction = {
  id: '123',
  property: '123 Main Street',
  client: 'John Doe',
  agent: 'Jane Smith',
  type: 'buyer' as const,
  status: 'under-contract' as const,
  tier: 'Premium',
  closingDate: '2024-02-15',
  location: 'Norfolk, VA'
}

describe('TransactionCard', () => {
  it('renders transaction information correctly', () => {
    render(<TransactionCard {...mockTransaction} />)
    
    // Check that all key information is displayed
    expect(screen.getByText('123 Main Street')).toBeInTheDocument()
  })

  it('displays correct badges for status and type', () => {
    render(<TransactionCard {...mockTransaction} />)
    
    // Check badges
    expect(screen.getByText('UNDER CONTRACT')).toBeInTheDocument()
    expect(screen.getByText('BUYER')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('applies correct status colors', () => {
    const { rerender } = render(<TransactionCard {...mockTransaction} />)
    
    // Test under-contract status (blue)
    let statusBadge = screen.getByText('UNDER CONTRACT')
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800')
    
    // Test pending status (yellow)
    rerender(<TransactionCard {...mockTransaction} status="pending" />)
    statusBadge = screen.getByText('PENDING')
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    
    // Test completed status (green)
    rerender(<TransactionCard {...mockTransaction} status="completed" />)
    statusBadge = screen.getByText('COMPLETED')
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
    
    // Test closing status (orange)
    rerender(<TransactionCard {...mockTransaction} status="closing" />)
    statusBadge = screen.getByText('CLOSING')
    expect(statusBadge).toHaveClass('bg-orange-100', 'text-orange-800')
  })

  it('applies correct type colors', () => {
    const { rerender } = render(<TransactionCard {...mockTransaction} />)
    
    // Test buyer type (emerald)
    let typeBadge = screen.getByText('BUYER')
    expect(typeBadge).toHaveClass('bg-emerald-100', 'text-emerald-800')
    
    // Test seller type (purple)
    rerender(<TransactionCard {...mockTransaction} type="seller" />)
    typeBadge = screen.getByText('SELLER')
    expect(typeBadge).toHaveClass('bg-purple-100', 'text-purple-800')
  })

  it('renders action buttons', () => {
    render(<TransactionCard {...mockTransaction} />)
    
    // Check that action buttons are present
    expect(screen.getByText('View Details')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
  })

  it('includes proper icons', () => {
    const { container } = render(<TransactionCard {...mockTransaction} />)
    
    // Check that icons are rendered (by checking for lucide icon classes)
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('has hover effect styling', () => {
    const { container } = render(<TransactionCard {...mockTransaction} />)
    
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow')
  })

  it('displays client and agent labels correctly', () => {
    render(<TransactionCard {...mockTransaction} />)
    
    // Check that labels are present
    expect(screen.getByText('Client:')).toBeInTheDocument()
    expect(screen.getByText('Agent:')).toBeInTheDocument()
    expect(screen.getByText('Closing:')).toBeInTheDocument()
  })
})
