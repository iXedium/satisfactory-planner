// src/types/types.ts
export interface Item {
    id: string;
    name: string;
    category: string;
    row?: number;
    stack?: number;
    fuel?: {
      category: string;
      value: number;
    };
  }
  
  export interface Recipe {
    id: string;
    name: string;
    producers: string[];
    time: number;
    in: Record<string, number>;
    out: Record<string, number>;
    cost?: number;
    row?: number;
    category?: string;
    flags?: string[];
    usage?: number;
  }

  export interface ProductionChainNode {
    itemId: string;
    amount: number;
    recipe?: Recipe;  // Changed from any to Recipe
    inputs: ProductionChainNode[];
  }

  export interface ProductionNode {
    itemId: string;
    rate: number;
    recipeId: string | null;
    children: ProductionNode[];
  }

  export interface ProductionNodeUI extends ProductionNode {
    availableRecipes: Recipe[];
    item: Item;
  }

  export interface ResourceSummary {
    [itemId: string]: number;
  }

  export interface TargetItem {
    id: string;
    rate: number;
  }