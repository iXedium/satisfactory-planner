import React from 'react';
import { Item, ProductionRelationship } from '../../types/types';
import { ItemIcon } from '../ui/ItemIcon';
import { Box, Typography, Paper, styled } from '@mui/material';

const ConsumptionList = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const ConsumptionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ProgressBar = styled(Box)<{ percentage: number }>(({ theme, percentage }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: `${percentage}%`,
  backgroundColor: theme.palette.primary.main,
  opacity: 0.1,
  transition: 'width 0.3s ease',
}));

interface ConsumptionItemsProps {
  relationships?: ProductionRelationship;
  itemsMap: Map<string, Item>;
  onConsumerClick: (e: React.MouseEvent, itemId: string) => void;
  isAccumulated: boolean;
}

export function ConsumptionItems({
  relationships,
  itemsMap,
  onConsumerClick,
  isAccumulated
}: ConsumptionItemsProps) {
  if (!relationships || !isAccumulated) return null;

  // Aggregate relationships by itemId
  const aggregatedRelationships = relationships.producedFor.reduce((acc, rel) => {
    if (!acc[rel.itemId]) {
      acc[rel.itemId] = {
        itemId: rel.itemId,
        amount: 0,
        nodeIds: new Set()
      };
    }
    acc[rel.itemId].amount += rel.amount;
    acc[rel.itemId].nodeIds.add(rel.nodeId);
    return acc;
  }, {} as Record<string, { itemId: string; amount: number; nodeIds: Set<string> }>);

  // Calculate totals and percentages
  const totalConsumed = Object.values(aggregatedRelationships)
    .reduce((sum, rel) => sum + rel.amount, 0);

  const withPercentages = Object.values(aggregatedRelationships).map(rel => ({
    ...rel,
    percentageNoStorage: (rel.amount / totalConsumed) * 100,
    percentage: (rel.amount / relationships.totalProduction) * 100
  }));

  const storageAmount = relationships.totalProduction - totalConsumed;
  const storagePercentage = (storageAmount / relationships.totalProduction) * 100;

  return (
    <ConsumptionList elevation={1}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Consumption
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {withPercentages.map(rel => {
          const item = itemsMap.get(rel.itemId);
          if (!item) return null;

          return (
            <ConsumptionItem
              key={rel.itemId}
              onClick={(e) => onConsumerClick(e, rel.itemId)}
              sx={{ position: 'relative', overflow: 'hidden' }}
            >
              <ProgressBar percentage={rel.percentage} />
              <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <ItemIcon iconId={item.id} size={32} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rel.amount.toFixed(2)}/min ({rel.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {rel.nodeIds.size} consumer{rel.nodeIds.size !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </ConsumptionItem>
          );
        })}

        {storageAmount > 0 && (
          <ConsumptionItem sx={{ position: 'relative', overflow: 'hidden' }}>
            <ProgressBar percentage={storagePercentage} />
            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2">📦</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Storage</Typography>
                <Typography variant="caption" color="text.secondary">
                  {storageAmount.toFixed(2)}/min ({storagePercentage.toFixed(1)}%)
                </Typography>
              </Box>
            </Box>
          </ConsumptionItem>
        )}
      </Box>
    </ConsumptionList>
  );
} 