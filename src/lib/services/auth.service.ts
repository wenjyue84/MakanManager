import { LoginCredentials, User } from '../types';

const ACCESS_KEY = 'makanmanager_access_token';
const REFRESH_KEY = 'makanmanager_refresh_token';

export class AuthService {
  static async login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: data.message || 'Invalid email or password' };
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem(ACCESS_KEY, data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_KEY, data.refreshToken);

      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  }

  static async validateToken(): Promise<{ valid: boolean; user?: User }> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      return { valid: false };
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem(ACCESS_KEY, data.accessToken);
      }
      if (data.user) {
        AuthService.storeUser(data.user);
        return { valid: true, user: data.user };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
  }

  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    try {
      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      localStorage.removeItem('makanmanager_user');
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
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
