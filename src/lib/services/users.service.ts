import { query } from '../database';
import { User, UserRole } from '../types';

export class UsersService {
  async getAllUsers(): Promise<User[]> {
    const result = await query(`
      SELECT 
        id,
        name,
        roles,
        avatar,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        photo,
        station,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
      FROM users 
      ORDER BY points DESC
    `);
    
    return result.rows.map(this.mapRowToUser);
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await query(`
      SELECT 
        id,
        name,
        roles,
        avatar,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        photo,
        station,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
      FROM users 
      WHERE id = $1
    `, [id]);

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const result = await query(`
      INSERT INTO users (
        name, roles, avatar, phone, start_date, 
        emergency_contact, photo, station, points, 
        weekly_points, monthly_points
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id,
        name,
        roles,
        avatar,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        photo,
        station,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
    `, [
      userData.name,
      userData.roles,
      userData.avatar,
      userData.phone,
      userData.startDate,
      userData.emergencyContact,
      userData.photo,
      userData.station,
      userData.points || 0,
      userData.weeklyPoints || 0,
      userData.monthlyPoints || 0
    ]);

    return this.mapRowToUser(result.rows[0]);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (userData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(userData.name);
    }
    if (userData.roles !== undefined) {
      fields.push(`roles = $${paramCount++}`);
      values.push(userData.roles);
    }
    if (userData.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(userData.avatar);
    }
    if (userData.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(userData.phone);
    }
    if (userData.startDate !== undefined) {
      fields.push(`start_date = $${paramCount++}`);
      values.push(userData.startDate);
    }
    if (userData.emergencyContact !== undefined) {
      fields.push(`emergency_contact = $${paramCount++}`);
      values.push(userData.emergencyContact);
    }
    if (userData.photo !== undefined) {
      fields.push(`photo = $${paramCount++}`);
      values.push(userData.photo);
    }
    if (userData.station !== undefined) {
      fields.push(`station = $${paramCount++}`);
      values.push(userData.station);
    }
    if (userData.points !== undefined) {
      fields.push(`points = $${paramCount++}`);
      values.push(userData.points);
    }
    if (userData.weeklyPoints !== undefined) {
      fields.push(`weekly_points = $${paramCount++}`);
      values.push(userData.weeklyPoints);
    }
    if (userData.monthlyPoints !== undefined) {
      fields.push(`monthly_points = $${paramCount++}`);
      values.push(userData.monthlyPoints);
    }

    if (fields.length === 0) {
      return this.getUserById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(`
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        name,
        roles,
        avatar,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        photo,
        station,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
    `, values);

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const result = await query(`
      SELECT 
        id,
        name,
        roles,
        avatar,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        photo,
        station,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
      FROM users 
      WHERE $1 = ANY(roles)
      ORDER BY points DESC
    `, [role]);

    return result.rows.map(this.mapRowToUser);
  }

  async updateUserPoints(id: string, pointsToAdd: number): Promise<User | null> {
    const result = await query(`
      UPDATE users 
      SET 
        points = points + $2,
        weekly_points = weekly_points + $2,
        monthly_points = monthly_points + $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        name,
        roles,
        avatar,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        photo,
        station,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
    `, [id, pointsToAdd]);

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      roles: row.roles,
      avatar: row.avatar,
      phone: row.phone,
      startDate: row.startDate,
      emergencyContact: row.emergencyContact,
      photo: row.photo,
      station: row.station,
      points: parseInt(row.points) || 0,
      weeklyPoints: parseInt(row.weeklyPoints) || 0,
      monthlyPoints: parseInt(row.monthlyPoints) || 0
    };
  }
}

export const usersService = new UsersService();