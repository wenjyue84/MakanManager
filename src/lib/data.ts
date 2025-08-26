import { Task, DisciplinaryAction, Recipe, AppSettings } from './types';

// Using any[] to allow legacy user seed data that doesn't include new mandatory fields
export const users: any[] = [
  {
    id: '1',
    name: 'Jay',
    email: 'jay@makanmanager.com',
    password: 'password123',
    roles: ['owner'],
    avatar: '👨‍💼',
    phone: '+60123456789',
    startDate: '2020-01-15',
    emergencyContact: '+60123456790',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    station: 'front',
    points: 2500,
    weeklyPoints: 350,
    monthlyPoints: 1200
  },
  {
    id: '2',
    name: 'Simon',
    email: 'simon@makanmanager.com',
    password: 'password123',
    roles: ['manager'],
    avatar: '👨‍💻',
    phone: '+60123456791',
    startDate: '2020-03-10',
    emergencyContact: '+60123456792',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    station: 'front',
    points: 2200,
    weeklyPoints: 320,
    monthlyPoints: 1100
  },
  {
    id: '3',
    name: 'Lily',
    email: 'lily@makanmanager.com',
    password: 'password123',
    roles: ['head-of-kitchen'],
    avatar: '👩‍🍳',
    phone: '+60123456793',
    startDate: '2020-05-20',
    emergencyContact: '+60123456794',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b723ff83?w=100&h=100&fit=crop&crop=face',
    station: 'kitchen',
    points: 2100,
    weeklyPoints: 300,
    monthlyPoints: 1050
  },
  {
    id: '4',
    name: 'Sherry',
    email: 'sherry@makanmanager.com',
    password: 'password123',
    roles: ['front-desk-manager'],
    avatar: '👩‍💼',
    phone: '+60123456795',
    startDate: '2020-07-12',
    emergencyContact: '+60123456796',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    station: 'front',
    points: 1950,
    weeklyPoints: 280,
    monthlyPoints: 980
  },
  {
    id: '5',
    name: 'Bahar',
    email: 'bahar@makanmanager.com',
    password: 'password123',
    roles: ['staff'],
    avatar: '👨‍🍳',
    phone: '+60123456797',
    startDate: '2021-02-15',
    emergencyContact: '+60123456798',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    station: 'kitchen',
    points: 1800,
    weeklyPoints: 250,
    monthlyPoints: 900
  },
  {
    id: '6',
    name: 'Ros',
    email: 'ros@makanmanager.com',
    password: 'password123',
    roles: ['staff'],
    avatar: '👩‍🍳',
    phone: '+60123456799',
    startDate: '2021-04-10',
    emergencyContact: '+60123456800',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    station: 'kitchen',
    points: 1600,
    weeklyPoints: 200,
    monthlyPoints: 750
  },
  {
    id: '7',
    name: 'Ana',
    email: 'ana@makanmanager.com',
    password: 'password123',
    roles: ['staff'],
    avatar: '👩',
    phone: '+60123456801',
    startDate: '2021-06-05',
    emergencyContact: '+60123456802',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    station: 'front',
    points: 1550,
    weeklyPoints: 220,
    monthlyPoints: 780
  },
  {
    id: '8',
    name: 'Islam',
    roles: ['staff'],
    avatar: '👨',
    phone: '+60123456803',
    startDate: '2021-08-20',
    emergencyContact: '+60123456804',
    photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
    station: 'store',
    points: 1400,
    weeklyPoints: 180,
    monthlyPoints: 650
  },
  {
    id: '9',
    name: 'Mya Sai',
    roles: ['staff'],
    avatar: '👩',
    phone: '+60123456805',
    startDate: '2021-10-15',
    emergencyContact: '+60123456806',
    photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    station: 'outdoor',
    points: 1300,
    weeklyPoints: 160,
    monthlyPoints: 600
  }
];

