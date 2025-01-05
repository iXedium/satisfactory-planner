import React, { useState } from 'react';
import { ProductionNodeUI, Item } from '../../types/types';
import { ItemIcon } from '../ui';
import { CustomRecipeDropdown } from '../recipes';
import { MachineAdjustmentControls, ProductionRate } from '.';
import '../../styles/components/_tree-view.scss';

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
    
    // Get the clicked element
    const target = e.target as HTMLElement;
    
    // Check if we clicked on an interactive element
    const isInteractive = target.closest('.c-tree-view__controls, select, input, button');
    
    if (!isInteractive) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div 
      className={`c-tree-view ${detailLevel}`}
      data-item-id={node.itemId}
      data-rate-type={totalRate < 0 ? 'negative' : 'positive'}
    >
      <div 
        className={`c-tree-view__content ${hasChildren ? 'c-tree-view__content--collapsible' : ''}`}
        onClick={handleNodeClick}
      >
        {hasChildren && (
          <span className={`c-tree-view__collapse-icon ${collapsed ? 'c-tree-view__collapse-icon--collapsed' : ''}`}>▼</span>
        )}
        
        <div className="c-tree-view__icon">
          <ItemIcon iconId={node.item.id} size={detailLevel === 'compact' ? 32 : 64} />
        </div>

        <div className="c-tree-view__info">
          <h3 className="c-tree-view__title">{node.item.name}</h3>
          {node.availableRecipes.length > 0 && detailLevel !== 'compact' && totalRate >= 0 && (
            <div className="c-tree-view__controls" onClick={e => e.stopPropagation()}>
              <CustomRecipeDropdown
                recipes={node.availableRecipes}
                value={node.recipeId || ''}
                onChange={(value) => node.nodeId && onRecipeChange(node.nodeId, value)}
                itemsMap={itemsMap}
              />
            </div>
          )}
        </div>

        {currentRecipe && producer && detailLevel !== 'compact' && (
          <div className="c-tree-view__building" onClick={e => e.stopPropagation()}>
            {detailLevel === 'detailed' && (
              <ItemIcon iconId={producer.toLowerCase()} size={32} />
            )}
            <div className="c-tree-view__building-info">
              <span className="c-tree-view__producer-name">{formatBuildingName(producer)}</span>
              <span className="c-tree-view__nominal-rate">({nominalRate.toFixed(2)}/min)</span>
              <MachineAdjustmentControls
                machineCount={actualMachineCount}
                efficiency={efficiency}
                onMachineCountChange={(count) => node.nodeId && onMachineCountChange(node.nodeId, count)}
                producer={producer}
                nominalRate={nominalRate}
                detailLevel={detailLevel}
              />
            </div>
          </div>
        )}

        <ProductionRate
          totalRate={totalRate}
          manualRate={node.manualRate || 0}
          onManualRateChange={(rate) => node.nodeId && onManualRateChange(node.nodeId, rate)}
          onOptimalRateClick={() => {}}
          onClearRate={() => node.nodeId && onManualRateChange(node.nodeId, 0)}
          detailLevel={detailLevel}
        />
      </div>

      {!collapsed && hasChildren && (
        <div className="c-tree-view__children">
          {node.children.map((child) => (
            <div key={child.itemId} className="c-tree-view__child">
              <TreeView
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 