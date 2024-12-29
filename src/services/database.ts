// src/services/database.ts
import Dexie from 'dexie';
import { Item, Recipe } from '../types/types';

class Database extends Dexie {
  items!: Dexie.Table<Item, string>;  // Add ! to indicate definite assignment
  recipes!: Dexie.Table<Recipe, string>;  // Add ! to indicate definite assignment

  constructor() {
    super('SatisfactoryDB');
    
    // Initialize the tables
    this.version(1).stores({
      items: 'id, name, category',
      recipes: 'id, name'
    });

    // Define the tables
    this.items = this.table('items');
    this.recipes = this.table('recipes');
  }
}

export const db = new Database();
