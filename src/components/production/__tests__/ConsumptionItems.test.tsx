import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsumptionItems } from '../consumptionItems/ConsumptionItems';
import { Item, ProductionRelationship } from '../../../types/types';

describe('ConsumptionItems', () => {
  const mockItems = new Map<string, Item>([
    ['iron-plate', { id: 'iron-plate', name: 'Iron Plate', category: 'parts' }],
    ['iron-ingot', { id: 'iron-ingot', name: 'Iron Ingot', category: 'parts' }],
    ['iron-rod', { id: 'iron-rod', name: 'Iron Rod', category: 'parts' }]
  ]);

  const mockRelationships: ProductionRelationship = {
    producedFor: [
      { itemId: 'iron-ingot', amount: 30, nodeId: 'node1' },
      { itemId: 'iron-rod', amount: 15, nodeId: 'node2' }
    ],
    totalProduction: 45
  };

  const defaultProps = {
    relationships: mockRelationships,
    itemsMap: mockItems,
    onConsumerClick: jest.fn(),
    isAccumulated: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders consumed items with correct rates', () => {
    render(<ConsumptionItems {...defaultProps} />);
    
    const ironIngotIcon = screen.getByTitle('iron-ingot');
    const ironRodIcon = screen.getByTitle('iron-rod');
    expect(ironIngotIcon).toBeInTheDocument();
    expect(ironRodIcon).toBeInTheDocument();
    expect(screen.getByText('30.00/min')).toBeInTheDocument();
    expect(screen.getByText('15.00/min')).toBeInTheDocument();
  });

  it('shows total production when accumulated', () => {
    render(<ConsumptionItems {...defaultProps} isAccumulated={true} />);
    
    const ironIngotIcon = screen.getByTitle('iron-ingot');
    const ironRodIcon = screen.getByTitle('iron-rod');
    expect(ironIngotIcon).toBeInTheDocument();
    expect(ironRodIcon).toBeInTheDocument();
    expect(screen.getByText('30.00/min')).toBeInTheDocument();
    expect(screen.getByText('15.00/min')).toBeInTheDocument();
    expect(screen.getByText('45.00/min')).toBeInTheDocument();
  });

  it('calls onConsumerClick with correct parameters', () => {
    const mockEvent = new MouseEvent('click') as any;
    render(<ConsumptionItems {...defaultProps} />);
    
    const consumer = screen.getByTitle('iron-ingot');
    fireEvent.click(consumer, mockEvent);
    
    expect(defaultProps.onConsumerClick).toHaveBeenCalledWith(mockEvent, 'iron-ingot');
  });

  it('displays item icons for each consumer', () => {
    render(<ConsumptionItems {...defaultProps} />);
    
    const ironIngotIcon = screen.getByTitle('iron-ingot');
    const ironRodIcon = screen.getByTitle('iron-rod');
    expect(ironIngotIcon).toBeInTheDocument();
    expect(ironRodIcon).toBeInTheDocument();
  });

  it('handles missing items by showing itemId', () => {
    const relationships: ProductionRelationship = {
      producedFor: [
        { itemId: 'missing-item', amount: 10, nodeId: 'node3' }
      ],
      totalProduction: 10
    };

    render(
      <ConsumptionItems
        {...defaultProps}
        relationships={relationships}
      />
    );
    
    expect(screen.getByTitle('missing-item')).toBeInTheDocument();
    expect(screen.getByText('10.00/min')).toBeInTheDocument();
  });

  it('renders nothing when no relationships', () => {
    const emptyRelationships: ProductionRelationship = {
      producedFor: [],
      totalProduction: 0
    };

    const { container } = render(
      <ConsumptionItems
        {...defaultProps}
        relationships={emptyRelationships}
      />
    );
    
    expect(container).toBeEmptyDOMElement();
  });

  it('prevents event propagation on click', () => {
    render(<ConsumptionItems {...defaultProps} />);
    
    const container = screen.getByRole('list');
    const stopPropagation = jest.fn();
    
    fireEvent.click(container, { stopPropagation });
    
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('formats rates with two decimal places', () => {
    const relationships: ProductionRelationship = {
      producedFor: [
        { itemId: 'iron-ingot', amount: 30.123, nodeId: 'node1' }
      ],
      totalProduction: 30.123
    };

    render(
      <ConsumptionItems
        {...defaultProps}
        relationships={relationships}
      />
    );
    
    expect(screen.getByText('30.12/min')).toBeInTheDocument();
  });
}); 