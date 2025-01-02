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

  export interface ProductionPurpose {
    itemId: string;     // The item that consumes this production
    amount: number;     // How much is used for this consumer
    nodeId: string;     // The node ID of the consumer
    percentage?: number; // Will be calculated when needed
  }

  export interface ProductionRelationship {
    producedFor: ProductionPurpose[];
    totalProduction: number;  // Total amount produced
  }

  export interface ProductionNode {
    itemId: string;
    rate: number;
    recipeId: string | null;
    children: ProductionNode[];
    manualRate?: number;  // Add this new property
    nodeId?: string;  // Add this new property
    relationships?: ProductionRelationship;  // Add this to track why items are produced
  }

  export interface ProductionNodeUI extends ProductionNode {
    availableRecipes: Recipe[];
    item: Item;
    totalRate?: number;  // Add this to store calculated + manual rate
    consumption?: NodeConsumption;
  }

  export interface AccumulatedNodeUI extends ProductionNodeUI {
    sourceNodes: string[];  // Make this required
    isAccumulated: true;   // Make this required and always true
  }

  export interface ResourceSummary {
    [itemId: string]: number;
  }

  export interface TargetItem {
    id: string;
    rate: number;
  }

  export interface MergedNode extends ProductionNode {
    totalRate: number;
    manualRate: number;
    nodeIds: string[];
    item: Item;
    recipe: Recipe | null;
    machineCount: number;
    efficiency: number;
    rate: number;      // Required by ProductionNode
    children: ProductionNode[];  // Required by ProductionNode
  }

  export interface ViewMode {
    type: 'tree' | 'list';
  }

  export interface AccumulatedNode extends ProductionNode {
    sourceNodes: string[];  // Array of original nodeIds that make up this accumulated node
    totalRate: number;      // Sum of all accumulated rates
    totalManualRate: number; // Sum of all manual rates
  }

  export interface ConsumptionData {
    itemId: string;
    amount: number;
    percentage: number;
    percentageWithStorage: number;
  }

  export interface NodeConsumption {
    consumers: ConsumptionData[];
    storage: {
      amount: number;
      percentage: number;
    } | null;
    totalProduction: number;
  }