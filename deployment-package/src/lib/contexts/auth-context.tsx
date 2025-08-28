import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/tasks';

interface User {
  id: string;
  username: string;
  name: string;
  roles: string[];
  purchasingPerm: boolean;
  status: string;
  station?: string;
  startDate: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  photoUrl?: string;
  email?: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data for demo purposes
const mockUsers: Record<string, User> = {
  'owner': {
    id: '1',
    username: 'owner',
    name: 'Jay',
    roles: ['owner'],
    purchasingPerm: true,
    status: 'active',
    station: 'Management',
    startDate: '2024-01-01',
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+1234567890'
    },
    photoUrl: '',
    email: 'jay@makanmanager.com',
    phone: '+1234567890'
  },
  'manager': {
    id: '2',
    username: 'manager',
    name: 'Sherry',
    roles: ['manager'],
    purchasingPerm: true,
    status: 'active',
    station: 'Management',
    startDate: '2024-01-01',
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+1234567890'
    },
    photoUrl: '',
    email: 'sherry@makanmanager.com',
    phone: '+1234567890'
  },
  'chef1': {
    id: '3',
    username: 'chef1',
    name: 'Chef Alex',
    roles: ['staff'],
    purchasingPerm: false,
    status: 'active',
    station: 'Kitchen',
    startDate: '2024-01-01',
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+1234567890'
    },
    photoUrl: '',
    email: 'alex@makanmanager.com',
    phone: '+1234567890'
  }
};

// Quick backend availability check
const isBackendAvailable = async (): Promise<boolean> => {
  try {
    // Quick timeout check - don't wait more than 500ms
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 500);
    
    const response = await fetch('/api/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Backend is not available
    return false;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // Quick backend check
        const backendStatus = await isBackendAvailable();
        setBackendAvailable(backendStatus);
        
        if (authApi.isAuthenticated()) {
          const storedUser = authApi.getStoredUser();
          if (storedUser) {
            if (backendStatus) {
              // Backend available, try to validate token
              try {
                const response = await authApi.getCurrentUser();
                setUser(response.user);
              } catch (error) {
                console.log('Token validation failed, falling back to mock auth');
                // Fall back to mock authentication
                const mockUser = mockUsers[storedUser.username];
                if (mockUser) {
                  setUser(mockUser);
                } else {
                  authApi.logout();
                }
              }
            } else {
              // Backend not available, use mock auth
              const mockUser = mockUsers[storedUser.username];
              if (mockUser) {
                setUser(mockUser);
              } else {
                authApi.logout();
              }
            }
          }
        }
      } catch (error) {
        console.log('Auth check failed, using mock authentication');
        // If backend is not available, try to restore from mock data
        const storedUser = authApi.getStoredUser();
        if (storedUser && mockUsers[storedUser.username]) {
          setUser(mockUsers[storedUser.username]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For demo users, go straight to mock authentication for speed
      if (mockUsers[username]) {
        const mockUser = mockUsers[username];
        // Check password (in real app, this would be hashed)
        const expectedPassword = username === 'owner' ? 'admin123' : 
                               username === 'manager' ? 'manager123' : 
                               username === 'chef1' ? 'staff123' : '';
        
        if (password === expectedPassword) {
          // Store mock user data
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('mockAuth', 'true');
          setUser(mockUser);
          return;
        } else {
          throw new Error('Invalid username or password');
        }
      }
      
      // For non-demo users, check backend availability first
      if (backendAvailable === null) {
        // Check backend status if not already known
        const backendStatus = await isBackendAvailable();
        setBackendAvailable(backendStatus);
      }
      
      if (backendAvailable) {
        // Backend available, try real API
        try {
          const response = await authApi.login({ username, password });
          setUser(response.user);
          return;
        } catch (apiError: any) {
          console.log('API login failed:', apiError.message);
          throw apiError;
        }
      } else {
        // Backend not available, throw error for non-demo users
        throw new Error('Backend server is not available. Please try again later.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    localStorage.removeItem('mockAuth');
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user?.roles.some((role: string) => roles.includes(role)) || false;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
