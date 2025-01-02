import { ProductionNode, AccumulatedNodeUI, Item, Recipe, NodeConsumption } from '../types/types';
import { createMergedNodesMap } from './nodeUtils';
import { calculateConsumption } from './consumptionTracker';

export function accumulateNodes(
  nodes: ProductionNode[], 
  items: Map<string, Item>,
  recipes: Map<string, Recipe>
): AccumulatedNodeUI[] {
  if (!nodes || nodes.length === 0) return [];

  const mergedMap = createMergedNodesMap(nodes, items, recipes);
  
  const accumulated = Array.from(mergedMap.values()).map(node => {
    // Get all production relationships for this item
    const relationships = nodes
      .filter(n => n.itemId === node.itemId)
      .map(n => n.relationships || { producedFor: [], totalProduction: 0 }) // Ensure relationships is defined
      .reduce((acc, rel) => ({
        producedFor: [...acc.producedFor, ...rel.producedFor],
        totalProduction: acc.totalProduction + rel.totalProduction
      }), { producedFor: [], totalProduction: 0 });

    // Calculate percentages
    const withPercentages = {
      ...relationships,
      producedFor: relationships.producedFor.map(p => ({
        ...p,
        percentage: (p.amount / relationships.totalProduction) * 100
      }))
    };

    // Create the accumulated node
    const accumulatedNode: AccumulatedNodeUI = {
      ...node,
      availableRecipes: Array.from(recipes.values()).filter(r => 
        Object.keys(r.out).includes(node.itemId)
      ),
      item: items.get(node.itemId)!,
      sourceNodes: node.nodeIds,
      isAccumulated: true,
      children: node.children,
      relationships: withPercentages
    };

    return accumulatedNode;
  });

  return accumulated;
}

// Add an empty export to make this file a module
export {}
