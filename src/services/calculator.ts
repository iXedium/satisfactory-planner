import { Item, Recipe, ProductionNode, ResourceSummary, ProductionRelationship, ProductionPurpose } from '../types/types';

export class ProductionCalculator {
  private items: Map<string, Item>;
  private recipes: Map<string, Recipe>;
  private processingStack: Set<string>; // Track items being processed to detect cycles

  constructor(items: Item[], recipes: Recipe[]) {
    this.items = new Map(items.map(item => [item.id, item]));
    this.recipes = new Map(recipes.map(recipe => [recipe.id, recipe]));
    this.processingStack = new Set();
  }

  calculateProduction(itemId: string, rate: number, recipeId?: string | null, manualRate: number = 0, producedFor?: ProductionPurpose): ProductionNode {
    // Generate a unique ID for this node
    const nodeId = `${itemId}-${Math.random().toString(36).substr(2, 9)}`;

    // Create relationships data
    const relationships: ProductionRelationship = {
      producedFor: producedFor ? [producedFor] : [],
      totalProduction: rate + manualRate
    };

    // Check for circular dependencies
    if (this.processingStack.has(itemId)) {
      console.warn(`Circular dependency detected for item: ${itemId}`);
      return {
        itemId,
        rate,
        manualRate,
        recipeId: null,
        nodeId,  // Add the unique ID
        children: [],
        relationships
      };
    }

    this.processingStack.add(itemId);

    const item = this.items.get(itemId);
    if (!item) {
      console.warn(`Item ${itemId} not found`);
      this.processingStack.delete(itemId);
      return {
        itemId,
        rate,
        manualRate,
        recipeId: null,
        nodeId,  // Add the unique ID
        children: [],
        relationships
      };
    }

    // Use findBestRecipe instead of direct filtering
    const recipe = this.findBestRecipe(itemId, recipeId);

    if (!recipe) {
      console.warn(`No valid recipe found for ${itemId}`);
      this.processingStack.delete(itemId);
      return {
        itemId,
        rate,
        manualRate,
        recipeId: null,
        nodeId,  // Add the unique ID
        children: [],
        relationships
      };
    }

    try {
      const node: ProductionNode = {
        itemId,
        rate,
        manualRate,
        recipeId: recipe?.id || null,
        nodeId,  // Add the unique ID
        children: [],
        relationships
      };

      // Use total rate for calculations
      const totalRate = rate + manualRate;
      const baseRate = recipe?.out[itemId] || 1;
      const multiplier = totalRate / baseRate;

      // Create child nodes with relationship data
      for (const [inputId, inputRate] of Object.entries(recipe?.in || {})) {
        const childRate = inputRate * multiplier;
        const purpose: ProductionPurpose = {
          itemId: node.itemId,
          amount: childRate,
          nodeId: nodeId  // Using the parent's nodeId
        };
        
        node.children.push(
          this.calculateProduction(inputId, childRate, undefined, 0, purpose)
        );
      }

      this.processingStack.delete(itemId);
      return node;
    } catch (error) {
      console.error(`Error processing recipe for ${itemId}:`, error);
      this.processingStack.delete(itemId);
      return {
        itemId,
        rate,
        manualRate,
        recipeId: null,
        nodeId,  // Add the unique ID
        children: [],
        relationships
      };
    }
  }

  updateRecipe(node: ProductionNode, nodeId: string, newRecipeId: string): ProductionNode {
    if (node.nodeId === nodeId) {
      return this.calculateProduction(node.itemId, node.rate, newRecipeId, node.manualRate || 0);
    }

    return {
      ...node,
      nodeId: node.nodeId, // Preserve nodeId
      children: node.children.map(child => this.updateRecipe(child, nodeId, newRecipeId))
    };
  }

  updateManualRate(node: ProductionNode, nodeId: string, manualRate: number): ProductionNode {
    if (node.nodeId === nodeId) {
      // First, update this node's relationships to reflect new total production
      const newRelationships = {
        ...node.relationships!,
        totalProduction: node.rate + manualRate
      };

      // Create new node with updated manual rate and relationships
      const updatedNode = {
        ...node,
        manualRate,
        relationships: newRelationships,
        // Recalculate children with new total rate
        children: node.children.map(child => {
          const totalRate = node.rate + manualRate;
          const recipe = this.findBestRecipe(node.itemId, node.recipeId);
          const baseRate = recipe?.out[node.itemId] || 1;
          const multiplier = totalRate / baseRate;
          const childBaseRate = recipe?.in[child.itemId] || 0;
          const childRate = childBaseRate * multiplier;
          
          // Create new purpose for child with updated amount
          const purpose = {
            itemId: node.itemId,
            amount: childRate,
            nodeId: node.nodeId!
          };
          
          return this.calculateProduction(
            child.itemId,
            childRate,
            child.recipeId,
            child.manualRate,
            purpose
          );
        })
      };

      return updatedNode;
    }

    // If this isn't the target node, recursively update children
    return {
      ...node,
      nodeId: node.nodeId,
      children: node.children.map(child => this.updateManualRate(child, nodeId, manualRate))
    };
  }

  calculateTotalResources(node: ProductionNode): ResourceSummary {
    const resources: ResourceSummary = {};

    // Helper function to accumulate resources
    const addResource = (itemId: string, rate: number) => {
      resources[itemId] = (resources[itemId] || 0) + rate;
    };

    // Add this node's resource requirement
    addResource(node.itemId, node.rate);

    // Recursively process children
    for (const child of node.children) {
      const childResources = this.calculateTotalResources(child);
      // Combine child resources
      Object.entries(childResources).forEach(([itemId, rate]) => {
        addResource(itemId, rate);
      });
    }

    return resources;
  }

  private findBestRecipe(itemId: string, recipeId?: string | null): Recipe | null {
    // Get all valid recipes for this item
    const availableRecipes = Array.from(this.recipes.values())
      .filter(r => {
        return Object.keys(r.out).includes(itemId) && 
               !r.id.includes('excluded-') && 
               r.producers.length > 0;
      });

    if (availableRecipes.length === 0) return null;

    // If specific recipe requested, try to use it
    if (recipeId) {
      const requested = this.recipes.get(recipeId);
      if (requested && availableRecipes.includes(requested)) {
        return requested;
      }
    }

    // Try to find recipe with exactly matching ID
    const defaultRecipe = availableRecipes.find(r => r.id === itemId);
    if (defaultRecipe) {
      return defaultRecipe;
    }

    // Try to find recipe that starts with the item ID
    const alternativeRecipe = availableRecipes.find(r => r.id.startsWith(itemId));
    if (alternativeRecipe) {
      return alternativeRecipe;
    }

    // Fallback to first available recipe
    return availableRecipes[0];
  }

  private calculateNominalRate(recipe: Recipe, itemId: string): number {
    const baseOutputAmount = recipe.out[itemId] || 0;
    return (baseOutputAmount * 60) / recipe.time; // Convert to per minute
  }
}
