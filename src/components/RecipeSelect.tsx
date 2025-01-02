import React, { useState, useRef } from 'react';
import { Recipe, Item } from '../types/types';
import { Tooltip } from './Tooltip';

interface RecipeSelectProps {
  recipes: Recipe[];
  value: string;
  onChange: (value: string) => void;
  itemsMap: Map<string, Item>;
}

export function RecipeSelect({ recipes, value, onChange, itemsMap }: RecipeSelectProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredRecipe, setHoveredRecipe] = useState<Recipe | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleOptionHover = (e: React.MouseEvent<HTMLOptionElement>) => {
    const option = e.currentTarget;
    const recipe = recipes.find(r => r.id === option.value);
    if (!recipe) return;

    const rect = option.getBoundingClientRect();
    const selectRect = selectRef.current?.getBoundingClientRect();

    if (selectRect) {
      setTooltipPosition({
        x: selectRect.right + 10,
        y: rect.top
      });
      setHoveredRecipe(recipe);
      setTooltipVisible(true);
    }
  };

  return (
    <div className="recipe-select-container">
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        {recipes.map(recipe => (
          <option
            key={recipe.id}
            value={recipe.id}
            onMouseEnter={(e) => handleOptionHover(e)}
          >
            {recipe.name}
          </option>
        ))}
      </select>
      
      {hoveredRecipe && (
        <Tooltip
          recipe={hoveredRecipe}
          items={itemsMap}
          show={tooltipVisible}
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        />
      )}
    </div>
  );
}
