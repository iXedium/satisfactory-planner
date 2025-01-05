import { useState, useEffect, useRef } from 'react';
import { db } from '../services/database';
import { ProductionCalculator } from '../services/calculator';
import { Item, Recipe, ProductionNode, ProductionNodeUI, TargetItem, ResourceSummary, MergedNode } from '../types/types';
import { createMergedNodesMap, collectAllNodes } from '../utils/nodeUtils';
import { calculateConsumption } from '../utils/consumptionTracker';
import { accumulateNodes } from '../utils/nodeAccumulator';

export function useProductionPlanner() {
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
  const [treePanelWidth, setTreePanelWidth] = useState<number>(70);
  const [resourceSummary, setResourceSummary] = useState<ResourceSummary>({});
  const [manualRates, setManualRates] = useState<Map<string, number>>(new Map());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('list');
  const [mergedNodes, setMergedNodes] = useState<MergedNode[]>([]);
  const [itemsMap, setItemsMap] = useState<Map<string, Item>>(new Map());
  const [recipesMap, setRecipesMap] = useState<Map<string, Recipe>>(new Map());

  const productionResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
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

  useEffect(() => {
    setItemsMap(new Map(items.map(item => [item.id, item])));
    setRecipesMap(new Map(recipes.map(recipe => [recipe.id, recipe])));
  }, [items, recipes]);

  useEffect(() => {
    if (calculator && productionChain) {
      const resources = calculator.calculateTotalResources(productionChain);
      setResourceSummary(resources);
    }
  }, [calculator, productionChain]);

  const updateMergedNodes = () => {
    if (!productionChain) return;
    const allNodes = collectAllNodes(productionChain);
    const consumptionData = calculateConsumption(allNodes);
    const mergedMap = createMergedNodesMap(allNodes, items, recipes);
    
    const mergedNodes = Array.from(mergedMap.values()).map(node => ({
      ...node,
      consumption: consumptionData.get(node.itemId)
    }));
    
    setMergedNodes(mergedNodes);
  };

  const handleCalculate = () => {
    if (!calculator) return;

    const validTargets = targetItems.filter(target => target.id);
    if (validTargets.length === 0) return;

    const rootNode: ProductionNode = {
      itemId: 'root',
      rate: 0,
      recipeId: null,
      children: validTargets.map(target => 
        calculator.calculateProduction(target.id, target.rate)
      )
    };

    // Calculate all derived data in one go
    const allNodes = collectAllNodes(rootNode);
    const consumptionData = calculateConsumption(allNodes);
    const resources = calculator.calculateTotalResources(rootNode);

    if (viewMode === 'list') {
      const accumulated = accumulateNodes(allNodes, itemsMap, recipesMap);
      const mergedNodes = accumulated.map(node => ({
        ...node,
        nodeIds: node.sourceNodes,
        recipe: node.recipeId ? recipesMap.get(node.recipeId) || null : null,
        machineCount: 1,
        efficiency: 100,
        itemId: node.itemId,
        rate: node.rate,
        children: node.children,
        totalRate: node.rate + (node.manualRate || 0),
        manualRate: node.manualRate || 0,
        consumption: consumptionData.get(node.itemId)
      }));
      setMergedNodes(mergedNodes);
    }

    const enhanceNodesWithConsumption = (node: ProductionNode): ProductionNodeUI => {
      const enhanced = node as ProductionNodeUI;
      enhanced.consumption = consumptionData.get(node.itemId);
      enhanced.children = node.children.map(enhanceNodesWithConsumption);
      return enhanced;
    };

    const enhancedRoot = enhanceNodesWithConsumption(rootNode);

    // Update all states in one batch to avoid unnecessary re-renders
    Promise.resolve().then(() => {
      setProductionChain(enhancedRoot);
      setResourceSummary(resources);
    });
  };

  const handleRecipeChange = (nodeId: string, newRecipeId: string) => {
    if (calculator && productionChain) {
      const newChain = calculator.updateRecipe(productionChain, nodeId, newRecipeId);
      const allNodes = collectAllNodes(newChain);
      const consumptionData = calculateConsumption(allNodes);
      
      // Update all states in one batch
      Promise.resolve().then(() => {
        setProductionChain(newChain);
        if (viewMode === 'list') {
          const accumulated = accumulateNodes(allNodes, itemsMap, recipesMap);
          const mergedNodes = accumulated.map(node => ({
            ...node,
            nodeIds: node.sourceNodes,
            recipe: node.recipeId ? recipesMap.get(node.recipeId) || null : null,
            machineCount: 1,
            efficiency: 100,
            itemId: node.itemId,
            rate: node.rate,
            children: node.children,
            totalRate: node.rate + (node.manualRate || 0),
            manualRate: node.manualRate || 0,
            consumption: consumptionData.get(node.itemId)
          }));
          setMergedNodes(mergedNodes);
        }
      });
    }
  };

  const handleManualRateChange = (nodeId: string, manualRate: number) => {
    if (!calculator || !productionChain || !nodeId) return;
    
    const newRates = new Map(manualRates);
    newRates.set(nodeId, manualRate);
    
    const newChain = calculator.updateManualRate(productionChain, nodeId, manualRate);
    const allNodes = collectAllNodes(newChain);
    const consumptionData = calculateConsumption(allNodes);

    // Update all states in one batch
    Promise.resolve().then(() => {
      setManualRates(newRates);
      setProductionChain(newChain);
      if (viewMode === 'list') {
        const accumulated = accumulateNodes(allNodes, itemsMap, recipesMap);
        const mergedNodes = accumulated.map(node => ({
          ...node,
          nodeIds: node.sourceNodes,
          recipe: node.recipeId ? recipesMap.get(node.recipeId) || null : null,
          machineCount: 1,
          efficiency: 100,
          itemId: node.itemId,
          rate: node.rate,
          children: node.children,
          totalRate: node.rate + (node.manualRate || 0),
          manualRate: node.manualRate || 0,
          consumption: consumptionData.get(node.itemId)
        }));
        setMergedNodes(mergedNodes);
      }
    });
  };

  const handleMachineCountChange = (itemId: string, count: number) => {
    const newOverrides = new Map(machineOverrides);
    newOverrides.set(itemId, count);
    
    Promise.resolve().then(() => {
      setMachineOverrides(newOverrides);
      if (viewMode === 'list' && productionChain) {
        const allNodes = collectAllNodes(productionChain);
        const mergedMap = createMergedNodesMap(allNodes, items, recipes);
        setMergedNodes(Array.from(mergedMap.values()));
      }
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
        containerWidth - 200
      );
      const newSummaryWidth = containerWidth - newTreeWidth - 8;
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

  const handleViewModeToggle = () => {
    if (viewMode === 'tree') {
      if (productionChain) {
        const allNodes = collectAllNodes(productionChain);
        const consumptionData = calculateConsumption(allNodes);
        const accumulated = accumulateNodes(allNodes, itemsMap, recipesMap);
        
        const mergedNodes = accumulated.map(node => ({
          ...node,
          nodeIds: node.sourceNodes,
          recipe: node.recipeId ? recipesMap.get(node.recipeId) || null : null,
          machineCount: 1,
          efficiency: 100,
          itemId: node.itemId,
          rate: node.rate,
          children: node.children,
          totalRate: node.rate + (node.manualRate || 0),
          manualRate: node.manualRate || 0,
          consumption: consumptionData.get(node.itemId)
        }));
        setMergedNodes(mergedNodes);
      }
      setViewMode('list');
    } else {
      setViewMode('tree');
    }
  };

  const enhanceProductionNode = (node: ProductionNode): ProductionNodeUI => {
    const item = items.find(i => i.id === node.itemId);
    const availableRecipes = recipes.filter(r => 
      Object.keys(r.out).includes(node.itemId)
    );

    if (!item) {
      throw new Error(`Item with id ${node.itemId} not found`);
    }

    return {
      ...node,
      availableRecipes,
      item,
      children: node.children.map(child => enhanceProductionNode(child))
    };
  };

  return {
    // State
    items,
    recipes,
    calculator,
    targetItems,
    productionChain,
    collapsedNodes,
    detailLevel,
    machineOverrides,
    summaryMode,
    isDragging,
    treePanelWidth,
    resourceSummary,
    manualRates,
    viewMode,
    mergedNodes,
    itemsMap,
    recipesMap,
    productionResultRef,

    // Actions
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
    toggleNode,
    handleViewModeToggle,
    updateMergedNodes,
    enhanceProductionNode,
  };
} 