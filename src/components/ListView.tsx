import React from 'react';
import { MergedNode } from '../types/types';
import { ItemIcon } from './ItemIcon';

interface ListViewProps {
  nodes: MergedNode[];
  onMachineCountChange: (nodeId: string, count: number) => void;
  onManualRateChange: (nodeId: string, rate: number) => void;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  detailLevel: 'compact' | 'normal' | 'detailed';
}

export function ListView({ nodes, onMachineCountChange, onManualRateChange, onRecipeChange, detailLevel }: ListViewProps) {
  if (nodes.length === 0) {
    return <div>No data available</div>; // Debugging step
  }

  return (
    <div className="list-view">
      {nodes.map(node => (
        <div key={`${node.itemId}-${node.recipeId}`} className="list-item">
          <div className="list-item-content">
            <ItemIcon iconId={node.item.id} />
            <div className="item-info">
              <h3>{node.item.name}</h3>
              {node.recipe && (
                <div className="recipe-name">{node.recipe.name}</div>
              )}
            </div>
            <div className="total-rate">
              {node.totalRate.toFixed(2)}/min
              ({node.nodeIds.length} nodes)
            </div>
            <div className="controls">
              <button onClick={() => onMachineCountChange(node.nodeIds[0], node.machineCount + 1)}>+</button>
              <button onClick={() => onMachineCountChange(node.nodeIds[0], node.machineCount - 1)}>-</button>
              <input
                type="number"
                value={node.manualRate}
                onChange={(e) => onManualRateChange(node.nodeIds[0], parseFloat(e.target.value) || 0)}
                onClick={(e) => e.currentTarget.select()}
                onWheel={(e) => e.currentTarget.blur()}
              />
              <select
                value={node.recipeId || ''}
                onChange={(e) => onRecipeChange(node.nodeIds[0], e.target.value)}
              >
                {node.recipe && (
                  <option value={node.recipe.id}>{node.recipe.name}</option>
                )}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
