export interface StaffMember {
  id: string;
  name: string;
  roles: string;
  gender?: 'male' | 'female';
  phone: string;
  email?: string;
  startDate?: string;
  status?: 'active' | 'inactive';
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
