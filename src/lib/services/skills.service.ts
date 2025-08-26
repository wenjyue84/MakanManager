import { query } from '../database';
import { Skill } from '../types';

export class SkillsService {
  async getAll(): Promise<Skill[]> {
    const result = await query(
      `SELECT id, name, category, description, created_at as "createdAt", updated_at as "updatedAt" FROM skills ORDER BY name`
    );
    return result.rows;
  }

  async getById(id: string): Promise<Skill | null> {
    const result = await query(
      `SELECT id, name, category, description, created_at as "createdAt", updated_at as "updatedAt" FROM skills WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Skill> {
    const result = await query(
      `INSERT INTO skills (name, category, description) VALUES ($1,$2,$3) RETURNING id, name, category, description, created_at as "createdAt", updated_at as "updatedAt"`,
      [data.name, data.category, data.description]
    );
    return result.rows[0];
  }

  async update(
    id: string,
    data: Partial<Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Skill | null> {
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
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (fields.length === 0) return this.getById(id);
    values.push(id);
    const result = await query(
      `UPDATE skills SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, name, category, description, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM skills WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }
}

export default SkillsService;
