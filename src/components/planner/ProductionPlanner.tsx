import React, { JSX } from 'react';
import { useProductionPlanner } from '../../hooks/useProductionPlanner';
import { ProductionNode as ProductionNodeComponent } from '../production/productionNode/ProductionNode';
import { ViewToggle } from '../ViewToggle';
import { ListView } from '../ListView';
import { Item, ProductionNode } from '../../types/types';
import { ItemIcon } from '../ItemIcon';


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

  const getProductionItems = (items: Item[]) => {
    return items.filter(item => 
      ['parts', 'components'].includes(item.category)
    ).sort((a, b) => a.name.localeCompare(b.name));
  };

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

  const renderResourceSummary = () => {
    if (!resourceSummary) return null;

    return (
      <div className={`resource-summary ${summaryMode}`}>
        <div className="summary-header">
          <h2>Summary</h2>
          <button
            className="view-mode-button"
            onClick={() => setSummaryMode(mode => mode === 'normal' ? 'compact' : 'normal')}
          >
            {summaryMode === 'normal' ? 'Compact' : 'Normal'}
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Rate (/min)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(resourceSummary)
              .sort(([, a], [, b]) => b - a)
              .map(([itemId, rate]) => {
                const item = items.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <tr key={itemId}>
                    <td>
                      <ItemIcon iconId={item.id} />
                      {item.name}
                    </td>
                    <td>{rate.toFixed(2)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
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
        <div className="targets-container">
          {targetItems.map((target, index) => (
            <div key={index} className="target-item">
              <select
                value={target.id}
                onChange={e => updateTargetItem(index, 'id', e.target.value)}
              >
                <option value="">Select item...</option>
                {getProductionItems(items).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={target.rate}
                onChange={e => updateTargetItem(index, 'rate', Number(e.target.value))}
                min="0.01"
                step="0.01"
              />

              <button 
                className="remove-button"
                onClick={() => removeTargetItem(index)}
                disabled={targetItems.length === 1}
                title="Remove item"
              >
                ×
              </button>
            </div>
          ))}

          <div className="target-controls">
            <button className="add-button" onClick={addTargetItem}>
              Add Item
            </button>
            <button className="calculate-button" onClick={handleCalculate}>
              Calculate
            </button>
          </div>
        </div>
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
            {renderResourceSummary()}
          </div>
        </div>
      )}
    </div>
  );
} 