import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductionNode } from '../productionNode/ProductionNode';
import { ProductionNodeUI, Item, Recipe } from '../../../types/types';

describe('ProductionNode', () => {
  const mockRecipes = new Map<string, Recipe>([
    ['iron-plate-recipe', {
      id: 'iron-plate-recipe',
      name: 'Iron Plate',
      time: 6,
      in: { 'iron-ingot': 3 },
      out: { 'iron-plate': 2 },
      producers: ['constructor']
    }]
  ]);

  const mockItems = new Map<string, Item>([
    ['iron-plate', { id: 'iron-plate', name: 'Iron Plate', category: 'parts' }],
    ['iron-ingot', { id: 'iron-ingot', name: 'Iron Ingot', category: 'parts' }]
  ]);

  const mockNode: ProductionNodeUI = {
    itemId: 'iron-plate',
    rate: 30,
    recipeId: 'iron-plate-recipe',
    children: [],
    manualRate: 0,
    nodeId: 'node1',
    item: mockItems.get('iron-plate')!,
    availableRecipes: [mockRecipes.get('iron-plate-recipe')!],
    relationships: {
      producedFor: [],
      totalProduction: 30
    }
  };

  const defaultProps = {
    node: mockNode,
    onRecipeChange: jest.fn(),
    onManualRateChange: jest.fn(),
    onMachineCountChange: jest.fn(),
    machineOverrides: new Map(),
    manualRates: new Map(),
    detailLevel: 'normal' as const,
    isAccumulated: false,
    itemsMap: mockItems
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with basic node information', () => {
    render(<ProductionNode {...defaultProps} />);
    
    expect(screen.getByText('Iron Plate')).toBeInTheDocument();
    expect(screen.getByText('30.00/min')).toBeInTheDocument();
  });

  it('shows recipe selection dropdown', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const recipeSelect = screen.getByText('Iron Plate');
    expect(recipeSelect).toBeInTheDocument();
  });

  it('calls onRecipeChange when recipe is changed', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const recipeSelect = screen.getByText('Iron Plate');
    fireEvent.click(recipeSelect);
    
    const option = screen.getByText('Iron Plate');
    fireEvent.click(option);
    
    expect(defaultProps.onRecipeChange).toHaveBeenCalledWith('node1', 'iron-plate-recipe');
  });

  it('shows machine count adjustment controls', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const decreaseButton = screen.getByText('-');
    const increaseButton = screen.getByText('+');
    const input = screen.getByDisplayValue('2');
    
    expect(decreaseButton).toBeInTheDocument();
    expect(increaseButton).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('calls onMachineCountChange when adjusting machine count', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    
    expect(defaultProps.onMachineCountChange).toHaveBeenCalledWith('node1', 3);
  });

  it('shows manual rate input', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Add rate...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(0);
  });

  it('calls onManualRateChange when adjusting manual rate', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Add rate...');
    fireEvent.change(input, { target: { value: '45' } });
    
    expect(defaultProps.onManualRateChange).toHaveBeenCalledWith('node1', 45);
  });

  it('shows consumption items when present', () => {
    const nodeWithRelationships: ProductionNodeUI = {
      ...mockNode,
      relationships: {
        producedFor: [
          { itemId: 'iron-ingot', amount: 45, nodeId: 'node2' }
        ],
        totalProduction: 45
      }
    };

    render(<ProductionNode {...defaultProps} node={nodeWithRelationships} />);
    
    const icon = screen.getByTitle('iron-ingot');
    expect(icon).toBeInTheDocument();
    expect(screen.getByText('45.00/min')).toBeInTheDocument();
  });

  it('applies machine override when provided', () => {
    const machineOverrides = new Map([['node1', 4]]);
    
    render(<ProductionNode {...defaultProps} machineOverrides={machineOverrides} />);
    
    const input = screen.getByDisplayValue('4');
    expect(input).toBeInTheDocument();
  });

  it('applies manual rate override when provided', () => {
    const manualRates = new Map([['node1', 40]]);
    
    render(<ProductionNode {...defaultProps} manualRates={manualRates} />);
    
    const input = screen.getByPlaceholderText('Add rate...');
    expect(input).toHaveValue(40);
  });

  it('shows optimal rate button', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const button = screen.getByTitle('Set manual rate to achieve 100% efficiency');
    expect(button).toBeInTheDocument();
  });

  it('shows clear rate button', () => {
    const nodeWithManualRate: ProductionNodeUI = {
      ...mockNode,
      manualRate: 20
    };

    render(<ProductionNode {...defaultProps} node={nodeWithManualRate} />);
    
    const button = screen.getByTitle('Clear manual rate');
    expect(button).toBeInTheDocument();
  });

  it('shows efficiency percentage', () => {
    render(<ProductionNode {...defaultProps} />);
    
    const efficiency = screen.getByText('(75.00%)');
    expect(efficiency).toBeInTheDocument();
  });
}); 