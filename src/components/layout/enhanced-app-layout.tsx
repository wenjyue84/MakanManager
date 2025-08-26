"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useTranslations } from '../../lib/hooks/use-translations';

interface EnhancedAppLayoutProps {
  children: React.ReactNode;
  onUserChange: (userId: string) => void;
}

export function EnhancedAppLayout({ 
  children, 
  onUserChange
}: EnhancedAppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.replace('/', '') || 'dashboard';
  const { currentLanguage, t, setLanguage, languageNames } = useTranslations();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['operations']); // Operations expanded by default
  const [pinnedItems, setPinnedItems] = useState<string[]>(['dashboard', 'online-orders', 'cash']); // Default pinned items
  const [recentItems, setRecentItems] = useState<string[]>(['tasks', 'staff']);

  // Navigation groups with logical organization
  const navigationGroups = [
    {
      id: 'operations',
      label: t('operations'),
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, description: t('overviewAndQuickActions'), badge: 3 },
        { id: 'online-orders', label: t('onlineOrders'), icon: Package2, description: t('manageCustomerOrders'), badge: 3 },
        { id: 'cash', label: t('cash'), icon: Wallet, description: t('cashReconciliation'), badge: 1 },
        { id: 'tasks', label: t('tasks'), icon: CheckSquare, description: t('taskManagement'), badge: 5 },
        { id: 'task-management', label: t('taskManagement'), icon: CheckSquare, description: t('fullCrudOperationsForTasks'), managementOnly: true }
      ]
    },
    {
      id: 'staff',
      label: t('staffManagement'),
      icon: Users,
      items: [
        { id: 'staff', label: t('staffDirectory'), icon: Users, description: t('staffInformationAndManagement') },
        { id: 'leaderboard', label: t('leaderboard'), icon: Trophy, description: t('performanceRankings') },
        { id: 'skills', label: t('skillsMatrix'), icon: GraduationCap, description: t('staffSkillsTracking') },
        { id: 'salary', label: t('salary'), icon: DollarSign, description: t('payrollAndSalaryManagement') }
      ]
    },
    {
      id: 'kitchen',
      label: t('kitchenAndInventory'),
      icon: UtensilsCrossed,
      items: [
        { id: 'recipes', label: t('recipes'), icon: BookOpen, description: t('recipeManagement') },
        { id: 'staff-meal', label: t('staffMeal'), icon: UtensilsCrossed, description: t('staffMealTracking') },
        { id: 'purchase-list', label: t('purchaseList'), icon: ShoppingCart, description: t('inventoryAndPurchasing') },
        { id: 'suppliers', label: t('suppliers'), icon: Building2, description: t('supplierManagement') },
        { id: 'disposal', label: t('disposal'), icon: Trash2, description: t('wasteTracking') }
      ]
    },
    {
      id: 'issues',
      label: t('issuesAndReports'),
      icon: AlertCircle,
      items: [
        { id: 'issues', label: t('issues'), icon: AlertCircle, description: t('issueReportingAndTracking'), badge: 2 },
        { id: 'discipline', label: t('discipline'), icon: AlertTriangle, description: t('disciplinaryActions'), managementOnly: true },
        { id: 'reports', label: t('reports'), icon: BarChart3, description: t('analyticsAndReports'), managementOnly: true },
        { id: 'admin', label: t('admin'), icon: Settings, description: t('systemAdministration'), managementOnly: true }
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
        icon: item.icon,
        url: `/${item.id}`
      }))
    ),
    // Sample data items (in real app, this would be dynamic)
    { id: 'order-001', title: 'Order #ORD-001', description: 'Ahmad Rizal - RM28.40', type: 'order' as const, group: 'Orders', url: '/online-orders' },
    { id: 'order-002', title: 'Order #ORD-002', description: 'Siti Nurhaliza - RM45.20', type: 'order' as const, group: 'Orders', url: '/online-orders' },
    { id: 'staff-sherry', title: 'Sherry', description: 'Front of House Staff', type: 'staff' as const, group: 'Staff', url: '/staff' },
    { id: 'staff-ahmad', title: 'Ahmad Rizal', description: 'Kitchen Staff', type: 'staff' as const, group: 'Staff', url: '/staff' },
    { id: 'recipe-teh-tarik', title: 'Teh Tarik', description: 'Traditional milk tea recipe', type: 'recipe' as const, group: 'Recipes', url: '/recipes' },
    { id: 'recipe-nasi-lemak', title: 'Nasi Lemak', description: 'Traditional Malaysian dish', type: 'recipe' as const, group: 'Recipes', url: '/recipes' },
    { id: 'task-clean-machine', title: 'Clean Espresso Machine', description: 'Daily maintenance task', type: 'task' as const, group: 'Tasks', url: '/tasks' },
    { id: 'task-stock-check', title: 'Weekly Stock Check', description: 'Inventory management task', type: 'task' as const, group: 'Tasks', url: '/tasks' }
  ];

  const languages = [
    { code: 'en' as const, name: languageNames.en },
    { code: 'id' as const, name: languageNames.id },
    { code: 'vi' as const, name: languageNames.vi },
    { code: 'my' as const, name: languageNames.my }
  ];

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
          handleNavigation(quickNavItems[index]);
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

  const handleNavigation = (pageId: string) => {
    navigate(`/${pageId}`);
    setIsMoreMenuOpen(false);
    setIsSearchOpen(false);
    
    // Add to recent items
    setRecentItems(prev => {
      const filtered = prev.filter(item => item !== pageId);
      return [pageId, ...filtered].slice(0, 5);
    });
  };

  const handleNotificationNavigate = (url: string) => {
    handleNavigation(url);
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
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group search results by type
  const groupedSearchResults = filteredSearchResults.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof searchableItems>);

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
                  <Globe className="size-4 mr-1" />
                  <span className="uppercase">{currentLanguage}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
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
                onClick={() => handleNavigation(item.id)}
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
                <span>{t('more')}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>{t('allFeatures')}</SheetTitle>
                <SheetDescription>
                  {t('accessAllSectionsOfMakanMomentsCafe')}
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
                              onClick={() => handleNavigation(item.id)}
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
                    onClick={() => handleNavigation(item.id)}
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
                    onClick={() => handleNavigation(item.id)}
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
                          onClick={() => handleNavigation(item.id)}
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
                    onClick={() => setLanguage(lang.code)}
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
                {t('search')}
              </DialogTitle>
              <DialogDescription>
                {t('searchForPagesOrdersStaffRecipesAndMore')}
              </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                              <Input
                  placeholder={t('typeToSearch')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
            </div>
            
            {searchQuery ? (
              <ScrollArea className="h-80">
                {filteredSearchResults.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedSearchResults).map(([group, items]) => (
                      <div key={group}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2 px-3">{group}</h4>
                        <div className="space-y-1">
                          {items.map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                handleNavigation(item.url.replace(/^\//, ''));
                                setIsSearchOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent text-left"
                            >
                              {item.icon && getItemIcon(item.icon)}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">{item.type}</Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('noResultsFoundFor')} "{searchQuery}"
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{t('quickAccess')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['dashboard', 'tasks', 'staff', 'online-orders'].map(itemId => {
                      const allItems = navigationGroups.flatMap(g => g.items);
                      const item = allItems.find(i => i.id === itemId);
                      if (!item) return null;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.id)}
                          className="flex items-center gap-2 p-2 rounded hover:bg-accent text-left"
                        >
                          {getItemIcon(item.icon)}
                          <span className="text-sm">{item.label}</span>
                          <kbd className="ml-auto text-xs bg-muted px-1 rounded">
                            ⌘{['1', '2', '3', '4'][['dashboard', 'tasks', 'staff', 'online-orders'].indexOf(item.id)]}
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
                          onClick={() => handleNavigation(item.id)}
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