import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from '../ViewToggle';

describe('ViewToggle', () => {
  const defaultProps = {
    mode: 'tree' as const,
    onToggle: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tree view mode correctly', () => {
    render(<ViewToggle {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Tree View');
    expect(button).toHaveAttribute('data-mode', 'tree');
    expect(button).toHaveAttribute('title', 'Switch to list view');
  });

  it('renders list view mode correctly', () => {
    render(<ViewToggle {...defaultProps} mode="list" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('List View');
    expect(button).toHaveAttribute('data-mode', 'list');
    expect(button).toHaveAttribute('title', 'Switch to tree view');
  });

  it('calls onToggle when clicked', () => {
    render(<ViewToggle {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it('has correct class name based on mode', () => {
    render(<ViewToggle {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('view-toggle-button');
    expect(button).toHaveClass('tree-mode');
  });

  it('shows correct class name in list mode', () => {
    render(<ViewToggle {...defaultProps} mode="list" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('view-toggle-button');
    expect(button).toHaveClass('list-mode');
  });

  it('prevents event propagation on click', () => {
    render(<ViewToggle {...defaultProps} />);
    
    const button = screen.getByRole('button');
    const stopPropagation = jest.fn();
    
    fireEvent.click(button, { stopPropagation });
    
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('shows correct icon based on mode', () => {
    const { rerender } = render(<ViewToggle {...defaultProps} />);
    
    let icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('alt', 'tree-view');
    
    rerender(<ViewToggle {...defaultProps} mode="list" />);
    
    icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('alt', 'list-view');
  });
}); 