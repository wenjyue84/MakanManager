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
    const initAuth = () => {
      try {
        console.log('Initializing authentication...');
        const storedUser = AuthService.getStoredUser();
        console.log('Stored user:', storedUser);
        dispatch({ type: 'INIT_AUTH', payload: storedUser });
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'INIT_AUTH', payload: null });
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
  const logout = () => {
    AuthService.logout();
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
