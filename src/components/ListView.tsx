import React from 'react';
import { ProductionNode, Item, Recipe, AccumulatedNodeUI } from '../types/types';
import { accumulateNodes } from '../utils/nodeAccumulator';
import { ProductionNode as ProductionNodeComponent } from './ProductionNode';

interface ListViewProps {
  nodes: ProductionNode[];
  items: Map<string, Item>;
  recipes: Map<string, Recipe>;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  onManualRateChange: (nodeId: string, rate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  detailLevel: 'compact' | 'normal' | 'detailed';
}

export function ListView(props: ListViewProps) {
  const accumulatedNodes = accumulateNodes(props.nodes, props.items, props.recipes);

  const handleRecipeChange = (nodeId: string, newRecipeId: string) => {
    // Apply change to all source nodes immediately
    const node = accumulatedNodes.find(n => n.sourceNodes.includes(nodeId));
    if (node) {
      node.sourceNodes.forEach(sourceId => {
        props.onRecipeChange(sourceId, newRecipeId);
      });
    }
  };

  // Add error boundary
  if (accumulatedNodes.length === 0) {
    return <div>No production nodes to display</div>;
  }

  return (
    <div className="list-view">
      {accumulatedNodes.map(node => (
        <ProductionNodeComponent
          key={`${node.itemId}-${node.recipeId}`}
          node={node}
          onRecipeChange={handleRecipeChange}
          onManualRateChange={props.onManualRateChange}
          onMachineCountChange={props.onMachineCountChange}
          machineOverrides={props.machineOverrides}
          manualRates={props.manualRates}
          detailLevel={props.detailLevel}
          isAccumulated={true}
          sourceCount={node.sourceNodes.length}
        />
      ))}
    </div>
  );
}
