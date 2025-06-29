import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test to verify setup
describe('Testing setup', () => {
  it('should render a basic component', () => {
    const TestComponent = () => <div>Hello Testing World</div>
    
    render(<TestComponent />)
    
    expect(screen.getByText('Hello Testing World')).toBeInTheDocument()
  })
  
  it('should perform basic math operations', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
  })
})