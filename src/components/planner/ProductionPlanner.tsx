import React, { JSX } from 'react';
import { useProductionPlanner } from '../../hooks/useProductionPlanner';
import { ProductionNode as ProductionNodeComponent } from '../production/productionNode/ProductionNode';
import { ViewToggle } from '../ViewToggle';
import { ListView } from '../ListView';
import { Item, ProductionNode } from '../../types/types';
import { ResourceSummary } from './ResourceSummary';
import { TargetItemControls } from './TargetItemControls';

export function ProductionPlanner() {
  const {
    items,
    targetItems,
    productionChain,
    detailLevel,
    machineOverrides,
    summaryMode,
    isDragging,
    resourceSummary,
    manualRates,
    viewMode,
    mergedNodes,
    itemsMap,
    recipesMap,
    productionResultRef,

    setDetailLevel,
    setSummaryMode,
    handleCalculate,
    handleRecipeChange,
    handleManualRateChange,
    handleMachineCountChange,
    handleResizeStart,
    addTargetItem,
    removeTargetItem,
    updateTargetItem,
    handleViewModeToggle,
    enhanceProductionNode,
  } = useProductionPlanner();

  const handleSummaryModeToggle = () => {
    setSummaryMode(mode => mode === 'normal' ? 'compact' : 'normal');
  };

  const renderDetailControls = () => (
    <div className="detail-controls">
      <button
        className={`detail-button ${detailLevel === 'compact' ? 'active' : ''}`}
        onClick={() => setDetailLevel('compact')}
        title="Show minimal information"
      >
        Compact
      </button>
      <button
        className={`detail-button ${detailLevel === 'normal' ? 'active' : ''}`}
        onClick={() => setDetailLevel('normal')}
        title="Show standard information"
      >
        Normal
      </button>
      <button
        className={`detail-button ${detailLevel === 'detailed' ? 'active' : ''}`}
        onClick={() => setDetailLevel('detailed')}
        title="Show all information"
      >
        Detailed
      </button>
    </div>
  );

  const renderProductionNode = (node: ProductionNode): JSX.Element | null => {
    if (node.itemId === 'root') {
      return (
        <div className="production-chain">
          {node.children.map((child, index) => renderProductionNode(child))}
        </div>
      );
    }

    const enhancedNode = enhanceProductionNode(node);

    return (
      <ProductionNodeComponent
        node={enhancedNode}
        onRecipeChange={handleRecipeChange}
        onManualRateChange={handleManualRateChange}
        onMachineCountChange={handleMachineCountChange}
        machineOverrides={machineOverrides}
        manualRates={manualRates}
        detailLevel={detailLevel}
        itemsMap={itemsMap}
      />
    );
  };

  return (
    <div className="planner">
      <h1>Satisfactory Production Planner</h1>
      <div className="controls-container">
        <aside className="view-mode-controls">
          <ViewToggle 
            mode={viewMode} 
            onToggle={handleViewModeToggle} 
          />
          {renderDetailControls()}
        </aside>
        <TargetItemControls
          targetItems={targetItems}
          items={items}
          onAdd={addTargetItem}
          onRemove={removeTargetItem}
          onUpdate={updateTargetItem}
          onCalculate={handleCalculate}
        />
      </div>

      {productionChain && (
        <div className="production-result" ref={productionResultRef}>
          <div className="production-chain">
            {viewMode === 'tree' ? (
              renderProductionNode(productionChain)
            ) : (
              <ListView
                nodes={mergedNodes}
                items={itemsMap}
                recipes={recipesMap}
                onMachineCountChange={handleMachineCountChange}
                onManualRateChange={handleManualRateChange}
                onRecipeChange={handleRecipeChange}
                machineOverrides={machineOverrides}
                manualRates={manualRates}
                detailLevel={detailLevel}
              />
            )}
          </div>
          <div 
            className={`view-resizer ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleResizeStart}
          />
          <div className="resource-summary-container">
            <ResourceSummary
              resourceSummary={resourceSummary}
              items={items}
              summaryMode={summaryMode}
              onToggleMode={handleSummaryModeToggle}
            />
          </div>
        </div>
      )}
    </div>
  );
} 