import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/contexts/auth-context';
import { useTranslations } from '../../lib/hooks/use-translations';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, ChefHat } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError, isLoading } = useAuth();
  const { t } = useTranslations();

  // Clear error when component mounts or when error changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('pleaseFillAllFields'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await login({ email, password });
      if (success) {
        toast.success(t('loginSuccessful'));
      } else {
        toast.error(t('loginFailed'));
      }
    } catch (error) {
      toast.error(t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setIsSubmitting(true);
    try {
      const success = await login({ email: demoEmail, password: 'password123' });
      if (success) {
        toast.success(t('demoLoginSuccessful'));
      }
    } catch (error) {
      toast.error(t('demoLoginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <LoadingSpinner size="lg" text={t('loading')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('appName')}
          </h1>
          <p className="text-gray-600">
            {t('appTagline')}
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {t('welcomeBack')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('signInToContinue')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('emailAddress')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('enterYourEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('enterYourPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t('signingIn')}
                  </>
                ) : (
                  t('signIn')
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                {t('tryDemoAccounts')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('jay@makanmanager.com')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {t('owner')} (Jay)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('simon@makanmanager.com')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {t('manager')} (Simon)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('lily@makanmanager.com')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {t('kitchen')} (Lily)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('ana@makanmanager.com')}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {t('staff')} (Ana)
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 Makan Manager. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
