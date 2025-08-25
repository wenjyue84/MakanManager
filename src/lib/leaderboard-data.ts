import { User } from './types';

export interface LeaderboardEntry {
  user: User;
  rank: number;
  points: number;
  trend: 'up' | 'down' | 'same';
  trendDelta: number;
  tasksCompleted: number;
  avgApprovalTime: number; // in hours
  topStation: string;
  isTied?: boolean;
}

export interface LeaderboardData {
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

// Sample leaderboard data as specified in requirements
export const leaderboardData: LeaderboardData = {
  weekly: [
    {
      user: {
        id: '2',
        name: 'Simon',
        roles: ['manager'],
        avatar: '👨‍💻',
        phone: '+60123456791',
        startDate: '2020-03-10',
        emergencyContact: '+60123456792',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        station: 'front',
        points: 2200,
        weeklyPoints: 820,
        monthlyPoints: 1100
      },
      rank: 1,
      points: 820,
      trend: 'up',
      trendDelta: 120,
      tasksCompleted: 34,
      avgApprovalTime: 2.0,
      topStation: 'front'
    },
    {
      user: {
        id: '3',
        name: 'Lily',
        roles: ['head-of-kitchen'],
        avatar: '👩‍🍳',
        phone: '+60123456793',
        startDate: '2020-05-20',
        emergencyContact: '+60123456794',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b723ff83?w=100&h=100&fit=crop&crop=face',
        station: 'kitchen',
        points: 2100,
        weeklyPoints: 790,
        monthlyPoints: 1050
      },
      rank: 2,
      points: 790,
      trend: 'up',
      trendDelta: 80,
      tasksCompleted: 28,
      avgApprovalTime: 1.5,
      topStation: 'kitchen'
    },
    {
      user: {
        id: '5',
        name: 'Bahar',
        roles: ['staff'],
        avatar: '👨‍🍳',
        phone: '+60123456797',
        startDate: '2021-02-15',
        emergencyContact: '+60123456798',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        station: 'kitchen',
        points: 1800,
        weeklyPoints: 720,
        monthlyPoints: 900
      },
      rank: 3,
      points: 720,
      trend: 'up',
      trendDelta: 200,
      tasksCompleted: 26,
      avgApprovalTime: 3.0,
      topStation: 'kitchen'
    },
    {
      user: {
        id: '6',
        name: 'Ros',
        roles: ['staff'],
        avatar: '👩‍🍳',
        phone: '+60123456799',
        startDate: '2021-04-10',
        emergencyContact: '+60123456800',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
        station: 'front',
        points: 1600,
        weeklyPoints: 640,
        monthlyPoints: 750
      },
      rank: 4,
      points: 640,
      trend: 'same',
      trendDelta: 0,
      tasksCompleted: 22,
      avgApprovalTime: 2.5,
      topStation: 'front'
    },
    {
      user: {
        id: '7',
        name: 'Ana',
        roles: ['staff'],
        avatar: '👩',
        phone: '+60123456801',
        startDate: '2021-06-05',
        emergencyContact: '+60123456802',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        station: 'store',
        points: 1550,
        weeklyPoints: 610,
        monthlyPoints: 780
      },
      rank: 5,
      points: 610,
      trend: 'down',
      trendDelta: -40,
      tasksCompleted: 20,
      avgApprovalTime: 2.0,
      topStation: 'store'
    },
    {
      user: {
        id: '8',
        name: 'Islam',
        roles: ['staff'],
        avatar: '👨',
        phone: '+60123456803',
        startDate: '2021-08-20',
        emergencyContact: '+60123456804',
        photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
        station: 'kitchen',
        points: 1400,
        weeklyPoints: 560,
        monthlyPoints: 650
      },
      rank: 6,
      points: 560,
      trend: 'up',
      trendDelta: 60,
      tasksCompleted: 19,
      avgApprovalTime: 3.5,
      topStation: 'kitchen'
    },
    {
      user: {
        id: '9',
        name: 'Mya Sai',
        roles: ['staff'],
        avatar: '👩',
        phone: '+60123456805',
        startDate: '2021-10-15',
        emergencyContact: '+60123456806',
        photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
        station: 'front',
        points: 1300,
        weeklyPoints: 540,
        monthlyPoints: 600
      },
      rank: 7,
      points: 540,
      trend: 'up',
      trendDelta: 10,
      tasksCompleted: 18,
      avgApprovalTime: 2.0,
      topStation: 'front'
    },
    {
      user: {
        id: '4',
        name: 'Sherry',
        roles: ['front-desk-manager'],
        avatar: '👩‍💼',
        phone: '+60123456795',
        startDate: '2020-07-12',
        emergencyContact: '+60123456796',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        station: 'front',
        points: 1950,
        weeklyPoints: 520,
        monthlyPoints: 980
      },
      rank: 8,
      points: 520,
      trend: 'up',
      trendDelta: 30,
      tasksCompleted: 16,
      avgApprovalTime: 2.0,
      topStation: 'front'
    },
    {
      user: {
        id: '1',
        name: 'Jay',
        roles: ['owner'],
        avatar: '👨‍💼',
        phone: '+60123456789',
        startDate: '2020-01-15',
        emergencyContact: '+60123456790',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        station: 'outdoor',
        points: 2500,
        weeklyPoints: 500,
        monthlyPoints: 1200
      },
      rank: 9,
      points: 500,
      trend: 'same',
      trendDelta: 0,
      tasksCompleted: 10,
      avgApprovalTime: 1.0,
      topStation: 'outdoor'
    },
    {
      user: {
        id: '10',
        name: 'New Staff',
        roles: ['staff'],
        avatar: '👨‍🍳',
        phone: '+60123456810',
        startDate: '2024-01-15',
        emergencyContact: '+60123456811',
        photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
        station: 'store',
        points: 480,
        weeklyPoints: 480,
        monthlyPoints: 520
      },
      rank: 10,
      points: 480,
      trend: 'up',
      trendDelta: 50,
      tasksCompleted: 15,
      avgApprovalTime: 4.0,
      topStation: 'store'
    }
  ],
  monthly: [
    {
      user: {
        id: '1',
        name: 'Jay',
        roles: ['owner'],
        avatar: '👨‍💼',
        phone: '+60123456789',
        startDate: '2020-01-15',
        emergencyContact: '+60123456790',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        station: 'outdoor',
        points: 2500,
        weeklyPoints: 500,
        monthlyPoints: 1200
      },
      rank: 1,
      points: 1200,
      trend: 'up',
      trendDelta: 150,
      tasksCompleted: 45,
      avgApprovalTime: 1.0,
      topStation: 'outdoor'
    },
    {
      user: {
        id: '2',
        name: 'Simon',
        roles: ['manager'],
        avatar: '👨‍💻',
        phone: '+60123456791',
        startDate: '2020-03-10',
        emergencyContact: '+60123456792',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        station: 'front',
        points: 2200,
        weeklyPoints: 820,
        monthlyPoints: 1100
      },
      rank: 2,
      points: 1100,
      trend: 'up',
      trendDelta: 200,
      tasksCompleted: 42,
      avgApprovalTime: 2.0,
      topStation: 'front'
    },
    {
      user: {
        id: '3',
        name: 'Lily',
        roles: ['head-of-kitchen'],
        avatar: '👩‍🍳',
        phone: '+60123456793',
        startDate: '2020-05-20',
        emergencyContact: '+60123456794',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b723ff83?w=100&h=100&fit=crop&crop=face',
        station: 'kitchen',
        points: 2100,
        weeklyPoints: 790,
        monthlyPoints: 1050
      },
      rank: 3,
      points: 1050,
      trend: 'up',
      trendDelta: 100,
      tasksCompleted: 38,
      avgApprovalTime: 1.5,
      topStation: 'kitchen'
    },
    {
      user: {
        id: '4',
        name: 'Sherry',
        roles: ['front-desk-manager'],
        avatar: '👩‍💼',
        phone: '+60123456795',
        startDate: '2020-07-12',
        emergencyContact: '+60123456796',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        station: 'front',
        points: 1950,
        weeklyPoints: 520,
        monthlyPoints: 980
      },
      rank: 4,
      points: 980,
      trend: 'up',
      trendDelta: 80,
      tasksCompleted: 35,
      avgApprovalTime: 2.0,
      topStation: 'front'
    },
    {
      user: {
        id: '5',
        name: 'Bahar',
        roles: ['staff'],
        avatar: '👨‍🍳',
        phone: '+60123456797',
        startDate: '2021-02-15',
        emergencyContact: '+60123456798',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        station: 'kitchen',
        points: 1800,
        weeklyPoints: 720,
        monthlyPoints: 900
      },
      rank: 5,
      points: 900,
      trend: 'up',
      trendDelta: 250,
      tasksCompleted: 32,
      avgApprovalTime: 3.0,
      topStation: 'kitchen'
    }
    // Additional entries would continue...
  ],
  allTime: [
    {
      user: {
        id: '1',
        name: 'Jay',
        roles: ['owner'],
        avatar: '👨‍💼',
        phone: '+60123456789',
        startDate: '2020-01-15',
        emergencyContact: '+60123456790',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        station: 'outdoor',
        points: 2500,
        weeklyPoints: 500,
        monthlyPoints: 1200
      },
      rank: 1,
      points: 2500,
      trend: 'up',
      trendDelta: 300,
      tasksCompleted: 180,
      avgApprovalTime: 1.0,
      topStation: 'outdoor'
    },
    {
      user: {
        id: '2',
        name: 'Simon',
        roles: ['manager'],
        avatar: '👨‍💻',
        phone: '+60123456791',
        startDate: '2020-03-10',
        emergencyContact: '+60123456792',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        station: 'front',
        points: 2200,
        weeklyPoints: 820,
        monthlyPoints: 1100
      },
      rank: 2,
      points: 2200,
      trend: 'up',
      trendDelta: 400,
      tasksCompleted: 165,
      avgApprovalTime: 2.0,
      topStation: 'front'
    },
    {
      user: {
        id: '3',
        name: 'Lily',
        roles: ['head-of-kitchen'],
        avatar: '👩‍🍳',
        phone: '+60123456793',
        startDate: '2020-05-20',
        emergencyContact: '+60123456794',
        photo: 'https://images.unsplash.com/photo-1494790108755-2616b723ff83?w=100&h=100&fit=crop&crop=face',
        station: 'kitchen',
        points: 2100,
        weeklyPoints: 790,
        monthlyPoints: 1050
      },
      rank: 3,
      points: 2100,
      trend: 'up',
      trendDelta: 200,
      tasksCompleted: 158,
      avgApprovalTime: 1.5,
      topStation: 'kitchen'
    }
    // Additional entries would continue...
  ]
};

// Helper function to get user's rank in a specific period
export const getUserRank = (userId: string, period: 'weekly' | 'monthly' | 'allTime'): LeaderboardEntry | null => {
  return leaderboardData[period].find(entry => entry.user.id === userId) || null;
};

// Helper function to get total active users
export const getTotalActiveUsers = (period: 'weekly' | 'monthly' | 'allTime'): number => {
  // Simulate total active users beyond top 10
  const baseCounts = { weekly: 37, monthly: 42, allTime: 47 };
  return baseCounts[period];
};

// Simulate user not in top 10 scenario for Bahar in monthly view
export const baharMonthlyRank = {
  rank: 14,
  totalActive: 37,
  points: 390,
  trendDelta: 110,
  nextRewardAt: 1000
};