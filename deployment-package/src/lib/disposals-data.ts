import { Station } from './types';

// Disposal Data
export interface Disposal {
  id: string;
  date: string;
  time: string;
  item: string;
  quantity: number;
  unit: string;
  reason: 'expired' | 'spoiled' | 'overcooked' | 'prep-error' | 'other';
  station: Station;
  thrownBy: string; // staff id
  photo?: string;
  notes?: string;
  createdAt: string;
}

// Enhanced Disposal Data - More realistic waste scenarios
export const disposals: Disposal[] = [
  {
    id: '1',
    date: '2024-08-23',
    time: '17:30',
    item: 'Coconut milk (3 cans)',
    quantity: 3,
    unit: 'cans',
    reason: 'expired',
    station: 'kitchen',
    thrownBy: '6', // Thua
    photo: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
    notes: 'Expired 2 days ago, found during inventory check. Smell was sour.',
    createdAt: '2024-08-23T17:30:00Z'
  },
  {
    id: '2',
    date: '2024-08-23',
    time: '11:45',
    item: 'Fried chicken batch',
    quantity: 8,
    unit: 'pieces',
    reason: 'overcooked',
    station: 'kitchen',
    thrownBy: '5', // Ko Sai
    photo: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop',
    notes: 'Oil temperature too high during lunch rush, chicken got burnt. Learning mistake.',
    createdAt: '2024-08-23T11:45:00Z'
  },
  {
    id: '3',
    date: '2024-08-22',
    time: '20:40',
    item: 'Mixed vegetables (kangkung)',
    quantity: 1.2,
    unit: 'kg',
    reason: 'spoiled',
    station: 'kitchen',
    thrownBy: '8', // Ros
    photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    notes: 'Leaves turned black and slimy, not stored properly in chiller',
    createdAt: '2024-08-22T20:40:00Z'
  },
  {
    id: '4',
    date: '2024-08-22',
    time: '14:20',
    item: 'Tom Yam soup base',
    quantity: 2.5,
    unit: 'liters',
    reason: 'prep-error',
    station: 'kitchen',
    thrownBy: '6', // Thua
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    notes: 'Accidentally added too much salt, couldn\'t be saved even after dilution',
    createdAt: '2024-08-22T14:20:00Z'
  },
  {
    id: '5',
    date: '2024-08-21',
    time: '09:15',
    item: 'Fresh prawns',
    quantity: 0.8,
    unit: 'kg',
    reason: 'spoiled',
    station: 'kitchen',
    thrownBy: '3', // Lily
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    notes: 'Delivered yesterday but went bad overnight, supplier quality issue',
    createdAt: '2024-08-21T09:15:00Z'
  },
  {
    id: '6',
    date: '2024-08-21',
    time: '16:30',
    item: 'Bread loaves',
    quantity: 6,
    unit: 'loaves',
    reason: 'expired',
    station: 'front-desk',
    thrownBy: '7', // Sherry
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    notes: 'Day-old bread, too hard to serve customers but not moldy',
    createdAt: '2024-08-21T16:30:00Z'
  },
  {
    id: '7',
    date: '2024-08-20',
    time: '12:10',
    item: 'Mee Siam noodles',
    quantity: 1.5,
    unit: 'portions',
    reason: 'overcooked',
    station: 'kitchen',
    thrownBy: '10', // Bahar
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    notes: 'Noodles became mushy during cooking, timing was off',
    createdAt: '2024-08-20T12:10:00Z'
  },
  {
    id: '8',
    date: '2024-08-20',
    time: '18:45',
    item: 'Lettuce and salad greens',
    quantity: 2,
    unit: 'kg',
    reason: 'spoiled',
    station: 'kitchen',
    thrownBy: '4', // Simon
    photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    notes: 'Weekend delivery arrived wilted, supplier will be contacted',
    createdAt: '2024-08-20T18:45:00Z'
  },
  {
    id: '9',
    date: '2024-08-19',
    time: '21:20',
    item: 'Fish slice (siham)',
    quantity: 1,
    unit: 'kg',
    reason: 'expired',
    station: 'kitchen',
    thrownBy: '3', // Lily
    photo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    notes: 'Exceeded safe storage time, fishy smell detected during evening check',
    createdAt: '2024-08-19T21:20:00Z'
  },
  {
    id: '10',
    date: '2024-08-19',
    time: '13:30',
    item: 'Curry sauce batch',
    quantity: 1.8,
    unit: 'liters',
    reason: 'prep-error',
    station: 'kitchen',
    thrownBy: '5', // Ko Sai
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    notes: 'Wrong spice ratio, too spicy to serve even to spice-lovers',
    createdAt: '2024-08-19T13:30:00Z'
  },
  {
    id: '11',
    date: '2024-08-18',
    time: '16:50',
    item: 'Rice (overcooked batch)',
    quantity: 3,
    unit: 'kg',
    reason: 'overcooked',
    station: 'kitchen',
    thrownBy: '6', // Thua
    photo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    notes: 'Rice cooker malfunction, rice became mushy and inedible',
    createdAt: '2024-08-18T16:50:00Z'
  },
  {
    id: '12',
    date: '2024-08-18',
    time: '10:30',
    item: 'Bean sprouts',
    quantity: 1.5,
    unit: 'kg',
    reason: 'spoiled',
    station: 'kitchen',
    thrownBy: '8', // Ros
    photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    notes: 'Sour smell and brown discoloration, weekend storage issue',
    createdAt: '2024-08-18T10:30:00Z'
  }
];