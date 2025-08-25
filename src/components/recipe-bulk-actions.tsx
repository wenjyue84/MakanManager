"use client";

import React, { useState } from 'react';
import { 
  Trash2, 
  Download, 
  Edit, 
  Tag, 
  AlertTriangle,
  CheckSquare,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Recipe } from '../lib/recipes-data';
import { RecipeService } from '../lib/services/recipes.service';
import { toast } from "sonner@2.0.3";

interface RecipeBulkActionsProps {
  selectedRecipes: Recipe[];
  onSelectionChange: (recipes: Recipe[]) => void;
  onRefresh: () => void;
}

export function RecipeBulkActions({ 
  selectedRecipes, 
  onSelectionChange, 
  onRefresh 
}: RecipeBulkActionsProps) {
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'category' | 'cuisine' | 'station' | 'tags'>('category');
  const [bulkValue, setBulkValue] = useState('');
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = ['main-dish', 'soup', 'beverage', 'sauce-condiment'];
  const cuisines = ['malaysian', 'thai', 'indonesian'];
  const stations = ['kitchen', 'front', 'store', 'outdoor'];
  const commonTags = ['popular', 'signature', 'seasonal', 'quick', 'healthy', 'spicy'];

  const handleBulkDelete = async () => {
    if (selectedRecipes.length === 0) return;

    setIsProcessing(true);
    try {
      const ids = selectedRecipes.map(r => r.id);
      const result = await RecipeService.bulkDeleteRecipes(ids);
      
      if (result.success.length > 0) {
        toast.success(`Successfully deleted ${result.success.length} recipes`);
        if (result.failed.length > 0) {
          toast.error(`Failed to delete ${result.failed.length} recipes`);
        }
        onSelectionChange([]);
        onRefresh();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error('Failed to delete any recipes');
      }
    } catch (error) {
      toast.error('Error during bulk delete operation');
      console.error('Bulk delete error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEdit = async () => {
    if (selectedRecipes.length === 0 || !bulkValue) return;

    setIsProcessing(true);
    try {
      const updatePromises = selectedRecipes.map(recipe => {
        const updateData: any = { id: recipe.id };
        
        switch (bulkAction) {
          case 'category':
            updateData.category = bulkValue;
            break;
          case 'cuisine':
            updateData.cuisine = bulkValue;
            break;
          case 'station':
            updateData.station = bulkValue;
            break;
          case 'tags':
            updateData.tags = bulkTags;
            break;
        }
        
        return RecipeService.updateRecipe(recipe.id, updateData);
      });

      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`Successfully updated ${successful} recipes`);
        if (failed > 0) {
          toast.error(`Failed to update ${failed} recipes`);
        }
        onSelectionChange([]);
        onRefresh();
        setIsBulkEditOpen(false);
        setBulkValue('');
        setBulkTags([]);
      } else {
        toast.error('Failed to update any recipes');
      }
    } catch (error) {
      toast.error('Error during bulk edit operation');
      console.error('Bulk edit error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedRecipes.length === 0) return;

    // Create CSV content
    const headers = ['Name', 'Category', 'Cuisine', 'Station', 'Yield', 'Prep Time', 'Tags', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...selectedRecipes.map(recipe => [
        `"${recipe.name}"`,
        `"${recipe.category}"`,
        `"${recipe.cuisine}"`,
        `"${recipe.station}"`,
        `"${recipe.yield}"`,
        recipe.prepTimeMinutes,
        `"${recipe.tags.join('; ')}"`,
        `"${recipe.notes}"`
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipes-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedRecipes.length} recipes to CSV`);
    setIsBulkExportOpen(false);
  };

  const addTag = () => {
    if (newTag.trim() && !bulkTags.includes(newTag.trim())) {
      setBulkTags([...bulkTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBulkTags(bulkTags.filter(tag => tag !== tagToRemove));
  };

  const getActionDisplayName = () => {
    switch (bulkAction) {
      case 'category': return 'Category';
      case 'cuisine': return 'Cuisine';
      case 'station': return 'Station';
      case 'tags': return 'Tags';
      default: return '';
    }
  };

  const getActionOptions = () => {
    switch (bulkAction) {
      case 'category': return categories;
      case 'cuisine': return cuisines;
      case 'station': return stations;
      default: return [];
    }
  };

  if (selectedRecipes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-muted/50 border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
          >
            <X className="h-4 w-4" />
            Clear Selection
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkEditOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBulkExportOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsBulkDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Bulk Delete
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {selectedRecipes.slice(0, 5).map(recipe => (
            <Badge key={recipe.id} variant="secondary" className="text-xs">
              {recipe.name}
            </Badge>
          ))}
          {selectedRecipes.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedRecipes.length - 5} more
            </Badge>
          )}
        </div>
      </div>

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Edit Recipes</DialogTitle>
            <DialogDescription>
              Update {selectedRecipes.length} selected recipes with new values.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Action Type</label>
              <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="cuisine">Cuisine</SelectItem>
                  <SelectItem value="station">Station</SelectItem>
                  <SelectItem value="tags">Tags</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkAction !== 'tags' ? (
              <div>
                <label className="text-sm font-medium">New {getActionDisplayName()}</label>
                <Select value={bulkValue} onValueChange={setBulkValue}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={`Select new ${getActionDisplayName().toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getActionOptions().map(option => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">New Tags</label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add new tag"
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm" variant="outline">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {bulkTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Common tags: {commonTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => !bulkTags.includes(tag) && setBulkTags([...bulkTags, tag])}
                        className="text-primary hover:underline mr-2"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkEdit} 
              disabled={!bulkValue && bulkAction !== 'tags' || bulkTags.length === 0}
            >
              {isProcessing ? 'Updating...' : 'Update Recipes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Bulk Delete Recipes
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRecipes.length} selected recipes? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The following recipes will be permanently removed:
            </AlertDescription>
          </Alert>

          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedRecipes.map(recipe => (
              <div key={recipe.id} className="flex items-center gap-2 p-2 border rounded">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm">{recipe.name}</span>
                <Badge variant="outline" className="text-xs">
                  {recipe.category}
                </Badge>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : `Delete ${selectedRecipes.length} Recipes`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Export Dialog */}
      <Dialog open={isBulkExportOpen} onOpenChange={setIsBulkExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Selected Recipes
            </DialogTitle>
            <DialogDescription>
              Export {selectedRecipes.length} selected recipes to CSV format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The CSV will include: Name, Category, Cuisine, Station, Yield, Prep Time, Tags, and Notes.
            </p>
            <div className="text-sm">
              <strong>Selected recipes:</strong>
              <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                {selectedRecipes.map(recipe => (
                  <div key={recipe.id} className="text-xs p-1 bg-muted rounded">
                    {recipe.name} ({recipe.category})
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
