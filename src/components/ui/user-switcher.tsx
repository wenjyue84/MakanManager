"use client";

import React from 'react';
import { User as UserIcon, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Button } from './button';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
import { Badge } from './badge';
import { users } from '../../lib/data';
import { useAuth } from '../../lib/contexts/auth-context';

interface UserSwitcherProps {
  onUserChange: (userId: string) => void;
}

export function UserSwitcher({ onUserChange }: UserSwitcherProps) {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const staffUsers = users.filter(user => user.roles.includes('staff'));
  const managementUsers = users.filter(user => 
    user.roles.some(role => ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role))
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-auto p-2">
          <Avatar className="size-8">
            <AvatarImage src={user.photo} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.roles.join(', ').replace(/-/g, ' ')}
            </p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Current User: {user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="size-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Switch User (Demo)
        </DropdownMenuLabel>
        
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Management
        </DropdownMenuLabel>
        {managementUsers.map((userItem) => (
          <DropdownMenuItem
            key={userItem.id}
            onClick={() => onUserChange(userItem.id)}
            className={userItem.id === user.id ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="size-6">
                <AvatarImage src={userItem.photo} />
                <AvatarFallback className="text-xs">{userItem.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{userItem.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userItem.roles.join(', ').replace(/-/g, ' ')}
                </p>
              </div>
              {userItem.id === user.id && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Staff
        </DropdownMenuLabel>
        {staffUsers.map((userItem) => (
          <DropdownMenuItem
            key={userItem.id}
            onClick={() => onUserChange(userItem.id)}
            className={userItem.id === user.id ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="size-6">
                <AvatarImage src={userItem.photo} />
                <AvatarFallback className="text-xs">{userItem.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{userItem.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userItem.roles.join(', ').replace(/-/g, ' ')}
                </p>
              </div>
              {userItem.id === user.id && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}