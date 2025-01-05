import React from 'react';
import { render, screen } from '@testing-library/react';
import { ItemIcon } from '../ItemIcon';

describe('ItemIcon', () => {
  const defaultProps = {
    iconId: 'test-item'
  };

  it('renders with default size', () => {
    render(<ItemIcon {...defaultProps} />);
    
    const icon = screen.getByTitle('test-item');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({
      width: '32px',
      height: '32px',
      minWidth: '32px',
      fontSize: '8px'
    });
  });

  it('renders with custom size', () => {
    render(<ItemIcon {...defaultProps} size={64} />);
    
    const icon = screen.getByTitle('test-item');
    expect(icon).toHaveStyle({
      width: '64px',
      height: '64px',
      minWidth: '64px',
      fontSize: '16px'
    });
  });

  it('applies custom className', () => {
    render(<ItemIcon {...defaultProps} className="custom-class" />);
    
    const icon = screen.getByTitle('test-item');
    expect(icon).toHaveClass('custom-class');
  });

  it('includes base classes', () => {
    render(<ItemIcon {...defaultProps} />);
    
    const icon = screen.getByTitle('test-item');
    expect(icon).toHaveClass('item-icon', `item-icon-${defaultProps.iconId}`);
  });

  it('formats icon id correctly', () => {
    render(<ItemIcon {...defaultProps} iconId="Complex Item Name" />);
    
    const icon = screen.getByTitle('complex-item-name');
    expect(icon).toHaveClass('item-icon', 'item-icon-complex-item-name');
  });

  it('handles empty icon id', () => {
    render(<ItemIcon {...defaultProps} iconId="" />);
    
    const icon = screen.getByTitle('');
    expect(icon).toHaveClass('item-icon', 'item-icon-');
  });

  it('applies container styles', () => {
    render(<ItemIcon {...defaultProps} />);
    
    const icon = screen.getByTitle('test-item');
    expect(icon).toHaveStyle({
      borderRadius: '4px',
      marginRight: '8px'
    });
  });
}); 