export const tasks: Task[] = [
  // Open Tasks
  {
    id: '1',
    title: 'Front Closing Checklist',
    description: 'Complete all front desk closing procedures including cash count, cleaning, and security check',
    station: 'front',
    status: 'open',
    dueDate: '2024-08-20',
    dueTime: '23:00',
    basePoints: 50,
    assignerId: '4',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-20T15:00:00Z',
    repeat: 'daily'
  },
  {
    id: '10',
    title: 'Morning Coffee Setup',
    description: 'Set up coffee machines, check bean levels, and prepare brewing stations',
    station: 'front',
    status: 'open',
    dueDate: '2024-08-21',
    dueTime: '07:30',
    basePoints: 40,
    assignerId: '4',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-20T16:00:00Z',
    repeat: 'daily'
  },
  {
    id: '11',
    title: 'Weekly Inventory Count',
    description: 'Complete full inventory count for all kitchen items',
    station: 'kitchen',
    status: 'open',
    dueDate: '2024-08-22',
    dueTime: '16:00',
    basePoints: 80,
    assignerId: '3',
    proofType: 'text',
    overdueDays: 7,
    createdAt: '2024-08-20T10:00:00Z'
  },
  {
    id: '12',
    title: 'Outdoor Seating Setup',
    description: 'Arrange outdoor furniture, check umbrellas, and clean surfaces',
    station: 'outdoor',
    status: 'open',
    dueDate: '2024-08-21',
    dueTime: '08:00',
    basePoints: 30,
    assignerId: '2',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-20T17:00:00Z',
    repeat: 'daily'
  },

  // In Progress Tasks
  {
    id: '2',
    title: 'Kitchen Prep — Morning',
    description: 'Prepare ingredients for morning service, check inventory, set up stations',
    station: 'kitchen',
    status: 'in-progress',
    dueDate: '2024-08-21',
    dueTime: '10:30',
    basePoints: 50,
    assignerId: '3',
    assigneeId: '5',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-20T06:00:00Z',
    repeat: 'daily'
  },
  {
    id: '13',
    title: 'Daily Sales Report',
    description: 'Compile and review daily sales figures, identify trends',
    station: 'front',
    status: 'in-progress',
    dueDate: '2024-08-21',
    dueTime: '18:00',
    basePoints: 40,
    assignerId: '2',
    assigneeId: '7',
    proofType: 'text',
    overdueDays: 7,
    createdAt: '2024-08-21T10:00:00Z'
  },
  {
    id: '14',
    title: 'Equipment Maintenance Check',
    description: 'Perform routine maintenance checks on kitchen equipment',
    station: 'kitchen',
    status: 'in-progress',
    dueDate: '2024-08-21',
    dueTime: '15:00',
    basePoints: 60,
    assignerId: '3',
    assigneeId: '6',
    proofType: 'checklist',
    overdueDays: 7,
    createdAt: '2024-08-21T08:00:00Z'
  },

  // Pending Review Tasks
  {
    id: '3',
    title: 'Store Count (Wed)',
    description: 'Complete weekly inventory count for store items and update system',
    station: 'store',
    status: 'pending-review',
    dueDate: '2024-08-20',
    dueTime: '16:00',
    basePoints: 50,
    assignerId: '2',
    assigneeId: '8',
    proofType: 'text',
    proofData: 'Completed count: 250 items checked, 3 discrepancies noted in system',
    overdueDays: 7,
    createdAt: '2024-08-19T09:00:00Z',
    completedAt: '2024-08-20T15:45:00Z'
  },
  {
    id: '15',
    title: 'Staff Training Documentation',
    description: 'Document completed staff training sessions and update records',
    station: 'front',
    status: 'pending-review',
    dueDate: '2024-08-20',
    dueTime: '17:00',
    basePoints: 45,
    assignerId: '4',
    assigneeId: '7',
    proofType: 'text',
    proofData: 'Training completed for 3 staff members: Customer Service Module A, Safety Protocols, POS System Update',
    overdueDays: 7,
    createdAt: '2024-08-19T14:00:00Z',
    completedAt: '2024-08-20T16:30:00Z'
  },
  {
    id: '16',
    title: 'Monthly Deep Clean — Grill',
    description: 'Complete thorough cleaning and maintenance of main grill station',
    station: 'kitchen',
    status: 'pending-review',
    dueDate: '2024-08-20',
    dueTime: '14:00',
    basePoints: 70,
    assignerId: '3',
    assigneeId: '5',
    proofType: 'photo',
    proofData: 'Deep clean completed, photos uploaded to system',
    overdueDays: 7,
    createdAt: '2024-08-19T08:00:00Z',
    completedAt: '2024-08-20T13:45:00Z'
  },

  // On Hold Tasks
  {
    id: '5',
    title: 'Menu Photo Update',
    description: 'Take new photos of menu items for social media and display boards',
    station: 'outdoor',
    status: 'on-hold',
    dueDate: '2024-08-22',
    dueTime: '15:00',
    basePoints: 50,
    assignerId: '2',
    assigneeId: '9',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-19T11:00:00Z'
  },
  {
    id: '17',
    title: 'Social Media Content Creation',
    description: 'Create content for weekly social media posts',
    station: 'front',
    status: 'on-hold',
    dueDate: '2024-08-23',
    dueTime: '12:00',
    basePoints: 35,
    assignerId: '2',
    assigneeId: '7',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-20T09:00:00Z'
  },

  // Overdue Tasks
  {
    id: '4',
    title: 'Deep Clean Fryer',
    description: 'Complete deep cleaning of fryer including oil change and filter replacement',
    station: 'kitchen',
    status: 'overdue',
    dueDate: '2024-08-19',
    dueTime: '14:00',
    basePoints: 80,
    assignerId: '3',
    assigneeId: '6',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-17T10:00:00Z'
  },
  {
    id: '18',
    title: 'Quarterly Supplier Review',
    description: 'Review supplier performance and update contracts',
    station: 'store',
    status: 'overdue',
    dueDate: '2024-08-18',
    dueTime: '17:00',
    basePoints: 100,
    assignerId: '2',
    assigneeId: '8',
    proofType: 'text',
    overdueDays: 7,
    createdAt: '2024-08-15T09:00:00Z'
  },

  // Done Tasks (Recent)
  {
    id: '19',
    title: 'Wipe Service Counter',
    description: 'Clean and sanitize all service counter surfaces',
    station: 'front',
    status: 'done',
    dueDate: '2024-08-20',
    dueTime: '11:00',
    basePoints: 30,
    finalPoints: 35,
    multiplier: 1.0,
    adjustment: 5,
    assignerId: '4',
    assigneeId: '9',
    proofType: 'checklist',
    overdueDays: 7,
    createdAt: '2024-08-20T07:00:00Z',
    completedAt: '2024-08-20T10:45:00Z',
    approvedAt: '2024-08-20T11:15:00Z'
  },
  {
    id: '20',
    title: 'Stock Beverages',
    description: 'Restock all beverage coolers and check expiry dates',
    station: 'store',
    status: 'done',
    dueDate: '2024-08-20',
    dueTime: '09:00',
    basePoints: 25,
    finalPoints: 25,
    multiplier: 1.0,
    adjustment: 0,
    assignerId: '2',
    assigneeId: '8',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-19T18:00:00Z',
    completedAt: '2024-08-20T08:45:00Z',
    approvedAt: '2024-08-20T09:30:00Z'
  },
  {
    id: '21',
    title: 'Prep Vegetables',
    description: 'Wash, cut, and prepare vegetables for lunch service',
    station: 'kitchen',
    status: 'done',
    dueDate: '2024-08-20',
    dueTime: '11:00',
    basePoints: 40,
    finalPoints: 60,
    multiplier: 1.5,
    adjustment: 0,
    assignerId: '3',
    assigneeId: '5',
    proofType: 'photo',
    overdueDays: 7,
    createdAt: '2024-08-20T06:00:00Z',
    completedAt: '2024-08-20T10:30:00Z',
    approvedAt: '2024-08-20T11:00:00Z'
  },
  {
    id: '22',
    title: 'Customer Feedback Review',
    description: 'Review and categorize customer feedback from yesterday',
    station: 'front',
    status: 'done',
    dueDate: '2024-08-20',
    dueTime: '10:00',
    basePoints: 35,
    finalPoints: 35,
    multiplier: 1.0,
    adjustment: 0,
    assignerId: '4',
    assigneeId: '7',
    proofType: 'text',
    overdueDays: 7,
    createdAt: '2024-08-19T16:00:00Z',
    completedAt: '2024-08-20T09:45:00Z',
    approvedAt: '2024-08-20T10:15:00Z'
  }
];

