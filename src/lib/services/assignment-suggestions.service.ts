import { Task, User, Station, UserRole } from '../types';

export interface AssignmentSuggestion {
  userId: string;
  score: number;
  reasons: string[];
  confidence: 'low' | 'medium' | 'high';
  workloadImpact: 'minimal' | 'moderate' | 'significant';
  estimatedCompletionTime: string;
}

export interface WorkloadMetrics {
  userId: string;
  activeTasks: number;
  avgCompletionRate: number;
  avgResponseTime: number; // in hours
  stationEfficiency: { [station: string]: number };
  skillRatings: { [skill: string]: number };
  recentPerformance: number; // 1-10 scale
  availability: number; // 0-100 percentage
}

export class AssignmentSuggestionsService {
  private workloadData: Map<string, WorkloadMetrics> = new Map();
  
  constructor() {
    // Initialize with mock data - in real app, this would come from database
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock workload data for demonstration
    const mockUsers = [
      'user-1', 'user-2', 'user-3', 'user-4', 'user-5', 
      'user-6', 'user-7', 'user-8', 'user-9', 'user-10'
    ];

    mockUsers.forEach(userId => {
      this.workloadData.set(userId, {
        userId,
        activeTasks: Math.floor(Math.random() * 10) + 1,
        avgCompletionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
        avgResponseTime: Math.floor(Math.random() * 12) + 2, // 2-14 hours
        stationEfficiency: {
          kitchen: Math.floor(Math.random() * 30) + 70,
          front: Math.floor(Math.random() * 30) + 70,
          store: Math.floor(Math.random() * 30) + 70,
          outdoor: Math.floor(Math.random() * 30) + 70,
        },
        skillRatings: {
          communication: Math.floor(Math.random() * 5) + 5,
          technical: Math.floor(Math.random() * 5) + 5,
          leadership: Math.floor(Math.random() * 5) + 3,
          efficiency: Math.floor(Math.random() * 5) + 5,
        },
        recentPerformance: Math.floor(Math.random() * 4) + 6, // 6-10 scale
        availability: Math.floor(Math.random() * 30) + 70 // 70-100%
      });
    });
  }

  async getSuggestionsForTask(task: Task, availableUsers: User[]): Promise<AssignmentSuggestion[]> {
    const suggestions: AssignmentSuggestion[] = [];

    for (const user of availableUsers) {
      const metrics = this.workloadData.get(user.id);
      if (!metrics) continue;

      const suggestion = this.calculateAssignmentScore(task, user, metrics);
      suggestions.push(suggestion);
    }

    // Sort by score descending
    return suggestions.sort((a, b) => b.score - a.score);
  }

  async getBulkSuggestions(tasks: Task[], availableUsers: User[]): Promise<Map<string, AssignmentSuggestion[]>> {
    const suggestions = new Map<string, AssignmentSuggestion[]>();

    for (const task of tasks) {
      const taskSuggestions = await this.getSuggestionsForTask(task, availableUsers);
      suggestions.set(task.id, taskSuggestions);
    }

    return suggestions;
  }

  private calculateAssignmentScore(task: Task, user: User, metrics: WorkloadMetrics): AssignmentSuggestion {
    const reasons: string[] = [];
    let score = 0;
    
    // Base score from user's overall performance
    score += metrics.recentPerformance * 10; // 60-100 points
    reasons.push(`Recent performance: ${metrics.recentPerformance}/10`);

    // Station matching bonus
    if (user.station === task.station) {
      const stationEfficiency = metrics.stationEfficiency[task.station] || 70;
      score += stationEfficiency * 0.3; // Up to 30 points
      reasons.push(`Station expertise: ${stationEfficiency}% efficiency in ${task.station}`);
    } else {
      score -= 15; // Penalty for station mismatch
      reasons.push(`Cross-station assignment (${user.station} → ${task.station})`);
    }

    // Workload factor
    const workloadFactor = this.calculateWorkloadFactor(metrics.activeTasks);
    score += workloadFactor.points;
    reasons.push(workloadFactor.reason);

    // Availability factor
    const availabilityBonus = (metrics.availability - 50) * 0.4; // -20 to +20 points
    score += availabilityBonus;
    if (metrics.availability > 80) {
      reasons.push(`High availability: ${metrics.availability}%`);
    } else if (metrics.availability < 60) {
      reasons.push(`Limited availability: ${metrics.availability}%`);
    }

    // Completion rate bonus
    const completionBonus = (metrics.avgCompletionRate - 70) * 0.5; // Up to 15 points
    score += completionBonus;
    if (metrics.avgCompletionRate > 85) {
      reasons.push(`Excellent completion rate: ${metrics.avgCompletionRate}%`);
    }

    // Response time factor
    const responseTimeFactor = Math.max(0, (24 - metrics.avgResponseTime) * 2); // Up to 44 points
    score += responseTimeFactor;
    if (metrics.avgResponseTime < 6) {
      reasons.push(`Quick response time: ${metrics.avgResponseTime}h average`);
    }

    // Role-based bonuses
    const roleBonus = this.getRoleBonus(user.roles, task);
    score += roleBonus.points;
    if (roleBonus.reason) {
      reasons.push(roleBonus.reason);
    }

    // Task complexity vs skill matching
    const skillMatchBonus = this.getSkillMatchBonus(task, metrics);
    score += skillMatchBonus.points;
    if (skillMatchBonus.reason) {
      reasons.push(skillMatchBonus.reason);
    }

    // Determine confidence and workload impact
    const confidence = this.determineConfidence(score, reasons.length);
    const workloadImpact = this.determineWorkloadImpact(metrics.activeTasks, task.basePoints);
    const estimatedCompletionTime = this.estimateCompletionTime(task, metrics);

    return {
      userId: user.id,
      score: Math.round(Math.max(0, score)),
      reasons: reasons.slice(0, 5), // Keep top 5 reasons
      confidence,
      workloadImpact,
      estimatedCompletionTime
    };
  }

