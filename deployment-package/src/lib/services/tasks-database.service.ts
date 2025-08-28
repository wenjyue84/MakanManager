import { PrismaClient } from '@prisma/client';
import { Task, TaskStatus, Station } from '../types';

const prisma = new PrismaClient();

export class TasksDatabaseService {
  async getAllTasks(): Promise<Task[]> {
    try {
      const dbTasks = await prisma.task.findMany({
        include: {
          assigner: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform database tasks to match our Task interface
      return dbTasks.map(dbTask => ({
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        station: dbTask.station as Station,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.dueAt.toISOString().split('T')[0], // Extract date part
        dueTime: dbTask.dueAt.toISOString().split('T')[1].substring(0, 5), // Extract time part
        basePoints: dbTask.points,
        assignerId: dbTask.assignerId,
        assigneeId: dbTask.assigneeId || undefined,
        proofType: dbTask.proofType as 'photo' | 'text' | 'checklist' | 'none',
        overdueDays: dbTask.overdueDays || 0,
        createdAt: dbTask.createdAt.toISOString(),
        updatedAt: dbTask.updatedAt.toISOString(),
        tags: [], // Not in current schema, can be added later
        attachments: [], // Will be populated from attachments relation
        comments: [], // Not in current schema, can be added later
        history: [] // Will be populated from TaskEvent relation
      }));
    } catch (error) {
      console.error('Database error fetching tasks:', error);
      throw new Error('Failed to fetch tasks from database');
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const dbTask = await prisma.task.findUnique({
        where: { id },
        include: {
          assigner: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      });

      if (!dbTask) return null;

      return {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        station: dbTask.station as Station,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.dueAt.toISOString().split('T')[0],
        dueTime: dbTask.dueAt.toISOString().split('T')[1].substring(0, 5),
        basePoints: dbTask.points,
        assignerId: dbTask.assignerId,
        assigneeId: dbTask.assigneeId || undefined,
        proofType: dbTask.proofType as 'photo' | 'text' | 'checklist' | 'none',
        overdueDays: dbTask.overdueDays || 0,
        createdAt: dbTask.createdAt.toISOString(),
        updatedAt: dbTask.updatedAt.toISOString(),
        tags: [],
        attachments: [],
        comments: [],
        history: []
      };
    } catch (error) {
      console.error('Database error fetching task:', error);
      throw new Error('Failed to fetch task from database');
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'overdueDays' | 'updatedAt'>): Promise<Task> {
    try {
      const dueAt = new Date(`${taskData.dueDate}T${taskData.dueTime}:00`);

      const dbTask = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          station: taskData.station,
          points: taskData.basePoints,
          dueAt,
          status: taskData.status,
          assignerId: taskData.assignerId,
          assigneeId: taskData.assigneeId,
          proofType: taskData.proofType,
          allowMultiplier: true // Default value
        },
        include: {
          assigner: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      });

      // Create task event for tracking
      await prisma.taskEvent.create({
        data: {
          taskId: dbTask.id,
          actorId: taskData.assignerId,
          type: 'Create',
          meta: {
            title: taskData.title,
            description: taskData.description,
            station: taskData.station,
            points: taskData.basePoints
          }
        }
      });

      return {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        station: dbTask.station as Station,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.dueAt.toISOString().split('T')[0],
        dueTime: dbTask.dueAt.toISOString().split('T')[1].substring(0, 5),
        basePoints: dbTask.points,
        assignerId: dbTask.assignerId,
        assigneeId: dbTask.assigneeId || undefined,
        proofType: dbTask.proofType as 'photo' | 'text' | 'checklist' | 'none',
        overdueDays: dbTask.overdueDays || 0,
        createdAt: dbTask.createdAt.toISOString(),
        updatedAt: dbTask.updatedAt.toISOString(),
        tags: [],
        attachments: [],
        comments: [],
        history: []
      };
    } catch (error) {
      console.error('Database error creating task:', error);
      throw new Error('Failed to create task in database');
    }
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
    try {
      const updateData: any = {};
      
      if (taskData.title) updateData.title = taskData.title;
      if (taskData.description) updateData.description = taskData.description;
      if (taskData.station) updateData.station = taskData.station;
      if (taskData.basePoints) updateData.points = taskData.basePoints;
      if (taskData.status) updateData.status = taskData.status;
      if (taskData.assigneeId !== undefined) updateData.assigneeId = taskData.assigneeId;
      if (taskData.proofType) updateData.proofType = taskData.proofType;
      
      if (taskData.dueDate && taskData.dueTime) {
        updateData.dueAt = new Date(`${taskData.dueDate}T${taskData.dueTime}:00`);
      }

      const dbTask = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          assigner: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        }
      });

      // Create task event for tracking
      await prisma.taskEvent.create({
        data: {
          taskId: dbTask.id,
          actorId: dbTask.assignerId, // Assuming the assigner is making the update
          type: 'Edit',
          meta: updateData
        }
      });

      return {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        station: dbTask.station as Station,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.dueAt.toISOString().split('T')[0],
        dueTime: dbTask.dueAt.toISOString().split('T')[1].substring(0, 5),
        basePoints: dbTask.points,
        assignerId: dbTask.assignerId,
        assigneeId: dbTask.assigneeId || undefined,
        proofType: dbTask.proofType as 'photo' | 'text' | 'checklist' | 'none',
        overdueDays: dbTask.overdueDays || 0,
        createdAt: dbTask.createdAt.toISOString(),
        updatedAt: dbTask.updatedAt.toISOString(),
        tags: [],
        attachments: [],
        comments: [],
        history: []
      };
    } catch (error) {
      console.error('Database error updating task:', error);
      throw new Error('Failed to update task in database');
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await prisma.task.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Database error deleting task:', error);
      throw new Error('Failed to delete task from database');
    }
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const dbTasks = await prisma.task.findMany({
        where: { status },
        include: {
          assigner: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        orderBy: [
          { dueAt: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return dbTasks.map(dbTask => ({
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        station: dbTask.station as Station,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.dueAt.toISOString().split('T')[0],
        dueTime: dbTask.dueAt.toISOString().split('T')[1].substring(0, 5),
        basePoints: dbTask.points,
        assignerId: dbTask.assignerId,
        assigneeId: dbTask.assigneeId || undefined,
        proofType: dbTask.proofType as 'photo' | 'text' | 'checklist' | 'none',
        overdueDays: dbTask.overdueDays || 0,
        createdAt: dbTask.createdAt.toISOString(),
        updatedAt: dbTask.updatedAt.toISOString(),
        tags: [],
        attachments: [],
        comments: [],
        history: []
      }));
    } catch (error) {
      console.error('Database error fetching tasks by status:', error);
      throw new Error('Failed to fetch tasks by status from database');
    }
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    try {
      const dbTasks = await prisma.task.findMany({
        where: { assigneeId },
        include: {
          assigner: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return dbTasks.map(dbTask => ({
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        station: dbTask.station as Station,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.dueAt.toISOString().split('T')[0],
        dueTime: dbTask.dueAt.toISOString().split('T')[1].substring(0, 5),
        basePoints: dbTask.points,
        assignerId: dbTask.assignerId,
        assigneeId: dbTask.assigneeId || undefined,
        proofType: dbTask.proofType as 'photo' | 'text' | 'checklist' | 'none',
        overdueDays: dbTask.overdueDays || 0,
        createdAt: dbTask.createdAt.toISOString(),
        updatedAt: dbTask.updatedAt.toISOString(),
        tags: [],
        attachments: [],
        comments: [],
        history: []
      }));
    } catch (error) {
      console.error('Database error fetching tasks by assignee:', error);
      throw new Error('Failed to fetch tasks by assignee from database');
    }
  }

  async getTasksByStation(station: Station): Promise<Task[]> {
    try {
      const dbTasks = await prisma.task.findMany({
        where: { station },
        include: {
          assigner: {
            select: {
              id: true,
              name: true,
              username: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        orderBy: [
          { dueAt: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return dbTasks.map(dbTask => ({
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        station: dbTask.station as Station,
        status: dbTask.status as TaskStatus,
        dueDate: dbTask.dueAt.toISOString().split('T')[0],
        dueTime: dbTask.dueAt.toISOString().split('T')[1].substring(0, 5),
        basePoints: dbTask.points,
        assignerId: dbTask.assignerId,
        assigneeId: dbTask.assigneeId || undefined,
        proofType: dbTask.proofType as 'photo' | 'text' | 'checklist' | 'none',
        overdueDays: dbTask.overdueDays || 0,
        createdAt: dbTask.createdAt.toISOString(),
        updatedAt: dbTask.updatedAt.toISOString(),
        tags: [],
        attachments: [],
        comments: [],
        history: []
      }));
    } catch (error) {
      console.error('Database error fetching tasks by station:', error);
      throw new Error('Failed to fetch tasks by station from database');
    }
  }

  async closeConnection(): Promise<void> {
    await prisma.$disconnect();
  }
}

export const tasksDatabaseService = new TasksDatabaseService();
