import React, { useState, useRef } from 'react';
import { Item, ProductionNodeUI } from '../../types/types';
import { ItemIcon } from '../ui/ItemIcon';
import { CustomRecipeDropdown } from '../recipes';
import { MachineAdjustmentControls } from './MachineAdjustmentControls';
import { ProductionRate } from './ProductionRate';
import { ConsumptionItems } from './ConsumptionItems';
import { Box, Paper, Typography, IconButton, styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const ProductionNodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&[data-rate-type="negative"]': {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  },
  '&[data-rate-type="positive"]': {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }
}));

const NodeContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const ChildrenContainer = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginTop: theme.spacing(2),
  '& > *': {
    marginBottom: theme.spacing(1),
  }
}));

interface ProductionNodeProps {
  node: ProductionNodeUI;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  onManualRateChange: (nodeId: string, rate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel?: 'compact' | 'normal' | 'detailed';
  isAccumulated?: boolean;
  itemsMap: Map<string, Item>;
  sourceCount?: number;
}

export function ProductionNode({ 
  node,
  onRecipeChange,
  onManualRateChange,
  onMachineCountChange,
  machineOverrides,
  manualRates,
  detailLevel = 'normal',
  isAccumulated = false,
  itemsMap
}: ProductionNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const nameRecipeRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children.length > 0;
  const totalRate = node.rate + (node.manualRate || 0);

  // Calculate machine-related values
  const currentRecipe = node.recipeId ? node.availableRecipes.find(r => r.id === node.recipeId) : null;
  const nominalRate = currentRecipe ? (currentRecipe.out[node.itemId] * 60) / currentRecipe.time : 0;
  const producer = currentRecipe ? currentRecipe.producers[0] : null;
  const defaultMachineCount = currentRecipe ? Math.ceil(totalRate / nominalRate) : 0;
  const actualMachineCount = node.nodeId ? machineOverrides.get(node.nodeId) || defaultMachineCount : defaultMachineCount;
  const actualCapacity = actualMachineCount * nominalRate;
  const efficiency = currentRecipe ? ((totalRate / actualCapacity) * 100).toFixed(2) : '0';

  const handleNodeClick = (e: React.MouseEvent) => {
    if (!hasChildren) return;
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('.MuiSelect-root, .MuiTextField-root, .MuiButtonBase-root, .consumption-list');
    if (!isInteractive) {
      setCollapsed(!collapsed);
    }
  };

  const handleConsumerClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const calculateOptimalManualRate = () => {
    if (currentRecipe && node.nodeId) {
      const optimalRate = actualCapacity;
      onManualRateChange(node.nodeId, optimalRate - node.rate);
    }
  };

  const clearManualRate = () => {
    if (node.nodeId) {
      onManualRateChange(node.nodeId, 0);
    }
  };

  return (
    <ProductionNodeContainer
      elevation={1}
      data-item-id={node.itemId}
      data-rate-type={totalRate < 0 ? 'negative' : 'positive'}
    >
      <NodeContent onClick={handleNodeClick}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => setCollapsed(!collapsed)}
              sx={{ color: 'text.secondary' }}
            >
              {collapsed ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
          <ItemIcon iconId={node.item.id} size={detailLevel === 'compact' ? 32 : 64} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box ref={nameRecipeRef}>
            <Typography variant="h6" color="text.primary">
              {node.item.name}
            </Typography>
            {node.availableRecipes.length > 0 && detailLevel !== 'compact' && totalRate >= 0 && (
              <Box sx={{ mt: 1 }}>
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
            <Box sx={{ mt: 2 }}>
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
        </Box>

        <Box>
          <ProductionRate
            totalRate={totalRate}
            manualRate={node.manualRate || 0}
            onManualRateChange={(rate) => node.nodeId && onManualRateChange(node.nodeId, rate)}
            onOptimalRateClick={calculateOptimalManualRate}
            onClearRate={clearManualRate}
            detailLevel={detailLevel}
          />
        </Box>
      </NodeContent>

      {!collapsed && (
        <>
          {node.relationships && (
            <Box sx={{ mt: 2 }}>
              <ConsumptionItems
                relationships={node.relationships}
                itemsMap={itemsMap}
                onConsumerClick={handleConsumerClick}
                isAccumulated={isAccumulated}
              />
            </Box>
          )}

          {hasChildren && (
            <ChildrenContainer>
              {node.children.map((child) => (
                <ProductionNode
                  key={child.itemId}
                  node={child as ProductionNodeUI}
                  onRecipeChange={onRecipeChange}
                  onManualRateChange={onManualRateChange}
                  onMachineCountChange={onMachineCountChange}
                  machineOverrides={machineOverrides}
                  manualRates={manualRates}
                  detailLevel={detailLevel}
                  isAccumulated={isAccumulated}
                  itemsMap={itemsMap}
                />
              ))}
            </ChildrenContainer>
          )}
        </>
      )}
    </ProductionNodeContainer>
  );
} 