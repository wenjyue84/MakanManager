"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Medal,
  Settings,
  Star,
  Clock,
  CheckSquare,
  Filter,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import { appSettings } from '../../lib/data';
import { leaderboardData, getUserRank, getTotalActiveUsers, baharMonthlyRank } from '../../lib/leaderboard-data';
import { UserRole, Station } from '../../lib/types';
import { toast } from "sonner@2.0.3";

interface LeaderboardProps {
  onAdminClick?: () => void;
  onProfileClick?: (userId: string) => void;
}

type TimePeriod = 'weekly' | 'monthly' | 'allTime';

export function Leaderboard({ onAdminClick, onProfileClick }: LeaderboardProps) {
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user: currentUser, isLoading } = useCurrentUser();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  const isManagement = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  // Get leaderboard data for current period
  const currentData = leaderboardData[activePeriod];

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    return currentData.filter(entry => {
      if (searchQuery && !entry.user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedRole !== 'all') {
        if (selectedRole === 'staff' && !entry.user.roles.includes('staff')) return false;
        if (selectedRole === 'management' && !entry.user.roles.some(role => 
          ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
        )) return false;
        if (!selectedRole.includes('-') && !entry.user.roles.includes(selectedRole as UserRole)) return false;
      }
      if (selectedStation !== 'all' && entry.topStation !== selectedStation) return false;
      return true;
    });
  }, [currentData, searchQuery, selectedRole, selectedStation]);

  // Get top 3 for podium
  const top3 = filteredData.slice(0, 3);

  // Get current user's rank
  const userRank = getUserRank(currentUser.id, activePeriod);
  const isUserInTop10 = userRank && userRank.rank <= 10;

  // For demo: Show Bahar as not in top 10 for monthly view
  const showOutOfTop10 = currentUser.id === '5' && activePeriod === 'monthly';

  const totalActiveUsers = getTotalActiveUsers(activePeriod);

  const handleExportCSV = () => {
    toast.success(`CSV exported for ${activePeriod} leaderboard`, {
      description: 'Download will begin shortly'
    });
  };

  const handleProfileView = (userId: string) => {
    toast.info(`Opening profile for ${filteredData.find(e => e.user.id === userId)?.user.name}`);
    onProfileClick?.(userId);
  };

  const applyPreset = (preset: string) => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedStation('all');
    
    switch (preset) {
      case 'kitchen-only':
        setSelectedStation('kitchen');
        break;
      case 'front-only':
        setSelectedStation('front');
        break;
      case 'staff-only':
        setSelectedRole('staff');
        break;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedStation('all');
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same', delta: number) => {
    if (trend === 'up') return <TrendingUp className="size-3 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="size-3 text-red-600" />;
    return <Minus className="size-3 text-gray-500" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'same') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const formatTrendDelta = (trend: 'up' | 'down' | 'same', delta: number) => {
    if (trend === 'same') return '0';
    return `${delta > 0 ? '+' : ''}${delta}`;
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getRoleDisplayName = (roles: UserRole[]) => {
    const roleNames = {
      'owner': 'Owner',
      'manager': 'Manager',
      'head-of-kitchen': 'HoK',
      'front-desk-manager': 'FDM',
      'staff': 'Staff'
    };
    
    return roles.map(role => roleNames[role] || role).join(', ');
  };

  const getProgressToNextReward = () => {
    const userPoints = showOutOfTop10 ? baharMonthlyRank.points : (userRank?.points || currentUser.weeklyPoints);
    const nextThreshold = appSettings.rewardThresholds.find(t => t.points > userPoints);
    
    if (!nextThreshold) return null;
    
    const progress = (userPoints / nextThreshold.points) * 100;
    return {
      current: userPoints,
      next: nextThreshold.points,
      progress,
      reward: nextThreshold.reward
    };
  };

  const rewardProgress = getProgressToNextReward();

  // Podium Card Component
  const PodiumCard = ({ entry, rank }: { entry: any; rank: number }) => (
    <Card className={`cursor-pointer hover:bg-accent/50 ${rank === 1 ? 'ring-2 ring-yellow-400' : ''}`} 
          onClick={() => handleProfileView(entry.user.id)}>
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div className="text-4xl mb-2">{getMedalIcon(rank)}</div>
          <Avatar className="size-16 mx-auto">
            <AvatarImage src={entry.user.photo} />
            <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{entry.user.name}</h3>
            <Badge variant="outline" className="mt-1">
              {getRoleDisplayName(entry.user.roles)}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-primary">{entry.points}</div>
            <div className="text-sm text-muted-foreground">points this {activePeriod === 'allTime' ? 'period' : activePeriod.replace('ly', '')}</div>
            <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(entry.trend)}`}>
              {getTrendIcon(entry.trend, entry.trendDelta)}
              {formatTrendDelta(entry.trend, entry.trendDelta)}
            </div>
          </div>
          {entry.isTied && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    Tied<sup>t</sup>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tied on points; earliest timestamp wins</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Leaderboard Row Component
  const LeaderboardRow = ({ entry }: { entry: any }) => (
    <TableRow className="cursor-pointer hover:bg-accent/50" onClick={() => handleProfileView(entry.user.id)}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          #{entry.rank}
          {entry.isTied && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <sup className="text-xs text-muted-foreground">t</sup>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tied on points; earliest timestamp wins</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={entry.user.photo} />
            <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{entry.user.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getRoleDisplayName(entry.user.roles)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">{entry.topStation}</Badge>
      </TableCell>
      <TableCell className="font-semibold">{entry.points}</TableCell>
      <TableCell>
        <div className={`flex items-center gap-1 ${getTrendColor(entry.trend)}`}>
          {getTrendIcon(entry.trend, entry.trendDelta)}
          <span className="text-sm">{formatTrendDelta(entry.trend, entry.trendDelta)}</span>
        </div>
      </TableCell>
      <TableCell>{entry.tasksCompleted}</TableCell>
      <TableCell>{entry.avgApprovalTime}h</TableCell>
    </TableRow>
  );

  // Mobile Card Component
  const MobileCard = ({ entry }: { entry: any }) => (
    <Card className="cursor-pointer hover:bg-accent/50" onClick={() => handleProfileView(entry.user.id)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-2 py-1">
              #{entry.rank}
            </Badge>
            <Avatar className="size-10">
              <AvatarImage src={entry.user.photo} />
              <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{entry.user.name}</div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {getRoleDisplayName(entry.user.roles)}
                </Badge>
                <Badge variant="secondary" className="text-xs capitalize">
                  {entry.topStation}
                </Badge>
              </div>
            </div>
          </div>
          {entry.isTied && (
            <Badge variant="secondary" className="text-xs">
              Tied<sup>t</sup>
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-primary">{entry.points}</div>
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(entry.trend)}`}>
              {getTrendIcon(entry.trend, entry.trendDelta)}
              {formatTrendDelta(entry.trend, entry.trendDelta)}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>{entry.tasksCompleted} tasks</div>
            <div>{entry.avgApprovalTime}h avg approval</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Range Tabs */}
            <Tabs value={activePeriod} onValueChange={(value) => setActivePeriod(value as TimePeriod)}>
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="allTime">All-time</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {isManagement && (
              <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                <Download className="size-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role and Station Filters */}
            <div className="flex gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="head-of-kitchen">HoK</SelectItem>
                  <SelectItem value="front-desk-manager">FDM</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || selectedRole !== 'all' || selectedStation !== 'all') && (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <X className="size-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Presets */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('all')}
              className={selectedRole === 'all' && selectedStation === 'all' ? 'bg-accent' : ''}
            >
              All Roles · All Stations
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('kitchen-only')}
              className={selectedStation === 'kitchen' ? 'bg-accent' : ''}
            >
              Kitchen Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('front-only')}
              className={selectedStation === 'front' ? 'bg-accent' : ''}
            >
              Front Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('staff-only')}
              className={selectedRole === 'staff' ? 'bg-accent' : ''}
            >
              Staff Only
            </Button>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        <div className={isMobile ? 'space-y-6' : 'lg:col-span-3 space-y-6'}>
          {/* Top 3 Podium */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Top 3 {activePeriod === 'allTime' ? 'All-time' : activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((entry, index) => (
                <PodiumCard key={entry.user.id} entry={entry} rank={index + 1} />
              ))}
            </div>
            {top3.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Tie-breaker: earliest to reach the total
              </p>
            )}
          </div>

          {/* Your Rank Card */}
          {(isUserInTop10 || showOutOfTop10) && (
            <Card>
              <CardContent className="p-4">
                {isUserInTop10 && !showOutOfTop10 ? (
                  <div className="flex items-center gap-3">
                    <Trophy className="size-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-green-600">You're in Top 10!</h3>
                      <p className="text-sm text-muted-foreground">
                        Rank #{userRank?.rank} • {userRank?.points} points this {activePeriod === 'allTime' ? 'period' : activePeriod.replace('ly', '')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Your Position</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          #{showOutOfTop10 ? baharMonthlyRank.rank : userRank?.rank} of {totalActiveUsers}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {showOutOfTop10 ? baharMonthlyRank.points : userRank?.points} points • 
                          <span className="text-green-600 ml-1">
                            +{showOutOfTop10 ? baharMonthlyRank.trendDelta : userRank?.trendDelta} vs last {activePeriod === 'allTime' ? 'period' : activePeriod.replace('ly', '')}
                          </span>
                        </p>
                      </div>
                      <Avatar className="size-12">
                        <AvatarImage src={currentUser.photo} />
                        <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Table/List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Rankings</h2>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  No rankings yet for this period. Complete tasks to earn points.
                </div>
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div className="space-y-3">
                    {filteredData.map((entry) => (
                      <MobileCard key={entry.user.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Station</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Trend</TableHead>
                          <TableHead>Tasks</TableHead>
                          <TableHead>Avg Approval</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((entry) => (
                          <LeaderboardRow key={entry.user.id} entry={entry} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Rewards Progress Panel */}
        <div className={isMobile ? '' : 'lg:col-span-1'}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5 text-yellow-500" />
                Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Points translate to rewards. Default reward: Extra Day Off.
              </p>
              
              {rewardProgress && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next reward</span>
                    <span className="font-medium">{rewardProgress.current} / {rewardProgress.next}</span>
                  </div>
                  <Progress value={rewardProgress.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Next at {rewardProgress.next} pts: {rewardProgress.reward}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reward Tiers</h4>
                {appSettings.rewardThresholds.map((threshold, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{threshold.points} pts</span>
                    <span className="text-muted-foreground">{threshold.reward}</span>
                  </div>
                ))}
              </div>
              
              {isManagement && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center gap-2"
                  onClick={onAdminClick}
                >
                  <Settings className="size-4" />
                  Configure rewards
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}