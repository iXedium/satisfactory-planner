import { useState, useRef, useEffect } from 'react';
import { ProductionNodeUI, Recipe, Item } from '../types/types';  // Add Item import
import { ItemIcon } from './ItemIcon';
import { Tooltip } from './Tooltip';
import { RecipeSelect } from './RecipeSelect';
import { CustomRecipeDropdown } from './CustomRecipeDropdown';
import './ProductionNode.css'; // Keep for now
import '../styles/components/_production-node.scss';

interface ProductionNodeProps {
  node: ProductionNodeUI;
  onRecipeChange: (nodeId: string, recipeId: string) => void; // Change itemId to nodeId
  onManualRateChange: (nodeId: string, manualRate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel?: 'compact' | 'normal' | 'detailed';
  isAccumulated?: boolean;
  sourceCount?: number;
  itemsMap: Map<string, Item>; // Add this new prop
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
  itemsMap // Add this new prop
}: ProductionNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showConsumption, setShowConsumption] = useState(false);
  const nameRecipeRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children.length > 0;
  const totalRate = node.rate + (node.manualRate || 0);

  // Calculate nominal rate and get producer info
  const currentRecipe = node.recipeId ? node.availableRecipes.find(r => r.id === node.recipeId) : null;
  const nominalRate = currentRecipe ? (currentRecipe.out[node.itemId] * 60) / currentRecipe.time : 0;
  const producer = currentRecipe ? currentRecipe.producers[0] : null;

  // Calculate machine count and efficiency using nodeId instead of itemId
  const defaultMachineCount = currentRecipe ? Math.ceil(totalRate / nominalRate) : 0;
  const actualMachineCount = node.nodeId ? machineOverrides.get(node.nodeId) || defaultMachineCount : defaultMachineCount;
  const actualCapacity = actualMachineCount * nominalRate;
  const efficiency = currentRecipe ? ((totalRate / actualCapacity) * 100).toFixed(2) : '0';

  const getEfficiencyClass = (efficiency: number): string => {
    if (efficiency === 100) return 'efficiency-optimal';
    if (efficiency < 100) return 'efficiency-under';
    return 'efficiency-over';
  };

  const formatBuildingName = (name: string): string => {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    if (!hasChildren) return;
    
    // Get the clicked element
    const target = e.target as HTMLElement;
    
    // Check if we clicked on an interactive element or consumption list
    const isInteractive = target.closest('.machine-controls, .consumption-list, select, input, button');
    
    if (!isInteractive) {
      setCollapsed(!collapsed);
    }
  };

  const handleConsumptionToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node collapse when clicking consumption
    setShowConsumption(!showConsumption);
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

  const handleConsumerClick = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the list view container first
    const listView = document.querySelector('.list-view');
    const targetElement = document.querySelector(`.production-node[data-item-id="${itemId}"]`);
    
    if (listView instanceof HTMLElement && targetElement instanceof HTMLElement) {
      // Get the relative position of the target element
      const listViewRect = listView.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const relativeTop = targetRect.top - listViewRect.top;
      
      // Scroll to the element with offset
      listView.scrollBy({
        top: relativeTop - 100, // 100px padding from top
        behavior: 'smooth'
      });

      // Add highlight effect
      targetElement.classList.add('highlight');
      setTimeout(() => targetElement.classList.remove('highlight'), 2000);
    }
  };

  const renderRelationships = () => {
    if (!node.relationships || !isAccumulated) return null;

    const relationships = node.relationships;
    const totalConsumed = relationships.producedFor.reduce((sum, rel) => sum + rel.amount, 0);
    const storageAmount = relationships.totalProduction - totalConsumed;
    const storagePercentage = (storageAmount / relationships.totalProduction) * 100;

    return (
      <div className="c-production-node__consumption">
        {relationships.producedFor.map(rel => {
          const consumerItem = itemsMap.get(rel.itemId);
          const percentage = (rel.amount / totalConsumed) * 100;
          const totalPercentage = (rel.amount / relationships.totalProduction) * 100;

          return (
            <div 
              key={rel.itemId} 
              className="c-production-node__consumption-item"
              onClick={(e) => handleConsumerClick(e, rel.itemId)}
              role="button"
              tabIndex={0}
              title={`Jump to ${consumerItem?.name || rel.itemId}`}
            >
              <span className="c-production-node__consumer-name">
                <ItemIcon iconId={rel.itemId} size={32} />
                {consumerItem?.name || rel.itemId}
              </span>
              <span className="c-production-node__consumer-amount">
                {rel.amount.toFixed(2)}/min
              </span>
              <span className="c-production-node__consumer-percentage">
                <span className="c-production-node__percentage-primary">
                  {percentage.toFixed(1)}%
                </span>
                <span className="c-production-node__percentage-secondary">
                  / {totalPercentage.toFixed(1)}%
                </span>
              </span>
            </div>
          );
        })}
        {storageAmount > 0.01 && (
          <div className="c-production-node__consumption-item c-production-node__consumption-item--storage">
            <span className="c-production-node__consumer-name">Storage</span>
            <span className="c-production-node__consumer-amount">
              {storageAmount.toFixed(2)}/min
            </span>
            <span className="c-production-node__consumer-percentage">
              ({storagePercentage.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`c-production-node c-production-node--${detailLevel} ${hasChildren ? 'has-children' : ''}`}
      data-item-id={node.itemId}
      data-rate-type={totalRate < 0 ? 'negative' : 'positive'}
    >
      <div 
        className={`c-production-node__content ${hasChildren ? 'collapsible' : ''}`}
        onClick={handleNodeClick}
      >
        {hasChildren && (
          <span className={`c-production-node__collapse-icon ${collapsed ? 'collapsed' : ''}`}>▼</span>
        )}
        
        <div className="c-production-node__icon-container">
          <ItemIcon iconId={node.item.id} size={detailLevel === 'compact' ? 32 : 64} />
        </div>

        <div className="c-production-node__info">
          <h3 className="c-production-node__title">{node.item.name}</h3>
          {node.availableRecipes.length > 0 && detailLevel !== 'compact' && totalRate >= 0 && (
            <div className="c-production-node__controls" onClick={e => e.stopPropagation()}>
              <CustomRecipeDropdown
                recipes={node.availableRecipes}
                value={node.recipeId || ''}
                onChange={(value) => node.nodeId && onRecipeChange(node.nodeId, value)}
                itemsMap={itemsMap}
              />
            </div>
          )}
        </div>

        {detailLevel !== 'compact' && renderRelationships()}

        {currentRecipe && producer && detailLevel !== 'compact' && (
          <div className="building-container" onClick={e => e.stopPropagation()}>
            {detailLevel === 'detailed' && (
              <ItemIcon iconId={producer.toLowerCase()} size={32} />
            )}
            <div className="building-info">
              <span className="producer-name">{formatBuildingName(producer)}</span>
              <span className="nominal-rate">({nominalRate.toFixed(2)}/min)</span>
              <div className="machine-controls">
                <button 
                  className="machine-adjust" 
                  onClick={() => node.nodeId && onMachineCountChange(node.nodeId, actualMachineCount - 1)}
                  disabled={actualMachineCount <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={actualMachineCount}
                  onChange={(e) => {
                    const count = Math.max(1, parseInt(e.target.value) || 1);
                    node.nodeId && onMachineCountChange(node.nodeId, count);
                  }}
                  onClick={(e) => e.currentTarget.select()}
                  min="1"
                  className="machine-count-input"
                />
                <button 
                  className="machine-adjust" 
                  onClick={() => node.nodeId && onMachineCountChange(node.nodeId, actualMachineCount + 1)}
                >
                  +
                </button>
                <div 
                  className={`efficiency-value ${getEfficiencyClass(parseFloat(efficiency))}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const actualEfficiency = (totalRate / actualCapacity).toFixed(6);
                    navigator.clipboard.writeText(actualEfficiency);
                  }}
                  title="Click to copy actual value"
                >
                  ({efficiency}%)
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="production-rate" onClick={e => e.stopPropagation()}>
          <div className="rate-value">
            {totalRate.toFixed(2)}/min
          </div>
          {detailLevel !== 'compact' && (
            <div className="machine-controls manual-rate-controls">
              <button
                className="machine-adjust"
                onClick={clearManualRate}
                title="Clear manual rate"
              >
                ×
              </button>
              <input
                type="number"
                className="manual-rate-input"
                value={node.manualRate || 0}
                onChange={(e) => node.nodeId && onManualRateChange(node.nodeId, parseFloat(e.target.value) || 0)}
                onWheel={(e) => e.currentTarget.blur()} // Prevent scroll from changing value
                onClick={(e) => e.currentTarget.select()} // Select all text when clicked
                placeholder="Add rate..."
                min="0"
                step="0.1"
              />
              <button
                className="machine-adjust"
                onClick={calculateOptimalManualRate}
                title="Set manual rate to achieve 100% efficiency"
              >
                ↑
              </button>
            </div>
          )}
        </div>
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
                itemsMap={itemsMap} // Add this new prop
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

