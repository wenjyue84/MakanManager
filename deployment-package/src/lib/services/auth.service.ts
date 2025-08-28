import { LoginCredentials, User } from '../types';

const SESSION_KEY = 'makanmanager_session_id';

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
      if (data.sessionId) {
        localStorage.setItem(SESSION_KEY, data.sessionId);
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  }

  static async validateSession(): Promise<{ valid: boolean; user?: User }> {
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      return { valid: false };
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();
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
    const sessionId = localStorage.getItem(SESSION_KEY);

    try {
      if (sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
      }
    } finally {
      localStorage.removeItem('makanmanager_user');
      localStorage.removeItem(SESSION_KEY);
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
