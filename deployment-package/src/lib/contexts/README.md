# Authentication System

This directory contains the authentication system for the MakanManager application.

## Components

### AuthContext (`auth-context.tsx`)
- Provides authentication state management using React Context and useReducer
- Handles login, logout, and user session management
- Manages loading states and error handling

### ProtectedRoute (`../auth/protected-route.tsx`)
- Wraps components that require authentication
- Redirects unauthenticated users to the login page
- Supports role-based access control

## Services

### AuthService (`../services/auth.service.ts`)
- Handles authentication logic (login, logout, token validation)
- Manages localStorage for user persistence
- Provides a clean interface for authentication operations

## Usage

### Basic Authentication
```tsx
import { useAuth } from '../lib/contexts/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {user?.name}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes
```tsx
import { ProtectedRoute } from '../components/auth/protected-route';

function App() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### Role-Based Access
```tsx
<ProtectedRoute requiredRoles={['owner', 'manager']}>
  <AdminPanel />
</ProtectedRoute>
```

## Demo Accounts

The system includes several demo accounts for testing:

- **Owner**: jay@makanmanager.com / password123
- **Manager**: simon@makanmanager.com / password123
- **Kitchen Head**: lily@makanmanager.com / password123
- **Front Desk Manager**: sherry@makanmanager.com / password123
- **Staff**: bahar@makanmanager.com / password123
- **Staff**: ros@makanmanager.com / password123
- **Staff**: ana@makanmanager.com / password123

## Security Notes

⚠️ **Important**: This is a demo implementation. In production:

1. **Never store passwords in plain text** - use bcrypt or similar hashing
2. **Implement proper JWT tokens** instead of localStorage
3. **Add CSRF protection** and other security measures
4. **Use HTTPS** for all authentication requests
5. **Implement rate limiting** for login attempts
6. **Add session timeout** and automatic logout
7. **Log authentication events** for security monitoring

## State Management

The authentication state includes:
- `user`: Current authenticated user object
- `isAuthenticated`: Boolean indicating authentication status
- `isLoading`: Boolean for loading states
- `error`: String for error messages

## Persistence

User sessions are persisted in localStorage for demo purposes. In production, use secure HTTP-only cookies or JWT tokens with proper expiration handling.
