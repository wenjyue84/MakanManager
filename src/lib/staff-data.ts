export interface StaffMember {
  id: string;
  name: string;
  roles: string;
  gender?: 'male' | 'female';
  phone: string;
  email?: string;
  startDate?: string;
  status?: 'active' | 'inactive';
  photo?: string;
}

const API_URL = '/api/staff';

export const fetchStaffMembers = async (): Promise<StaffMember[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch staff');
  return res.json();
};

export const getStaffMemberById = async (id: string): Promise<StaffMember | undefined> => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) return undefined;
  return res.json();
};

export const addStaffMember = async (member: StaffMember): Promise<StaffMember> => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member)
  });
  if (!res.ok) throw new Error('Failed to add staff');
  return res.json();
};

export const deleteStaffMember = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete staff member');
};

export const updateStaffMember = async (id: string, member: Partial<StaffMember>): Promise<StaffMember> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member)
  });
  if (!res.ok) throw new Error('Failed to update staff member');
  return res.json();
};

export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    'owner': 'Owner',
    'manager': 'Manager', 
    'supervisor': 'Supervisor',
    'chef': 'Chef',
    'cook': 'Cook',
    'server': 'Server',
    'cashier': 'Cashier',
    'cleaner': 'Cleaner',
    'delivery': 'Delivery',
    'kitchen-staff': 'Kitchen Staff',
    'front-staff': 'Front Staff',
    'part-time': 'Part Time',
    'full-time': 'Full Time'
  };
  return roleMap[role] || role;
};

export const getLanguageDisplayName = (language: string): string => {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'ms': 'Bahasa Malaysia', 
    'zh': 'Chinese',
    'ta': 'Tamil',
    'th': 'Thai',
    'id': 'Indonesian'
  };
  return languageMap[language] || language;
};

// Mock staff data for development - updated to match data.ts structure
export const staffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'Jay',
    roles: 'Owner',
    gender: 'male',
    phone: '+60123456789',
    email: 'jay@makanmanager.com',
    startDate: '2020-01-15',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2', 
    name: 'Simon',
    roles: 'Manager',
    gender: 'male',
    phone: '+60123456791',
    email: 'simon@makanmanager.com',
    startDate: '2020-03-10',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Lily', 
    roles: 'Head of Kitchen',
    gender: 'female',
    phone: '+60123456793',
    email: 'lily@makanmanager.com',
    startDate: '2020-05-20',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b723ff83?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Sherry',
    roles: 'Front Desk Manager',
    gender: 'female',
    phone: '+60123456795',
    email: 'sherry@makanmanager.com',
    startDate: '2020-07-12',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'Bahar',
    roles: 'Staff',
    gender: 'male',
    phone: '+60123456797',
    email: 'bahar@makanmanager.com',
    startDate: '2021-02-15',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '6',
    name: 'Ros',
    roles: 'Staff',
    gender: 'female',
    phone: '+60123456799',
    email: 'ros@makanmanager.com',
    startDate: '2021-04-10',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face'
  }
];
