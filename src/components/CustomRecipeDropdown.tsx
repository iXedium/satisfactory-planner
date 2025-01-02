import React, { useState, useRef, useEffect } from 'react';
import { Recipe, Item } from '../types/types';
import { Tooltip } from './Tooltip';
import { Portal } from './Portal';

interface CustomRecipeDropdownProps {
  recipes: Recipe[];
  value: string;
  onChange: (value: string) => void;
  itemsMap: Map<string, Item>;
}

export function CustomRecipeDropdown({ recipes, value, onChange, itemsMap }: CustomRecipeDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredRecipe, setHoveredRecipe] = useState<Recipe | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<number | undefined>(undefined);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        window.clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredRecipe(null); // Clear any hover state
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRecipeHover = (recipe: Recipe, event: React.MouseEvent<HTMLDivElement>) => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      window.clearTimeout(tooltipTimeoutRef.current);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 10,
      y: Math.min(rect.top, window.innerHeight - 400) // Prevent tooltip from going too low
    });
    setHoveredRecipe(recipe);
  };

  const handleRecipeLeave = () => {
    // Add a small delay before hiding the tooltip
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setHoveredRecipe(null);
    }, 100);
  };

  const handleSelectedClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!isOpen) {
      const selectedRecipe = recipes.find(r => r.id === value);
      if (selectedRecipe) {
        setTooltipPosition({
          x: rect.right + 10,
          y: Math.min(rect.top, window.innerHeight - 400)
        });
        setHoveredRecipe(selectedRecipe);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (recipeId: string) => {
    onChange(recipeId);
    setIsOpen(false);
    setHoveredRecipe(null); // Clear hover state when selecting
  };

  const selectedRecipe = recipes.find(r => r.id === value);

  return (
    <div className="custom-recipe-dropdown" ref={dropdownRef}>
      <div 
        className="dropdown-selected"
        onClick={handleSelectedClick}
        onMouseEnter={(e) => !isOpen && handleRecipeHover(selectedRecipe!, e)}
        onMouseLeave={() => !isOpen && handleRecipeLeave()}
      >
        {selectedRecipe?.name || 'Select recipe...'}
        <span className="dropdown-arrow">▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-options">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className={`dropdown-option ${recipe.id === value ? 'selected' : ''}`}
              onClick={() => handleOptionClick(recipe.id)}
              onMouseEnter={(e) => handleRecipeHover(recipe, e)}
              onMouseLeave={handleRecipeLeave}
            >
              {recipe.name}
            </div>
          ))}
        </div>
      )}

      {hoveredRecipe && (
        <Portal>
          <Tooltip
            recipe={hoveredRecipe}
            items={itemsMap}
            show={true}
            style={{
              position: 'fixed',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              zIndex: 9999, // Use a very high z-index since it's at root level
            }}
          />
        </Portal>
      )}
    </div>
  );
}
