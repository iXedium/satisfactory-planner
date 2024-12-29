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

  calculateProduction(itemId: string, rate: number, recipeId?: string): ProductionNode {
    // Check for circular dependencies
    if (this.processingStack.has(itemId)) {
      console.warn(`Circular dependency detected for item: ${itemId}`);
      return {
        itemId,
        rate,
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
        recipeId: null,
        children: []
      };
    }

    // Filter out any excluded recipes from data.json
    const availableRecipes = Array.from(this.recipes.values())
      .filter(r => {
        return Object.keys(r.out).includes(itemId) && 
               !r.id.includes('excluded-') && // Add any other exclusion criteria
               r.producers.length > 0;
      });

    // Base case: treat as raw resource if no valid recipes
    if (availableRecipes.length === 0) {
      this.processingStack.delete(itemId);
      return {
        itemId,
        rate,
        recipeId: null,
        children: []
      };
    }

    // Use specified recipe or first available
    const recipe = recipeId ? 
      this.recipes.get(recipeId) : 
      availableRecipes[0];

    if (!recipe) {
      console.warn(`Recipe ${recipeId} not found for ${itemId}`);
      this.processingStack.delete(itemId);
      return {
        itemId,
        rate,
        recipeId: null,
        children: []
      };
    }

    try {
      const node: ProductionNode = {
        itemId,
        rate,
        recipeId: recipe.id,
        children: []
      };

      // Calculate input requirements
      const baseRate = recipe.out[itemId] || 1;
      const multiplier = rate / baseRate;

      // Create child nodes for each input
      for (const [inputId, inputRate] of Object.entries(recipe.in)) {
        node.children.push(
          this.calculateProduction(inputId, inputRate * multiplier)
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
        recipeId: null,
        children: []
      };
    }
  }

  updateRecipe(node: ProductionNode, itemId: string, newRecipeId: string): ProductionNode {
    if (node.itemId === itemId) {
      return this.calculateProduction(itemId, node.rate, newRecipeId);
    }

    return {
      ...node,
      children: node.children.map((child: ProductionNode) => 
        this.updateRecipe(child, itemId, newRecipeId)
      )
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
}
