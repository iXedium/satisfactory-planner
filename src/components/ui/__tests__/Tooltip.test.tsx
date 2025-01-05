import React from 'react';
import { render, screen } from '@testing-library/react';
import { Tooltip } from '../Tooltip';
import { Recipe, Item } from '../../../types/types';

describe('Tooltip', () => {
  const mockRecipe: Recipe = {
    id: 'test-recipe',
    name: 'Test Recipe',
    time: 60,
    in: { 'input-item': 2 },
    out: { 'output-item': 1 },
    producers: ['test-machine']
  };

  const mockItems = new Map<string, Item>([
    ['input-item', { id: 'input-item', name: 'Input Item', category: 'parts' }],
    ['output-item', { id: 'output-item', name: 'Output Item', category: 'parts' }]
  ]);

  const defaultProps = {
    recipe: mockRecipe,
    items: mockItems,
    show: true,
    style: { top: 0, left: 0 }
  };

  it('renders recipe name and time', () => {
    render(<Tooltip {...defaultProps} />);
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('60s')).toBeInTheDocument();
  });

  it('renders input items with rates', () => {
    render(<Tooltip {...defaultProps} />);
    
    expect(screen.getByText('Input Item')).toBeInTheDocument();
    expect(screen.getByText('2.0/min')).toBeInTheDocument();
  });

  it('renders output items with rates', () => {
    render(<Tooltip {...defaultProps} />);
    
    expect(screen.getByText('Output Item')).toBeInTheDocument();
    expect(screen.getByText('1.0/min')).toBeInTheDocument();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<Tooltip {...defaultProps} show={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('applies custom styles', () => {
    const customStyle = { top: 100, left: 200 };
    render(<Tooltip {...defaultProps} style={customStyle} />);
    
    const tooltip = screen.getByTestId('recipe-tooltip');
    expect(tooltip).toHaveStyle(customStyle);
  });

  it('handles missing item names gracefully', () => {
    const recipeWithMissingItems: Recipe = {
      ...mockRecipe,
      in: { 'missing-item': 1 },
      out: { 'another-missing-item': 1 }
    };

    render(
      <Tooltip
        {...defaultProps}
        recipe={recipeWithMissingItems}
      />
    );
    
    expect(screen.getByText('missing-item')).toBeInTheDocument();
    expect(screen.getByText('another-missing-item')).toBeInTheDocument();
  });

  it('calculates rates per minute correctly', () => {
    const recipeWithDifferentTime: Recipe = {
      ...mockRecipe,
      time: 30,
      in: { 'input-item': 2 },
      out: { 'output-item': 1 }
    };

    render(
      <Tooltip
        {...defaultProps}
        recipe={recipeWithDifferentTime}
      />
    );
    
    expect(screen.getByText('4.0/min')).toBeInTheDocument(); // Input: 2 * (60/30)
    expect(screen.getByText('2.0/min')).toBeInTheDocument(); // Output: 1 * (60/30)
  });

  it('shows section headers', () => {
    render(<Tooltip {...defaultProps} />);
    
    expect(screen.getByText('Inputs')).toBeInTheDocument();
    expect(screen.getByText('Outputs')).toBeInTheDocument();
  });

  it('renders item icons', () => {
    render(<Tooltip {...defaultProps} />);
    
    const icons = screen.getAllByTitle(/item/i);
    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveClass('item-icon-input-item');
    expect(icons[1]).toHaveClass('item-icon-output-item');
  });
}); 