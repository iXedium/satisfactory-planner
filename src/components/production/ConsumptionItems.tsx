import React from 'react';
import { Item, ProductionRelationship } from '../../types/types';
import { ItemIcon } from '../ui/ItemIcon';

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
    <div className="consumption-list">
      <div className="consumption-items">
        {withPercentages.map(rel => {
          const consumerItem = itemsMap.get(rel.itemId);
          return (
            <div 
              key={rel.itemId} 
              className="consumption-item"
              onClick={(e) => onConsumerClick(e, rel.itemId)}
              role="button"
              tabIndex={0}
              title={`Jump to ${consumerItem?.name || rel.itemId}`}
              onKeyPress={(e) => e.key === 'Enter' && onConsumerClick(e as any, rel.itemId)}
            >
              <span className="consumer-name">
                <ItemIcon iconId={rel.itemId} size={32} />
                {consumerItem?.name || rel.itemId}
              </span>
              <span className="consumer-amount">{rel.amount.toFixed(2)}/min</span>
              <span className="consumer-percentage">
                <span className="percentage-primary">{rel.percentageNoStorage.toFixed(1)}%</span>
                <span className="percentage-secondary"> / {rel.percentage.toFixed(1)}%</span>
              </span>
            </div>
          );
        })}
        {storageAmount > 0.01 && (
          <div className="consumption-item storage">
            <span className="consumer-name">Storage</span>
            <span className="consumer-amount">{storageAmount.toFixed(2)}/min</span>
            <span className="consumer-percentage">
              ({storagePercentage.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 