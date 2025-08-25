# User Management Hooks

This directory contains hooks for managing the current authenticated user in the MakanManager application.

## Problem Solved

Previously, the application had a hardcoded `currentUser` export from `lib/data.ts` that defaulted to Bahar (Staff). This caused inconsistencies where:
- The UI showed Simon as logged in (from auth context)
- But components still displayed "Good Evening, Bahar!" (from hardcoded currentUser)

## Solution

We've introduced two new hooks that provide consistent user management:

### `useCurrentUser()`

Returns the current authenticated user from the auth context.

```tsx
import { useCurrentUser } from '../../lib/hooks/use-current-user';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  
  if (isLoading || !user) {
    return <div>Loading...</div>;
  }
  
  return <div>Hello, {user.name}!</div>;
}
```

### `useCurrentUserWithFallback()`

Returns the current authenticated user, or falls back to a default user (Bahar) during loading states.

```tsx
import { useCurrentUserWithFallback } from '../../lib/hooks/use-current-user';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useCurrentUserWithFallback();
  
  // user will always be defined, either the authenticated user or the fallback
  return <div>Hello, {user.name}!</div>;
}
```

## Migration Guide

### Before (Deprecated)
```tsx
import { currentUser } from '../../lib/data';

function MyComponent() {
  return <div>Hello, {currentUser.name}!</div>;
}
```

### After (Recommended)
```tsx
import { useCurrentUser } from '../../lib/hooks/use-current-user';

function MyComponent() {
  const { user, isLoading } = useCurrentUser();
  
  if (isLoading || !user) {
    return <div>Loading...</div>;
  }
  
  return <div>Hello, {user.name}!</div>;
}
```

## Benefits

1. **Consistency**: All components now show the same user information
2. **Real-time updates**: User changes are reflected immediately across the app
3. **Type safety**: Better TypeScript support with proper user object types
4. **Loading states**: Proper handling of authentication loading states
5. **Maintainability**: Centralized user management logic

## Components Updated

The following components have been updated to use the new hook system:

- ✅ `src/components/pages/dashboard.tsx` - Fixed the greeting inconsistency
- ❌ Other components still need migration (see TODO below)

## TODO

The following components still need to be migrated from the deprecated `currentUser`:

- `src/components/task-management/task-list.tsx`
- `src/components/modals/task-edit-modal.tsx`
- `src/components/pages/issues.tsx`
- `src/components/modals/task-detail-modal.tsx`
- `src/components/modals/task-create-modal.tsx`
- `src/components/pages/disposal.tsx`
- `src/components/modals/recipe-edit-modal.tsx`
- `src/components/pages/purchase-list.tsx`
- `src/components/pages/cash.tsx`
- `src/components/pages/salary.tsx`
- `src/components/pages/recipes.tsx`
- `src/components/pages/reports.tsx`
- `src/components/pages/tasks.tsx`
- `src/components/modals/recipe-create-modal.tsx`
- `src/components/pages/staff.tsx`
- `src/components/pages/suppliers.tsx`
- `src/components/pages/staff-meal.tsx`
- `src/components/pages/skills.tsx`
- `src/components/layout/enhanced-app-layout.tsx`
- `src/components/layout/app-layout.tsx`
- `src/components/pages/online-orders.tsx`
- `src/components/pages/leaderboard.tsx`

## Notes

- The old `currentUser` export is deprecated but kept for backward compatibility
- Components should be migrated gradually to avoid breaking changes
- The `switchUserRole` function is also deprecated and should not be used
- All new components should use the `useCurrentUser` hook
- **User switching is restricted to owners only** - other users cannot switch between user accounts
