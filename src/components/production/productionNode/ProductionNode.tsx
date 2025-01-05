import React, { useState, useRef } from 'react';
import { Item, ProductionNodeUI } from '../../../types/types';
import { ItemIcon } from '../../ui/ItemIcon';
import { CustomRecipeDropdown } from '../../CustomRecipeDropdown';
import { MachineAdjustmentControls } from '../machineAdjustmentControls/MachineAdjustmentControls';
import { ProductionRate } from '../productionRate/ProductionRate';
import { ConsumptionItems } from '../consumptionItems/ConsumptionItems';
import './ProductionNode.css';

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
    const isInteractive = target.closest('.machine-controls, .consumption-list, select, input, button');
    if (!isInteractive) {
      setCollapsed(!collapsed);
    }
  };

  const handleConsumerClick = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const listView = document.querySelector('.list-view');
    const targetElement = document.querySelector(`.production-node[data-item-id="${itemId}"]`);
    
    if (listView instanceof HTMLElement && targetElement instanceof HTMLElement) {
      const listViewRect = listView.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const relativeTop = targetRect.top - listViewRect.top;
      
      listView.scrollBy({
        top: relativeTop - 100,
        behavior: 'smooth'
      });

      targetElement.classList.add('highlight');
      setTimeout(() => targetElement.classList.remove('highlight'), 2000);
    }
  };

  const calculateOptimalManualRate = () => {
    if (!currentRecipe || !node.nodeId) return;
    const actualCapacity = actualMachineCount * nominalRate;
    const optimalManualRate = actualCapacity - node.rate;
    onManualRateChange(node.nodeId, Math.max(0, optimalManualRate));
  };

  const clearManualRate = () => {
    if (!node.nodeId) return;
    onManualRateChange(node.nodeId, 0);
  };

  return (
    <div 
      className={`production-node ${detailLevel}`}
      data-item-id={node.itemId}
      data-rate-type={totalRate < 0 ? 'negative' : 'positive'}
    >
      <div 
        className={`node-content ${hasChildren ? 'collapsible' : ''}`}
        onClick={handleNodeClick}
      >
        {hasChildren && (
          <span className={`collapse-icon ${collapsed ? 'collapsed' : ''}`}>▼</span>
        )}
        
        <div className="item-icon-container">
          <ItemIcon iconId={node.item.id} size={detailLevel === 'compact' ? 32 : 64} />
        </div>

        <div 
          className="name-recipe-container"
          ref={nameRecipeRef}
        >
          <h3>{node.item.name}</h3>
          {node.availableRecipes.length > 0 && detailLevel !== 'compact' && totalRate >= 0 && (
            <div className="machine-controls" onClick={e => e.stopPropagation()}>
              <CustomRecipeDropdown
                recipes={node.availableRecipes}
                value={node.recipeId || ''}
                onChange={(value) => node.nodeId && onRecipeChange(node.nodeId, value)}
                itemsMap={itemsMap}
              />
            </div>
          )}
        </div>

        <ConsumptionItems
          relationships={node.relationships}
          itemsMap={itemsMap}
          onConsumerClick={handleConsumerClick}
          isAccumulated={isAccumulated}
        />

        {currentRecipe && producer && detailLevel !== 'compact' && (
          <MachineAdjustmentControls
            machineCount={actualMachineCount}
            efficiency={efficiency}
            onMachineCountChange={(count) => node.nodeId && onMachineCountChange(node.nodeId, count)}
            producer={producer}
            nominalRate={nominalRate}
            detailLevel={detailLevel}
          />
        )}

        <ProductionRate
          totalRate={totalRate}
          manualRate={node.manualRate || 0}
          onManualRateChange={(rate) => node.nodeId && onManualRateChange(node.nodeId, rate)}
          onOptimalRateClick={calculateOptimalManualRate}
          onClearRate={clearManualRate}
          detailLevel={detailLevel}
        />
      </div>

      {!collapsed && hasChildren && (
        <div className="node-inputs">
          {node.children.map((child) => (
            <div key={child.itemId} className="input-node">
              <ProductionNode
                node={child as ProductionNodeUI}
                onRecipeChange={onRecipeChange}
                onManualRateChange={onManualRateChange}
                onMachineCountChange={onMachineCountChange}
                machineOverrides={machineOverrides}
                manualRates={manualRates}
                detailLevel={detailLevel}
                itemsMap={itemsMap}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 