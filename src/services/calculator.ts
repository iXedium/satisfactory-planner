import { Item, Recipe, ProductionNode, ResourceSummary } from '../types/types';

export class ProductionCalculator {
  private items: Map<string, Item>;
  private recipes: Map<string, Recipe>;
  private processingStack: Set<string>; // Track items being processed to detect cycles

  constructor(items: Item[], recipes: Recipe[]) {
    this.items = new Map(items.map(item => [item.id, item]));
    this.recipes = new Map(recipes.map(recipe => [recipe.id, recipe]));
    this.processingStack = new Set();
  }

  calculateProduction(itemId: string, rate: number, recipeId?: string | null, manualRate: number = 0): ProductionNode {
    // Check for circular dependencies
    if (this.processingStack.has(itemId)) {
      console.warn(`Circular dependency detected for item: ${itemId}`);
      return {
        itemId,
        rate,
        manualRate,
        recipeId: null,
        children: []
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
        children: []
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
        children: []
      };
    }

    try {
      const node: ProductionNode = {
        itemId,
        rate,
        manualRate,
        recipeId: recipe?.id || null,
        children: []
      };

      // Use total rate for calculations
      const totalRate = rate + manualRate;
      const baseRate = recipe?.out[itemId] || 1;
      const multiplier = totalRate / baseRate;

      // Create child nodes for each input
      for (const [inputId, inputRate] of Object.entries(recipe?.in || {})) {
        node.children.push(
          this.calculateProduction(inputId, inputRate * multiplier, undefined, 0) // Add missing arguments
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
        children: []
      };
    }
  }

  updateRecipe(node: ProductionNode, itemId: string, newRecipeId: string): ProductionNode {
    if (node.itemId === itemId) {
      return this.calculateProduction(itemId, node.rate, newRecipeId, node.manualRate || 0);
    }

    return {
      ...node,
      children: node.children.map((child: ProductionNode) => 
        this.updateRecipe(child, itemId, newRecipeId)
      )
    };
  }

  updateManualRate(node: ProductionNode, itemId: string, manualRate: number): ProductionNode {
    if (node.itemId === itemId) {
      // Convert null to undefined when passing to calculateProduction
      return this.calculateProduction(itemId, node.rate, node.recipeId || undefined, manualRate);
    }

    return {
      ...node,
      children: node.children.map(child => this.updateManualRate(child, itemId, manualRate))
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
