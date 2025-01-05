import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CustomRecipeDropdown } from '../CustomRecipeDropdown';
import { Recipe, Item } from '../../../types/types';

jest.useFakeTimers();

describe('CustomRecipeDropdown', () => {
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
    jest.clearAllTimers();
  });

  it('renders with selected recipe', () => {
    render(<CustomRecipeDropdown {...defaultProps} />);
    expect(screen.getByText('Recipe 1')).toBeInTheDocument();
  });

  it('shows placeholder when no recipe is selected', () => {
    render(<CustomRecipeDropdown {...defaultProps} value="" />);
    expect(screen.getByText('Select recipe...')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<CustomRecipeDropdown {...defaultProps} />);

    const trigger = screen.getByText('Recipe 1');
    fireEvent.click(trigger);

    expect(screen.getByText('Recipe 2')).toBeInTheDocument();
  });

  it('calls onChange when selecting a recipe', () => {
    render(<CustomRecipeDropdown {...defaultProps} />);

    const trigger = screen.getByText('Recipe 1');
    fireEvent.click(trigger);

    const option = screen.getByText('Recipe 2');
    fireEvent.click(option);

    expect(defaultProps.onChange).toHaveBeenCalledWith('recipe2');
  });

  it('closes dropdown when clicking outside', () => {
    render(<CustomRecipeDropdown {...defaultProps} />);

    const trigger = screen.getByText('Recipe 1');
    fireEvent.click(trigger);
    expect(screen.getByText('Recipe 2')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Recipe 2')).not.toBeInTheDocument();
  });

  it('shows recipe details in tooltip', () => {
    render(<CustomRecipeDropdown {...defaultProps} />);

    const trigger = screen.getByText('Recipe 1');
    fireEvent.mouseEnter(trigger);

    expect(screen.getByText('Input: 2 Input Item')).toBeInTheDocument();
    expect(screen.getByText('Output: 1 Output Item')).toBeInTheDocument();
    expect(screen.getByText('Time: 60s')).toBeInTheDocument();
    expect(screen.getByText('Producer: Test Machine')).toBeInTheDocument();
  });

  it('hides tooltip when mouse leaves', () => {
    render(<CustomRecipeDropdown {...defaultProps} />);

    const trigger = screen.getByText('Recipe 1');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Input: 2 Input Item')).not.toBeInTheDocument();
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
      <CustomRecipeDropdown
        {...defaultProps}
        recipes={recipesWithMissingItems}
        value="recipe3"
      />
    );

    const trigger = screen.getByText('Recipe 3');
    fireEvent.mouseEnter(trigger);

    expect(screen.getByText('Input: 1 missing-item')).toBeInTheDocument();
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
      <CustomRecipeDropdown
        {...defaultProps}
        recipes={recipesWithComplexProducer}
        value="recipe4"
      />
    );

    const trigger = screen.getByText('Recipe 4');
    fireEvent.mouseEnter(trigger);

    expect(screen.getByText('Producer: Complex Machine Name')).toBeInTheDocument();
  });

  it('handles empty recipe list', () => {
    render(<CustomRecipeDropdown {...defaultProps} recipes={[]} />);
    expect(screen.getByText('Select recipe...')).toBeInTheDocument();
  });
}); 