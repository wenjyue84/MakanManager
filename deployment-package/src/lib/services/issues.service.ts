import { query } from '../database';
import { Station } from '../types';
import { getCategoryDefaultPoints } from '../operations-data';
import { tasksService } from './tasks.service';
import { usersService } from './users.service';

export interface Issue {
  id: string;
  issueNumber: string;
  title: string;
  category: 'complaint' | 'hygiene' | 'wastage' | 'recipe' | 'disciplinary' | 'stock-out';
  station: Station;
  description: string;
  reportedBy: string;
  targetStaff?: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  defaultPoints: number;
  managerExtra: number;
  ownerExtra: number;
  totalPoints: number;
  appliedBy?: string;
  appliedAt?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApplyPointsData {
  managerExtra: number;
  ownerExtra: number;
  newStatus: Issue['status'];
  appliedBy: string;
}

export class IssuesService {
  private mapRowToIssue(row: any): Issue {
    return {
      id: row.id,
      issueNumber: row.issueNumber,
      title: row.title,
      category: row.category,
      station: row.station,
      description: row.description,
      reportedBy: row.reportedBy,
      targetStaff: row.targetStaff || undefined,
      status: row.status,
      defaultPoints: parseInt(row.defaultPoints) || 0,
      managerExtra: parseInt(row.managerExtra) || 0,
      ownerExtra: parseInt(row.ownerExtra) || 0,
      totalPoints: parseInt(row.totalPoints) || 0,
      appliedBy: row.appliedBy || undefined,
      appliedAt: row.appliedAt || undefined,
      attachments: row.attachments || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getAllIssues(): Promise<Issue[]> {
    const result = await query(`
      SELECT
        id,
        issue_number as "issueNumber",
        title,
        category,
        station,
        description,
        reported_by_id as "reportedBy",
        target_staff_id as "targetStaff",
        status,
        default_points as "defaultPoints",
        manager_extra as "managerExtra",
        owner_extra as "ownerExtra",
        total_points as "totalPoints",
        applied_by_id as "appliedBy",
        applied_at as "appliedAt",
        attachments,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM issues
      ORDER BY created_at DESC
    `);

    return result.rows.map((row: any) => this.mapRowToIssue(row));
  }

  async getIssueById(id: string): Promise<Issue | null> {
    const result = await query(`
      SELECT
        id,
        issue_number as "issueNumber",
        title,
        category,
        station,
        description,
        reported_by_id as "reportedBy",
        target_staff_id as "targetStaff",
        status,
        default_points as "defaultPoints",
        manager_extra as "managerExtra",
        owner_extra as "ownerExtra",
        total_points as "totalPoints",
        applied_by_id as "appliedBy",
        applied_at as "appliedAt",
        attachments,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM issues
      WHERE id = $1
    `,[id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToIssue(result.rows[0]);
  }

  async createIssue(data: {
    issueNumber: string;
    title: string;
    category: Issue['category'];
    station: Station;
    description: string;
    reportedBy: string;
    targetStaff?: string;
    photo?: string;
  }): Promise<Issue> {
    const defaultPoints = getCategoryDefaultPoints(data.category);
    const result = await query(`
      INSERT INTO issues (
        issue_number, title, category, station, description,
        reported_by_id, target_staff_id, status,
        default_points, manager_extra, owner_extra, total_points, photo
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,'open',$8,0,0,$8,$9)
      RETURNING
        id,
        issue_number as "issueNumber",
        title,
        category,
        station,
        description,
        reported_by_id as "reportedBy",
        target_staff_id as "targetStaff",
        status,
        default_points as "defaultPoints",
        manager_extra as "managerExtra",
        owner_extra as "ownerExtra",
        total_points as "totalPoints",
        applied_by_id as "appliedBy",
        applied_at as "appliedAt",
        attachments,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `,[
      data.issueNumber,
      data.title,
      data.category,
      data.station,
      data.description,
      data.reportedBy,
      data.targetStaff || null,
      defaultPoints,
      data.photo || null
    ]);
    return this.mapRowToIssue(result.rows[0]);
  }

  async applyPoints(id: string, data: ApplyPointsData): Promise<Issue | null> {
    const result = await query(`
      UPDATE issues
      SET
        manager_extra = $2,
        owner_extra = $3,
        total_points = default_points + $2 + $3,
        status = $4,
        applied_by_id = $5,
        applied_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id,
        issue_number as "issueNumber",
        title,
        category,
        station,
        description,
        reported_by_id as "reportedBy",
        target_staff_id as "targetStaff",
        status,
        default_points as "defaultPoints",
        manager_extra as "managerExtra",
        owner_extra as "ownerExtra",
        total_points as "totalPoints",
        applied_by_id as "appliedBy",
        applied_at as "appliedAt",
        attachments,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `,[id, data.managerExtra, data.ownerExtra, data.newStatus, data.appliedBy]);

    if (result.rows.length === 0) return null;
    const issue = this.mapRowToIssue(result.rows[0]);

    if (issue.targetStaff) {
      await usersService.updateUserPoints(issue.targetStaff, issue.totalPoints);
    }

    return issue;
  }

  async createTaskFromIssue(id: string, taskData: {
    assignerId: string;
    assigneeId?: string;
    dueDate?: string;
    dueTime?: string;
  }) {
    const issue = await this.getIssueById(id);
    if (!issue) return null;

    const task = await tasksService.createTask({
      title: issue.title,
      description: issue.description,
      station: issue.station,
      status: 'open',
      dueDate: taskData.dueDate || new Date().toISOString().slice(0,10),
      dueTime: taskData.dueTime || '09:00',
      basePoints: Math.abs(issue.defaultPoints),
      finalPoints: undefined,
      multiplier: undefined,
      adjustment: undefined,
      assignerId: taskData.assignerId,
      assigneeId: taskData.assigneeId,
      proofType: 'none',
      proofData: undefined,
      repeat: undefined,
      overdueDays: 0,
      createdAt: new Date().toISOString(),
    } as any);

    return task;
  }
}

export const issuesService = new IssuesService();
