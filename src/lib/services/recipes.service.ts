// Frontend-safe version - no database dependencies
import { Recipe, RecipeIngredient, RecipeStep, RecipeAttachment } from '../recipes-data';
import { currentUser } from '../data';

export interface CreateRecipeData {
  name: string;
  category: 'main-dish' | 'soup' | 'beverage' | 'sauce-condiment';
  cuisine: 'malaysian' | 'thai' | 'indonesian';
  station: 'kitchen' | 'front' | 'store' | 'outdoor';
  yield: string;
  prepTimeMinutes: number;
  tags: string[];
  photo?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  allergens: ('shellfish' | 'dairy' | 'gluten' | 'nuts' | 'soy' | 'egg')[];
  notes: string;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}

export class RecipeService {
  /**
   * Get all recipes with optional filtering
   */
  static async getAllRecipes(filters?: {
    category?: string;
    cuisine?: string;
    station?: string;
    tags?: string[];
    search?: string;
  }): Promise<Recipe[]> {
    // Mock implementation for frontend
    return new Promise((resolve) => {
      setTimeout(() => {
        // Import recipes data dynamically to avoid circular dependencies
        import('../recipes-data').then(({ recipes }) => {
          let filteredRecipes = [...recipes];
          
          if (filters?.category && filters.category !== 'all') {
            filteredRecipes = filteredRecipes.filter(r => r.category === filters.category);
          }
          
          if (filters?.cuisine && filters.cuisine !== 'all') {
            filteredRecipes = filteredRecipes.filter(r => r.cuisine === filters.cuisine);
          }
          
          if (filters?.station && filters.station !== 'all') {
            filteredRecipes = filteredRecipes.filter(r => r.station === filters.station);
          }
          
          if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            filteredRecipes = filteredRecipes.filter(r => 
              r.name.toLowerCase().includes(searchLower) ||
              r.ingredients.some(i => i.name.toLowerCase().includes(searchLower)) ||
              r.tags.some(t => t.toLowerCase().includes(searchLower))
            );
          }
          
          if (filters?.tags && filters.tags.length > 0) {
            filteredRecipes = filteredRecipes.filter(r => 
              filters.tags!.some(tag => r.tags.includes(tag))
            );
          }
          
          resolve(filteredRecipes);
        });
      }, 100);
    });
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        import('../recipes-data').then(({ recipes }) => {
          const recipe = recipes.find(r => r.id === id);
          resolve(recipe || null);
        });
      }, 100);
    });
  }

  /**
   * Create a new recipe
   */
  static async createRecipe(data: CreateRecipeData): Promise<Recipe> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecipe: Recipe = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: currentUser.name,
          attachments: []
        };
        resolve(newRecipe);
      }, 100);
    });
  }

  /**
   * Update an existing recipe
   */
  static async updateRecipe(data: UpdateRecipeData): Promise<Recipe> {
    return new Promise((resolve) => {
      setTimeout(() => {
        import('../recipes-data').then(({ recipes }) => {
          const existingRecipe = recipes.find(r => r.id === data.id);
          if (!existingRecipe) {
            throw new Error('Recipe not found');
          }
          
          const updatedRecipe: Recipe = {
            ...existingRecipe,
            ...data,
            updatedAt: new Date().toISOString(),
            lastUpdatedBy: currentUser.name
          };
          resolve(updatedRecipe);
        });
      }, 100);
    });
  }

  /**
   * Delete a recipe
   */
  static async deleteRecipe(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
  }

  /**
   * Get recipe statistics
   */
  static async getRecipeStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byCuisine: Record<string, number>;
    byStation: Record<string, number>;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        import('../recipes-data').then(({ recipes }) => {
          const stats = {
            total: recipes.length,
            byCategory: {} as Record<string, number>,
            byCuisine: {} as Record<string, number>,
            byStation: {} as Record<string, number>
          };
          
          recipes.forEach(recipe => {
            stats.byCategory[recipe.category] = (stats.byCategory[recipe.category] || 0) + 1;
            stats.byCuisine[recipe.cuisine] = (stats.byCuisine[recipe.cuisine] || 0) + 1;
            stats.byStation[recipe.station] = (stats.byStation[recipe.station] || 0) + 1;
          });
          
          resolve(stats);
        });
      }, 100);
    });
  }
}
