import { query } from '../database';
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
    try {
      let sql = `
        SELECT 
          r.id,
          r.name,
          r.category,
          r.cuisine,
          r.station,
          r.yield,
          r.prep_time as "prepTimeMinutes",
          r.tags,
          r.photo,
          r.ingredients,
          r.steps,
          r.allergens,
          r.notes,
          r.created_at as "createdAt",
          r.updated_at as "updatedAt",
          u.name as "lastUpdatedBy"
        FROM recipes r
        LEFT JOIN users u ON r.updated_by = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.category && filters.category !== 'all') {
        sql += ` AND r.category = $${paramIndex++}`;
        params.push(filters.category);
      }

      if (filters?.cuisine && filters.cuisine !== 'all') {
        sql += ` AND r.cuisine = $${paramIndex++}`;
        params.push(filters.cuisine);
      }

      if (filters?.station && filters.station !== 'all') {
        sql += ` AND r.station = $${paramIndex++}`;
        params.push(filters.station);
      }

      if (filters?.search) {
        sql += ` AND (
          r.name ILIKE $${paramIndex} OR 
          r.ingredients::text ILIKE $${paramIndex} OR
          r.tags::text ILIKE $${paramIndex}
        )`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters?.tags && filters.tags.length > 0) {
        sql += ` AND r.tags && $${paramIndex++}`;
        params.push(filters.tags);
      }

      sql += ` ORDER BY r.updated_at DESC`;

      const result = await query(sql, params);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        cuisine: row.cuisine,
        station: row.station,
        yield: row.yield,
        prepTimeMinutes: row.prepTimeMinutes,
        tags: row.tags || [],
        photo: row.photo,
        ingredients: row.ingredients || [],
        steps: row.steps || [],
        allergens: row.allergens || [],
        attachments: [], // TODO: Implement attachments table
        notes: row.notes || '',
        lastUpdatedBy: row.lastUpdatedBy || 'Unknown',
        lastUpdatedDate: row.updatedAt ? new Date(row.updatedAt).toISOString().split('T')[0] : 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw new Error('Failed to fetch recipes');
    }
  }

  /**
   * Get a single recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const sql = `
        SELECT 
          r.id,
          r.name,
          r.category,
          r.cuisine,
          r.station,
          r.yield,
          r.prep_time as "prepTimeMinutes",
          r.tags,
          r.photo,
          r.ingredients,
          r.steps,
          r.allergens,
          r.notes,
          r.created_at as "createdAt",
          r.updated_at as "updatedAt",
          u.name as "lastUpdatedBy"
        FROM recipes r
        LEFT JOIN users u ON r.updated_by = u.id
        WHERE r.id = $1
      `;
      
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      return {
        id: row.id,
        name: row.name,
        category: row.category,
        cuisine: row.cuisine,
        station: row.station,
        yield: row.yield,
        prepTimeMinutes: row.prepTimeMinutes,
        tags: row.tags || [],
        photo: row.photo,
        ingredients: row.ingredients || [],
        steps: row.steps || [],
        allergens: row.allergens || [],
        attachments: [], // TODO: Implement attachments table
        notes: row.notes || '',
        lastUpdatedBy: row.lastUpdatedBy || 'Unknown',
        lastUpdatedDate: row.updatedAt ? new Date(row.updatedAt).toISOString().split('T')[0] : 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw new Error('Failed to fetch recipe');
    }
  }

  /**
   * Create a new recipe
   */
  static async createRecipe(recipeData: CreateRecipeData): Promise<Recipe> {
    try {
      const sql = `
        INSERT INTO recipes (
          name, category, cuisine, station, yield, prep_time, 
          tags, photo, ingredients, steps, allergens, notes, 
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13
        ) RETURNING id, created_at, updated_at
      `;
      
      const params = [
        recipeData.name,
        recipeData.category,
        recipeData.cuisine,
        recipeData.station,
        recipeData.yield,
        recipeData.prepTimeMinutes,
        recipeData.tags,
        recipeData.photo || null,
        JSON.stringify(recipeData.ingredients),
        recipeData.steps.map(s => s.instruction),
        recipeData.allergens,
        recipeData.notes,
        currentUser.id
      ];

      const result = await query(sql, params);
      const newId = result.rows[0].id;
      
      // Return the created recipe
      const createdRecipe = await this.getRecipeById(newId);
      if (!createdRecipe) {
        throw new Error('Failed to retrieve created recipe');
      }
      
      return createdRecipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw new Error('Failed to create recipe');
    }
  }

  /**
   * Update an existing recipe
   */
  static async updateRecipe(id: string, recipeData: UpdateRecipeData): Promise<Recipe | null> {
    try {
      // First check if recipe exists
      const existingRecipe = await this.getRecipeById(id);
      if (!existingRecipe) {
        return null;
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (recipeData.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        params.push(recipeData.name);
      }

      if (recipeData.category !== undefined) {
        updateFields.push(`category = $${paramIndex++}`);
        params.push(recipeData.category);
      }

      if (recipeData.cuisine !== undefined) {
        updateFields.push(`cuisine = $${paramIndex++}`);
        params.push(recipeData.cuisine);
      }

      if (recipeData.station !== undefined) {
        updateFields.push(`station = $${paramIndex++}`);
        params.push(recipeData.station);
      }

      if (recipeData.yield !== undefined) {
        updateFields.push(`yield = $${paramIndex++}`);
        params.push(recipeData.yield);
      }

      if (recipeData.prepTimeMinutes !== undefined) {
        updateFields.push(`prep_time = $${paramIndex++}`);
        params.push(recipeData.prepTimeMinutes);
      }

      if (recipeData.tags !== undefined) {
        updateFields.push(`tags = $${paramIndex++}`);
        params.push(recipeData.tags);
      }

      if (recipeData.photo !== undefined) {
        updateFields.push(`photo = $${paramIndex++}`);
        params.push(recipeData.photo);
      }

      if (recipeData.ingredients !== undefined) {
        updateFields.push(`ingredients = $${paramIndex++}`);
        params.push(JSON.stringify(recipeData.ingredients));
      }

      if (recipeData.steps !== undefined) {
        updateFields.push(`steps = $${paramIndex++}`);
        params.push(recipeData.steps.map(s => s.instruction));
      }

      if (recipeData.allergens !== undefined) {
        updateFields.push(`allergens = $${paramIndex++}`);
        params.push(recipeData.allergens);
      }

      if (recipeData.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        params.push(recipeData.notes);
      }

      // Add updated_by and updated_at
      updateFields.push(`updated_by = $${paramIndex++}`);
      params.push(currentUser.id);

      // Add the recipe ID
      params.push(id);

      const sql = `
        UPDATE recipes 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id
      `;

      await query(sql, params);
      
      // Return the updated recipe
      return await this.getRecipeById(id);
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw new Error('Failed to update recipe');
    }
  }

  /**
   * Delete a recipe
   */
  static async deleteRecipe(id: string): Promise<boolean> {
    try {
      const sql = 'DELETE FROM recipes WHERE id = $1 RETURNING id';
      const result = await query(sql, [id]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw new Error('Failed to delete recipe');
    }
  }

  /**
   * Bulk delete recipes
   */
  static async bulkDeleteRecipes(ids: string[]): Promise<{ success: string[], failed: string[] }> {
    try {
      const success: string[] = [];
      const failed: string[] = [];

      for (const id of ids) {
        try {
          const deleted = await this.deleteRecipe(id);
          if (deleted) {
            success.push(id);
          } else {
            failed.push(id);
          }
        } catch (error) {
          failed.push(id);
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Error in bulk delete:', error);
      throw new Error('Failed to bulk delete recipes');
    }
  }

  /**
   * Get recipe statistics
   */
  static async getRecipeStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byCuisine: Record<string, number>;
    byStation: Record<string, number>;
    recentUpdates: number;
  }> {
    try {
      const totalResult = await query('SELECT COUNT(*) as count FROM recipes');
      const total = parseInt(totalResult.rows[0].count);

      const categoryResult = await query(`
        SELECT category, COUNT(*) as count 
        FROM recipes 
        GROUP BY category
      `);
      
      const byCategory: Record<string, number> = {};
      categoryResult.rows.forEach(row => {
        byCategory[row.category] = parseInt(row.count);
      });

      const cuisineResult = await query(`
        SELECT cuisine, COUNT(*) as count 
        FROM recipes 
        GROUP BY cuisine
      `);
      
      const byCuisine: Record<string, number> = {};
      cuisineResult.rows.forEach(row => {
        byCuisine[row.cuisine] = parseInt(row.count);
      });

      const stationResult = await query(`
        SELECT station, COUNT(*) as count 
        FROM recipes 
        GROUP BY station
      `);
      
      const byStation: Record<string, number> = {};
      stationResult.rows.forEach(row => {
        byStation[row.station] = parseInt(row.count);
      });

      const recentResult = await query(`
        SELECT COUNT(*) as count 
        FROM recipes 
        WHERE updated_at >= CURRENT_DATE - INTERVAL '7 days'
      `);
      const recentUpdates = parseInt(recentResult.rows[0].count);

      return {
        total,
        byCategory,
        byCuisine,
        byStation,
        recentUpdates
      };
    } catch (error) {
      console.error('Error fetching recipe stats:', error);
      throw new Error('Failed to fetch recipe statistics');
    }
  }

  /**
   * Search recipes with advanced filtering
   */
  static async searchRecipes(query: string, filters?: {
    category?: string;
    cuisine?: string;
    station?: string;
    tags?: string[];
    prepTimeMax?: number;
    allergens?: string[];
  }): Promise<Recipe[]> {
    try {
      let sql = `
        SELECT 
          r.id,
          r.name,
          r.category,
          r.cuisine,
          r.station,
          r.yield,
          r.prep_time as "prepTimeMinutes",
          r.tags,
          r.photo,
          r.ingredients,
          r.steps,
          r.allergens,
          r.notes,
          r.created_at as "createdAt",
          r.updated_at as "updatedAt",
          u.name as "lastUpdatedBy"
        FROM recipes r
        LEFT JOIN users u ON r.updated_by = u.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      // Text search
      if (query) {
        sql += ` AND (
          r.name ILIKE $${paramIndex} OR 
          r.ingredients::text ILIKE $${paramIndex} OR
          r.tags::text ILIKE $${paramIndex} OR
          r.notes ILIKE $${paramIndex}
        )`;
        params.push(`%${query}%`);
        paramIndex++;
      }

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        sql += ` AND r.category = $${paramIndex++}`;
        params.push(filters.category);
      }

      if (filters?.cuisine && filters.cuisine !== 'all') {
        sql += ` AND r.cuisine = $${paramIndex++}`;
        params.push(filters.cuisine);
      }

      if (filters?.station && filters.station !== 'all') {
        sql += ` AND r.station = $${paramIndex++}`;
        params.push(filters.station);
      }

      if (filters?.tags && filters.tags.length > 0) {
        sql += ` AND r.tags && $${paramIndex++}`;
        params.push(filters.tags);
      }

      if (filters?.prepTimeMax) {
        sql += ` AND r.prep_time <= $${paramIndex++}`;
        params.push(filters.prepTimeMax);
      }

      if (filters?.allergens && filters.allergens.length > 0) {
        sql += ` AND r.allergens && $${paramIndex++}`;
        params.push(filters.allergens);
      }

      sql += ` ORDER BY r.updated_at DESC`;

      const result = await query(sql, params);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        cuisine: row.cuisine,
        station: row.station,
        yield: row.yield,
        prepTimeMinutes: row.prepTimeMinutes,
        tags: row.tags || [],
        photo: row.photo,
        ingredients: row.ingredients || [],
        steps: row.steps || [],
        allergens: row.allergens || [],
        attachments: [],
        notes: row.notes || '',
        lastUpdatedBy: row.lastUpdatedBy || 'Unknown',
        lastUpdatedDate: row.updatedAt ? new Date(row.updatedAt).toISOString().split('T')[0] : 'Unknown'
      }));
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw new Error('Failed to search recipes');
    }
  }
}
