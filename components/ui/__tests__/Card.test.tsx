import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders without crashing', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <Card>
        <h1>Title</h1>
        <p>Description</p>
      </Card>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">Content</Card>
    );
    
    const cardElement = container.querySelector('.custom-class');
    expect(cardElement).toBeInTheDocument();
  });

  it('renders with default styling', () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild;
    
    expect(cardElement).toHaveClass('bg-white');
    expect(cardElement).toHaveClass('rounded-lg');
    expect(cardElement).toHaveClass('shadow');
  });

  it('handles empty children', () => {
    const { container } = render(<Card />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with padding', () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild;
    
    expect(cardElement).toHaveClass('p-6');
  });

  it('supports nested elements', () => {
    render(
      <Card>
        <div data-testid="nested-div">
          <span>Nested Content</span>
        </div>
      </Card>
    );
    
    expect(screen.getByTestId('nested-div')).toBeInTheDocument();
    expect(screen.getByText('Nested Content')).toBeInTheDocument();
  });

  it('maintains accessibility', () => {
    const { container } = render(
      <Card>
        <button>Click Me</button>
      </Card>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

