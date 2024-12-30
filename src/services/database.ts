// src/services/database.ts
import Dexie from 'dexie';
import { Item, Recipe } from '../types/types';
import data from '../data/data.json';

class Database extends Dexie {
  items!: Dexie.Table<Item, string>;
  recipes!: Dexie.Table<Recipe, string>;

  constructor() {
    super('SatisfactoryDB');
    
    this.version(1).stores({
      items: 'id, name, category',
      recipes: 'id, name'
    });
  }

  async initialize() {
    const itemCount = await this.items.count();
    const recipeCount = await this.recipes.count();

    // Only populate if tables are empty
    if (itemCount === 0) {
      console.log('Initializing items database...');
      await this.items.bulkAdd(data.items as Item[]);
    }

    if (recipeCount === 0) {
      console.log('Initializing recipes database...');
      
      // Validate and transform recipes
      const validRecipes = data.recipes.map(recipe => {
        // Ensure all required properties exist and are of correct type
        const transformedRecipe: Recipe = {
          id: String(recipe.id || ''),
          name: String(recipe.name || ''),
          producers: Array.isArray(recipe.producers) ? recipe.producers : [],
          time: Number(recipe.time || 0),
          in: {},
          out: {},
          cost: recipe.cost,
          row: recipe.row,
          category: recipe.category,
          flags: recipe.flags,
          usage: recipe.usage
        };

        // Convert input/output objects ensuring all values are numbers
        if (recipe.in && typeof recipe.in === 'object') {
          Object.entries(recipe.in).forEach(([key, value]) => {
            if (typeof value === 'number') {
              transformedRecipe.in[key] = value;
            }
          });
        }

        if (recipe.out && typeof recipe.out === 'object') {
          Object.entries(recipe.out).forEach(([key, value]) => {
            if (typeof value === 'number') {
              transformedRecipe.out[key] = value;
            }
          });
        }

        return transformedRecipe;
      });

      await this.recipes.bulkAdd(validRecipes);
    }
  }
}

export const db = new Database();

// Initialize database when the module is imported
db.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
});
