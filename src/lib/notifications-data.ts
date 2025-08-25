// Notifications Data Structure
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'task' | 'approval' | 'alert' | 'system' | 'staff' | 'cash' | 'issue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  timestamp: string;
  relatedId?: string; // ID of related order, task, etc.
  actionRequired?: boolean;
  actionText?: string;
  actionUrl?: string;
  fromUserId?: string;
  fromUserName?: string;
  data?: Record<string, any>; // Additional data for the notification
}

export interface NotificationGroup {
  category: string;
  icon: string;
  count: number;
  notifications: Notification[];
}

// Sample notifications data
export let notifications: Notification[] = [
  {
    id: '1',
    title: 'New Online Order',
    message: 'Order #ORD-007 received from Ahmad Rizal - RM32.50 (Grab Food)',
    type: 'order',
    priority: 'high',
    isRead: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    relatedId: 'ORD-007',
    actionRequired: true,
    actionText: 'View Order',
    actionUrl: 'online-orders',
    data: { orderAmount: 32.50, platform: 'grab-food', customerName: 'Ahmad Rizal' }
  },
  {
    id: '2',
    title: 'Cash Reconciliation Pending',
    message: 'Ros\'s afternoon shift reconciliation needs manager approval (RM6.50 shortage)',
    type: 'approval',
    priority: 'urgent',
    isRead: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    relatedId: 'CR-002',
    actionRequired: true,
    actionText: 'Review & Approve',
    actionUrl: 'cash',
    fromUserId: '8',
    fromUserName: 'Ros',
    data: { amount: -6.50, shift: 'afternoon' }
  },
  {
    id: '3',
    title: 'Task Overdue',
    message: 'Deep clean espresso machine is 2 hours overdue (assigned to Islam)',
    type: 'task',
    priority: 'high',
    isRead: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    relatedId: 'T-008',
    actionRequired: true,
    actionText: 'Check Progress',
    actionUrl: 'tasks',
    data: { assignee: 'Islam', hoursOverdue: 2 }
  },
  {
    id: '4',
    title: 'Staff Issue Reported',
    message: 'Sherry reported equipment malfunction in the kitchen area',
    type: 'issue',
    priority: 'medium',
    isRead: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    relatedId: 'ISS-003',
    actionRequired: true,
    actionText: 'View Issue',
    actionUrl: 'issues',
    fromUserId: '7',
    fromUserName: 'Sherry',
    data: { category: 'equipment', location: 'kitchen' }
  },
  {
    id: '5',
    title: 'Low Stock Alert',
    message: 'Arabica coffee beans running low (2 days remaining at current usage)',
    type: 'alert',
    priority: 'medium',
    isRead: false,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    actionRequired: true,
    actionText: 'Update Inventory',
    actionUrl: 'purchase-list',
    data: { item: 'Arabica coffee beans', daysRemaining: 2 }
  },
  {
    id: '6',
    title: 'New Staff Meal Request',
    message: 'Bahar requested Nasi Lemak for lunch break',
    type: 'staff',
    priority: 'low',
    isRead: true,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    relatedId: 'SM-015',
    actionText: 'View Request',
    actionUrl: 'staff-meal',
    fromUserId: '10',
    fromUserName: 'Bahar',
    data: { mealType: 'lunch', item: 'Nasi Lemak' }
  },
  {
    id: '7',
    title: 'Salary Advance Request',
    message: 'Thua requested RM500 advance for personal emergency',
    type: 'approval',
    priority: 'medium',
    isRead: true,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    relatedId: 'ADV-003',
    actionRequired: true,
    actionText: 'Review Request',
    actionUrl: 'salary',
    fromUserId: '6',
    fromUserName: 'Thua',
    data: { amount: 500, reason: 'personal emergency' }
  },
  {
    id: '8',
    title: 'Daily Sales Target Achieved',
    message: 'Congratulations! Today\'s sales target of RM2,500 has been exceeded by 15%',
    type: 'system',
    priority: 'low',
    isRead: true,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    data: { target: 2500, actual: 2875, percentage: 115 }
  },
  {
    id: '9',
    title: 'Recipe Updated',
    message: 'Teh Tarik recipe has been updated with new ingredient ratios',
    type: 'system',
    priority: 'low',
    isRead: true,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    relatedId: 'RCP-001',
    actionText: 'View Recipe',
    actionUrl: 'recipes',
    data: { recipeName: 'Teh Tarik' }
  },
  {
    id: '10',
    title: 'Order Ready for Pickup',
    message: 'Order #ORD-003 is ready for customer pickup (Rajesh Kumar)',
    type: 'order',
    priority: 'medium',
    isRead: true,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    relatedId: 'ORD-003',
    actionText: 'Mark Completed',
    actionUrl: 'online-orders',
    data: { customerName: 'Rajesh Kumar', orderType: 'pickup' }
  },
  {
    id: '11',
    title: 'System Maintenance Scheduled',
    message: 'POS system maintenance scheduled for tomorrow 2:00 AM - 4:00 AM',
    type: 'system',
    priority: 'medium',
    isRead: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    data: { maintenanceTime: '2:00 AM - 4:00 AM', date: 'tomorrow' }
  },
  {
    id: '12',
    title: 'Task Completed',
    message: 'Simon completed "Restock condiment station" task (+5 points)',
    type: 'task',
    priority: 'low',
    isRead: true,
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 1 day ago
    relatedId: 'T-005',
    fromUserId: '4',
    fromUserName: 'Simon',
    data: { pointsAwarded: 5, taskName: 'Restock condiment station' }
  }
];

