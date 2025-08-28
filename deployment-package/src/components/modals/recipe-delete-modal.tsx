"use client";

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Recipe } from '../../lib/recipes-data';

interface RecipeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteRecipe: (id: string) => void;
  recipe: Recipe | null;
}

export function RecipeDeleteModal({ isOpen, onClose, onDeleteRecipe, recipe }: RecipeDeleteModalProps) {
  if (!recipe) return null;

  const handleDelete = () => {
    onDeleteRecipe(recipe.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            Delete Recipe
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this recipe? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="size-4" />
            <AlertDescription>
              <strong>{recipe.name}</strong> will be permanently removed from the system.
            </AlertDescription>
          </Alert>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Recipe Details:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium">Category:</span> {recipe.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p><span className="font-medium">Cuisine:</span> {recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1)}</p>
              <p><span className="font-medium">Station:</span> {recipe.station.charAt(0).toUpperCase() + recipe.station.slice(1)}</p>
              <p><span className="font-medium">Yield:</span> {recipe.yield}</p>
              <p><span className="font-medium">Prep Time:</span> {recipe.prepTimeMinutes} minutes</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="size-4 mr-2" />
            Delete Recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
