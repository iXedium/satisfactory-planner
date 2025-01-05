import React from 'react';
import { ProductionNode, Item, Recipe, AccumulatedNodeUI } from '../types/types';
import { accumulateNodes } from '../utils/nodeAccumulator';
import { calculateConsumption } from '../utils/consumptionTracker';
import { ProductionNode as ProductionNodeComponent } from './production/ProductionNode';

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
  // Get all nodes including their children for consumption calculation
  const getAllNodesWithRelationships = (nodes: ProductionNode[]): ProductionNode[] => {
    const allNodes: ProductionNode[] = [];
    
    // Helper function to maintain parent-child relationships
    const processNode = (node: ProductionNode, parent: ProductionNode | null) => {
      if (node.itemId !== 'root') {
        // Create a copy of the node with its parent reference
        const nodeWithParent = {
          ...node,
          parent: parent // Track the parent node
        };
        allNodes.push(nodeWithParent);
        node.children.forEach(child => processNode(child, node));
      } else {
        // Process root node's children without adding root itself
        node.children.forEach(child => processNode(child, null));
      }
    };

    // Start processing from root nodes
    nodes.forEach(node => processNode(node, null));
    return allNodes;
  };

  // Get all nodes with their relationships
  const allNodes = getAllNodesWithRelationships(props.nodes);

  // Calculate consumption data for entire production chain
  const consumptionData = calculateConsumption(allNodes);
  
  // Accumulate nodes with consumption data
  const accumulatedNodes = accumulateNodes(props.nodes, props.items, props.recipes);
  
  // Create enhanced nodes with preserved relationships
  const enhancedNodes = accumulatedNodes.map(node => ({
    ...node,
    relationships: {
      producedFor: node.relationships?.producedFor || [],
      totalProduction: node.rate + (node.manualRate || 0)
    }
  }));

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
          itemsMap={props.items}  // Pass the itemsMap from props
        />
      ))}
    </div>
  );
}
