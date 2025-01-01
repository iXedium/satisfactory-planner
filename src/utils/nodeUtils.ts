import { ProductionNode, MergedNode, Item, Recipe } from '../types/types';

export function createMergedNodesMap(
  nodes: ProductionNode[],
  items: Item[] | Map<string, Item>,
  recipes: Recipe[] | Map<string, Recipe>
): Map<string, MergedNode> {
  const itemsMap = items instanceof Map ? items : new Map(items.map(item => [item.id, item]));
  const recipesMap = recipes instanceof Map ? recipes : new Map(recipes.map(recipe => [recipe.id, recipe]));
  
  const mergedMap = new Map<string, MergedNode>();
  
  nodes.forEach(node => {
    const key = `${node.itemId}-${node.recipeId}`;
    const item = itemsMap.get(node.itemId)!;
    const recipe = node.recipeId ? recipesMap.get(node.recipeId) || null : null;
    
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!;
      existing.rate += node.rate;
      existing.totalRate += node.rate;
      existing.manualRate += node.manualRate || 0;
      existing.nodeIds.push(node.nodeId!);
      existing.machineCount += 1;
    } else {
      mergedMap.set(key, {
        itemId: node.itemId,
        rate: node.rate,
        recipeId: node.recipeId,
        children: [],
        nodeId: node.nodeId!,
        totalRate: node.rate,
        manualRate: node.manualRate || 0,
        nodeIds: [node.nodeId!],
        item,
        recipe,
        machineCount: 1,
        efficiency: 0
      });
    }
  });

  return mergedMap;
}

export function collectAllNodes(node: ProductionNode): ProductionNode[] {
  const allNodes: ProductionNode[] = [];
  
  const collectNodes = (node: ProductionNode) => {
    if (node.itemId !== 'root') {
      allNodes.push({
        ...node,
        nodeId: node.nodeId || `${node.itemId}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
    node.children.forEach(collectNodes);
  };
  
  if (node.itemId === 'root') {
    node.children.forEach(collectNodes);
  } else {
    collectNodes(node);
  }

  return allNodes;
}
