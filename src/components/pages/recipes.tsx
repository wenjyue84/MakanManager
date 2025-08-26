"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Grid3X3,
  List,
  Clock,
  Users,
  ChefHat,
  MapPin,
  Tag,
  Timer,
  CheckSquare,
  FileText,
  Upload,
  Edit,
  Trash2,
  Printer,
  Eye,
  Camera,
  AlertTriangle,
  X,
  Scale,
  Minus,
  Plus as PlusIcon,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import {
  scaleRecipe,
  getCategoryDisplayName,
  getCuisineDisplayName,
  getAllergenIcon,
  getAllergenDisplayName,
  type Recipe
} from '../../lib/recipes-data';
import { RecipeService } from '../../lib/services/recipes.service';
import { RecipeBulkActions } from '../recipe-bulk-actions';
import { Station } from '../../lib/types';
import { toast } from "sonner@2.0.3";
import { RecipeCreateModal } from '../modals/recipe-create-modal';
import { RecipeEditModal } from '../modals/recipe-edit-modal';
import { RecipeDeleteModal } from '../modals/recipe-delete-modal';

interface RecipesProps {
  // No additional props needed for this demo
}

export function Recipes({}: RecipesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scaleFactor, setScaleFactor] = useState([1]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [targetYield, setTargetYield] = useState('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const { user: currentUser, isLoading: userLoading } = useCurrentUser();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        const data = await RecipeService.getAllRecipes();
        setRecipesList(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        toast.error('Failed to load recipes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [refreshTrigger]);


  if (isUserLoading || !currentUser) {

    return <div>Loading...</div>;
  }

  const isManagement = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen'].includes(role)
  );

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    return recipesList.filter(recipe => {
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      if (selectedCategory !== 'all' && recipe.category !== selectedCategory) return false;
      if (selectedCuisine !== 'all' && recipe.cuisine !== selectedCuisine) return false;
      if (selectedStation !== 'all' && recipe.station !== selectedStation) return false;
      if (selectedTags.length > 0 && !selectedTags.some(tag => recipe.tags.includes(tag))) return false;
      return true;
    });
  }, [recipesList, searchQuery, selectedCategory, selectedCuisine, selectedStation, selectedTags]);

  // Get scaled recipe for display
  const scaledRecipe = selectedRecipe ? scaleRecipe(selectedRecipe, scaleFactor[0]) : null;

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setScaleFactor([1]);
    setTargetYield(recipe.yield);
    setCompletedSteps([]);
    setIsChecklistMode(false);
    setEditNotes(recipe.notes);
    setIsDetailOpen(true);
  };

  const handleAddRecipe = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditRecipe = () => {
    if (!isManagement) {
      toast.error('Only management can edit recipes');
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleDeleteRecipe = () => {
    if (!selectedRecipe || !isManagement) return;
    
    setIsDeleteModalOpen(true);
  };

  const handlePrintRecipe = () => {
    if (!selectedRecipe) return;
    setIsPrintViewOpen(true);
  };

  const handleExportPDF = () => {
    if (!selectedRecipe || !isManagement) return;
    toast.success('PDF recipe card generated', {
      description: 'Download will begin shortly'
    });
  };

  const handleUploadAttachment = () => {
    if (!isManagement) {
      toast.error('Only management can upload attachments');
      return;
    }
    toast.info('File upload feature coming soon!');
  };

  const handleScaleChange = (value: number[]) => {
    setScaleFactor(value);
    if (selectedRecipe) {
      const scaledYield = `${(parseFloat(selectedRecipe.yield.match(/\d+/) || ['1'])[0] * value[0]).toFixed(1)} ${selectedRecipe.yield.replace(/\d+\.?\d*/, '')}`;
      setTargetYield(scaledYield);
    }
  };

  const handleStepToggle = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedRecipe || !isManagement) return;
    
    // In a real app, this would update the recipe
    toast.success('Notes updated successfully');
  };

  const handleCreateRecipe = async (recipeData: Omit<Recipe, 'id' | 'lastUpdatedBy' | 'lastUpdatedDate'>) => {
    try {
      setIsLoading(true);
      const newRecipe = await RecipeService.createRecipe(recipeData, currentUser);
      toast.success(`Recipe "${newRecipe.name}" created successfully`);
      // Refresh the recipes list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to create recipe');
      console.error('Error creating recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRecipe = async (id: string, recipeData: Omit<Recipe, 'id' | 'lastUpdatedBy' | 'lastUpdatedDate'>) => {
    try {
      setIsLoading(true);
      const updatedRecipe = await RecipeService.updateRecipe(id, recipeData, currentUser);
      if (updatedRecipe) {
        toast.success(`Recipe "${updatedRecipe.name}" updated successfully`);
        // Update the selected recipe if it's the one being edited
        if (selectedRecipe && selectedRecipe.id === id) {
          setSelectedRecipe(updatedRecipe);
        }
        // Refresh the recipes list
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error('Failed to update recipe');
      }
    } catch (error) {
      toast.error('Failed to update recipe');
      console.error('Error updating recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecipeConfirm = async (id: string) => {
    try {
      setIsLoading(true);
      const success = await RecipeService.deleteRecipe(id);
      if (success) {
        const recipeToDelete = recipesList.find(r => r.id === id);
        toast.success(`Recipe "${recipeToDelete?.name || 'Unknown'}" deleted successfully`);
        // Close modals and reset state
        setIsDeleteModalOpen(false);
        setIsDetailOpen(false);
        setSelectedRecipe(null);
        // Refresh the recipes list
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error('Failed to delete recipe');
      }
    } catch (error) {
      toast.error('Failed to delete recipe');
      console.error('Error deleting recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCuisine('all');
    setSelectedStation('all');
    setSelectedTags([]);
  };

  const hasRequiredPhoto = (recipe: Recipe) => {
    return recipe.photo && recipe.photo !== '';
  };

  const allTags = Array.from(new Set(recipesList.flatMap(r => r.tags)));

  // Recipe Grid Card Component
  const RecipeGridCard = ({ 
    recipe, 
    isSelected, 
    onSelectionChange 
  }: { 
    recipe: Recipe;
    isSelected: boolean;
    onSelectionChange: (checked: boolean) => void;
  }) => (
    <Card className={`cursor-pointer hover:bg-accent/50 overflow-hidden relative ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="aspect-[4/3] relative" onClick={() => handleRecipeClick(recipe)}>
        {recipe.photo ? (
          <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Camera className="size-8 text-muted-foreground" />
          </div>
        )}
        {!hasRequiredPhoto(recipe) && (
          <div className="absolute top-2 right-2">
            <AlertTriangle className="size-5 text-warning bg-background rounded-full p-1" />
          </div>
        )}
      </div>
      <CardContent className="p-4" onClick={() => handleRecipeClick(recipe)}>
        <div className="space-y-2">
          <h4 className="font-medium truncate">{recipe.name}</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {getCategoryDisplayName(recipe.category)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getCuisineDisplayName(recipe.cuisine)}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {recipe.station}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{recipe.tags.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              {recipe.prepTimeMinutes}m
            </div>
            <div className="flex items-center gap-1">
              <Users className="size-3" />
              {recipe.yield}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Recipe Table Row Component
  const RecipeTableRow = ({ 
    recipe, 
    isSelected, 
    onSelectionChange 
  }: { 
    recipe: Recipe;
    isSelected: boolean;
    onSelectionChange: (checked: boolean) => void;
  }) => (
    <TableRow className="cursor-pointer hover:bg-accent/50">
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
        />
      </TableCell>
      <TableCell onClick={() => handleRecipeClick(recipe)}>
        <div className="flex items-center gap-2">
          <div className="size-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {recipe.photo ? (
              <img src={recipe.photo} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
              <Camera className="size-4 text-muted-foreground" />
            )}
          </div>
          {!hasRequiredPhoto(recipe) && (
            <AlertTriangle className="size-4 text-warning" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{recipe.name}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getCategoryDisplayName(recipe.category)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{getCuisineDisplayName(recipe.cuisine)}</Badge>
      </TableCell>
      <TableCell>{recipe.yield}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {recipe.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{recipe.tags.length - 2}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">{recipe.station}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline">
            <Eye className="size-3 mr-1" />
            View
          </Button>
          {isManagement && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Edit className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleEditRecipe();
                }}>
                  Edit Recipe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRecipe(recipe);
                  setIsDeleteDialogOpen(true);
                }}>
                  Delete Recipe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Recipes</h1>
              <p className="text-muted-foreground">Recipe library and management</p>
            </div>
            
            <div className="flex items-center gap-2">
              {isManagement && (
                <>
                  <Button onClick={handleAddRecipe} className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Add Recipe
                  </Button>
                  {selectedRecipe && (
                    <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                      <Download className="size-4" />
                      Export PDF Card
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* View Toggle */}
              <div className="flex border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="main-dish">Main Dish</SelectItem>
                  <SelectItem value="soup">Soup</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="sauce-condiment">Sauce/Condiment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  <SelectItem value="malaysian">Malaysian</SelectItem>
                  <SelectItem value="thai">Thai</SelectItem>
                  <SelectItem value="indonesian">Indonesian</SelectItem>
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

              {(searchQuery || selectedCategory !== 'all' || selectedCuisine !== 'all' || selectedStation !== 'all' || selectedTags.length > 0) && (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <X className="size-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <RecipeBulkActions
          selectedRecipes={selectedRecipes}
          onSelectionChange={setSelectedRecipes}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />

        {/* Recipes List/Grid */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                Loading recipes...
              </div>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No recipes found. Try removing filters.
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'}`}>
                  {filteredRecipes.map((recipe) => (
                    <RecipeGridCard 
                      key={recipe.id} 
                      recipe={recipe}
                      isSelected={selectedRecipes.some(r => r.id === recipe.id)}
                      onSelectionChange={(checked) => {
                        if (checked) {
                          setSelectedRecipes(prev => [...prev, recipe]);
                        } else {
                          setSelectedRecipes(prev => prev.filter(r => r.id !== recipe.id));
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox
                            checked={selectedRecipes.length === filteredRecipes.length && filteredRecipes.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRecipes([...filteredRecipes]);
                              } else {
                                setSelectedRecipes([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Cuisine</TableHead>
                        <TableHead>Yield/Servings</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecipes.map((recipe) => (
                        <RecipeTableRow 
                          key={recipe.id} 
                          recipe={recipe}
                          isSelected={selectedRecipes.some(r => r.id === recipe.id)}
                          onSelectionChange={(checked) => {
                            if (checked) {
                              setSelectedRecipes(prev => [...prev, recipe]);
                            } else {
                              setSelectedRecipes(prev => prev.filter(r => r.id !== recipe.id));
                            }
                          }}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="size-24 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {selectedRecipe.photo ? (
                      <img src={selectedRecipe.photo} alt={selectedRecipe.name} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="size-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{getCategoryDisplayName(selectedRecipe.category)}</Badge>
                      <Badge variant="secondary">{getCuisineDisplayName(selectedRecipe.cuisine)}</Badge>
                      <Badge variant="outline" className="capitalize">{selectedRecipe.station}</Badge>
                    </div>
                    <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        {targetYield}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        {selectedRecipe.prepTimeMinutes} mins
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePrintRecipe} variant="outline" size="sm">
                      <Printer className="size-4 mr-1" />
                      Print Recipe Card
                    </Button>
                    {isManagement && (
                      <>
                        <Button onClick={handleEditRecipe} variant="outline" size="sm">
                          <Edit className="size-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => setIsDeleteDialogOpen(true)} 
                          variant="outline" 
                          size="sm"
                        >
                          <Trash2 className="size-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {!hasRequiredPhoto(selectedRecipe) && isManagement && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Photo required for this recipe.</span>
                    <Button size="sm" variant="outline">
                      <Camera className="size-4 mr-1" />
                      Add Photo
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <div className={isMobile ? '' : 'col-span-2'}>
                  <Tabs defaultValue="ingredients">
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="steps">Steps</TabsTrigger>
                      <TabsTrigger value="allergens">Allergens & Tags</TabsTrigger>
                      <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ingredients" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Ingredients
                            <div className="flex items-center gap-2 text-sm">
                              <Scale className="size-4" />
                              Scale servings
                            </div>
                          </CardTitle>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Label className="text-sm">Target yield</Label>
                                <Input 
                                  value={targetYield} 
                                  onChange={(e) => setTargetYield(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-sm">Scale factor: {scaleFactor[0]}×</Label>
                                <Slider
                                  value={scaleFactor}
                                  onValueChange={handleScaleChange}
                                  min={0.5}
                                  max={3}
                                  step={0.1}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ingredient</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Unit</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {scaledRecipe?.ingredients.map((ingredient, index) => (
                                <TableRow key={index}>
                                  <TableCell>{ingredient.name}</TableCell>
                                  <TableCell>{ingredient.quantity}</TableCell>
                                  <TableCell>{ingredient.unit}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="steps" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Preparation Steps
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={isChecklistMode}
                                onCheckedChange={setIsChecklistMode}
                              />
                              <Label className="text-sm">Checklist mode</Label>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedRecipe.steps.map((step) => (
                            <div key={step.step} className="flex items-start gap-3">
                              {isChecklistMode ? (
                                <Checkbox 
                                  checked={completedSteps.includes(step.step)}
                                  onCheckedChange={() => handleStepToggle(step.step)}
                                  className="mt-1"
                                />
                              ) : (
                                <Badge variant="outline" className="mt-0.5 min-w-[24px] justify-center">
                                  {step.step}
                                </Badge>
                              )}
                              <div className="flex-1">
                                <p className={completedSteps.includes(step.step) ? 'line-through text-muted-foreground' : ''}>
                                  {step.instruction}
                                </p>
                                {step.timerMinutes && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    <Timer className="size-3 mr-1" />
                                    {step.timerMinutes} min
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="allergens" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Allergens & Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Allergens</h4>
                            {selectedRecipe.allergens.length === 0 ? (
                              <p className="text-muted-foreground">No known allergens</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {selectedRecipe.allergens.map((allergen) => (
                                  <Badge key={allergen} variant="destructive" className="flex items-center gap-1">
                                    <span>{getAllergenIcon(allergen)}</span>
                                    {getAllergenDisplayName(allergen)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="font-medium mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedRecipe.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  <Tag className="size-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="attachments" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Attachments
                            {isManagement && (
                              <Button onClick={handleUploadAttachment} size="sm" variant="outline">
                                <Upload className="size-4 mr-1" />
                                Upload
                              </Button>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedRecipe.attachments.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              No attachments uploaded yet
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedRecipe.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="size-4" />
                                    <div>
                                      <div className="font-medium">{attachment.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Uploaded by {attachment.uploadedBy} • {attachment.uploadedDate}
                                      </div>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost">
                                    <ExternalLink className="size-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes for Kitchen/Front</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isManagement ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add notes for kitchen/front staff..."
                            rows={4}
                          />
                          <Button onClick={handleSaveNotes} size="sm" className="w-full">
                            Save Notes
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm">{selectedRecipe.notes || 'No notes available'}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">
                        <div>Last updated by</div>
                        <div className="font-medium text-foreground">{selectedRecipe.lastUpdatedBy}</div>
                        <div>{selectedRecipe.lastUpdatedDate}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Recipe Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedRecipe?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRecipe}>
              Delete Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Recipe Card Dialog */}
      <Dialog open={isPrintViewOpen} onOpenChange={setIsPrintViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Recipe Card — A4 (Print)</DialogTitle>
              </DialogHeader>
              
              {/* Print-friendly recipe card */}
              <div className="bg-white text-black p-8 print:p-0" style={{ minHeight: '297mm', width: '210mm' }}>
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-bold">{selectedRecipe.name}</h1>
                    <div className="text-lg mt-2">
                      {getCategoryDisplayName(selectedRecipe.category)} • {getCuisineDisplayName(selectedRecipe.cuisine)}
                    </div>
                  </div>

                  {/* Recipe Info */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        {selectedRecipe.photo ? (
                          <img src={selectedRecipe.photo} alt={selectedRecipe.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Camera className="size-16 mx-auto mb-2 text-gray-500" />
                            <p>No photo available</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div><strong>Yield/Servings:</strong> {selectedRecipe.yield}</div>
                        <div><strong>Prep Time:</strong> {selectedRecipe.prepTimeMinutes} minutes</div>
                        <div><strong>Station:</strong> {selectedRecipe.station}</div>
                      </div>

                      {/* QR Code placeholder */}
                      <div className="mt-6 text-center">
                        <div className="size-24 bg-gray-200 rounded mx-auto flex items-center justify-center">
                          <QrCode className="size-12 text-gray-500" />
                        </div>
                        <p className="text-sm mt-2">Open in App</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Ingredients */}
                      <div>
                        <h2 className="text-xl font-bold border-b border-black pb-2 mb-3">Ingredients</h2>
                        <div className="space-y-1">
                          {selectedRecipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex">
                              <span className="w-16">{ingredient.quantity}</span>
                              <span className="w-12">{ingredient.unit}</span>
                              <span className="flex-1">{ingredient.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Allergens */}
                      {selectedRecipe.allergens.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold border-b border-black pb-2 mb-3">Allergens</h2>
                          <div className="flex flex-wrap gap-2">
                            {selectedRecipe.allergens.map((allergen) => (
                              <span key={allergen} className="border border-black px-2 py-1 rounded">
                                {getAllergenIcon(allergen)} {getAllergenDisplayName(allergen)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div>
                        <h2 className="text-xl font-bold border-b border-black pb-2 mb-3">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.tags.map((tag) => (
                            <span key={tag} className="border border-black px-2 py-1 rounded text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <h2 className="text-xl font-bold border-b border-black pb-2 mb-3">Preparation Steps</h2>
                    <div className="space-y-3">
                      {selectedRecipe.steps.map((step) => (
                        <div key={step.step} className="flex gap-3">
                          <input type="checkbox" className="mt-1" />
                          <div className="flex-1">
                            <span className="font-bold">{step.step}.</span> {step.instruction}
                            {step.timerMinutes && (
                              <span className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded">
                                ⏲ {step.timerMinutes} min
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t-2 border-black pt-4 text-center text-sm">
                    <p>Last updated by {selectedRecipe.lastUpdatedBy} • {selectedRecipe.lastUpdatedDate}</p>
                    <p className="mt-2">Makan Moments Cafe</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => window.print()} className="flex items-center gap-2">
                  <Printer className="size-4" />
                  Print Recipe Card
                </Button>
                <Button variant="outline" onClick={() => setIsPrintViewOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recipe Create Modal */}
      <RecipeCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRecipe={handleCreateRecipe}
      />

      {/* Recipe Edit Modal */}
      <RecipeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateRecipe={handleUpdateRecipe}
        recipe={selectedRecipe}
      />

      {/* Recipe Delete Modal */}
      <RecipeDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleteRecipe={handleDeleteRecipeConfirm}
        recipe={selectedRecipe}
      />
    </>
  );
}