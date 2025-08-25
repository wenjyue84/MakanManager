import { LoginCredentials, User } from '../types';
import { users } from '../data';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user by email and password
      const user = users.find(
        u => u.email.toLowerCase() === credentials.email.toLowerCase() && 
             u.password === credentials.password
      );

      if (user) {
        return { success: true, user };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  }

  static async validateToken(token: string): Promise<{ valid: boolean; user?: User }> {
    try {
      // In a real app, this would validate a JWT token
      // For now, we'll just check if the user exists in localStorage
      const storedUser = localStorage.getItem('makanmanager_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return { valid: true, user };
      }
      return { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }

  static logout(): void {
    localStorage.removeItem('makanmanager_user');
  }

  static getStoredUser(): User | null {
    try {
      const storedUser = localStorage.getItem('makanmanager_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  }

  static storeUser(user: User): void {
    localStorage.setItem('makanmanager_user', JSON.stringify(user));
  }
}
