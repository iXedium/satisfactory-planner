import React from 'react';
import { ProductionNode as ProductionNodeComponent } from '../production/productionNode/ProductionNode';
import { ListView } from '../production/ListView';
import { Item, ProductionNode, Recipe, ProductionNodeUI } from '../../types/types';

interface ProductionChainProps {
  productionChain: ProductionNode;
  mergedNodes: ProductionNode[];
  viewMode: 'tree' | 'list';
  detailLevel: 'compact' | 'normal' | 'detailed';
  machineOverrides: Map<string, number>;
  manualRates: Map<string, number>;
  itemsMap: Map<string, Item>;
  recipesMap: Map<string, Recipe>;
  onRecipeChange: (nodeId: string, recipeId: string) => void;
  onManualRateChange: (nodeId: string, rate: number) => void;
  onMachineCountChange: (nodeId: string, count: number) => void;
  enhanceProductionNode: (node: ProductionNode) => ProductionNodeUI;
}

export function ProductionChain({
  productionChain,
  mergedNodes,
  viewMode,
  detailLevel,
  machineOverrides,
  manualRates,
  itemsMap,
  recipesMap,
  onRecipeChange,
  onManualRateChange,
  onMachineCountChange,
  enhanceProductionNode,
}: ProductionChainProps) {
  const renderProductionNode = (node: ProductionNode): React.ReactNode => {
    if (node.itemId === 'root') {
      return (
        <div className="production-chain" key="root">
          {node.children.map((child, index) => renderProductionNode(child))}
        </div>
      );
    }

    const enhancedNode = enhanceProductionNode(node);

    return (
      <ProductionNodeComponent
        key={enhancedNode.nodeId || enhancedNode.itemId}
        node={enhancedNode}
        onRecipeChange={onRecipeChange}
        onManualRateChange={onManualRateChange}
        onMachineCountChange={onMachineCountChange}
        machineOverrides={machineOverrides}
        manualRates={manualRates}
        detailLevel={detailLevel}
        itemsMap={itemsMap}
      />
    );
  };

  return viewMode === 'tree' ? (
    renderProductionNode(productionChain)
  ) : (
    <ListView
      nodes={mergedNodes}
      items={itemsMap}
      recipes={recipesMap}
      onMachineCountChange={onMachineCountChange}
      onManualRateChange={onManualRateChange}
      onRecipeChange={onRecipeChange}
      machineOverrides={machineOverrides}
      manualRates={manualRates}
      detailLevel={detailLevel}
    />
  );
} 