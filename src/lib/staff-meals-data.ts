// Staff Meal Data
export interface StaffMeal {
  id: string;
  date: string;
  time: string;
  mealType: 'lunch' | 'dinner';
  dishName: string;
  cookedBy: string; // staff id
  eaters: string[]; // staff ids
  approximateCost: number; // RM
  photo?: string;
  notes?: string;
  createdAt: string;
}

// Enhanced Staff Meals Data - More realistic cafe dishes
export const staffMeals: StaffMeal[] = [
  {
    id: '1',
    date: '2024-08-23',
    time: '12:45',
    mealType: 'lunch',
    dishName: 'Nasi Lemak with Ayam Rendang',
    cookedBy: '10', // Bahar
    eaters: ['8', '7', '5'], // Ros, Sherry, Ko Sai
    approximateCost: 42.50,
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    notes: 'Used leftover chicken from yesterday, made fresh rendang sauce. Everyone loved it!',
    createdAt: '2024-08-23T12:45:00Z'
  },
  {
    id: '2',
    date: '2024-08-23',
    time: '19:30',
    mealType: 'dinner',
    dishName: 'Tom Yam Seafood with Rice',
    cookedBy: '3', // Lily
    eaters: ['4', '6', '10'], // Simon, Thua, Bahar
    approximateCost: 38.80,
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    notes: 'Perfect spice level, used fresh prawns and squid from today\'s delivery',
    createdAt: '2024-08-23T19:30:00Z'
  },
  {
    id: '3',
    date: '2024-08-22',
    time: '13:15',
    mealType: 'lunch',
    dishName: 'Fried Kueh Teow with Prawns',
    cookedBy: '6', // Thua
    eaters: ['3', '8'], // Lily, Ros
    approximateCost: 24.00,
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    notes: 'Light lunch for just two people, used extra prawns',
    createdAt: '2024-08-22T13:15:00Z'
  },
  {
    id: '4',
    date: '2024-08-22',
    time: '20:00',
    mealType: 'dinner',
    dishName: 'Indonesian Curry Chicken with Rice',
    cookedBy: '3', // Lily (Le)
    eaters: ['10', '5', '7', '4'], // Bahar, Ko Sai, Sherry, Simon
    approximateCost: 45.60,
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    notes: 'Le\'s special Indonesian-style curry, very popular with the team',
    createdAt: '2024-08-22T20:00:00Z'
  },
  {
    id: '5',
    date: '2024-08-21',
    time: '12:30',
    mealType: 'lunch',
    dishName: 'Mee Siam with Tofu and Egg',
    cookedBy: '5', // Ko Sai
    eaters: ['8', '9'], // Ros, Islam
    approximateCost: 18.50,
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    notes: 'Simple lunch, good balance of protein and carbs',
    createdAt: '2024-08-21T12:30:00Z'
  },
  {
    id: '6',
    date: '2024-08-21',
    time: '19:45',
    mealType: 'dinner',
    dishName: 'Black Pepper Chicken with Vegetables',
    cookedBy: '3', // Lily
    eaters: ['6', '10', '4'], // Thua, Bahar, Simon
    approximateCost: 36.20,
    photo: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop',
    notes: 'Used Le\'s signature black pepper sauce recipe',
    createdAt: '2024-08-21T19:45:00Z'
  },
  {
    id: '7',
    date: '2024-08-20',
    time: '13:00',
    mealType: 'lunch',
    dishName: 'Fish Slice Noodle Soup',
    cookedBy: '3', // Lily
    eaters: ['7', '5'], // Sherry, Ko Sai
    approximateCost: 22.00,
    photo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    notes: 'Fresh fish from this morning\'s delivery, clear and tasty broth',
    createdAt: '2024-08-20T13:00:00Z'
  },
  {
    id: '8',
    date: '2024-08-20',
    time: '20:15',
    mealType: 'dinner',
    dishName: 'Salted Egg Prawns with Fried Rice',
    cookedBy: '3', // Lily
    eaters: ['4', '8', '6', '10'], // Simon, Ros, Thua, Bahar
    approximateCost: 52.40,
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    notes: 'Weekend special dinner, everyone stayed late to enjoy this',
    createdAt: '2024-08-20T20:15:00Z'
  },
  {
    id: '9',
    date: '2024-08-19',
    time: '12:20',
    mealType: 'lunch',
    dishName: 'Ayam Penyet with Sambal',
    cookedBy: '3', // Lily
    eaters: ['10', '9'], // Bahar, Islam
    approximateCost: 28.80,
    photo: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop',
    notes: 'Classic Indonesian dish, Bahar especially loves this',
    createdAt: '2024-08-19T12:20:00Z'
  },
  {
    id: '10',
    date: '2024-08-19',
    time: '19:20',
    mealType: 'dinner',
    dishName: 'Curry Mee with Fish Cake',
    cookedBy: '6', // Thua
    eaters: ['3', '5', '7'], // Lily, Ko Sai, Sherry
    approximateCost: 31.50,
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    notes: 'Thua\'s improvement on the curry mee recipe, getting better!',
    createdAt: '2024-08-19T19:20:00Z'
  },
  {
    id: '11',
    date: '2024-08-18',
    time: '13:10',
    mealType: 'lunch',
    dishName: 'Wat Tan Hor (Hor Fun in Gravy)',
    cookedBy: '5', // Ko Sai
    eaters: ['4', '8'], // Simon, Ros
    approximateCost: 19.60,
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    notes: 'Ko Sai is getting better at wok hei technique',
    createdAt: '2024-08-18T13:10:00Z'
  },
  {
    id: '12',
    date: '2024-08-18',
    time: '20:30',
    mealType: 'dinner',
    dishName: 'Kong Pao Chicken with Steamed Rice',
    cookedBy: '3', // Lily
    eaters: ['6', '10', '7', '5'], // Thua, Bahar, Sherry, Ko Sai
    approximateCost: 41.20,
    photo: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop',
    notes: 'Sunday dinner special, Le\'s Kong Pao sauce is always a hit',
    createdAt: '2024-08-18T20:30:00Z'
  },
  {
    id: '13',
    date: '2024-08-17',
    time: '12:50',
    mealType: 'lunch',
    dishName: 'Fried Rice with Chinese Sausage',
    cookedBy: '10', // Bahar
    eaters: ['8', '9'], // Ros, Islam
    approximateCost: 16.80,
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    notes: 'Simple but satisfying, used leftover rice from yesterday',
    createdAt: '2024-08-17T12:50:00Z'
  },
  {
    id: '14',
    date: '2024-08-17',
    time: '19:00',
    mealType: 'dinner',
    dishName: 'Buttermilk Prawns with Mantou',
    cookedBy: '3', // Lily
    eaters: ['4', '6', '10', '5'], // Simon, Thua, Bahar, Ko Sai
    approximateCost: 48.90,
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    notes: 'Weekend treat - Le\'s buttermilk sauce is amazing, everyone asked for seconds',
    createdAt: '2024-08-17T19:00:00Z'
  }
];