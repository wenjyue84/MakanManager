import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthState, LoginCredentials, User } from '../types';
import { AuthService } from '../services/auth.service';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INIT_AUTH'; payload: User | null };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'INIT_AUTH':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check for stored user
        const storedUser = AuthService.getStoredUser();
        if (storedUser) {
          dispatch({ type: 'INIT_AUTH', payload: storedUser });
          return;
        }

        // Try to validate session
        const result = await AuthService.validateSession();
        if (result.valid && result.user) {
          dispatch({ type: 'INIT_AUTH', payload: result.user });
        } else {
          // Auto-login with default user for development
          const defaultUser = {
            id: '1',
            name: 'Jay',
            email: 'jay@makanmanager.com',
            roles: ['owner' as const],
            permissions: ['all'],
            profilePicture: undefined,
            department: 'Management',
            position: 'Owner',
            phone: '+1234567890',
            address: '123 Main St',
            emergencyContact: 'Emergency Contact',
            dateOfBirth: '1990-01-01',
            employeeId: 'EMP001',
            startDate: '2023-01-01',
            salary: 80000,
            status: 'active' as const,
            lastLogin: new Date().toISOString(),
            totalPoints: 1250,
            level: 'Gold',
            achievements: ['Team Player', 'Quality Master'],
            skillLevel: 'Expert',
            certifications: ['Food Safety', 'Management'],
          };
          
          AuthService.storeUser(defaultUser);
          dispatch({ type: 'INIT_AUTH', payload: defaultUser });
        }
      } catch (error) {
        // Auto-login with default user for development on error
        const defaultUser = {
          id: '1',
          name: 'Jay',
          email: 'jay@makanmanager.com',
          roles: ['owner' as const],
          permissions: ['all'],
          profilePicture: undefined,
          department: 'Management',
          position: 'Owner',
          phone: '+1234567890',
          address: '123 Main St',
          emergencyContact: 'Emergency Contact',
          dateOfBirth: '1990-01-01',
          employeeId: 'EMP001',
          startDate: '2023-01-01',
          salary: 80000,
          status: 'active' as const,
          lastLogin: new Date().toISOString(),
          totalPoints: 1250,
          level: 'Gold',
          achievements: ['Team Player', 'Quality Master'],
          skillLevel: 'Expert',
          certifications: ['Food Safety', 'Management'],
        };
        
        AuthService.storeUser(defaultUser);
        dispatch({ type: 'INIT_AUTH', payload: defaultUser });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const result = await AuthService.login(credentials);

      if (result.success && result.user) {
        AuthService.storeUser(result.user);
        dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: result.error || 'Login failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'An error occurred during login' });
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    await AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
