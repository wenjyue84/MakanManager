import { useAuth } from '../contexts/auth-context';
import { users } from '../data';

/**
 * Hook that provides the current authenticated user
 * This replaces the hardcoded currentUser from the data file
 * and ensures consistency across the application
 */
export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Return the authenticated user if available
  if (isAuthenticated && user) {
    return {
      user,
      isAuthenticated: true,
      isLoading: false
    };
  }
  
  // Fallback to loading state
  return {
    user: null,
    isAuthenticated: false,
    isLoading
  };
}

/**
 * Hook that provides the current user with fallback to default user
 * Use this when you need a user object even during loading states
 */
export function useCurrentUserWithFallback() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Return the authenticated user if available
  if (isAuthenticated && user) {
    return {
      user,
      isAuthenticated: true,
      isLoading: false
    };
  }
  
  // Fallback to default user (Bahar) during loading or when not authenticated
  const defaultUser = users[4]; // Bahar (Staff)
  return {
    user: defaultUser,
    isAuthenticated: false,
    isLoading
  };
}
