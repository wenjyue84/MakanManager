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
  Search,
  Command,
  UtensilsCrossed,
  Trash2,
  AlertCircle,
  ShoppingCart,
  GraduationCap,
  Building2,
  DollarSign,
  Package2,
  Wallet,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Pin,
  PinOff,
  Star,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { currentUser, users } from '../../lib/data';
import { getUnreadCount } from '../../lib/notifications-data';
import { Language } from '../../lib/types';

interface EnhancedAppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onUserChange: (userId: string) => void;
}

// Navigation groups with logical organization
const navigationGroups = [
  {
    id: 'operations',
    label: 'Operations',
    icon: LayoutDashboard,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview and quick actions' },
      { id: 'online-orders', label: 'Online Orders', icon: Package2, description: 'Manage customer orders', badge: 3 },
      { id: 'cash', label: 'Cash', icon: Wallet, description: 'Cash reconciliation', badge: 1 },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare, description: 'Task management', badge: 5 },
      { id: 'task-management', label: 'Task Management', icon: CheckSquare, description: 'Full CRUD operations for tasks', managementOnly: true }
    ]
  },
  {
    id: 'staff',
    label: 'Staff Management',
    icon: Users,
    items: [
      { id: 'staff', label: 'Staff Directory', icon: Users, description: 'Staff information and management' },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Performance rankings' },
      { id: 'skills', label: 'Skills Matrix', icon: GraduationCap, description: 'Staff skills tracking' },
      { id: 'salary', label: 'Salary', icon: DollarSign, description: 'Payroll and salary management' }
    ]
  },
  {
    id: 'kitchen',
    label: 'Kitchen & Inventory',
    icon: UtensilsCrossed,
    items: [
      { id: 'recipes', label: 'Recipes', icon: BookOpen, description: 'Recipe management' },
      { id: 'staff-meal', label: 'Staff Meal', icon: UtensilsCrossed, description: 'Staff meal tracking' },
      { id: 'purchase-list', label: 'Purchase List', icon: ShoppingCart, description: 'Inventory and purchasing' },
      { id: 'suppliers', label: 'Suppliers', icon: Building2, description: 'Supplier management' },
      { id: 'disposal', label: 'Disposal', icon: Trash2, description: 'Waste tracking' }
    ]
  },
  {
    id: 'issues',
    label: 'Issues & Reports',
    icon: AlertCircle,
    items: [
      { id: 'issues', label: 'Issues', icon: AlertCircle, description: 'Issue reporting and tracking', badge: 2 },
      { id: 'discipline', label: 'Discipline', icon: AlertTriangle, description: 'Disciplinary actions', managementOnly: true },
      { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Analytics and reports', managementOnly: true },
      { id: 'admin', label: 'Admin', icon: Settings, description: 'System administration', managementOnly: true }
    ]
  }
];

// Global search data
const searchableItems = [
  // Pages
  ...navigationGroups.flatMap(group => 
    group.items.map(item => ({
      id: item.id,
      title: item.label,
      description: item.description,
      type: 'page' as const,
      group: group.label,
      icon: item.icon
    }))
  ),
  // Sample data items (in real app, this would be dynamic)
  { id: 'order-001', title: 'Order #ORD-001', description: 'Ahmad Rizal - RM28.40', type: 'order' as const, group: 'Orders' },
  { id: 'staff-sherry', title: 'Sherry', description: 'Front of House Staff', type: 'staff' as const, group: 'Staff' },
  { id: 'recipe-teh-tarik', title: 'Teh Tarik', description: 'Traditional milk tea recipe', type: 'recipe' as const, group: 'Recipes' },
  { id: 'task-clean-machine', title: 'Clean Espresso Machine', description: 'Daily maintenance task', type: 'task' as const, group: 'Tasks' }
];

const languages = [
  { code: 'en' as Language, name: 'English' },
  { code: 'id' as Language, name: 'Bahasa Indonesia' },
  { code: 'vi' as Language, name: 'Tiếng Việt' },
  { code: 'my' as Language, name: 'မြန်မာဘာသာ' }
];

