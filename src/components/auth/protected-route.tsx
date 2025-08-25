import React from 'react';
import { useAuth } from '../../lib/contexts/auth-context';
import { LoginPage } from '../pages/login';
import { LoadingSpinner } from '../ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute - Not authenticated, showing login page');
    return <LoginPage />;
  }

  console.log('ProtectedRoute - Authenticated, rendering children');

  // If roles are required, check if user has the required role
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user.roles.some(role => requiredRoles.includes(role));
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
          <div className="text-center max-w-md mx-4">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required role, render children
  return <>{children}</>;
}
