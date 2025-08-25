"use client";

import React from 'react';
import { User as UserIcon, ChevronDown } from 'lucide-react';
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
import { users, currentUser } from '../../lib/data';

interface UserSwitcherProps {
  onUserChange: (userId: string) => void;
}

export function UserSwitcher({ onUserChange }: UserSwitcherProps) {
  const staffUsers = users.filter(user => user.roles.includes('staff'));
  const managementUsers = users.filter(user => 
    user.roles.some(role => ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role))
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-auto p-2">
          <Avatar className="size-8">
            <AvatarImage src={currentUser.photo} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {currentUser.roles.join(', ').replace(/-/g, ' ')}
            </p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch User (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Management
        </DropdownMenuLabel>
        {managementUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => onUserChange(user.id)}
            className={user.id === currentUser.id ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="size-6">
                <AvatarImage src={user.photo} />
                <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.roles.join(', ').replace(/-/g, ' ')}
                </p>
              </div>
              {user.id === currentUser.id && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Staff
        </DropdownMenuLabel>
        {staffUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => onUserChange(user.id)}
            className={user.id === currentUser.id ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="size-6">
                <AvatarImage src={user.photo} />
                <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.roles.join(', ').replace(/-/g, ' ')}
                </p>
              </div>
              {user.id === currentUser.id && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}