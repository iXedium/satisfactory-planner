import { ProductionNode, AccumulatedNodeUI, Item, Recipe } from '../types/types';
import { createMergedNodesMap } from './nodeUtils';

export function accumulateNodes(
  nodes: ProductionNode[], 
  items: Map<string, Item>,
  recipes: Map<string, Recipe>
): AccumulatedNodeUI[] {
  if (!nodes || nodes.length === 0) return [];

  const mergedMap = createMergedNodesMap(nodes, items, recipes);
  
  return Array.from(mergedMap.values()).map(node => ({
    ...node,
    sourceNodes: node.nodeIds,
    isAccumulated: true,
    availableRecipes: Array.from(recipes.values()).filter(r => 
      Object.keys(r.out).includes(node.itemId)
    )
  }));
}

// Add an empty export to make this file a module
export {}
