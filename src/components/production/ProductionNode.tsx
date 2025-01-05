import React, { memo, useCallback } from 'react';
import { Item, ProductionNodeUI } from '../../types/types';
import { ItemIcon } from '../ui';
import { CustomRecipeDropdown } from '../recipes';
import { MachineAdjustmentControls } from './MachineAdjustmentControls';
import { ProductionRate } from './ProductionRate';
import { ConsumptionItems } from './ConsumptionItems';
import { Box, Paper, Typography, IconButton, styled, Grid } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const StyledNodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  '&[data-rate-type="negative"]': {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  },
  '&[data-rate-type="positive"]': {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  },
  '&:hover': {
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.shadows[2],
  },
}));

const NodeContent = styled(Grid)(({ theme }) => ({
  cursor: 'pointer',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    '& > .MuiGrid-item': {
      width: '100%',
      marginBottom: theme.spacing(1),
    },
  },
}));

const ChildrenContainer = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginTop: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  borderLeft: `2px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginLeft: theme.spacing(2),
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 'fit-content',
}));

const InfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0, // Prevents flex item from overflowing
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'space-between',
  },
}));

interface ProductionNodeProps {
  node: ProductionNodeUI;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  onManualRateChange: (nodeId: string, manualRate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel?: 'compact' | 'normal' | 'detailed';
  isAccumulated?: boolean;
  itemsMap: Map<string, Item>;
  sourceCount?: number;
}

export const ProductionNode = memo(function ProductionNode({
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
}: ProductionNodeProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const hasChildren = node.children.length > 0;
  const totalRate = node.rate + (node.manualRate || 0);

  // Memoize calculations
  const {
    currentRecipe,
    nominalRate,
    producer,
    actualMachineCount,
    actualCapacity,
    efficiency
  } = React.useMemo(() => {
    const recipe = node.recipeId ? node.availableRecipes.find(r => r.id === node.recipeId) : null;
    const nRate = recipe ? (recipe.out[node.itemId] * 60) / recipe.time : 0;
    const prod = recipe ? recipe.producers[0] : null;
    const defaultCount = recipe ? Math.ceil(totalRate / nRate) : 0;
    const actualCount = node.nodeId ? machineOverrides.get(node.nodeId) || defaultCount : defaultCount;
    const capacity = actualCount * nRate;
    const eff = recipe ? ((totalRate / capacity) * 100).toFixed(2) : '0';

    return {
      currentRecipe: recipe,
      nominalRate: nRate,
      producer: prod,
      actualMachineCount: actualCount,
      actualCapacity: capacity,
      efficiency: eff
    };
  }, [node, totalRate, machineOverrides]);

  const handleNodeClick = useCallback((e: React.MouseEvent) => {
    if (!hasChildren) return;
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('.MuiSelect-root, .MuiTextField-root, .MuiButtonBase-root, .consumption-list');
    if (!isInteractive) {
      setCollapsed(!collapsed);
    }
  }, [hasChildren, collapsed]);

  const handleRecipeChange = useCallback((value: string) => {
    if (node.nodeId) onRecipeChange(node.nodeId, value);
  }, [node.nodeId, onRecipeChange]);

  const handleManualRateChange = useCallback((rate: number) => {
    if (node.nodeId) onManualRateChange(node.nodeId, rate);
  }, [node.nodeId, onManualRateChange]);

  const handleMachineCountChange = useCallback((count: number) => {
    if (node.nodeId) onMachineCountChange(node.nodeId, count);
  }, [node.nodeId, onMachineCountChange]);

  return (
    <StyledNodeContainer
      elevation={1}
      data-item-id={node.itemId}
      data-rate-type={totalRate < 0 ? 'negative' : 'positive'}
    >
      <NodeContent container onClick={handleNodeClick}>
        <IconContainer>
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
        </IconContainer>

        <InfoContainer>
          <Typography 
            variant={detailLevel === 'compact' ? 'subtitle1' : 'h6'} 
            color="text.primary"
            noWrap
          >
            {node.item.name}
          </Typography>
          {node.availableRecipes.length > 0 && detailLevel !== 'compact' && totalRate >= 0 && (
            <Box onClick={e => e.stopPropagation()}>
              <CustomRecipeDropdown
                recipes={node.availableRecipes}
                value={node.recipeId || ''}
                onChange={handleRecipeChange}
                itemsMap={itemsMap}
              />
            </Box>
          )}
        </InfoContainer>

        <ControlsContainer onClick={e => e.stopPropagation()}>
          {currentRecipe && producer && detailLevel !== 'compact' && (
            <MachineAdjustmentControls
              machineCount={actualMachineCount}
              efficiency={efficiency}
              onMachineCountChange={handleMachineCountChange}
              producer={producer}
              nominalRate={nominalRate}
              detailLevel={detailLevel}
            />
          )}

          <ProductionRate
            totalRate={totalRate}
            manualRate={node.manualRate || 0}
            onManualRateChange={handleManualRateChange}
            onOptimalRateClick={() => handleManualRateChange(actualCapacity - node.rate)}
            onClearRate={() => handleManualRateChange(0)}
            detailLevel={detailLevel}
          />
        </ControlsContainer>
      </NodeContent>

      {!collapsed && (
        <>
          {node.relationships && (
            <Box sx={{ 
              mt: 2, 
              px: 2,
              borderTop: theme => `1px solid ${theme.palette.divider}`,
              pt: 2
            }}>
              <ConsumptionItems
                relationships={node.relationships}
                itemsMap={itemsMap}
                onConsumerClick={(e: React.MouseEvent, itemId: string) => {
                  e.stopPropagation();
                  const element = document.querySelector(`[data-item-id="${itemId}"]`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
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
    </StyledNodeContainer>
  );
}); 