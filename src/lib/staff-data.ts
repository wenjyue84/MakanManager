import { UserRole, Station } from './types';

export interface StaffMember {
  id: string;
  name: string;
  roles: UserRole[];
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  startDate: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  station?: Station;
  status: 'active' | 'inactive';
  photo: string;
  languages?: string[];
  
  // Performance data
  pointsThisMonth: number;
  pointsYTD: number;
  completedTasks: number;
  disciplinaryCount: number;
  
  // Documents
  documents: {
    id: string;
    name: string;
    type: 'passport' | 'ic' | 'contract' | 'certificate';
    filename: string;
    uploadedBy: string;
    uploadedDate: string;
  }[];
}

export const staffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'Jay',
    roles: ['owner'],
    gender: 'male',
    phone: '012-700 0001',
    email: 'jay@makanmoments.com',
    startDate: '2024-10-07',
    emergencyContact: {
      name: 'Contact A',
      phone: '012-123 4567'
    },
    station: 'outdoor',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    languages: ['en', 'my'],
    pointsThisMonth: 1200,
    pointsYTD: 2500,
    completedTasks: 180,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd1',
        name: 'Passport',
        type: 'passport',
        filename: 'jay_passport.pdf',
        uploadedBy: 'Jay',
        uploadedDate: '2024-10-07'
      },
      {
        id: 'd2',
        name: 'Employment Contract',
        type: 'contract',
        filename: 'jay_contract.pdf',
        uploadedBy: 'Jay',
        uploadedDate: '2024-10-07'
      }
    ]
  },
  {
    id: '2',
    name: 'Niko',
    roles: ['owner'],
    gender: 'female',
    phone: '012-700 0002',
    email: 'niko@makanmoments.com',
    startDate: '2024-10-07',
    emergencyContact: {
      name: 'Contact B',
      phone: '012-234 5678'
    },
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b723ff83?w=100&h=100&fit=crop&crop=face',
    languages: ['en', 'vi'],
    pointsThisMonth: 1100,
    pointsYTD: 2200,
    completedTasks: 165,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd3',
        name: 'IC Copy',
        type: 'ic',
        filename: 'niko_ic.pdf',
        uploadedBy: 'Niko',
        uploadedDate: '2024-10-07'
      }
    ]
  },
  {
    id: '3',
    name: 'Le',
    roles: ['manager'],
    gender: 'female',
    phone: '012-700 0003',
    email: 'le@makanmoments.com',
    startDate: '2024-11-01',
    emergencyContact: {
      name: 'Contact C',
      phone: '012-345 6789'
    },
    station: 'front',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    languages: ['en', 'vi'],
    pointsThisMonth: 980,
    pointsYTD: 1950,
    completedTasks: 145,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd4',
        name: 'Passport',
        type: 'passport',
        filename: 'le_passport.pdf',
        uploadedBy: 'Le',
        uploadedDate: '2024-11-01'
      },
      {
        id: 'd5',
        name: 'Management Certificate',
        type: 'certificate',
        filename: 'le_mgmt_cert.pdf',
        uploadedBy: 'Le',
        uploadedDate: '2024-11-01'
      }
    ]
  },
  {
    id: '4',
    name: 'Simon',
    roles: ['manager'],
    gender: 'male',
    phone: '012-700 0004',
    email: 'simon@makanmoments.com',
    startDate: '2024-11-15',
    emergencyContact: {
      name: 'Contact D',
      phone: '012-456 7890'
    },
    station: 'front',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    languages: ['en', 'my'],
    pointsThisMonth: 1100,
    pointsYTD: 2200,
    completedTasks: 165,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd6',
        name: 'IC Copy',
        type: 'ic',
        filename: 'simon_ic.pdf',
        uploadedBy: 'Simon',
        uploadedDate: '2024-11-15'
      },
      {
        id: 'd7',
        name: 'Employment Contract',
        type: 'contract',
        filename: 'simon_contract.pdf',
        uploadedBy: 'Simon',
        uploadedDate: '2024-11-15'
      }
    ]
  },
  {
    id: '5',
    name: 'Ko Sai',
    roles: ['staff'],
    gender: 'male',
    phone: '012-700 0005',
    startDate: '2025-01-05',
    emergencyContact: {
      name: 'Contact E',
      phone: '012-567 8901'
    },
    station: 'kitchen',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    languages: ['my'],
    pointsThisMonth: 750,
    pointsYTD: 1500,
    completedTasks: 120,
    disciplinaryCount: 1,
    documents: [
      {
        id: 'd8',
        name: 'Passport',
        type: 'passport',
        filename: 'kosai_passport.pdf',
        uploadedBy: 'Ko Sai',
        uploadedDate: '2025-01-05'
      }
    ]
  },
  {
    id: '6',
    name: 'Thua',
    roles: ['staff'],
    gender: 'male',
    phone: '012-700 0006',
    startDate: '2025-01-12',
    emergencyContact: {
      name: 'Contact F',
      phone: '012-678 9012'
    },
    station: 'store',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face',
    languages: ['my', 'en'],
    pointsThisMonth: 650,
    pointsYTD: 1400,
    completedTasks: 95,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd9',
        name: 'IC Copy',
        type: 'ic',
        filename: 'thua_ic.pdf',
        uploadedBy: 'Thua',
        uploadedDate: '2025-01-12'
      }
    ]
  },
  {
    id: '7',
    name: 'Sherry',
    roles: ['staff'],
    gender: 'female',
    phone: '012-700 0007',
    startDate: '2025-02-01',
    emergencyContact: {
      name: 'Contact G',
      phone: '012-789 0123'
    },
    station: 'front',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    languages: ['en'],
    pointsThisMonth: 780,
    pointsYTD: 1550,
    completedTasks: 110,
    disciplinaryCount: 1,
    documents: [
      {
        id: 'd10',
        name: 'Passport',
        type: 'passport',
        filename: 'sherry_passport.pdf',
        uploadedBy: 'Sherry',
        uploadedDate: '2025-02-01'
      },
      {
        id: 'd11',
        name: 'Food Safety Certificate',
        type: 'certificate',
        filename: 'sherry_food_cert.pdf',
        uploadedBy: 'Sherry',
        uploadedDate: '2025-02-01'
      }
    ]
  },
  {
    id: '8',
    name: 'Ros',
    roles: ['staff'],
    gender: 'female',
    phone: '012-700 0008',
    startDate: '2025-02-10',
    emergencyContact: {
      name: 'Contact H',
      phone: '012-890 1234'
    },
    station: 'front',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    languages: ['en', 'my'],
    pointsThisMonth: 750,
    pointsYTD: 1600,
    completedTasks: 105,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd12',
        name: 'IC Copy',
        type: 'ic',
        filename: 'ros_ic.pdf',
        uploadedBy: 'Ros',
        uploadedDate: '2025-02-10'
      }
    ]
  },
  {
    id: '9',
    name: 'Zaw Zaw',
    roles: ['staff'],
    gender: 'female',
    phone: '012-700 0009',
    startDate: '2025-03-03',
    emergencyContact: {
      name: 'Contact I',
      phone: '012-901 2345'
    },
    station: 'kitchen',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    languages: ['my'],
    pointsThisMonth: 600,
    pointsYTD: 1300,
    completedTasks: 85,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd13',
        name: 'Passport',
        type: 'passport',
        filename: 'zawzaw_passport.pdf',
        uploadedBy: 'Zaw Zaw',
        uploadedDate: '2025-03-03'
      }
    ]
  },
  {
    id: '10',
    name: 'Bahar',
    roles: ['staff'],
    gender: 'male',
    phone: '012-700 0010',
    startDate: '2025-03-10',
    emergencyContact: {
      name: 'Contact J',
      phone: '012-012 3456'
    },
    station: 'kitchen',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    languages: ['en', 'my'],
    pointsThisMonth: 900,
    pointsYTD: 1800,
    completedTasks: 125,
    disciplinaryCount: 0,
    documents: [
      {
        id: 'd14',
        name: 'IC Copy',
        type: 'ic',
        filename: 'bahar_ic.pdf',
        uploadedBy: 'Bahar',
        uploadedDate: '2025-03-10'
      },
      {
        id: 'd15',
        name: 'Employment Contract',
        type: 'contract',
        filename: 'bahar_contract.pdf',
        uploadedBy: 'Bahar',
        uploadedDate: '2025-03-10'
      }
    ]
  }
];

// Helper functions
export const getStaffMemberById = (id: string): StaffMember | undefined => {
  return staffMembers.find(member => member.id === id);
};

export const getStaffMemberByCurrentUser = (currentUserId: string): StaffMember | undefined => {
  return getStaffMemberById(currentUserId);
};

export const updateStaffMember = (id: string, updates: Partial<StaffMember>): void => {
  const index = staffMembers.findIndex(member => member.id === id);
  if (index !== -1) {
    staffMembers[index] = { ...staffMembers[index], ...updates };
  }
};

export const getRoleDisplayName = (roles: UserRole[]): string => {
  const roleNames = {
    'owner': 'Owner',
    'manager': 'Manager',
    'head-of-kitchen': 'HoK',
    'front-desk-manager': 'FDM',
    'staff': 'Staff'
  };
  
  return roles.map(role => roleNames[role] || role).join(', ');
};

export const getLanguageDisplayName = (code: string): string => {
  const languages = {
    'en': 'English',
    'id': 'Bahasa Indonesia',
    'vi': 'Tiếng Việt',
    'my': 'မြန်မာဘာသာ'
  };
  
  return languages[code as keyof typeof languages] || code;
};