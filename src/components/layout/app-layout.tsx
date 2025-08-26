"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Trophy, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  Globe,
  Bell,
  User,
  UtensilsCrossed,
  Trash2,
  AlertCircle,
  ShoppingCart,
  GraduationCap,
  Building2,
  DollarSign,
  Package2,
  Wallet,
  Menu,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { UserSwitcher } from '../ui/user-switcher';
import { Notifications, MobileNotifications } from '../ui/notifications';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { users } from '../../lib/data';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import { getUnreadCount } from '../../lib/notifications-data';
import { Language } from '../../lib/types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onUserChange: (userId: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, priority: 1 },
  { id: 'online-orders', label: 'Online Orders', icon: Package2, priority: 2 },
  { id: 'cash', label: 'Cash', icon: Wallet, priority: 3 },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, priority: 4 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, priority: 5 },
  { id: 'staff', label: 'Staff', icon: Users, priority: 6 },
  { id: 'recipes', label: 'Recipes', icon: BookOpen, priority: 7 },
  { id: 'staff-meal', label: 'Staff Meal', icon: UtensilsCrossed, priority: 8 },
  { id: 'disposal', label: 'Disposal', icon: Trash2, priority: 9 },
  { id: 'issues', label: 'Issues', icon: AlertCircle, priority: 10 },
  { id: 'purchase-list', label: 'Purchase List', icon: ShoppingCart, priority: 11 },
  { id: 'skills', label: 'Skills', icon: GraduationCap, priority: 12 },
  { id: 'suppliers', label: 'Suppliers', icon: Building2, priority: 13 },
  { id: 'salary', label: 'Salary', icon: DollarSign, priority: 14 },
  { id: 'discipline', label: 'Discipline', icon: AlertTriangle, priority: 15 },
  { id: 'reports', label: 'Reports', icon: BarChart3, priority: 16 },
  { id: 'admin', label: 'Admin', icon: Settings, priority: 17 }
];

const languages = [
  { code: 'en' as Language, name: 'English' },
  { code: 'id' as Language, name: 'Bahasa Indonesia' },
  { code: 'vi' as Language, name: 'Tiếng Việt' },
  { code: 'my' as Language, name: 'မြန်မာဘာသာ' }
];

export function AppLayout({ 
  children, 
  currentPage, 
  onPageChange,
  currentLanguage,
  onLanguageChange,
  onUserChange
}: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update notification count periodically
  useEffect(() => {
    const updateNotificationCount = () => {
      setNotificationCount(getUnreadCount());
    };

    updateNotificationCount();
    const interval = setInterval(updateNotificationCount, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Don't render until mounted and user loaded to avoid hydration issues
  if (!mounted || isLoading || !currentUser) {
    return <div className="h-screen bg-background" />;
  }

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const filteredNav = navigationItems.filter(item => {
    if (item.id === 'discipline' || item.id === 'reports' || item.id === 'admin') {
      return isManagement;
    }
    return true;
  });

  // For mobile: show first 4 items in bottom nav, rest in overflow menu
  const primaryNavItems = filteredNav.slice(0, 4);
  const overflowNavItems = filteredNav.slice(4);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMoreMenuOpen(false);
  };

  const handleNotificationNavigate = (url: string) => {
    onPageChange(url);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">MM</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Makan Moments</h1>
              <p className="text-xs text-muted-foreground">Staff Points & Tasks</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={currentLanguage === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Notifications */}
            <MobileNotifications onNavigate={handleNotificationNavigate} />

            {/* User Switcher */}
            <UserSwitcher onUserChange={onUserChange} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="flex border-t bg-card">
          {/* Primary Navigation Items */}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-5 mb-1" />
                <span className="truncate">{item.label}</span>
                {/* Notification badges for specific items */}
                {item.id === 'tasks' && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
                    5
                  </Badge>
                )}
                {item.id === 'online-orders' && (
                  <Badge variant="warning" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
                    3
                  </Badge>
                )}
              </button>
            );
          })}
          
          {/* More Menu */}
          <Sheet open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs",
                  overflowNavItems.some(item => item.id === currentPage)
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground"
                )}
              >
                <MoreHorizontal className="size-5 mb-1" />
                <span>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>All Features</SheetTitle>
                <SheetDescription>
                  Access all sections of Makan Moments Cafe
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="h-full mt-6">
                <div className="grid grid-cols-2 gap-3 pb-6">
                  {/* Show all navigation items in overflow menu */}
                  {filteredNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handlePageChange(item.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors relative",
                          isActive 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border hover:border-primary/50 hover:bg-accent"
                        )}
                      >
                        <Icon className="size-6 mb-2" />
                        <span className="text-sm font-medium text-center">{item.label}</span>
                        {isActive && (
                          <Badge variant="default" className="mt-1 text-xs">
                            Current
                          </Badge>
                        )}
                        {/* Show notification badges for specific items */}
                        {item.id === 'tasks' && (
                          <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
                            5
                          </Badge>
                        )}
                        {item.id === 'issues' && (
                          <Badge variant="warning" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
                            2
                          </Badge>
                        )}
                        {item.id === 'cash' && (
                          <Badge variant="warning" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
                            1
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">MM</span>
            </div>
            <div>
              <h1 className="font-semibold">Makan Moments</h1>
              <p className="text-sm text-muted-foreground">Staff Points & Tasks</p>
            </div>
          </div>
        </div>

        <nav className="px-4 pb-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 relative",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
                {/* Show notification badges */}
                {item.id === 'tasks' && (
                  <Badge variant="destructive" className="ml-auto px-1 py-0 text-xs">
                    5
                  </Badge>
                )}
                {item.id === 'issues' && (
                  <Badge variant="warning" className="ml-auto px-1 py-0 text-xs">
                    2
                  </Badge>
                )}
                {item.id === 'cash' && (
                  <Badge variant="warning" className="ml-auto px-1 py-0 text-xs">
                    1
                  </Badge>
                )}
                {item.id === 'online-orders' && (
                  <Badge variant="primary" className="ml-auto px-1 py-0 text-xs">
                    3
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="flex items-center justify-between p-6 border-b bg-card">
          <div>
            <h2 className="text-xl font-semibold capitalize">{currentPage.replace('-', ' ')}</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back, {currentUser.name}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Globe className="size-4 mr-2" />
                  {languages.find(l => l.code === currentLanguage)?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={currentLanguage === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop Notifications */}
            <Notifications onNavigate={handleNotificationNavigate} />

            {/* User Switcher */}
            <UserSwitcher onUserChange={onUserChange} />
          </div>
        </header>

        {/* Desktop Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}