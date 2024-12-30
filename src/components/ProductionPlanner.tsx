// src/components/ProductionPlanner.tsx
import React, { useState, useEffect, JSX, useRef } from 'react';
import { db } from '../services/database';
import { ProductionCalculator } from '../services/calculator';
import { Item, Recipe, ProductionNode, ProductionNodeUI, TargetItem, ResourceSummary } from '../types/types';
import { ItemIcon } from './ItemIcon';
import { ProductionNode as ProductionNodeComponent } from './ProductionNode';

export function ProductionPlanner() {
  const [items, setItems] = useState<Item[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [calculator, setCalculator] = useState<ProductionCalculator | null>(null);
  const [targetItems, setTargetItems] = useState<TargetItem[]>([{ id: '', rate: 1 }]);
  const [productionChain, setProductionChain] = useState<ProductionNode | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [detailLevel, setDetailLevel] = useState<'compact' | 'normal' | 'detailed'>('normal');
  const [machineOverrides, setMachineOverrides] = useState<Map<string, number>>(new Map());
  const [summaryMode, setSummaryMode] = useState<'normal' | 'compact'>('normal');
  const [isDragging, setIsDragging] = useState(false);
  const productionResultRef = useRef<HTMLDivElement>(null);
  const [treePanelWidth, setTreePanelWidth] = useState<number>(70); // percentage
  const [resourceSummary, setResourceSummary] = useState<ResourceSummary>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Make sure database is initialized first
        await db.initialize();
        
        const loadedItems = await db.items.toArray();
        const loadedRecipes = await db.recipes.toArray();
        
        if (loadedItems.length === 0) {
          console.error('No items loaded from database');
          return;
        }

        console.log(`Loaded ${loadedItems.length} items and ${loadedRecipes.length} recipes`);
        setItems(loadedItems);
        setRecipes(loadedRecipes);
        setCalculator(new ProductionCalculator(loadedItems, loadedRecipes));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleCalculate = () => {
    if (!calculator) return;

    const validTargets = targetItems.filter(target => target.id);
    if (validTargets.length === 0) return;

    // Create a dummy root node that combines all targets
    const rootNode: ProductionNode = {
      itemId: 'root',
      rate: 0,
      recipeId: null,
      children: validTargets.map(target => 
        calculator.calculateProduction(target.id, target.rate)
      )
    };

    setProductionChain(rootNode);
  };

  const handleRecipeChange = (itemId: string, newRecipeId: string) => {
    if (calculator && productionChain) {
      const newChain = calculator.updateRecipe(productionChain, itemId, newRecipeId);
      setProductionChain(newChain);
    }
  };

  const handleManualRateChange = (itemId: string, manualRate: number) => {
    if (!calculator || !productionChain) return;
    
    const newChain = calculator.updateManualRate(productionChain, itemId, manualRate);
    setProductionChain(newChain);
    
    // Update the machine count if needed based on new total rate
    const node = findNode(newChain, itemId);
    if (node && node.recipeId) {
      const recipe = recipes.find(r => r.id === node.recipeId);
      if (recipe) {
        const totalRate = (node.rate || 0) + manualRate;
        const nominalRate = (recipe.out[itemId] * 60) / recipe.time;
        const defaultCount = Math.ceil(totalRate / nominalRate);
        handleMachineCountChange(itemId, defaultCount);
      }
    }
    
    // Update resource summary
    const resources = calculator.calculateTotalResources(newChain);
    setResourceSummary(resources);
  };

  // Add this helper function
  const findNode = (chain: ProductionNode, itemId: string): ProductionNode | null => {
    if (chain.itemId === itemId) return chain;
    for (const child of chain.children) {
      const found = findNode(child, itemId);
      if (found) return found;
    }
    return null;
  };

  const addTargetItem = () => {
    setTargetItems([...targetItems, { id: '', rate: 1 }]);
  };

  const removeTargetItem = (index: number) => {
    setTargetItems(targetItems.filter((_, i) => i !== index));
  };

  const updateTargetItem = (index: number, field: keyof TargetItem, value: string | number) => {
    setTargetItems(targetItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
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

  const getEfficiencyClass = (efficiency: number): string => {
    if (efficiency === 100) return 'efficiency-optimal';
    if (efficiency < 100) return 'efficiency-under';
    return 'efficiency-over';
  };

  const handleMachineCountChange = (itemId: string, count: number) => {
    setMachineOverrides(prev => {
      const newOverrides = new Map(prev);
      newOverrides.set(itemId, count);
      return newOverrides;
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = productionResultRef.current;
    if (!container) return;
  
    const startX = e.clientX;
    const treePanel = container.firstElementChild as HTMLElement;
    const summaryPanel = container.lastElementChild as HTMLElement;
    const initialTreeWidth = treePanel.clientWidth;
    const initialSummaryWidth = summaryPanel.clientWidth;
  
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const delta = e.clientX - startX;
      const containerWidth = container.clientWidth;
      const newTreeWidth = Math.min(
        Math.max(200, initialTreeWidth + delta),
        containerWidth - 200 // Leave space for summary and divider
      );
      const newSummaryWidth = containerWidth - newTreeWidth - 8; // 8px for divider
      if (newTreeWidth >= 200 && newSummaryWidth >= 200) {
        treePanel.style.flexGrow = '0';
        treePanel.style.flexBasis = `${newTreeWidth}px`;
        summaryPanel.style.flexGrow = '0';
        summaryPanel.style.flexBasis = `${newSummaryWidth}px`;
      }
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const enhanceProductionNode = (node: ProductionNode): ProductionNodeUI => {
    const item = items.find(i => i.id === node.itemId);
    const availableRecipes = recipes.filter(r => 
      Object.keys(r.out).includes(node.itemId)
    );

    return {
      ...node,
      availableRecipes,
      item: item!,
      children: node.children.map(child => enhanceProductionNode(child))
    };
  };

  const renderProductionNode = (node: ProductionNode): JSX.Element | null => {
    // Don't render the root node
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
        detailLevel={detailLevel}
      />
    );
  };

  const renderResourceSummary = () => {
    if (!calculator || !productionChain) return null;

    const resources = calculator.calculateTotalResources(productionChain);
    
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
            {Object.entries(resources)
              .sort(([, a], [, b]) => b - a) // Sort by rate descending
              .map(([itemId, rate]) => {
                const item = items.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <tr key={itemId}>
                    <td>
                      <ItemIcon iconId={item.id} /> {/* Remove size prop */}
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

  const getProductionItems = (items: Item[]) => {
    // Only show items from 'parts' and 'components' categories
    return items.filter(item => 
      ['parts', 'components'].includes(item.category)
    ).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  };

  return (
    <div className="planner">
      <h1>Satisfactory Production Planner</h1>
      <div className="controls-container">
        <div className="view-mode-controls">
          {renderDetailControls()}
        </div>
        <div className="targets-container">
          {targetItems.map((target, index) => (
            <div key={index} className="target-item">
              <select
                value={target.id}
                onChange={e => updateTargetItem(index, 'id', e.target.value)}
              >
                <option value="">Select an item...</option>
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
              >
                ✕
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
            {renderProductionNode(productionChain)}
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

};
