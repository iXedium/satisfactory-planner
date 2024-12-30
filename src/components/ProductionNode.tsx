import { useState } from 'react';
import { ProductionNodeUI, Recipe } from '../types/types';
import { ItemIcon } from './ItemIcon';

interface ProductionNodeProps {
  node: ProductionNodeUI;
  onRecipeChange: (nodeId: string, recipeId: string) => void; // Change itemId to nodeId
  onManualRateChange: (nodeId: string, manualRate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel?: 'compact' | 'normal' | 'detailed';
}

export function ProductionNode({ 
  node, 
  onRecipeChange, 
  onManualRateChange,
  onMachineCountChange,
  machineOverrides,
  manualRates,
  detailLevel = 'normal' 
}: ProductionNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
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
    // Only collapse if clicking directly on the node-content
    // and not on any of its interactive children
    if (
      hasChildren && 
      e.target instanceof Element && 
      e.target.className === 'node-content'
    ) {
      setCollapsed(!collapsed);
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
    <div className={`production-node ${detailLevel}`}>
      <div 
        className={`node-content ${hasChildren ? 'collapsible' : ''}`}
        onClick={() => hasChildren && setCollapsed(!collapsed)}
      >
        {hasChildren && (
          <span className={`collapse-icon ${collapsed ? 'collapsed' : ''}`}>▼</span>
        )}
        
        <div className="item-icon-container">
          <ItemIcon iconId={node.item.id} />
        </div>

        <div className="name-recipe-container">
          <h3>{node.item.name}</h3>
          {node.availableRecipes.length > 0 && detailLevel !== 'compact' && (
            <div className="machine-controls" onClick={e => e.stopPropagation()}>
              <select
                value={node.recipeId || ''}
                onChange={(e) => node.nodeId && onRecipeChange(node.nodeId, e.target.value)}
              >
                {node.availableRecipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {currentRecipe && producer && detailLevel !== 'compact' && (
          <div className="building-container" onClick={e => e.stopPropagation()}>
            {detailLevel === 'detailed' && (
              <ItemIcon iconId={producer.toLowerCase()} />
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
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
