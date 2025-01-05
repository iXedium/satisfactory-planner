import React from 'react';
import { ProductionNode, Item, Recipe, AccumulatedNodeUI } from '../../types/types';
import { accumulateNodes } from '../../utils/nodeAccumulator';
import { calculateConsumption } from '../../utils/consumptionTracker';
import { ProductionNode as ProductionNodeComponent } from './productionNode/ProductionNode';
import './ListView.css';

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
  const getAllNodesWithRelationships = (nodes: ProductionNode[]): ProductionNode[] => {
    const allNodes: ProductionNode[] = [];
    
    const processNode = (node: ProductionNode, parent: ProductionNode | null) => {
      if (node.itemId !== 'root') {
        const nodeWithParent = {
          ...node,
          parent: parent
        };
        allNodes.push(nodeWithParent);
        node.children.forEach(child => processNode(child, node));
      } else {
        node.children.forEach(child => processNode(child, null));
      }
    };

    nodes.forEach(node => processNode(node, null));
    return allNodes;
  };

  const allNodes = getAllNodesWithRelationships(props.nodes);
  const consumptionData = calculateConsumption(allNodes);
  const accumulatedNodes = accumulateNodes(props.nodes, props.items, props.recipes);
  
  const enhancedNodes = accumulatedNodes.map(node => ({
    ...node,
    relationships: {
      producedFor: node.relationships?.producedFor || [],
      totalProduction: node.rate + (node.manualRate || 0)
    }
  }));

  const handleRecipeChange = (nodeId: string, newRecipeId: string) => {
    const node = accumulatedNodes.find(n => n.sourceNodes.includes(nodeId));
    if (node) {
      node.sourceNodes.forEach(sourceId => {
        props.onRecipeChange(sourceId, newRecipeId);
      });
    }
  };

  if (accumulatedNodes.length === 0) {
    return <div>No production nodes to display</div>;
  }

  return (
    <div className="list-view">
      {enhancedNodes.map(node => (
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
          itemsMap={props.items}
        />
      ))}
    </div>
  );
} 