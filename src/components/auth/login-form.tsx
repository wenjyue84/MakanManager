import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../lib/contexts/auth-context';
import { toast } from 'sonner';
import { Loader2, User, Shield, ChefHat } from 'lucide-react';

// Demo user data for quick login
const demoUsers = [
  {
    id: '1',
    username: 'owner',
    password: 'admin123',
    name: 'Jay (Owner)',
    role: 'Owner',
    icon: Shield,
    description: 'Full system access'
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    name: 'Sherry (Manager)',
    role: 'Manager',
    icon: User,
    description: 'Management operations'
  },
  {
    id: '3',
    username: 'chef1',
    password: 'staff123',
    name: 'Chef Alex (Staff)',
    role: 'Staff',
    icon: ChefHat,
    description: 'Kitchen operations'
  }
];

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { login } = useAuth();

  const handleDemoLogin = async (demoUser: typeof demoUsers[0]) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setLoginError(null);
    
    // Show immediate loading state
    setIsLoading(true);
    
    try {
      // Add a small delay to show loading state (for better UX)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await login(demoUser.username, demoUser.password);
      toast.success(`Welcome back, ${demoUser.name}!`);
    } catch (error: any) {
      handleLoginError(error, demoUser.username);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(username, password);
      toast.success('Login successful!');
    } catch (error: any) {
      handleLoginError(error, username);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error: any, attemptedUsername: string) => {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed. ';
    let troubleshootingTips = '';
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      errorMessage += 'Cannot connect to the server.';
      troubleshootingTips = `
        • Check if the backend server is running
        • Verify your internet connection
        • Try refreshing the page
        • Contact system administrator if the issue persists
      `;
    } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      errorMessage += 'Invalid username or password.';
      troubleshootingTips = `
        • Double-check your username and password
        • Ensure Caps Lock is off
        • Try using the demo credentials below
        • Contact your manager if you forgot your password
      `;
    } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
      errorMessage += 'Server error occurred.';
      troubleshootingTips = `
        • The server is experiencing technical difficulties
        • Try again in a few minutes
        • Contact system administrator if the issue persists
        • Check system status page for updates
      `;
    } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      errorMessage += 'Authentication service not found.';
      troubleshootingTips = `
        • The login service may be temporarily unavailable
        • Check if the backend server is running
        • Verify the API endpoint configuration
        • Contact system administrator
      `;
    } else {
      errorMessage += error.message || 'An unexpected error occurred.';
      troubleshootingTips = `
        • Try refreshing the page
        • Clear your browser cache and cookies
        • Try using a different browser
        • Contact system administrator with error details
      `;
    }
    
    setLoginError(errorMessage);
    toast.error(errorMessage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Makan Manager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>
              
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800 font-medium">{loginError}</p>
                  <details className="mt-2">
                    <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                      Troubleshooting Tips
                    </summary>
                    <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                      {loginError.includes('Cannot connect') ? `
                        • Check if the backend server is running
                        • Verify your internet connection
                        • Try refreshing the page
                        • Contact system administrator if the issue persists
                      ` : loginError.includes('Invalid username') ? `
                        • Double-check your username and password
                        • Ensure Caps Lock is off
                        • Try using the demo credentials below
                        • Contact your manager if you forgot your password
                      ` : loginError.includes('Server error') ? `
                        • The server is experiencing technical difficulties
                        • Try again in a few minutes
                        • Contact system administrator if the issue persists
                        • Check system status page for updates
                      ` : `
                        • Try refreshing the page
                        • Clear your browser cache and cookies
                        • Try using a different browser
                        • Contact system administrator with error details
                      `}
                    </div>
                  </details>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
            
            {/* Demo User Buttons */}
            <div className="mt-6 space-y-3">
              <p className="text-center text-sm font-medium text-gray-700">Quick Demo Login</p>
              <div className="grid grid-cols-1 gap-2">
                {demoUsers.map((user) => {
                  const IconComponent = user.icon;
                  return (
                    <Button
                      key={user.id}
                      type="button"
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4"
                      onClick={() => handleDemoLogin(user)}
                      disabled={isLoading}
                    >
                      <IconComponent className="mr-3 h-5 w-5 text-gray-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Demo Credentials Text */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-2">Manual Demo Credentials:</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-mono text-xs text-gray-600">
                  <span className="font-medium">Owner:</span> owner / admin123<br />
                  <span className="font-medium">Manager:</span> manager / manager123<br />
                  <span className="font-medium">Staff:</span> chef1 / staff123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
