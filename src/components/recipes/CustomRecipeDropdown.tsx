import React, { useState } from 'react';
import { Recipe, Item } from '../../types/types';
import { Select, MenuItem, Box, Typography, Tooltip, SelectChangeEvent, styled } from '@mui/material';
import { ItemIcon } from '../ui';

const RecipeMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

interface CustomRecipeDropdownProps {
  recipes: Recipe[];
  value: string;
  onChange: (value: string) => void;
  itemsMap: Map<string, Item>;
}

export function CustomRecipeDropdown({ recipes, value, onChange, itemsMap }: CustomRecipeDropdownProps) {
  const [hoveredRecipe, setHoveredRecipe] = useState<Recipe | null>(null);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const getRecipeLabel = (recipe: Recipe): string => {
    const outputs = Object.entries(recipe.out)
      .map(([itemId, amount]) => {
        const item = itemsMap.get(itemId);
        return item ? `${item.name} (${amount}/min)` : itemId;
      })
      .join(', ');
    return `${recipe.name} → ${outputs}`;
  };

  const renderRecipeOption = (recipe: Recipe) => {
    const mainOutputId = Object.keys(recipe.out)[0];
    const mainOutput = itemsMap.get(mainOutputId);

    return (
      <RecipeMenuItem
        key={recipe.id}
        value={recipe.id}
        onMouseEnter={() => setHoveredRecipe(recipe)}
        onMouseLeave={() => setHoveredRecipe(null)}
      >
        {mainOutput && <ItemIcon iconId={mainOutput.id} size={32} />}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2">{recipe.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {Object.entries(recipe.out)
              .map(([itemId, amount]) => {
                const item = itemsMap.get(itemId);
                return item ? `${item.name} (${amount}/min)` : itemId;
              })
              .join(', ')}
          </Typography>
        </Box>
      </RecipeMenuItem>
    );
  };

  return (
    <Box>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <Typography color="text.secondary">Select a recipe...</Typography>;
          }
          const recipe = recipes.find(r => r.id === selected);
          return recipe ? getRecipeLabel(recipe) : selected;
        }}
        sx={{ minWidth: 250 }}
      >
        {recipes.map(renderRecipeOption)}
      </Select>

      {hoveredRecipe && (
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2">Inputs:</Typography>
              {Object.entries(hoveredRecipe.in).map(([itemId, amount]) => {
                const item = itemsMap.get(itemId);
                return (
                  <Box key={itemId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {item && <ItemIcon iconId={item.id} size={16} />}
                    <Typography variant="body2">
                      {item ? item.name : itemId}: {amount}/min
                    </Typography>
                  </Box>
                );
              })}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Outputs:</Typography>
              {Object.entries(hoveredRecipe.out).map(([itemId, amount]) => {
                const item = itemsMap.get(itemId);
                return (
                  <Box key={itemId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {item && <ItemIcon iconId={item.id} size={16} />}
                    <Typography variant="body2">
                      {item ? item.name : itemId}: {amount}/min
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          }
          placement="right"
          arrow
        >
          <span style={{ display: 'none' }} />
        </Tooltip>
      )}
    </Box>
  );
} 