export function EnhancedAppLayout({ 
  children, 
  currentPage, 
  onPageChange,
  currentLanguage,
  onLanguageChange,
  onUserChange
}: EnhancedAppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['operations']); // Operations expanded by default
  const [pinnedItems, setPinnedItems] = useState<string[]>(['dashboard', 'online-orders', 'cash']); // Default pinned items
  const [recentItems, setRecentItems] = useState<string[]>(['tasks', 'staff']);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global search: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Close search/modals: Escape
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMoreMenuOpen(false);
      }

      // Quick navigation: Cmd/Ctrl + 1-4
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const quickNavItems = ['dashboard', 'online-orders', 'cash', 'tasks'];
        const index = parseInt(e.key) - 1;
        if (quickNavItems[index]) {
          handlePageChange(quickNavItems[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return <div className="h-screen bg-background" />; 
  }

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setIsMoreMenuOpen(false);
    setIsSearchOpen(false);
    
    // Add to recent items
    setRecentItems(prev => {
      const filtered = prev.filter(item => item !== page);
      return [page, ...filtered].slice(0, 5);
    });
  };

  const handleNotificationNavigate = (url: string) => {
    onPageChange(url);
  };

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const togglePinned = (itemId: string) => {
    setPinnedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredSearchResults = searchableItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemIcon = (iconComponent: any) => {
    const Icon = iconComponent;
    return <Icon className="size-4" />;
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
            {/* Mobile Search */}
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)}>
              <Search className="size-4" />
            </Button>

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

        {/* Mobile Bottom Navigation - Pinned Items */}
        <nav className="flex border-t bg-card">
          {pinnedItems.slice(0, 4).map((itemId) => {
            const allItems = navigationGroups.flatMap(g => g.items);
            const item = allItems.find(i => i.id === itemId);
            if (!item) return null;
            
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
                {item.badge && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
          
          {/* More Menu */}
          <Sheet open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs text-muted-foreground">
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
                {navigationGroups.map(group => (
                  <div key={group.id} className="mb-6">
                    <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {group.items
                        .filter(item => !item.managementOnly || isManagement)
                        .map(item => {
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
                              {item.badge && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
                                  {item.badge}
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
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
      {/* Enhanced Desktop Sidebar */}
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

        {/* Search Button */}
        <div className="px-4 mb-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="size-4 mr-2" />
            Search...
            <div className="ml-auto flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </Button>
        </div>

        <ScrollArea className="px-4 pb-4 max-h-[calc(100vh-180px)]">
          {/* Pinned Items */}
          {pinnedItems.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="size-3 text-warning" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pinned</span>
              </div>
              {pinnedItems.map(itemId => {
                const allItems = navigationGroups.flatMap(g => g.items);
                const item = allItems.find(i => i.id === itemId);
                if (!item) return null;
                
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 group",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto px-1 py-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto opacity-0 group-hover:opacity-100 size-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinned(item.id);
                      }}
                    >
                      <PinOff className="size-3" />
                    </Button>
                  </button>
                );
              })}
              <Separator className="my-4" />
            </div>
          )}

          {/* Recent Items */}
          {recentItems.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</span>
              </div>
              {recentItems.slice(0, 3).map(itemId => {
                const allItems = navigationGroups.flatMap(g => g.items);
                const item = allItems.find(i => i.id === itemId);
                if (!item || pinnedItems.includes(itemId)) return null;
                
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto px-1 py-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
              <Separator className="my-4" />
            </div>
          )}

          {/* Navigation Groups */}
          {navigationGroups.map(group => (
            <div key={group.id} className="mb-4">
              <Collapsible 
                open={expandedGroups.includes(group.id)} 
                onOpenChange={() => toggleGroupExpanded(group.id)}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                    {expandedGroups.includes(group.id) ? 
                      <ChevronDown className="size-3" /> : 
                      <ChevronRight className="size-3" />
                    }
                    {getItemIcon(group.icon)}
                    {group.label}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {group.items
                    .filter(item => !item.managementOnly || isManagement)
                    .filter(item => !pinnedItems.includes(item.id)) // Don't show pinned items here
                    .map(item => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePageChange(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left group",
                            isActive 
                              ? "bg-primary text-primary-foreground" 
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-auto px-1 py-0 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto opacity-0 group-hover:opacity-100 size-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePinned(item.id);
                            }}
                          >
                            <Pin className="size-3" />
                          </Button>
                        </button>
                      );
                    })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Desktop Content */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Desktop Header */}
        <header className="flex items-center justify-between p-6 border-b bg-card">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold capitalize">{currentPage.replace('-', ' ')}</h2>
              <p className="text-sm text-muted-foreground">
                Welcome back, {currentUser.name}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Zap className="size-4 mr-2" />
                Quick Actions
              </Button>
            </div>
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

      {/* Global Search Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="size-5" />
              Global Search
            </DialogTitle>
            <DialogDescription>
              Search for pages, orders, staff, recipes, and more
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            
            {searchQuery ? (
              <ScrollArea className="h-80">
                {filteredSearchResults.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSearchResults.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.type === 'page') {
                            handlePageChange(item.id);
                          }
                          setIsSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent text-left"
                      >
                        {item.icon && getItemIcon(item.icon)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">{item.group}</Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Quick Access</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['dashboard', 'online-orders', 'cash', 'tasks'].map(itemId => {
                      const allItems = navigationGroups.flatMap(g => g.items);
                      const item = allItems.find(i => i.id === itemId);
                      if (!item) return null;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePageChange(item.id)}
                          className="flex items-center gap-2 p-2 rounded hover:bg-accent text-left"
                        >
                          {getItemIcon(item.icon)}
                          <span className="text-sm">{item.label}</span>
                          <kbd className="ml-auto text-xs bg-muted px-1 rounded">
                            ⌘{['1', '2', '3', '4'][['dashboard', 'online-orders', 'cash', 'tasks'].indexOf(item.id)]}
                          </kbd>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recent</h4>
                  <div className="space-y-1">
                    {recentItems.slice(0, 3).map(itemId => {
                      const allItems = navigationGroups.flatMap(g => g.items);
                      const item = allItems.find(i => i.id === itemId);
                      if (!item) return null;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePageChange(item.id)}
                          className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left"
                        >
                          {getItemIcon(item.icon)}
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}