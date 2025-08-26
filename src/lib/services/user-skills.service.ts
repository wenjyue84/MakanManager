import { query } from '../database';
import { UserSkill } from '../types';
import { PointEntriesService } from './point-entries.service';

const SKILL_AWARD_DEFAULT = 50;

export class UserSkillsService {
  private pointEntries = new PointEntriesService();

  private mapRow(row: any): UserSkill {
    return {
      id: row.id,
      userId: row.user_id,
      skillId: row.skill_id,
      level: row.level,
      verified: row.verified,
      verifiedBy: row.verified_by,
      verifiedDate: row.verified_date,
      requestedVerification: row.requested_verification,
      isExclusive: row.is_exclusive,
      notes: row.notes,
      pointsAwarded: row.points_awarded,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getAll(): Promise<UserSkill[]> {
    const result = await query(
      `SELECT id, user_id, skill_id, level, verified, verified_by, verified_date, requested_verification, is_exclusive, notes, points_awarded, created_at, updated_at FROM user_skills`
    );
    return result.rows.map((r: any) => this.mapRow(r));
  }

  async getById(id: string): Promise<UserSkill | null> {
    const result = await query(
      `SELECT id, user_id, skill_id, level, verified, verified_by, verified_date, requested_verification, is_exclusive, notes, points_awarded, created_at, updated_at FROM user_skills WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(data: {
    userId: string;
    skillId: string;
    level: string;
    isExclusive?: boolean;
    notes?: string;
  }): Promise<UserSkill> {
    const result = await query(
      `INSERT INTO user_skills (user_id, skill_id, level, is_exclusive, notes) VALUES ($1,$2,$3,$4,$5) RETURNING id, user_id, skill_id, level, verified, verified_by, verified_date, requested_verification, is_exclusive, notes, points_awarded, created_at, updated_at`,
      [data.userId, data.skillId, data.level, data.isExclusive || false, data.notes || null]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(id: string, updates: Partial<UserSkill>): Promise<UserSkill | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (updates.level !== undefined) {
      fields.push(`level = $${idx++}`);
      values.push(updates.level);
    }
    if (updates.verified !== undefined) {
      fields.push(`verified = $${idx++}`);
      values.push(updates.verified);
    }
    if (updates.verifiedBy !== undefined) {
      fields.push(`verified_by = $${idx++}`);
      values.push(updates.verifiedBy);
    }
    if (updates.verifiedDate !== undefined) {
      fields.push(`verified_date = $${idx++}`);
      values.push(updates.verifiedDate);
    }
    if (updates.requestedVerification !== undefined) {
      fields.push(`requested_verification = $${idx++}`);
      values.push(updates.requestedVerification);
    }
    if (updates.isExclusive !== undefined) {
      fields.push(`is_exclusive = $${idx++}`);
      values.push(updates.isExclusive);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(updates.notes);
    }
    if (updates.pointsAwarded !== undefined) {
      fields.push(`points_awarded = $${idx++}`);
      values.push(updates.pointsAwarded);
    }
    if (fields.length === 0) return this.getById(id);
    values.push(id);
    const result = await query(
      `UPDATE user_skills SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, user_id, skill_id, level, verified, verified_by, verified_date, requested_verification, is_exclusive, notes, points_awarded, created_at, updated_at`,
      values
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM user_skills WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }

  async verify(id: string, verifierId: string, approve: boolean): Promise<UserSkill | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    if (!approve) {
      return this.update(id, { requestedVerification: false });
    }
    const updated = await this.update(id, {
      verified: true,
      verifiedBy: verifierId,
      verifiedDate: new Date().toISOString().split('T')[0],
      requestedVerification: false,
      pointsAwarded: existing.verified ? existing.pointsAwarded : SKILL_AWARD_DEFAULT,
    });
    if (updated && !existing.verified) {
      await this.pointEntries.create({
        userId: existing.userId,
        points: SKILL_AWARD_DEFAULT,
        reason: 'Skill verification',
      });
    }
    return updated;
  }
}

export default UserSkillsService;