export const disciplinaryActions: DisciplinaryAction[] = [
  {
    id: '1',
    targetUserId: '6',
    type: 'Sudden Absence',
    points: -200,
    reason: 'No show on 18 Aug without prior notice',
    createdById: '3',
    createdAt: '2024-08-18T09:00:00Z'
  },
  {
    id: '2',
    targetUserId: '8',
    type: 'Late Arrival (>15m)',
    points: -30,
    reason: 'Arrived 25 mins late for morning shift',
    createdById: '2',
    createdAt: '2024-08-19T08:25:00Z'
  },
  {
    id: '3',
    targetUserId: '7',
    type: 'Phone Use on Duty',
    points: -20,
    reason: 'Using personal phone during service hours',
    createdById: '4',
    createdAt: '2024-08-19T14:30:00Z'
  }
];

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Pineapple Fried Rice',
    category: 'Main Course',
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Jasmine Rice', quantity: 2, unit: 'cups' },
      { name: 'Fresh Pineapple', quantity: 1, unit: 'cup diced' },
      { name: 'Shrimp', quantity: 200, unit: 'g' },
      { name: 'Egg', quantity: 2, unit: 'pieces' },
      { name: 'Fish Sauce', quantity: 2, unit: 'tbsp' },
      { name: 'Soy Sauce', quantity: 1, unit: 'tbsp' }
    ],
    steps: [
      'Cook jasmine rice and let cool completely',
      'Heat oil in wok over high heat',
      'Scramble eggs and set aside',
      'Stir-fry shrimp until pink',
      'Add rice, breaking up clumps',
      'Add pineapple, sauces, and scrambled eggs',
      'Toss everything together and serve hot'
    ],
    allergens: ['shellfish', 'eggs'],
    tags: ['thai', 'seafood', 'rice'],
    prepTime: 25,
    station: 'kitchen'
  },
  {
    id: '2',
    name: 'Curry Mee',
    category: 'Noodles',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Yellow Noodles', quantity: 200, unit: 'g' },
      { name: 'Rice Vermicelli', quantity: 100, unit: 'g' },
      { name: 'Coconut Milk', quantity: 400, unit: 'ml' },
      { name: 'Curry Paste', quantity: 3, unit: 'tbsp' },
      { name: 'Chicken', quantity: 150, unit: 'g sliced' },
      { name: 'Bean Sprouts', quantity: 100, unit: 'g' }
    ],
    steps: [
      'Boil noodles and vermicelli separately',
      'Heat curry paste in pot',
      'Add coconut milk gradually',
      'Add chicken and simmer',
      'Serve noodles in bowls with curry soup',
      'Top with bean sprouts and garnish'
    ],
    allergens: ['gluten'],
    tags: ['malaysian', 'spicy', 'noodles'],
    prepTime: 30,
    station: 'kitchen'
  },
  {
    id: '3',
    name: 'Fish Slice Bee Hoon Soup',
    category: 'Soup',
    photo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Rice Vermicelli', quantity: 200, unit: 'g' },
      { name: 'Fish Fillet', quantity: 200, unit: 'g sliced' },
      { name: 'Fish Stock', quantity: 1, unit: 'liter' },
      { name: 'Lettuce', quantity: 100, unit: 'g' },
      { name: 'Tomato', quantity: 1, unit: 'piece sliced' },
      { name: 'White Pepper', quantity: 1, unit: 'tsp' }
    ],
    steps: [
      'Soak rice vermicelli in warm water',
      'Bring fish stock to boil',
      'Add fish slices and cook briefly',
      'Add drained vermicelli',
      'Season with white pepper',
      'Serve with lettuce and tomato'
    ],
    allergens: ['fish'],
    tags: ['light', 'healthy', 'soup'],
    prepTime: 20,
    station: 'kitchen'
  }
];

