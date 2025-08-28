"use client";

import React, { useState } from 'react';
import {
  Bell,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Users,
  DollarSign,
  Settings,
  X,
  MoreHorizontal,
  ExternalLink,
  MarkAsRead
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { cn } from './utils';
import {
  notifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getGroupedNotifications,
  getPriorityColor,
  getTypeColor,
  formatTimeAgo,
  formatNotificationTime,
  type Notification,
  type NotificationGroup
} from '../../lib/notifications-data';
import { toast } from "sonner@2.0.3";

interface NotificationsProps {
  onNavigate?: (url: string) => void;
}

// Shared function to get type icons
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'order': return <Package className="size-4" />;
    case 'approval':
    case 'cash': return <Clock className="size-4" />;
    case 'task': return <CheckCircle className="size-4" />;
    case 'alert': return <AlertTriangle className="size-4" />;
    case 'issue': return <AlertCircle className="size-4" />;
    case 'staff': return <Users className="size-4" />;
    case 'system': return <Settings className="size-4" />;
    default: return <Bell className="size-4" />;
  }
};

export function Notifications({ onNavigate }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const unreadCount = getUnreadCount();
  const groupedNotifications = getGroupedNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsRead(notificationId);
    toast.success('Notification marked as read');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotification = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotification(notificationId);
    toast.success('Notification removed');
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={cn(
        "p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-accent/50",
        !notification.isRead && "bg-primary/5 border-l-4 border-l-primary"
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "size-8 rounded-full flex items-center justify-center flex-shrink-0",
          notification.isRead ? "bg-muted" : "bg-primary/10"
        )}>
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "text-sm truncate",
                  !notification.isRead && "font-medium"
                )}>
                  {notification.title}
                </h4>
                <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                  {notification.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {notification.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(notification.timestamp)}
                </span>
                {notification.actionRequired && (
                  <Badge variant="outline" className="text-xs">
                    Action Required
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.isRead && (
                  <DropdownMenuItem onClick={(e) => handleMarkAsRead(notification.id, e)}>
                    <CheckCircle className="size-4 mr-2" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                {notification.actionUrl && (
                  <DropdownMenuItem onClick={() => handleNotificationClick(notification)}>
                    <ExternalLink className="size-4 mr-2" />
                    {notification.actionText || 'View Details'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                  className="text-destructive"
                >
                  <X className="size-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="size-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Mark all read
              </Button>
            )}
            <Badge variant="secondary">
              {unreadCount} unread
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-0 rounded-none border-b">
            <TabsTrigger value="all" className="rounded-none">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="rounded-none">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0">
            <ScrollArea className="h-80">
              {filteredNotifications.length > 0 ? (
                <div className="group">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Bell className="size-8 text-muted-foreground mb-2" />
                  <h4 className="font-medium text-muted-foreground">
                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'unread' 
                      ? 'All caught up! Check back later for updates.'
                      : 'You\'ll see notifications here as they come in.'
                    }
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Footer */}
        {groupedNotifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <h4 className="text-sm font-medium mb-2">Quick Overview</h4>
              <div className="grid grid-cols-3 gap-2">
                {groupedNotifications.slice(0, 3).map((group) => (
                  <div key={group.category} className="text-center p-2 rounded bg-accent/50">
                    <div className="text-xs text-muted-foreground">{group.category}</div>
                    <div className="font-medium">{group.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Mobile-specific notifications component
export function MobileNotifications({ onNavigate }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = getUnreadCount();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl && onNavigate) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[16px] h-4">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <Badge variant="secondary" className="text-xs">
            {unreadCount} new
          </Badge>
        </div>

        <ScrollArea className="h-64">
          {notifications.slice(0, 8).map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-3 border-b last:border-b-0 cursor-pointer",
                !notification.isRead && "bg-primary/5"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-2">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "text-sm truncate",
                    !notification.isRead && "font-medium"
                  )}>
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        {notifications.length > 8 && (
          <div className="p-3 border-t text-center">
            <Button variant="ghost" size="sm" className="w-full">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}