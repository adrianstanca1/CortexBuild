import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders without crashing', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('displays correct status text', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('applies correct color for active status', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('applies correct color for pending status', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');
  });

  it('applies correct color for inactive status', () => {
    const { container } = render(<StatusBadge status="inactive" />);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });

  it('applies correct color for error status', () => {
    const { container } = render(<StatusBadge status="error" />);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });

  it('renders with badge styling', () => {
    const { container } = render(<StatusBadge status="active" />);
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('px-3');
    expect(badge).toHaveClass('py-1');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-sm');
    expect(badge).toHaveClass('font-semibold');
  });

  it('handles custom className', () => {
    const { container } = render(
      <StatusBadge status="active" className="custom-class" />
    );
    const badge = container.firstChild;
    
    expect(badge).toHaveClass('custom-class');
  });

  it('capitalizes status text', () => {
    render(<StatusBadge status="active" />);
    const text = screen.getByText('Active');
    
    expect(text).toBeInTheDocument();
  });
});