export const appSettings: AppSettings = {
  defaultTaskPoints: 50,
  minTaskPoints: 10,
  maxTaskPoints: 200,
  multiplierMin: 0.5,
  multiplierMax: 3.0,
  managementDailyBudget: 500,
  defaultOverdueDays: 7,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  rewardThresholds: [
    { points: 1000, reward: 'Extra Day Off' },
    { points: 2000, reward: 'Bonus Meal' },
    { points: 3000, reward: 'Recognition Certificate' }
  ],
  stations: ['kitchen', 'front', 'store', 'outdoor'],
  languages: ['en', 'id', 'vi', 'my']
};

// DEPRECATED: Use useCurrentUser hook instead
// This export is kept for backward compatibility but should not be used in new code
export const currentUser = users[4]; // Bahar (Staff) - DEPRECATED

// For switching views between staff and manager
export const switchUserRole = (userId: string) => {
  const user = users.find(u => u.id === userId);
  if (user) {
    // In a real app, this would update the session
    // Note: This function is deprecated and should not be used
    console.warn('switchUserRole is deprecated. Use the auth context instead.');
  }
};

// Management budget tracking (resets daily)
export const managementBudgets = new Map([
  ['2', 450], // Simon has 450 remaining
  ['3', 500], // Lily has full budget
  ['4', 480]  // Sherry has 480 remaining
]);