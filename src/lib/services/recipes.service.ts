import {
  Recipe,
  RecipeIngredient,
  RecipeStep,
  RecipeAttachment,
  User
} from '../types';
import { recipes } from '../recipes-data';
import { jsPDF } from 'jspdf';


export interface CreateRecipeData {
  name: string;
  category: 'main-dish' | 'soup' | 'beverage' | 'sauce-condiment';
  cuisine: 'malaysian' | 'thai' | 'indonesian';
  station: 'kitchen' | 'front' | 'store' | 'outdoor';
  yield: string;
  prepTimeMinutes: number;
  tags: string[];
  photo: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  allergens: ('shellfish' | 'dairy' | 'gluten' | 'nuts' | 'soy' | 'egg')[];
  notes: string;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}

export interface RecipeFilters {
  category?: 'all' | 'main-dish' | 'soup' | 'beverage' | 'sauce-condiment';
  cuisine?: 'all' | 'malaysian' | 'thai' | 'indonesian';
  station?: 'all' | 'kitchen' | 'front' | 'store' | 'outdoor';
  search?: string;
  tags?: string[];
}

export class RecipeService {
  /**
   * Get all recipes without filtering
   */
  static async getAllRecipes(): Promise<Recipe[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...recipes]);
      }, 100);
    });
  }

  /**
   * Get recipes with optional filtering
   */
  static async getRecipes(filters?: RecipeFilters): Promise<Recipe[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredRecipes = [...recipes];

        // Apply filters
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
            r.notes?.toLowerCase().includes(searchLower)
          );
        }
        if (filters?.tags && filters.tags.length > 0) {
          filteredRecipes = filteredRecipes.filter(r => 
            filters.tags!.some(tag => r.tags.includes(tag))
          );
        }

        resolve(filteredRecipes);
      }, 100);
    });
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recipe = recipes.find(r => r.id === id);
        resolve(recipe || null);
      }, 50);
    });
  }

  /**
   * Create a new recipe
   */
  static async createRecipe(
    data: CreateRecipeData,
    user: Pick<User, 'id' | 'name'>
  ): Promise<Recipe> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecipe: Recipe = {
          id: `recipe-${Date.now()}`,
          name: data.name,
          category: data.category,
          cuisine: data.cuisine,
          station: data.station,
          yield: data.yield,
          prepTimeMinutes: data.prepTimeMinutes,
          tags: data.tags,
          photo: data.photo,
          ingredients: data.ingredients,
          steps: data.steps,
          allergens: data.allergens,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.id,
          updatedBy: user.id,
          updatedByName: user.name
        };
        resolve(newRecipe);
      }, 100);
    });
  }

  /**
   * Update recipe
   */
  static async updateRecipe(
    id: string,
    data: Partial<CreateRecipeData>,
    user: Pick<User, 'id' | 'name'>
  ): Promise<Recipe> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingRecipe = recipes.find(r => r.id === id);
        if (!existingRecipe) {
          reject(new Error('Recipe not found'));
          return;
        }

        const updatedRecipe: Recipe = {
          ...existingRecipe,
          ...data,
          id: existingRecipe.id,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id,
          updatedByName: user.name
        };

        resolve(updatedRecipe);
      }, 100);
    });
  }

  /**
   * Delete recipe
   */
  static async deleteRecipe(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real implementation, this would actually delete the recipe
        // For demo purposes, we just return success
        resolve(true);
      }, 50);
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
            byCategory: {},
            byCuisine: {},
            byStation: {}
          };

          recipes.forEach(recipe => {
            // Count by category
            stats.byCategory[recipe.category] = (stats.byCategory[recipe.category] || 0) + 1;
            
            // Count by cuisine
            stats.byCuisine[recipe.cuisine] = (stats.byCuisine[recipe.cuisine] || 0) + 1;
            
            // Count by station
            stats.byStation[recipe.station] = (stats.byStation[recipe.station] || 0) + 1;
          });

          resolve(stats);
        });
      }, 100);
    });
  }

  /**
   * Export recipes to PDF
   */
  static async exportRecipesToPDF(recipes: Recipe[]): Promise<void> {
    const pdf = new jsPDF();
    let currentY = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const marginBottom = 20;

    pdf.setFontSize(20);
    pdf.text('Recipe Collection', 20, currentY);
    currentY += 20;

    recipes.forEach((recipe, index) => {
      // Check if we need a new page
      if (currentY > pageHeight - marginBottom - 60) {
        pdf.addPage();
        currentY = 20;
      }

      // Recipe title
      pdf.setFontSize(16);
      pdf.text(`${index + 1}. ${recipe.name}`, 20, currentY);
      currentY += 10;

      // Recipe details
      pdf.setFontSize(10);
      pdf.text(`Category: ${recipe.category}`, 20, currentY);
      currentY += 7;
      pdf.text(`Cuisine: ${recipe.cuisine}`, 20, currentY);
      currentY += 7;
      pdf.text(`Station: ${recipe.station}`, 20, currentY);
      currentY += 7;
      pdf.text(`Yield: ${recipe.yield}`, 20, currentY);
      currentY += 7;
      pdf.text(`Prep Time: ${recipe.prepTimeMinutes} minutes`, 20, currentY);
      currentY += 15;

      // Ingredients
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        pdf.setFontSize(12);
        pdf.text('Ingredients:', 20, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        recipe.ingredients.forEach(ingredient => {
          pdf.text(`• ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`, 25, currentY);
          currentY += 7;
        });
        currentY += 5;
      }

      // Steps
      if (recipe.steps && recipe.steps.length > 0) {
        pdf.setFontSize(12);
        pdf.text('Steps:', 20, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        recipe.steps.forEach((step, stepIndex) => {
          const stepText = `${stepIndex + 1}. ${step.instruction}`;
          const lines = pdf.splitTextToSize(stepText, 170);
          lines.forEach(line => {
            pdf.text(line, 25, currentY);
            currentY += 7;
          });
        });
        currentY += 10;
      }

      currentY += 10; // Space between recipes
    });

    pdf.save('recipes.pdf');
  }

  /**
   * Bulk delete recipes
   */
  static async bulkDeleteRecipes(ids: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real implementation, this would actually delete the recipes
        // For demo purposes, we just return success
        resolve(true);
      }, 200);
    });
  }
}