// Helper functions for notifications management
export const addNotification = (newNotification: Omit<Notification, 'id'>): Notification => {
  const id = (Math.max(...notifications.map(n => parseInt(n.id)), 0) + 1).toString();
  const notification: Notification = { ...newNotification, id };
  notifications.unshift(notification); // Add to beginning for latest first
  return notification;
};

export const markAsRead = (id: string): boolean => {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
    return true;
  }
  return false;
};

export const markAllAsRead = (): void => {
  notifications.forEach(n => n.isRead = true);
};

export const deleteNotification = (id: string): boolean => {
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.splice(index, 1);
    return true;
  }
  return false;
};

export const getUnreadCount = (): number => {
  return notifications.filter(n => !n.isRead).length;
};

export const getNotificationsByType = (type: string): Notification[] => {
  return notifications.filter(n => n.type === type);
};

export const getNotificationsByPriority = (priority: string): Notification[] => {
  return notifications.filter(n => n.priority === priority);
};

export const getGroupedNotifications = (): NotificationGroup[] => {
  const groups: NotificationGroup[] = [
    {
      category: 'Orders',
      icon: 'package',
      count: 0,
      notifications: []
    },
    {
      category: 'Approvals',
      icon: 'clock',
      count: 0,
      notifications: []
    },
    {
      category: 'Tasks',
      icon: 'checkcircle',
      count: 0,
      notifications: []
    },
    {
      category: 'Alerts',
      icon: 'alerttriangle',
      count: 0,
      notifications: []
    },
    {
      category: 'Staff',
      icon: 'users',
      count: 0,
      notifications: []
    },
    {
      category: 'System',
      icon: 'settings',
      count: 0,
      notifications: []
    }
  ];

  notifications.forEach(notification => {
    switch (notification.type) {
      case 'order':
        groups[0].notifications.push(notification);
        groups[0].count++;
        break;
      case 'approval':
      case 'cash':
        groups[1].notifications.push(notification);
        groups[1].count++;
        break;
      case 'task':
        groups[2].notifications.push(notification);
        groups[2].count++;
        break;
      case 'alert':
      case 'issue':
        groups[3].notifications.push(notification);
        groups[3].count++;
        break;
      case 'staff':
        groups[4].notifications.push(notification);
        groups[4].count++;
        break;
      case 'system':
        groups[5].notifications.push(notification);
        groups[5].count++;
        break;
    }
  });

  return groups.filter(group => group.count > 0);
};

// Priority and type color helpers
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'warning';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'secondary';
  }
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'order': return 'primary';
    case 'approval': return 'warning';
    case 'task': return 'default';
    case 'alert': return 'destructive';
    case 'issue': return 'destructive';
    case 'staff': return 'secondary';
    case 'cash': return 'warning';
    case 'system': return 'default';
    default: return 'secondary';
  }
};

export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'order': return 'package';
    case 'approval': return 'clock';
    case 'task': return 'checkcircle';
    case 'alert': return 'alerttriangle';
    case 'issue': return 'alertcircle';
    case 'staff': return 'users';
    case 'cash': return 'dollarsign';
    case 'system': return 'settings';
    default: return 'bell';
  }
};

// Utility functions
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return time.toLocaleDateString();
};

export const formatNotificationTime = (timestamp: string): string => {
  const time = new Date(timestamp);
  return time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Simulate real-time notifications (for demo purposes)
export const simulateNewNotification = (): Notification => {
  const sampleNotifications = [
    {
      title: 'New Order Received',
      message: 'Order #ORD-008 from Sarah Lim - RM28.90 (FoodPanda)',
      type: 'order' as const,
      priority: 'high' as const,
      actionRequired: true,
      actionText: 'View Order',
      actionUrl: 'online-orders'
    },
    {
      title: 'Task Assignment',
      message: 'You have been assigned "Clean coffee machine" task',
      type: 'task' as const,
      priority: 'medium' as const,
      actionRequired: true,
      actionText: 'View Task',
      actionUrl: 'tasks'
    },
    {
      title: 'Stock Alert',
      message: 'Milk supply is running low (1 day remaining)',
      type: 'alert' as const,
      priority: 'medium' as const,
      actionRequired: true,
      actionText: 'Reorder Now',
      actionUrl: 'purchase-list'
    }
  ];

  const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
  
  return addNotification({
    ...randomNotification,
    isRead: false,
    timestamp: new Date().toISOString()
  });
};