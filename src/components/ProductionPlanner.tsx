// src/components/ProductionPlanner.tsx
import React, { useState, useEffect, JSX } from 'react';
import { db } from '../services/database';
import { ProductionCalculator } from '../services/calculator';
import { Item, Recipe, ProductionNode, ProductionNodeUI, TargetItem } from '../types/types';
import { ItemIcon } from './ItemIcon';

export const ProductionPlanner: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [calculator, setCalculator] = useState<ProductionCalculator | null>(null);
  const [targetItems, setTargetItems] = useState<TargetItem[]>([{ id: '', rate: 1 }]);
  const [productionChain, setProductionChain] = useState<ProductionNode | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'summary'>('tree');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [detailLevel, setDetailLevel] = useState<'compact' | 'normal' | 'detailed'>('normal');

  useEffect(() => {
    const loadData = async () => {
      const loadedItems = await db.items.toArray();
      const loadedRecipes = await db.recipes.toArray();
      console.log('Loaded items:', loadedItems);
      console.log('Loaded recipes:', loadedRecipes);
      setItems(loadedItems);
      setRecipes(loadedRecipes);
      setCalculator(new ProductionCalculator(loadedItems, loadedRecipes));
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

  const renderProductionNode = (node: ProductionNode): JSX.Element | null => {
    // Don't render the root node
    if (node.itemId === 'root') {
      return (
        <div className="production-chain">
          {node.children.map((child, index) => renderProductionNode(child))}
        </div>
      );
    }

    const item = items.find(i => i.id === node.itemId);
    const availableRecipes = recipes.filter(r => 
      Object.keys(r.out).includes(node.itemId)  // Changed from [0] === to includes()
    );
    const currentRecipe = node.recipeId ? recipes.find(r => r.id === node.recipeId) : null;
    
    if (!item) return null;

    const isCollapsed = collapsedNodes.has(node.itemId);
    const hasChildren = node.children.length > 0;

    // Calculate nominal rate and get producer info
    const nominalRate = currentRecipe ? (currentRecipe.out[node.itemId] * 60) / currentRecipe.time : 0;
    const producer = currentRecipe ? currentRecipe.producers[0] : null;

    // Helper function to format building name
    const formatBuildingName = (name: string): string => {
      return name.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return (
      <div className={`production-node ${detailLevel}`}>
        <div className={`node-content ${hasChildren ? 'collapsible' : ''}`}
             onClick={() => hasChildren && toggleNode(node.itemId)}>
          {hasChildren && (
            <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
          )}
          <div className="item-icon-container">
            <ItemIcon iconId={item.id} />
          </div>

          <div className="name-recipe-container">
            <h3>{item.name}</h3>
            {availableRecipes.length > 0 && (
              <select
                value={node.recipeId || ''}
                onChange={(e) => handleRecipeChange(node.itemId, e.target.value)}
                onClick={e => e.stopPropagation()}
              >
                {availableRecipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentRecipe && producer && detailLevel !== 'compact' && (
            <div className="building-container">
              {detailLevel === 'detailed' && (
                <ItemIcon iconId={producer.toLowerCase()} />
              )}
              <div className="building-info">
                <span className="producer-name">{formatBuildingName(producer)}</span>
                <span className="nominal-rate">({nominalRate.toFixed(2)}/min)</span>
              </div>
            </div>
          )}

          <div className="production-rate">
            {node.rate.toFixed(2)}/min
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="node-inputs">
            {node.children.map((child: ProductionNode, index: number) => (
              <div key={index} className="input-node">
                {renderProductionNode(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderResourceSummary = () => {
    if (!calculator || !productionChain) return null;

    const resources = calculator.calculateTotalResources(productionChain);
    
    return (
      <div className="resource-summary">
        <h2>Total Resources Required</h2>
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
          <div className="view-controls">
            <button
              className={viewMode === 'tree' ? 'active' : ''}
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </button>
            <button
              className={viewMode === 'summary' ? 'active' : ''}
              onClick={() => setViewMode('summary')}
            >
              Resource Summary
            </button>
          </div>
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
        <div className="production-result">
          {viewMode === 'tree' ? (
            renderProductionNode(productionChain)
          ) : (
            renderResourceSummary()
          )}
        </div>
      )}
    </div>
  );

};
