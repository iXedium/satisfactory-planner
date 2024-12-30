import { useState } from 'react';
import { ProductionNodeUI, Recipe } from '../types/types';
import { ItemIcon } from './ItemIcon';

interface ProductionNodeProps {
  node: ProductionNodeUI;
  onRecipeChange: (itemId: string, recipeId: string) => void;
  onManualRateChange: (itemId: string, manualRate: number) => void;
  onMachineCountChange: (itemId: string, count: number) => void;  // Add this
  machineOverrides: Map<string, number>;  // Add this
  detailLevel?: 'compact' | 'normal' | 'detailed';
}

export function ProductionNode({ 
  node, 
  onRecipeChange, 
  onManualRateChange,
  onMachineCountChange,
  machineOverrides,
  detailLevel = 'normal' 
}: ProductionNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children.length > 0;
  const totalRate = (node.rate || 0) + (node.manualRate || 0);

  // Calculate nominal rate and get producer info
  const currentRecipe = node.recipeId ? node.availableRecipes.find(r => r.id === node.recipeId) : null;
  const nominalRate = currentRecipe ? (currentRecipe.out[node.itemId] * 60) / currentRecipe.time : 0;
  const producer = currentRecipe ? currentRecipe.producers[0] : null;

  // Calculate machine count and efficiency
  const defaultMachineCount = currentRecipe ? Math.ceil(totalRate / nominalRate) : 0;
  const actualMachineCount = machineOverrides.get(node.itemId) || defaultMachineCount;
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
            <select
              value={node.recipeId || ''}
              onChange={(e) => onRecipeChange(node.itemId, e.target.value)}
              onClick={e => e.stopPropagation()}
            >
              {node.availableRecipes.map(recipe => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {currentRecipe && producer && detailLevel !== 'compact' && (
          <div className="building-container">
            {detailLevel === 'detailed' && (
              <ItemIcon iconId={producer.toLowerCase()} />
            )}
            <div className="building-info">
              <span className="producer-name">{formatBuildingName(producer)}</span>
              <span className="nominal-rate">({nominalRate.toFixed(2)}/min)</span>
              <div className="machine-controls" onClick={e => e.stopPropagation()}>
                <button 
                  className="machine-adjust" 
                  onClick={() => onMachineCountChange(node.itemId, actualMachineCount - 1)}
                  disabled={actualMachineCount <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={actualMachineCount}
                  onChange={(e) => {
                    const count = Math.max(1, parseInt(e.target.value) || 1);
                    onMachineCountChange(node.itemId, count);
                  }}
                  onClick={(e) => e.currentTarget.select()}
                  min="1"
                  className="machine-count-input"
                />
                <button 
                  className="machine-adjust" 
                  onClick={() => onMachineCountChange(node.itemId, actualMachineCount + 1)}
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

        <div className="production-rate">
          <div className="rate-value">
            {totalRate.toFixed(2)}/min
          </div>
          {detailLevel !== 'compact' && (
            <div className="machine-controls" onClick={e => e.stopPropagation()}>
              <input
                type="number"
                className="manual-rate-input"
                value={node.manualRate || 0}
                onChange={(e) => onManualRateChange(node.itemId, parseFloat(e.target.value) || 0)}
                placeholder="Add rate..."
                min="0"
                step="0.1"
              />
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
                detailLevel={detailLevel}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
