import React, { memo, useCallback, useMemo } from 'react';
import { Item, ProductionNodeUI, Recipe } from '../../types/types';
import { ItemIcon } from '../ui';
import { CustomRecipeDropdown } from '../recipes';
import { MachineAdjustmentControls } from './MachineAdjustmentControls';
import { ProductionRate } from './ProductionRate';
import { ConsumptionItems } from './ConsumptionItems';
import { Box, Paper, Typography, IconButton, styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Move styled components outside component to prevent recreation
const StyledNodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
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

const NodeContent = styled('div')(({ theme }) => ({
  cursor: 'pointer',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s ease-in-out',
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    '& > *': {
      width: '100%',
      marginBottom: theme.spacing(1),
    },
  },
}));

const ChildrenContainer = styled('div')(({ theme }) => ({
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

const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 'fit-content',
}));

const InfoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
}));

const ControlsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'space-between',
  },
}));

// Memoize child components
const MemoizedConsumptionItems = memo(ConsumptionItems);
const MemoizedMachineAdjustmentControls = memo(MachineAdjustmentControls);
const MemoizedProductionRate = memo(ProductionRate);
const MemoizedCustomRecipeDropdown = memo(CustomRecipeDropdown);

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

// Add prop types interface for better memoization
interface MemoizedProductionNodeProps {
  nodeId: string;
  itemId: string;
  item: Item;
  recipeId: string | null;
  availableRecipes: Recipe[];
  rate: number;
  manualRate: number | null;
  children: ProductionNodeUI[];
  relationships?: any;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  onManualRateChange: (nodeId: string, manualRate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel: 'compact' | 'normal' | 'detailed';
  isAccumulated: boolean;
  itemsMap: Map<string, Item>;
  sourceCount?: number;
}

// Create a memoized wrapper component
const MemoizedProductionNode = memo(function MemoizedProductionNode({
  nodeId,
  itemId,
  item,
  recipeId,
  availableRecipes,
  rate,
  manualRate,
  children,
  relationships,
  onRecipeChange,
  onManualRateChange,
  onMachineCountChange,
  machineOverrides,
  manualRates,
  detailLevel,
  isAccumulated,
  itemsMap,
  sourceCount,
  ...props
}: MemoizedProductionNodeProps) {
  // Move state outside main render to prevent recreation
  const [collapsed, setCollapsed] = React.useState(false);
  
  // Memoize derived values that don't need frequent updates
  const hasChildren = useMemo(() => children.length > 0, [children.length]);
  const totalRate = useMemo(() => rate + (manualRate || 0), [rate, manualRate]);

  // Memoize recipe calculations to prevent recalculation on every render
  const recipeDetails = useMemo(() => {
    const recipe = recipeId ? availableRecipes.find(r => r.id === recipeId) : null;
    if (!recipe) {
      return {
        currentRecipe: null,
        nominalRate: 0,
        producer: null,
        actualMachineCount: 0,
        actualCapacity: 0,
        efficiency: '0'
      };
    }

    const nRate = (recipe.out[itemId] * 60) / recipe.time;
    const prod = recipe.producers[0];
    const defaultCount = Math.ceil(totalRate / nRate);
    const actualCount = nodeId ? machineOverrides.get(nodeId) || defaultCount : defaultCount;
    const capacity = actualCount * nRate;
    const eff = ((totalRate / capacity) * 100).toFixed(2);

    return {
      currentRecipe: recipe,
      nominalRate: nRate,
      producer: prod,
      actualMachineCount: actualCount,
      actualCapacity: capacity,
      efficiency: eff
    };
  }, [recipeId, availableRecipes, itemId, totalRate, nodeId, machineOverrides]);

  // Memoize handlers to prevent recreation
  const handleNodeClick = useCallback((e: React.MouseEvent) => {
    if (!hasChildren) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.MuiSelect-root, .MuiTextField-root, .MuiButtonBase-root, .consumption-list')) {
      setCollapsed(!collapsed);
    }
  }, [hasChildren, collapsed]);

  const handleRecipeChange = useCallback((value: string) => {
    if (nodeId) onRecipeChange(nodeId, value);
  }, [nodeId, onRecipeChange]);

  const handleManualRateChange = useCallback((rate: number) => {
    if (nodeId) onManualRateChange(nodeId, rate);
  }, [nodeId, onManualRateChange]);

  const handleMachineCountChange = useCallback((count: number) => {
    if (nodeId) onMachineCountChange(nodeId, count);
  }, [nodeId, onMachineCountChange]);

  const handleOptimalRateClick = useCallback(() => {
    handleManualRateChange(recipeDetails.actualCapacity - rate);
  }, [recipeDetails.actualCapacity, rate, handleManualRateChange]);

  const handleClearRate = useCallback(() => {
    handleManualRateChange(0);
  }, [handleManualRateChange]);

  const handleConsumerClick = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <StyledNodeContainer
      elevation={1}
      data-item-id={itemId}
      data-rate-type={totalRate < 0 ? 'negative' : 'positive'}
    >
      <NodeContent onClick={handleNodeClick}>
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
          <ItemIcon iconId={item.id} size={detailLevel === 'compact' ? 32 : 64} />
        </IconContainer>

        <InfoContainer>
          <Typography 
            variant={detailLevel === 'compact' ? 'subtitle1' : 'h6'} 
            color="text.primary"
            noWrap
          >
            {item.name}
          </Typography>
          {availableRecipes.length > 0 && detailLevel !== 'compact' && totalRate >= 0 && (
            <Box onClick={e => e.stopPropagation()}>
              <MemoizedCustomRecipeDropdown
                recipes={availableRecipes}
                value={recipeId || ''}
                onChange={handleRecipeChange}
                itemsMap={itemsMap}
              />
            </Box>
          )}
        </InfoContainer>

        <ControlsContainer onClick={e => e.stopPropagation()}>
          {recipeDetails.currentRecipe && recipeDetails.producer && detailLevel !== 'compact' && (
            <MemoizedMachineAdjustmentControls
              machineCount={recipeDetails.actualMachineCount}
              efficiency={recipeDetails.efficiency}
              onMachineCountChange={handleMachineCountChange}
              producer={recipeDetails.producer}
              nominalRate={recipeDetails.nominalRate}
              detailLevel={detailLevel}
            />
          )}

          <MemoizedProductionRate
            totalRate={totalRate}
            manualRate={manualRate || 0}
            onManualRateChange={handleManualRateChange}
            onOptimalRateClick={handleOptimalRateClick}
            onClearRate={handleClearRate}
            detailLevel={detailLevel}
          />
        </ControlsContainer>
      </NodeContent>

      {!collapsed && (
        <>
          {relationships && (
            <Box sx={{ 
              mt: 2, 
              px: 2,
              borderTop: theme => `1px solid ${theme.palette.divider}`,
              pt: 2
            }}>
              <MemoizedConsumptionItems
                relationships={relationships}
                itemsMap={itemsMap}
                onConsumerClick={handleConsumerClick}
                isAccumulated={isAccumulated}
              />
            </Box>
          )}

          {hasChildren && (
            <ChildrenContainer>
              {children.map((child) => (
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

// Main component now just destructures the node prop and passes individual values
export const ProductionNode = memo(function ProductionNode({
  node,
  detailLevel = 'normal',
  isAccumulated = false,
  ...props
}: ProductionNodeProps) {
  return (
    <MemoizedProductionNode
      {...props}
      nodeId={node.nodeId || ''}
      itemId={node.itemId}
      item={node.item}
      recipeId={node.recipeId}
      availableRecipes={node.availableRecipes}
      rate={node.rate}
      manualRate={node.manualRate || null}
      children={node.children as ProductionNodeUI[]}
      relationships={node.relationships}
      detailLevel={detailLevel}
      isAccumulated={isAccumulated}
    />
  );
}); 