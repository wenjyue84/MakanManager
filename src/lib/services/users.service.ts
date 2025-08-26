import { query } from '../database';
import { User, UserRole, UserDocument } from '../types';

export class UsersService {
  async getAllUsers(): Promise<User[]> {
    const result = await query(`
      SELECT
        id,
        name,
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
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
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
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
        name, email, password, roles, avatar, gender, phone, start_date,
        emergency_contact, status, photo, station, documents, points,
        weekly_points, monthly_points
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING
        id,
        name,
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
    `, [
      userData.name,
      userData.email,
      userData.password,
      userData.roles,
      userData.avatar,
      userData.gender,
      userData.phone,
      userData.startDate,
      userData.emergencyContact,
      userData.status,
      userData.photo,
      userData.station,
      JSON.stringify(userData.documents || []),
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
    if (userData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.password !== undefined) {
      fields.push(`password = $${paramCount++}`);
      values.push(userData.password);
    }
    if (userData.roles !== undefined) {
      fields.push(`roles = $${paramCount++}`);
      values.push(userData.roles);
    }
    if (userData.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(userData.avatar);
    }
    if (userData.gender !== undefined) {
      fields.push(`gender = $${paramCount++}`);
      values.push(userData.gender);
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
    if (userData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(userData.status);
    }
    if (userData.photo !== undefined) {
      fields.push(`photo = $${paramCount++}`);
      values.push(userData.photo);
    }
    if (userData.station !== undefined) {
      fields.push(`station = $${paramCount++}`);
      values.push(userData.station);
    }
    if (userData.documents !== undefined) {
      fields.push(`documents = $${paramCount++}`);
      values.push(JSON.stringify(userData.documents));
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
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
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
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
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
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"
    `, [id, pointsToAdd]);

    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  async uploadDocument(userId: string, document: UserDocument): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;
    const updatedDocs = [...(user.documents || []), document];
    const result = await query(
      `UPDATE users SET documents = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING
        id,
        name,
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"`,
      [userId, JSON.stringify(updatedDocs)]
    );
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  async deleteDocument(userId: string, documentId: string): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;
    const updatedDocs = (user.documents || []).filter(doc => doc.id !== documentId);
    const result = await query(
      `UPDATE users SET documents = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING
        id,
        name,
        email,
        password,
        roles,
        avatar,
        gender,
        phone,
        start_date as "startDate",
        emergency_contact as "emergencyContact",
        status,
        photo,
        station,
        documents,
        points,
        weekly_points as "weeklyPoints",
        monthly_points as "monthlyPoints"`,
      [userId, JSON.stringify(updatedDocs)]
    );
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      roles: row.roles,
      avatar: row.avatar,
      gender: row.gender,
      phone: row.phone,
      startDate: row.startDate,
      emergencyContact: row.emergencyContact,
      status: row.status,
      photo: row.photo,
      station: row.station,
      documents: row.documents || [],
      points: parseInt(row.points) || 0,
      weeklyPoints: parseInt(row.weeklyPoints) || 0,
      monthlyPoints: parseInt(row.monthlyPoints) || 0
    };
  }
}

export const usersService = new UsersService();