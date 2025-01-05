import React from 'react';
import { render, screen } from '@testing-library/react';
import { ListView } from '../ListView';
import { ProductionNode, Item, Recipe } from '../../../types/types';

jest.mock('../productionNode/ProductionNode', () => ({
  ProductionNode: ({ node }: { node: any }) => (
    <div data-testid={`production-node-${node.itemId}`}>
      {node.itemId} - {node.rate}/min
    </div>
  )
}));

describe('ListView', () => {
  const mockNodes: ProductionNode[] = [
    {
      itemId: 'item1',
      rate: 10,
      recipeId: 'recipe1',
      children: [],
      manualRate: 0
    },
    {
      itemId: 'item2',
      rate: 20,
      recipeId: 'recipe2',
      children: [],
      manualRate: 0
    }
  ];

  const mockItems = new Map<string, Item>([
    ['item1', { id: 'item1', name: 'Item 1', category: 'parts' }],
    ['item2', { id: 'item2', name: 'Item 2', category: 'parts' }]
  ]);

  const mockRecipes = new Map<string, Recipe>([
    ['recipe1', {
      id: 'recipe1',
      name: 'Recipe 1',
      time: 60,
      in: { 'input-item': 2 },
      out: { 'item1': 1 },
      producers: ['test-machine']
    }],
    ['recipe2', {
      id: 'recipe2',
      name: 'Recipe 2',
      time: 30,
      in: { 'input-item': 1 },
      out: { 'item2': 2 },
      producers: ['test-machine']
    }]
  ]);

  const defaultProps = {
    nodes: mockNodes,
    items: mockItems,
    recipes: mockRecipes,
    onRecipeChange: jest.fn(),
    onManualRateChange: jest.fn(),
    onMachineCountChange: jest.fn(),
    machineOverrides: new Map(),
    manualRates: new Map(),
    detailLevel: 'normal' as const
  };

  it('renders empty state when no nodes', () => {
    render(<ListView {...defaultProps} nodes={[]} />);
    expect(screen.getByText('No production nodes to display')).toBeInTheDocument();
  });

  it('renders all production nodes', () => {
    render(<ListView {...defaultProps} />);
    
    expect(screen.getByTestId('production-node-item1')).toBeInTheDocument();
    expect(screen.getByTestId('production-node-item2')).toBeInTheDocument();
  });

  it('renders nodes with correct rates', () => {
    render(<ListView {...defaultProps} />);
    
    expect(screen.getByText('item1 - 10/min')).toBeInTheDocument();
    expect(screen.getByText('item2 - 20/min')).toBeInTheDocument();
  });

  it('passes correct props to ProductionNode components', () => {
    render(<ListView {...defaultProps} />);
    
    const node1 = screen.getByTestId('production-node-item1');
    const node2 = screen.getByTestId('production-node-item2');
    
    expect(node1).toBeInTheDocument();
    expect(node2).toBeInTheDocument();
  });
}); 