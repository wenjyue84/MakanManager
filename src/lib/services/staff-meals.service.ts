import { query } from '../database';
import { StaffMeal } from '../types';

class StaffMealsService {
  private mapRow(row: any): StaffMeal {
    return {
      id: row.id,
      date: row.meal_date,
      time: row.meal_time,
      mealType: row.meal_type,
      dishName: row.dish_name,
      cookedBy: row.cooked_by,
      eaters: row.eaters || [],
      approximateCost: row.approximate_cost ? parseFloat(row.approximate_cost) : 0,
      photo: row.photo || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    };
  }

  async getAllMeals(): Promise<StaffMeal[]> {
    const result = await query(
      `SELECT id, meal_date, meal_time, meal_type, dish_name, cooked_by, eaters, approximate_cost, photo, notes, created_at FROM staff_meals ORDER BY created_at DESC`
    );
    return result.rows.map(this.mapRow);
  }

  async getMealById(id: string): Promise<StaffMeal | null> {
    const result = await query(
      `SELECT id, meal_date, meal_time, meal_type, dish_name, cooked_by, eaters, approximate_cost, photo, notes, created_at FROM staff_meals WHERE id = $1`,
      [id]
    );
    return result.rows.length ? this.mapRow(result.rows[0]) : null;
  }

  async createMeal(data: Omit<StaffMeal, 'id' | 'createdAt'>): Promise<StaffMeal> {
    const result = await query(
      `INSERT INTO staff_meals (meal_date, meal_time, meal_type, dish_name, cooked_by, eaters, approximate_cost, photo, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, meal_date, meal_time, meal_type, dish_name, cooked_by, eaters, approximate_cost, photo, notes, created_at`,
      [
        data.date,
        data.time,
        data.mealType,
        data.dishName,
        data.cookedBy,
        data.eaters,
        data.approximateCost,
        data.photo,
        data.notes
      ]
    );
    return this.mapRow(result.rows[0]);
  }

  async updateMeal(id: string, data: Partial<Omit<StaffMeal, 'id' | 'createdAt'>>): Promise<StaffMeal | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.date !== undefined) {
      fields.push(`meal_date = $${idx++}`);
      values.push(data.date);
    }
    if (data.time !== undefined) {
      fields.push(`meal_time = $${idx++}`);
      values.push(data.time);
    }
    if (data.mealType !== undefined) {
      fields.push(`meal_type = $${idx++}`);
      values.push(data.mealType);
    }
    if (data.dishName !== undefined) {
      fields.push(`dish_name = $${idx++}`);
      values.push(data.dishName);
    }
    if (data.cookedBy !== undefined) {
      fields.push(`cooked_by = $${idx++}`);
      values.push(data.cookedBy);
    }
    if (data.eaters !== undefined) {
      fields.push(`eaters = $${idx++}`);
      values.push(data.eaters);
    }
    if (data.approximateCost !== undefined) {
      fields.push(`approximate_cost = $${idx++}`);
      values.push(data.approximateCost);
    }
    if (data.photo !== undefined) {
      fields.push(`photo = $${idx++}`);
      values.push(data.photo);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return this.getMealById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE staff_meals SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, meal_date, meal_time, meal_type, dish_name, cooked_by, eaters, approximate_cost, photo, notes, created_at`,
      values
    );
    return result.rows.length ? this.mapRow(result.rows[0]) : null;
  }

  async deleteMeal(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM staff_meals WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }
}

export const staffMealsService = new StaffMealsService();
