import React, { useState } from 'react';
import { ProductionNodeUI, Item } from '../../types/types';
import { ItemIcon } from '../ui';
import { CustomRecipeDropdown } from '../recipes';
import { MachineAdjustmentControls, ProductionRate } from '.';
import { IconButton, Paper, Box, Typography, Grid, styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const StyledTreeView = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '&[data-rate-type="negative"]': {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  },
  '&[data-rate-type="positive"]': {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }
}));

const TreeViewContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const TreeViewChildren = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginTop: theme.spacing(1),
  '& > *': {
    marginBottom: theme.spacing(1),
  }
}));

interface TreeViewProps {
  node: ProductionNodeUI;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  onManualRateChange: (nodeId: string, manualRate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel?: 'compact' | 'normal' | 'detailed';
  isAccumulated?: boolean;
  itemsMap: Map<string, Item>;
  sourceCount: number;
}

export function TreeView({
  node,
  onRecipeChange,
  onManualRateChange,
  onMachineCountChange,
  machineOverrides,
  manualRates,
  detailLevel = 'normal',
  isAccumulated = false,
  itemsMap,
  sourceCount
}: TreeViewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children.length > 0;
  const totalRate = node.rate + (node.manualRate || 0);

  // Calculate nominal rate and get producer info
  const currentRecipe = node.recipeId ? node.availableRecipes.find(r => r.id === node.recipeId) : null;
  const nominalRate = currentRecipe ? (currentRecipe.out[node.itemId] * 60) / currentRecipe.time : 0;
  const producer = currentRecipe ? currentRecipe.producers[0] : null;

  // Calculate machine count and efficiency
  const defaultMachineCount = currentRecipe ? Math.ceil(totalRate / nominalRate) : 0;
  const actualMachineCount = node.nodeId ? machineOverrides.get(node.nodeId) || defaultMachineCount : defaultMachineCount;
  const actualCapacity = actualMachineCount * nominalRate;
  const efficiency = currentRecipe ? ((totalRate / actualCapacity) * 100).toFixed(2) : '0';

  const formatBuildingName = (name: string): string => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    if (!hasChildren) return;
    
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('.c-tree-view__controls, select, input, button, .MuiIconButton-root');
    
    if (!isInteractive) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <StyledTreeView
      elevation={1}
      data-item-id={node.itemId}
      data-rate-type={totalRate < 0 ? 'negative' : 'positive'}
    >
      <TreeViewContent onClick={handleNodeClick}>
        {hasChildren && (
          <IconButton 
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ color: 'text.secondary' }}
          >
            {collapsed ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Box>
            <ItemIcon iconId={node.item.id} size={detailLevel === 'compact' ? 32 : 64} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color="text.primary">
              {node.item.name}
            </Typography>
            {node.availableRecipes.length > 0 && detailLevel !== 'compact' && totalRate >= 0 && (
              <Box onClick={e => e.stopPropagation()} sx={{ mt: 1 }}>
                <CustomRecipeDropdown
                  recipes={node.availableRecipes}
                  value={node.recipeId || ''}
                  onChange={(value) => node.nodeId && onRecipeChange(node.nodeId, value)}
                  itemsMap={itemsMap}
                />
              </Box>
            )}
          </Box>

          {currentRecipe && producer && detailLevel !== 'compact' && (
            <Box onClick={e => e.stopPropagation()}>
              <MachineAdjustmentControls
                machineCount={actualMachineCount}
                efficiency={efficiency}
                onMachineCountChange={(count) => node.nodeId && onMachineCountChange(node.nodeId, count)}
                producer={producer}
                nominalRate={nominalRate}
                detailLevel={detailLevel}
              />
            </Box>
          )}

          <Box onClick={e => e.stopPropagation()}>
            <ProductionRate
              totalRate={totalRate}
              manualRate={node.manualRate || 0}
              onManualRateChange={(rate) => node.nodeId && onManualRateChange(node.nodeId, rate)}
              onOptimalRateClick={() => {}}
              onClearRate={() => node.nodeId && onManualRateChange(node.nodeId, 0)}
              detailLevel={detailLevel}
            />
          </Box>
        </Box>
      </TreeViewContent>

      {!collapsed && hasChildren && (
        <TreeViewChildren>
          {node.children.map((child) => (
            <TreeView
              key={child.itemId}
              node={child as ProductionNodeUI}
              onRecipeChange={onRecipeChange}
              onManualRateChange={onManualRateChange}
              onMachineCountChange={onMachineCountChange}
              machineOverrides={machineOverrides}
              manualRates={manualRates}
              detailLevel={detailLevel}
              itemsMap={itemsMap}
              sourceCount={sourceCount}
            />
          ))}
        </TreeViewChildren>
      )}
    </StyledTreeView>
  );
} 