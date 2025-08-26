import { query } from '../database';
import {
  Recipe,
  RecipeIngredient,
  RecipeStep,
  RecipeAttachment

} from '../types';
import { jsPDF } from 'jspdf';


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
  /** Map database row to Recipe object */
  private static mapRowToRecipe(row: any): Recipe {
    const steps: RecipeStep[] = (row.steps || []).map((instruction: string, index: number) => ({
      step: index + 1,
      instruction
    }));

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      cuisine: row.cuisine,
      station: row.station,
      yield: row.yield,
      prepTimeMinutes: row.prep_time,
      tags: row.tags || [],
      photo: row.photo || undefined,
      ingredients: row.ingredients || [],
      steps,
      allergens: row.allergens || [],
      attachments: row.attachments || [],
      notes: row.notes || '',
      lastUpdatedBy: row.updated_by_name || row.updated_by,
      lastUpdatedDate: row.updated_at
        ? new Date(row.updated_at).toISOString()
        : undefined
    } as Recipe;
  }

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
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters?.category && filters.category !== 'all') {
      conditions.push(`r.category = $${idx++}`);
      values.push(filters.category);
    }
    if (filters?.cuisine && filters.cuisine !== 'all') {
      conditions.push(`r.cuisine = $${idx++}`);
      values.push(filters.cuisine);
    }
    if (filters?.station && filters.station !== 'all') {
      conditions.push(`r.station = $${idx++}`);
      values.push(filters.station);
    }
    if (filters?.search) {
      conditions.push(`LOWER(r.name) LIKE $${idx++}`);
      values.push(`%${filters.search.toLowerCase()}%`);
    }
    if (filters?.tags && filters.tags.length > 0) {
      conditions.push(`r.tags && $${idx++}::text[]`);
      values.push(filters.tags);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT r.*, u.name AS updated_by_name
       FROM recipes r
       LEFT JOIN users u ON r.updated_by = u.id
       ${whereClause}
       ORDER BY r.created_at DESC`,
      values
    );

    return result.rows.map(this.mapRowToRecipe);
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe | null> {
    const result = await query(
      `SELECT r.*, u.name AS updated_by_name
       FROM recipes r
       LEFT JOIN users u ON r.updated_by = u.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows.length ? this.mapRowToRecipe(result.rows[0]) : null;
  }

  /**
   * Create a new recipe
   */
  static async createRecipe(
    data: CreateRecipeData,
    user: Pick<User, 'id' | 'name'>
  ): Promise<Recipe> {
    const stepTexts = data.steps.map(s => s.instruction);

    const result = await query(
      `INSERT INTO recipes (
         name, category, cuisine, station, yield, prep_time, tags,
         photo, ingredients, steps, allergens, notes, created_by, updated_by
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13, $14
       ) RETURNING *`,
      [
        data.name,
        data.category,
        data.cuisine,
        data.station,
        data.yield,
        data.prepTimeMinutes,
        data.tags,
        data.photo || null,
        JSON.stringify(data.ingredients),
        stepTexts,
        data.allergens,
        data.notes,
        user.id,
        user.id
      ]
    );

    const row = result.rows[0];
    row.updated_by_name = user.name;
    return this.mapRowToRecipe(row);
  }

  /**
   * Update an existing recipe
   */
  static async updateRecipe(
    id: string,
    data: UpdateRecipeData,
    user: Pick<User, 'id' | 'name'>
  ): Promise<Recipe | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(data.category);
    }
    if (data.cuisine !== undefined) {
      fields.push(`cuisine = $${idx++}`);
      values.push(data.cuisine);
    }
    if (data.station !== undefined) {
      fields.push(`station = $${idx++}`);
      values.push(data.station);
    }
    if (data.yield !== undefined) {
      fields.push(`yield = $${idx++}`);
      values.push(data.yield);
    }
    if (data.prepTimeMinutes !== undefined) {
      fields.push(`prep_time = $${idx++}`);
      values.push(data.prepTimeMinutes);
    }
    if (data.tags !== undefined) {
      fields.push(`tags = $${idx++}`);
      values.push(data.tags);
    }
    if (data.photo !== undefined) {
      fields.push(`photo = $${idx++}`);
      values.push(data.photo);
    }
    if (data.ingredients !== undefined) {
      fields.push(`ingredients = $${idx++}`);
      values.push(JSON.stringify(data.ingredients));
    }
    if (data.steps !== undefined) {
      fields.push(`steps = $${idx++}`);
      values.push(data.steps.map(s => s.instruction));
    }
    if (data.allergens !== undefined) {
      fields.push(`allergens = $${idx++}`);
      values.push(data.allergens);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return this.getRecipeById(id);
    }

    fields.push(`updated_by = $${idx++}`);
    values.push(user.id);
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE recipes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    row.updated_by_name = user.name;
    return this.mapRowToRecipe(row);
  }

  /**
   * Delete a recipe
   */
  static async deleteRecipe(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM recipes WHERE id = $1`, [id]);
    return result.rowCount > 0;
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
    const result = await query(`SELECT category, cuisine, station FROM recipes`);
    const stats = {
      total: result.rowCount,
      byCategory: {} as Record<string, number>,
      byCuisine: {} as Record<string, number>,
      byStation: {} as Record<string, number>
    };

    result.rows.forEach(row => {
      stats.byCategory[row.category] = (stats.byCategory[row.category] || 0) + 1;
      stats.byCuisine[row.cuisine] = (stats.byCuisine[row.cuisine] || 0) + 1;
      stats.byStation[row.station] = (stats.byStation[row.station] || 0) + 1;
    });

    return stats;
  }

  /**
   * Generate printable PDF for a recipe
   */
  static async printRecipe(id: string): Promise<Uint8Array | null> {
    const recipe = await this.getRecipeById(id);
    if (!recipe) return null;

    const doc = new jsPDF({ format: 'a4' });
    doc.setFontSize(18);
    doc.text(recipe.name, 20, 30);

    let y = 50;
    doc.setFontSize(12);
    doc.text(`Yield: ${recipe.yield}`, 20, y);
    y += 20;

    doc.text('Ingredients:', 20, y);
    y += 20;
    recipe.ingredients.forEach(ing => {
      doc.text(`- ${ing.quantity} ${ing.unit} ${ing.name}`, 30, y);
      y += 15;
    });

    y += 10;
    doc.text('Steps:', 20, y);
    y += 20;
    recipe.steps.forEach(step => {
      doc.text(`${step.step}. ${step.instruction}`, 30, y);
      y += 15;
    });

    return doc.output('arraybuffer');
  }
}

