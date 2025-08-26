import { User, UserRole } from '../types';

class UsersService {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || res.statusText);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  getUserById(id: string): Promise<User> {
    return this.request<User>(`/api/users/${id}`);
  }

  createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  deleteUser(id: string): Promise<void> {
    return this.request<void>(`/api/users/${id}`, { method: 'DELETE' });
  }

  getUsersByRole(role: UserRole): Promise<User[]> {
    return this.request<User[]>(`/api/users?role=${encodeURIComponent(role)}`);
  }

  updateUserPoints(id: string, pointsToAdd: number): Promise<User> {
    return this.request<User>(`/api/users/${id}/points`, {
      method: 'PATCH',
      body: JSON.stringify({ pointsToAdd }),
    });
  }
}

export const usersService = new UsersService();
export default UsersService;
