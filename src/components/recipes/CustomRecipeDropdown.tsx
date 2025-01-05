import React, { useState, ReactNode } from 'react';
import { Recipe, Item } from '../../types/types';
import { Select, MenuItem, Box, Typography, Tooltip, SelectChangeEvent, styled, Paper } from '@mui/material';
import { ItemIcon } from '../ui';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minHeight: '48px',
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const RecipeMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

const TooltipContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  maxWidth: 300,
}));

interface CustomRecipeDropdownProps {
  recipes: Recipe[];
  value: string;
  onChange: (value: string) => void;
  itemsMap: Map<string, Item>;
}

export function CustomRecipeDropdown({ recipes, value, onChange, itemsMap }: CustomRecipeDropdownProps) {
  const [hoveredRecipe, setHoveredRecipe] = useState<Recipe | null>(null);

  const handleChange = (event: SelectChangeEvent<unknown>, child: ReactNode) => {
    onChange(event.target.value as string);
  };

  const getRecipeLabel = (recipe: Recipe): ReactNode => {
    const mainOutputId = Object.keys(recipe.out)[0];
    const mainOutput = itemsMap.get(mainOutputId);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
      </Box>
    );
  };

  const renderRecipeOption = (recipe: Recipe) => (
    <RecipeMenuItem
      key={recipe.id}
      value={recipe.id}
      onMouseEnter={() => setHoveredRecipe(recipe)}
      onMouseLeave={() => setHoveredRecipe(null)}
    >
      {getRecipeLabel(recipe)}
    </RecipeMenuItem>
  );

  const renderTooltipContent = (recipe: Recipe) => (
    <TooltipContent>
      <Typography variant="subtitle2" gutterBottom>
        Inputs:
      </Typography>
      {Object.entries(recipe.in).map(([itemId, amount]) => {
        const item = itemsMap.get(itemId);
        return (
          <Box key={itemId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {item && <ItemIcon iconId={item.id} size={16} />}
            <Typography variant="body2">
              {item ? item.name : itemId}: {amount}/min
            </Typography>
          </Box>
        );
      })}

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Outputs:
      </Typography>
      {Object.entries(recipe.out).map(([itemId, amount]) => {
        const item = itemsMap.get(itemId);
        return (
          <Box key={itemId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {item && <ItemIcon iconId={item.id} size={16} />}
            <Typography variant="body2">
              {item ? item.name : itemId}: {amount}/min
            </Typography>
          </Box>
        );
      })}
    </TooltipContent>
  );

  return (
    <Box>
      <StyledSelect
        value={value}
        onChange={handleChange}
        displayEmpty
        IconComponent={KeyboardArrowDownIcon}
        renderValue={(selected: unknown): ReactNode => {
          if (!selected) {
            return (
              <Typography color="text.secondary">
                Select a recipe...
              </Typography>
            );
          }
          const recipe = recipes.find(r => r.id === selected);
          return recipe ? getRecipeLabel(recipe) : String(selected);
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: 'background.paper',
              backgroundImage: 'none',
              maxHeight: 400,
            },
          },
        }}
      >
        {recipes.map(renderRecipeOption)}
      </StyledSelect>

      {hoveredRecipe && (
        <Tooltip
          open={true}
          title={renderTooltipContent(hoveredRecipe)}
          placement="right-start"
          arrow
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: 'transparent',
                padding: 0,
              },
              '& .MuiTooltip-arrow': {
                color: 'background.paper',
              },
            },
          }}
        >
          <span style={{ display: 'none' }} />
        </Tooltip>
      )}
    </Box>
  );
} 