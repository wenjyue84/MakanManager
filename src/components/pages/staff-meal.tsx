"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  Camera,
  Edit,
  Trash2,
  Eye,
  ChefHat,
  UtensilsCrossed,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useCurrentUserWithFallback } from '../../lib/hooks/use-current-user';
import { staffMembers } from '../../lib/staff-data';
import {
  formatCurrency,
  formatTime
} from '../../lib/operations-data';
import { type StaffMeal } from '../../lib/types';
import { toast } from "sonner";

interface StaffMealProps {
  // No additional props needed for this demo
}

export function StaffMealPage({}: StaffMealProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [dateRange, setDateRange] = useState('today');
  const [selectedMeal, setSelectedMeal] = useState<StaffMeal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [meals, setMeals] = useState<StaffMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user: currentUser } = useCurrentUserWithFallback();

  // Form state
  const [formData, setFormData] = useState({
    mealType: 'lunch' as 'lunch' | 'dinner',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    dishName: '',
    cookedBy: currentUser.id,
    eaters: [currentUser.id] as string[],
    approximateCost: '',
    photo: '',
    notes: ''
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('/api/staff-meals')
      .then((res) => res.json())
      .then((data: StaffMeal[]) => setMeals(data))
      .catch(() => toast.error('Failed to load staff meals'))
      .finally(() => setLoading(false));
  }, []);

  const isManagement = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  if (loading) {
    return <div className="p-4">Loading staff meals...</div>;
  }

  // Filter meals based on search and filters and sort by most recent first
  const filteredMeals = useMemo(() => {
    return meals
      .filter(meal => {
        if (searchQuery && !meal.dishName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedMealType !== 'all' && meal.mealType !== selectedMealType) return false;

        // Date range filtering (simplified for demo)
        if (dateRange === 'today') {
          const today = new Date().toISOString().split('T')[0];
          if (meal.date !== today) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [meals, searchQuery, selectedMealType, dateRange]);

  // Calculate stats
  const weeklyStats = useMemo(() => {
    const thisWeek = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return mealDate >= weekAgo;
    });

    return {
      totalMeals: thisWeek.length,
      totalCost: thisWeek.reduce((sum, meal) => sum + meal.approximateCost, 0)
    };
  }, [meals]);

  const weeklySummary = useMemo(() => {
    const summary: Record<string, { meals: number; cost: number }> = {};
    meals.forEach(meal => {
      const date = new Date(meal.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!summary[key]) summary[key] = { meals: 0, cost: 0 };
      summary[key].meals += 1;
      summary[key].cost += meal.approximateCost;
    });
    return Object.entries(summary)
      .map(([weekStart, stats]) => ({ weekStart, ...stats }))
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
  }, [meals]);

  // Get current user's meals sorted by most recent first
  const currentUserMeals = useMemo(() => {
    return meals
      .filter(meal =>
        meal.cookedBy === currentUser.id || meal.eaters.includes(currentUser.id)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [meals]);

  const getUserById = (id: string) => {
    return staffMembers.find(member => member.id === id);
  };

  // Quick entry templates
  const quickEntryTemplates = [
    {
      name: 'Simple Lunch',
      mealType: 'lunch',
      dishName: 'Fried Rice',
      approximateCost: '15.00',
      notes: 'Quick lunch using leftover rice and vegetables'
    },
    {
      name: 'Simple Dinner',
      mealType: 'dinner',
      dishName: 'Noodle Soup',
      approximateCost: '20.00',
      notes: 'Warm soup for dinner'
    },
    {
      name: 'Staff Favorite',
      mealType: 'lunch',
      dishName: 'Chicken Rice',
      approximateCost: '25.00',
      notes: 'Classic staff meal'
    }
  ];

  const handleQuickEntry = (template: typeof quickEntryTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      mealType: template.mealType as 'lunch' | 'dinner',
      dishName: template.dishName,
      approximateCost: template.approximateCost,
      notes: template.notes,
      eaters: [currentUser.id] // Default to current user
    }));
    setShowQuickEntry(false);
    setIsCreateOpen(true);
  };

  const handleCreateMeal = () => {
    // Reset form and errors
    setFormData({
      mealType: 'lunch',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      dishName: '',
      cookedBy: currentUser.id,
      eaters: [currentUser.id], // Default to current user
      approximateCost: '',
      photo: '',
      notes: ''
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.dishName.trim()) {
      errors.dishName = 'Dish name is required';
    }

    if (!formData.cookedBy) {
      errors.cookedBy = 'Please select who cooked the meal';
    }

    if (formData.eaters.length === 0) {
      errors.eaters = 'Please select at least one eater';
    }

    if (!formData.approximateCost || parseFloat(formData.approximateCost) <= 0) {
      errors.approximateCost = 'Please enter a valid cost';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.time) {
      errors.time = 'Time is required';
    }

    if (!formData.photo) {
      errors.photo = 'Photo is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveMeal = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const payload = {
      date: formData.date,
      time: formData.time,
      mealType: formData.mealType,
      dishName: formData.dishName.trim(),
      cookedBy: formData.cookedBy,
      eaters: formData.eaters,
      approximateCost: parseFloat(formData.approximateCost),
      photo: formData.photo,
      notes: formData.notes.trim(),
    };

    try {
      const res = await fetch('/api/staff-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved: StaffMeal = await res.json();
      setMeals(prev => [saved, ...prev]);
      toast.success('Staff meal recorded successfully!');
      setIsCreateOpen(false);
      setFormData({
        mealType: 'lunch',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        dishName: '',
        cookedBy: currentUser.id,
        eaters: [currentUser.id],
        approximateCost: '',
        photo: '',
        notes: ''
      });
    } catch {
      toast.error('Failed to save meal');
    }
  };

  const handleDeleteMeal = async () => {
    if (!selectedMeal) return;

    try {
      const res = await fetch(`/api/staff-meals/${selectedMeal.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setMeals(prev => prev.filter(meal => meal.id !== selectedMeal.id));
      toast.success(`Meal "${selectedMeal.dishName}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedMeal(null);
    } catch {
      toast.error('Failed to delete meal');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMealType('all');
    setDateRange('today');
  };

  // Mobile Card Component
  const MealCard = ({ meal }: { meal: StaffMeal }) => {
    const cookedBy = getUserById(meal.cookedBy);
    const eatersList = meal.eaters.map(id => getUserById(id)).filter(Boolean);
    const isCurrentUserMeal = meal.cookedBy === currentUser.id || meal.eaters.includes(currentUser.id);

    return (
      <Card className={`cursor-pointer hover:bg-accent/50 ${isCurrentUserMeal ? 'ring-2 ring-blue-200' : ''}`} onClick={() => {
        setSelectedMeal(meal);
        setIsDetailOpen(true);
      }}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{meal.dishName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {meal.mealType}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {meal.date} {formatTime(meal.time)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">{formatCurrency(meal.approximateCost)}</div>
                <div className="text-xs text-muted-foreground">{eatersList.length} eaters</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ChefHat className="size-4 text-muted-foreground" />
              <span className="text-sm">{cookedBy?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <div className="flex -space-x-1">
                {eatersList.slice(0, 3).map((eater) => (
                  <Avatar key={eater!.id} className="size-6 border-2 border-background">
                    <AvatarImage src={eater!.photo} />
                    <AvatarFallback className="text-xs">{eater!.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
                {eatersList.length > 3 && (
                  <div className="size-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+{eatersList.length - 3}</span>
                  </div>
                )}
              </div>
            </div>

            {meal.photo && (
              <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                <img src={meal.photo} alt={meal.dishName} className="w-full h-full object-cover" />
              </div>
            )}

            {isCurrentUserMeal && (
              <div className="flex items-center gap-1 text-blue-600 text-xs">
                <CheckCircle className="size-3" />
                Your meal
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Desktop Table Row Component
  const MealTableRow = ({ meal }: { meal: StaffMeal }) => {
    const cookedBy = getUserById(meal.cookedBy);
    const eatersList = meal.eaters.map(id => getUserById(id)).filter(Boolean);
    const isCurrentUserMeal = meal.cookedBy === currentUser.id || meal.eaters.includes(currentUser.id);

    return (
      <TableRow className={`cursor-pointer hover:bg-accent/50 ${isCurrentUserMeal ? 'bg-blue-50' : ''}`} onClick={() => {
        setSelectedMeal(meal);
        setIsDetailOpen(true);
      }}>
        <TableCell>
          <div className="size-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {meal.photo ? (
              <img src={meal.photo} alt={meal.dishName} className="w-full h-full object-cover" />
            ) : (
              <Camera className="size-4 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div>{meal.date}</div>
            <div className="text-sm text-muted-foreground">{formatTime(meal.time)}</div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">{meal.mealType}</Badge>
        </TableCell>
        <TableCell>
          <div className="font-medium">{meal.dishName}</div>
          {isCurrentUserMeal && (
            <div className="flex items-center gap-1 text-blue-600 text-xs mt-1">
              <CheckCircle className="size-3" />
              Your meal
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={cookedBy?.photo} />
              <AvatarFallback className="text-xs">{cookedBy?.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{cookedBy?.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{eatersList.length}</span>
            <div className="flex -space-x-1">
              {eatersList.slice(0, 3).map((eater) => (
                <Avatar key={eater!.id} className="size-5 border border-background">
                  <AvatarImage src={eater!.photo} />
                  <AvatarFallback className="text-xs">{eater!.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {eatersList.length > 3 && (
                <div className="size-5 rounded-full bg-muted border border-background flex items-center justify-center">
                  <span className="text-xs">+{eatersList.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="font-semibold text-green-600">{formatCurrency(meal.approximateCost)}</span>
        </TableCell>
        <TableCell>
          <div className="text-sm">{meal.notes || '—'}</div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline">
              <Eye className="size-3 mr-1" />
              View
            </Button>
            {(isManagement || meal.cookedBy === currentUser.id) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMeal(meal);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Staff Meal</h1>
              <p className="text-muted-foreground">Track staff meals and costs</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Weekly Stats */}
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{weeklyStats.totalMeals}</div>
                  <div className="text-muted-foreground">Meals this week</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{formatCurrency(weeklyStats.totalCost)}</div>
                  <div className="text-muted-foreground">Cost this week</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => setShowQuickEntry(true)} variant="outline" className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Quick Entry
                </Button>
                <Button onClick={handleCreateMeal} className="flex items-center gap-2">
                  <Plus className="size-4" />
                  New Meal
                </Button>
              </div>
            </div>
          </div>

          {/* Current User Stats */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={currentUser.photo} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">Welcome back, {currentUser.name}!</h3>
                  <p className="text-sm text-muted-foreground">
                    You've recorded {currentUserMeals.filter(m => m.cookedBy === currentUser.id).length} meals and 
                    participated in {currentUserMeals.length} meals this week.
                  </p>
                </div>
                <Button onClick={handleCreateMeal} size="sm">
                  Record My Meal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week Starting</TableHead>
                    <TableHead className="text-right">Meals</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklySummary.map(week => (
                    <TableRow key={week.weekStart}>
                      <TableCell>{week.weekStart}</TableCell>
                      <TableCell className="text-right">{week.meals}</TableCell>
                      <TableCell className="text-right">{formatCurrency(week.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Personal Meal History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="size-5" />
                Your Meal History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentUserMeals.length === 0 ? (
                <div className="text-center py-6">
                  <UtensilsCrossed className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No meals recorded yet. Start by recording your first meal!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentUserMeals.slice(0, 5).map((meal) => {
                    const cookedBy = getUserById(meal.cookedBy);
                    const isCook = meal.cookedBy === currentUser.id;
                    const isEater = meal.eaters.includes(currentUser.id);
                    
                    return (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              {new Date(meal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-muted-foreground">{formatTime(meal.time)}</div>
                          </div>
                          <div className="w-px h-8 bg-border"></div>
                          <div>
                            <div className="font-medium">{meal.dishName}</div>
                            <div className="text-sm text-muted-foreground">
                              {isCook ? 'Cooked by you' : `Cooked by ${cookedBy?.name}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {meal.mealType}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            RM {meal.approximateCost.toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedMeal(meal);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {currentUserMeals.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        // Could expand to show more meals
                        toast.info('View all meals in the main list below');
                      }}>
                        View All {currentUserMeals.length} Meals
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || selectedMealType !== 'all' || dateRange !== 'today') && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Meal Type Chips */}
            <div className="flex gap-2">
              <Button
                variant={selectedMealType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMealType('all')}
              >
                All
              </Button>
              <Button
                variant={selectedMealType === 'lunch' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMealType('lunch')}
              >
                Lunch
              </Button>
              <Button
                variant={selectedMealType === 'dinner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMealType('dinner')}
              >
                Dinner
              </Button>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div>
          {filteredMeals.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="size-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-muted-foreground mb-4">
                No staff meals found. Record your first meal!
              </div>
              <Button onClick={handleCreateMeal} className="flex items-center gap-2">
                <Plus className="size-4" />
                Record Your First Meal
              </Button>
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="grid gap-4">
                  {filteredMeals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Meal Type</TableHead>
                        <TableHead>Dish Name</TableHead>
                        <TableHead>Cooked By</TableHead>
                        <TableHead>Eaters</TableHead>
                        <TableHead>Cost (RM)</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMeals.map((meal) => (
                        <MealTableRow key={meal.id} meal={meal} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quick Entry Dialog */}
      <Dialog open={showQuickEntry} onOpenChange={setShowQuickEntry}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Meal Entry</DialogTitle>
            <DialogDescription>
              Choose a template to quickly record your meal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {quickEntryTemplates.map((template, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleQuickEntry(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.dishName}</p>
                      <p className="text-sm text-muted-foreground">RM {template.approximateCost}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMeal}>
              Custom Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Meal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Staff Meal</DialogTitle>
            <DialogDescription>
              Add details about the meal prepared for staff
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Meal Type *</Label>
                <Select value={formData.mealType} onValueChange={(value: 'lunch' | 'dinner') => 
                  setFormData(prev => ({ ...prev, mealType: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.mealType && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.mealType}</p>
                )}
              </div>

              <div>
                <Label>Date & Time *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="flex-1"
                  />
                </div>
                {(formErrors.date || formErrors.time) && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.date || formErrors.time}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Dish Name *</Label>
              <Input
                value={formData.dishName}
                onChange={(e) => setFormData(prev => ({ ...prev, dishName: e.target.value }))}
                placeholder="e.g., Fried chicken rice"
                className="mt-1"
              />
              {formErrors.dishName && (
                <p className="text-sm text-red-600 mt-1">{formErrors.dishName}</p>
              )}
            </div>

            <div>
              <Label>Cooked By *</Label>
              <Select value={formData.cookedBy} onValueChange={(value: string) => 
                setFormData(prev => ({ ...prev, cookedBy: value }))
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.cookedBy && (
                <p className="text-sm text-red-600 mt-1">{formErrors.cookedBy}</p>
              )}
            </div>

            <div>
              <Label>Eaters * (Select multiple)</Label>
              <div className="mt-1 border rounded-lg p-3 max-h-32 overflow-y-auto">
                {staffMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.eaters.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ 
                            ...prev, 
                            eaters: [...prev.eaters, member.id] 
                          }));
                        } else {
                          setFormData(prev => ({ 
                            ...prev, 
                            eaters: prev.eaters.filter(id => id !== member.id) 
                          }));
                        }
                      }}
                    />
                    <Avatar className="size-6">
                      <AvatarImage src={member.photo} />
                      <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
              {formErrors.eaters && (
                <p className="text-sm text-red-600 mt-1">{formErrors.eaters}</p>
              )}
            </div>

            <div>
              <Label>Approximate Cost (RM) *</Label>
              <Input
                type="number"
                value={formData.approximateCost}
                onChange={(e) => setFormData(prev => ({ ...prev, approximateCost: e.target.value }))}
                placeholder="0.00"
                className="mt-1"
                step="0.01"
                min="0"
              />
              {formErrors.approximateCost && (
                <p className="text-sm text-red-600 mt-1">{formErrors.approximateCost}</p>
              )}
            </div>

            <div>
              <Label>Photo *</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button onClick={handlePhotoClick} variant="outline" className="w-full">
                  <Camera className="size-4 mr-2" />
                  {formData.photo ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </div>
              {formErrors.photo && (
                <p className="text-sm text-red-600 mt-1">{formErrors.photo}</p>
              )}
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about the meal..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeal}>
              Save Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meal Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedMeal && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMeal.dishName}</DialogTitle>
                <DialogDescription>
                  {selectedMeal.date} • {formatTime(selectedMeal.time)} • {selectedMeal.mealType}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedMeal.photo && (
                  <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                    <img src={selectedMeal.photo} alt={selectedMeal.dishName} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Cooked By</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="size-6">
                        <AvatarImage src={getUserById(selectedMeal.cookedBy)?.photo} />
                        <AvatarFallback className="text-xs">
                          {getUserById(selectedMeal.cookedBy)?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{getUserById(selectedMeal.cookedBy)?.name}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Cost</Label>
                    <div className="font-semibold text-green-600 mt-1">
                      {formatCurrency(selectedMeal.approximateCost)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Eaters ({selectedMeal.eaters.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMeal.eaters.map(eaterId => {
                      const eater = getUserById(eaterId);
                      return eater ? (
                        <div key={eaterId} className="flex items-center gap-2 bg-accent rounded-lg px-2 py-1">
                          <Avatar className="size-5">
                            <AvatarImage src={eater.photo} />
                            <AvatarFallback className="text-xs">{eater.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{eater.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {selectedMeal.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="mt-1 text-sm">{selectedMeal.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                {(isManagement || selectedMeal.cookedBy === currentUser.id) && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsDetailOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meal Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedMeal?.dishName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMeal}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}