  private calculateWorkloadFactor(activeTasks: number): { points: number; reason: string } {
    if (activeTasks <= 3) {
      return { points: 20, reason: `Light workload: ${activeTasks} active tasks` };
    } else if (activeTasks <= 6) {
      return { points: 10, reason: `Moderate workload: ${activeTasks} active tasks` };
    } else if (activeTasks <= 9) {
      return { points: -5, reason: `Heavy workload: ${activeTasks} active tasks` };
    } else {
      return { points: -20, reason: `Overloaded: ${activeTasks} active tasks` };
    }
  }

  private getRoleBonus(roles: UserRole[], task: Task): { points: number; reason?: string } {
    let bonus = 0;
    let reason: string | undefined;

    // Management roles get bonus for high-value tasks
    if (roles.includes('manager') || roles.includes('head-of-kitchen') || roles.includes('front-desk-manager')) {
      if (task.basePoints >= 50) {
        bonus = 15;
        reason = 'Management experience for high-value task';
      }
    }

    // Station-specific role bonuses
    if (roles.includes('head-of-kitchen') && task.station === 'kitchen') {
      bonus = 25;
      reason = 'Kitchen leadership role match';
    } else if (roles.includes('front-desk-manager') && task.station === 'front') {
      bonus = 25;
      reason = 'Front desk leadership role match';
    }

    return { points: bonus, reason };
  }

  private getSkillMatchBonus(task: Task, metrics: WorkloadMetrics): { points: number; reason?: string } {
    // Determine required skills based on task characteristics
    let requiredSkills: string[] = [];
    
    if (task.basePoints > 30) requiredSkills.push('technical');
    if (task.station === 'front') requiredSkills.push('communication');
    if (task.repeat) requiredSkills.push('efficiency');
    
    if (requiredSkills.length === 0) return { points: 0 };

    const skillScores = requiredSkills.map(skill => metrics.skillRatings[skill] || 5);
    const avgSkillScore = skillScores.reduce((a, b) => a + b, 0) / skillScores.length;
    
    const bonus = (avgSkillScore - 5) * 5; // Up to 25 points
    const reason = `Strong ${requiredSkills.join(' & ')} skills: ${avgSkillScore.toFixed(1)}/10`;
    
    return { points: bonus, reason: bonus > 5 ? reason : undefined };
  }

  private determineConfidence(score: number, reasonCount: number): 'low' | 'medium' | 'high' {
    if (score > 120 && reasonCount >= 4) return 'high';
    if (score > 80 && reasonCount >= 3) return 'medium';
    return 'low';
  }

  private determineWorkloadImpact(activeTasks: number, taskPoints: number): 'minimal' | 'moderate' | 'significant' {
    const impactScore = activeTasks + (taskPoints / 10);
    
    if (impactScore < 5) return 'minimal';
    if (impactScore < 10) return 'moderate';
    return 'significant';
  }

  private estimateCompletionTime(task: Task, metrics: WorkloadMetrics): string {
    const baseHours = Math.max(1, task.basePoints / 10);
    const efficiencyMultiplier = metrics.stationEfficiency[task.station] / 100 || 0.8;
    const workloadMultiplier = 1 + (metrics.activeTasks * 0.1);
    
    const estimatedHours = baseHours * workloadMultiplier / efficiencyMultiplier;
    
    if (estimatedHours < 2) return '< 2 hours';
    if (estimatedHours < 8) return `~${Math.round(estimatedHours)} hours`;
    if (estimatedHours < 24) return '< 1 day';
    return `~${Math.round(estimatedHours / 24)} days`;
  }

  // Method to update workload data (would be called when tasks are completed/assigned)
  async updateWorkloadMetrics(userId: string, updates: Partial<WorkloadMetrics>): Promise<void> {
    const existing = this.workloadData.get(userId);
    if (existing) {
      this.workloadData.set(userId, { ...existing, ...updates });
    }
  }

  // Method to get current workload overview
  async getWorkloadOverview(userIds: string[]): Promise<WorkloadMetrics[]> {
    return userIds
      .map(id => this.workloadData.get(id))
      .filter((metrics): metrics is WorkloadMetrics => metrics !== undefined);
  }
}

export const assignmentSuggestionsService = new AssignmentSuggestionsService();