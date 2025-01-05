import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeSelect } from '../RecipeSelect';
import { Recipe, Item } from '../../../types/types';

describe('RecipeSelect', () => {
  const mockRecipes: Recipe[] = [
    {
      id: 'recipe1',
      name: 'Recipe 1',
      time: 60,
      in: { 'input-item': 2 },
      out: { 'output-item': 1 },
      producers: ['test-machine']
    },
    {
      id: 'recipe2',
      name: 'Recipe 2',
      time: 30,
      in: { 'input-item': 1 },
      out: { 'output-item': 2 },
      producers: ['test-machine']
    }
  ];

  const mockItems = new Map<string, Item>([
    ['input-item', { id: 'input-item', name: 'Input Item', category: 'parts' }],
    ['output-item', { id: 'output-item', name: 'Output Item', category: 'parts' }]
  ]);

  const defaultProps = {
    recipes: mockRecipes,
    value: 'recipe1',
    onChange: jest.fn(),
    itemsMap: mockItems
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with selected recipe', () => {
    render(<RecipeSelect {...defaultProps} />);
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
  });

  it('renders all recipe options', () => {
    render(<RecipeSelect {...defaultProps} />);
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Recipe 2')).toBeInTheDocument();
  });

  it('calls onChange when selecting a recipe', () => {
    render(<RecipeSelect {...defaultProps} />);

    const currentRecipe = screen.getByText('Recipe 1');
    fireEvent.click(currentRecipe);
    
    const newRecipe = screen.getByText('Recipe 2');
    fireEvent.click(newRecipe);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('recipe2');
  });

  it('displays recipe names correctly', () => {
    render(<RecipeSelect {...defaultProps} />);
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Recipe 2')).toBeInTheDocument();
  });

  it('shows recipe details in tooltip', () => {
    render(<RecipeSelect {...defaultProps} />);

    const recipe = screen.getByText('Recipe 1');
    fireEvent.mouseEnter(recipe);

    expect(screen.getByText('Input: 2 Input Item')).toBeInTheDocument();
    expect(screen.getByText('Output: 1 Output Item')).toBeInTheDocument();
    expect(screen.getByText('Time: 60s')).toBeInTheDocument();
  });

  it('handles empty recipe list', () => {
    render(<RecipeSelect {...defaultProps} recipes={[]} />);
    expect(screen.queryByText('Recipe 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Recipe 2')).not.toBeInTheDocument();
  });

  it('handles missing item names gracefully', () => {
    const recipesWithMissingItems: Recipe[] = [
      {
        id: 'recipe3',
        name: 'Recipe 3',
        time: 45,
        in: { 'missing-item': 1 },
        out: { 'output-item': 1 },
        producers: ['test-machine']
      }
    ];

    render(
      <RecipeSelect
        {...defaultProps}
        recipes={recipesWithMissingItems}
        value="recipe3"
      />
    );

    const recipe = screen.getByText('Recipe 3');
    fireEvent.mouseEnter(recipe);

    expect(screen.getByText('Input: 1 missing-item')).toBeInTheDocument();
  });

  it('shows producer in tooltip', () => {
    render(<RecipeSelect {...defaultProps} />);

    const recipe = screen.getByText('Recipe 1');
    fireEvent.mouseEnter(recipe);

    expect(screen.getByText('Producer: Test Machine')).toBeInTheDocument();
  });

  it('formats producer name correctly', () => {
    const recipesWithComplexProducer: Recipe[] = [
      {
        id: 'recipe4',
        name: 'Recipe 4',
        time: 30,
        in: { 'input-item': 1 },
        out: { 'output-item': 1 },
        producers: ['complex-machine-name']
      }
    ];

    render(
      <RecipeSelect
        {...defaultProps}
        recipes={recipesWithComplexProducer}
        value="recipe4"
      />
    );

    const recipe = screen.getByText('Recipe 4');
    fireEvent.mouseEnter(recipe);

    expect(screen.getByText('Producer: Complex Machine Name')).toBeInTheDocument();
  });
}); 