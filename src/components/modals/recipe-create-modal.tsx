"use client";

import React, { useState } from 'react';
import { X, Plus, Minus, Upload, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Recipe, RecipeIngredient, RecipeStep, RecipeAttachment, Station } from '../../lib/recipes-data';

import { useCurrentUser } from '../../lib/hooks/use-current-user';

import { toast } from "sonner@2.0.3";

interface RecipeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRecipe: (recipeData: Omit<Recipe, 'id' | 'lastUpdatedBy' | 'lastUpdatedDate'>) => void;
}

export function RecipeCreateModal({ isOpen, onClose, onCreateRecipe }: RecipeCreateModalProps) {
  useCurrentUser();
  const [formData, setFormData] = useState({
    name: '',
    category: 'main-dish' as 'main-dish' | 'soup' | 'beverage' | 'sauce-condiment',
    cuisine: 'malaysian' as 'malaysian' | 'thai' | 'indonesian',
    station: 'kitchen' as Station,
    yield: '',
    prepTimeMinutes: 30,
    tags: [] as string[],
    photo: '',
    ingredients: [] as RecipeIngredient[],
    steps: [] as RecipeStep[],
    allergens: [] as ('shellfish' | 'dairy' | 'gluten' | 'nuts' | 'soy' | 'egg')[],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: 1, unit: '' });
  const [newStep, setNewStep] = useState({ instruction: '', timerMinutes: undefined as number | undefined });
  const [newTag, setNewTag] = useState('');

  const categories = ['main-dish', 'soup', 'beverage', 'sauce-condiment'];
  const cuisines = ['malaysian', 'thai', 'indonesian'];
  const stations: Station[] = ['kitchen', 'front', 'store', 'outdoor'];
  const allergenOptions = ['shellfish', 'dairy', 'gluten', 'nuts', 'soy', 'egg'];
  const units = ['g', 'kg', 'ml', 'L', 'pieces', 'stalks', 'leaves', 'cups', 'tbsp', 'tsp'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }
    if (!formData.yield.trim()) {
      newErrors.yield = 'Yield is required';
    }
    if (formData.prepTimeMinutes < 1) {
      newErrors.prepTimeMinutes = 'Prep time must be at least 1 minute';
    }
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    if (formData.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const recipeData: Omit<Recipe, 'id' | 'lastUpdatedBy' | 'lastUpdatedDate'> = {
      name: formData.name.trim(),
      category: formData.category,
      cuisine: formData.cuisine,
      station: formData.station,
      yield: formData.yield.trim(),
      prepTimeMinutes: formData.prepTimeMinutes,
      tags: formData.tags,
      photo: formData.photo,
      ingredients: formData.ingredients,
      steps: formData.steps,
      allergens: formData.allergens,
      attachments: [],
      notes: formData.notes.trim()
    };

    onCreateRecipe(recipeData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'main-dish',
      cuisine: 'malaysian',
      station: 'kitchen',
      yield: '',
      prepTimeMinutes: 30,
      tags: [],
      photo: '',
      ingredients: [],
      steps: [],
      allergens: [],
      notes: ''
    });
    setErrors({});
    setNewIngredient({ name: '', quantity: 1, unit: '' });
    setNewStep({ instruction: '', timerMinutes: undefined });
    setNewTag('');
  };

  const addIngredient = () => {
    if (!newIngredient.name.trim() || !newIngredient.unit.trim()) {
      toast.error('Please fill in ingredient name and unit');
      return;
    }

    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...newIngredient }]
    }));
    setNewIngredient({ name: '', quantity: 1, unit: '' });
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addStep = () => {
    if (!newStep.instruction.trim()) {
      toast.error('Please fill in step instruction');
      return;
    }

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { 
        step: prev.steps.length + 1, 
        instruction: newStep.instruction,
        timerMinutes: newStep.timerMinutes
      }]
    }));
    setNewStep({ instruction: '', timerMinutes: undefined });
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, step: i + 1 }))
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) {
      toast.error('Please enter a tag');
      return;
    }
    if (formData.tags.includes(newTag.trim())) {
      toast.error('Tag already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleAllergen = (allergen: 'shellfish' | 'dairy' | 'gluten' | 'nuts' | 'soy' | 'egg') => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Recipe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter recipe name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine</Label>
              <Select value={formData.cuisine} onValueChange={(value: any) => setFormData(prev => ({ ...prev, cuisine: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cuisines.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="station">Station</Label>
              <Select value={formData.station} onValueChange={(value: Station) => setFormData(prev => ({ ...prev, station: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(station => (
                    <SelectItem key={station} value={station}>
                      {station.charAt(0).toUpperCase() + station.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yield">Yield *</Label>
              <Input
                id="yield"
                value={formData.yield}
                onChange={(e) => setFormData(prev => ({ ...prev, yield: e.target.value }))}
                placeholder="e.g., 4 servings, 2L soup"
                className={errors.yield ? 'border-red-500' : ''}
              />
              {errors.yield && <p className="text-sm text-red-500">{errors.yield}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time (minutes) *</Label>
              <Input
                id="prepTime"
                type="number"
                min="1"
                value={formData.prepTimeMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, prepTimeMinutes: parseInt(e.target.value) || 1 }))}
                className={errors.prepTimeMinutes ? 'border-red-500' : ''}
              />
              {errors.prepTimeMinutes && <p className="text-sm text-red-500">{errors.prepTimeMinutes}</p>}
            </div>
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL (optional)</Label>
            <Input
              id="photo"
              value={formData.photo}
              onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div className="space-y-2">
            <Label>Allergens</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allergenOptions.map(allergen => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergen}
                    checked={formData.allergens.includes(allergen)}
                    onCheckedChange={() => toggleAllergen(allergen)}
                  />
                  <Label htmlFor={allergen} className="text-sm capitalize">
                    {allergen}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label>Ingredients *</Label>
            {errors.ingredients && <p className="text-sm text-red-500">{errors.ingredients}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={newIngredient.name}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ingredient name"
              />
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                placeholder="Quantity"
              />
              <Select value={newIngredient.unit} onValueChange={(value) => setNewIngredient(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="button" onClick={addIngredient} variant="outline" size="sm">
              <Plus className="size-4 mr-2" />
              Add Ingredient
            </Button>

            <div className="space-y-2 mt-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                  <span className="flex-1">{ingredient.name}</span>
                  <span className="text-muted-foreground">{ingredient.quantity} {ingredient.unit}</span>
                  <Button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Minus className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <Label>Steps *</Label>
            {errors.steps && <p className="text-sm text-red-500">{errors.steps}</p>}
            
            <div className="space-y-2">
              <Textarea
                value={newStep.instruction}
                onChange={(e) => setNewStep(prev => ({ ...prev, instruction: e.target.value }))}
                placeholder="Enter step instruction"
                rows={2}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Timer (minutes, optional)"
                  value={newStep.timerMinutes || ''}
                  onChange={(e) => setNewStep(prev => ({ 
                    ...prev, 
                    timerMinutes: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-40"
                />
                <Button type="button" onClick={addStep} variant="outline" size="sm">
                  <Plus className="size-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">Step {step.step}:</span>
                      {step.timerMinutes && (
                        <Badge variant="outline" className="text-xs">
                          ⏱️ {step.timerMinutes}m
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{step.instruction}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeStep(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Minus className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes, tips, or special instructions"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Recipe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
