"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock, 
  ChefHat, 
  Globe,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RecipeService } from '../lib/services/recipes.service';
import { Recipe } from '../lib/recipes-data';

interface RecipeStats {
  total: number;
  byCategory: Record<string, number>;
  byCuisine: Record<string, number>;
  byStation: Record<string, number>;
  recentUpdates: number;
}

export function RecipeStats() {
  const [stats, setStats] = useState<RecipeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const recipeStats = await RecipeService.getRecipeStats();
      setStats(recipeStats);
      setError(null);
    } catch (err) {
      setError('Failed to load recipe statistics');
      console.error('Error loading recipe stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (category: string): string => {
    const categoryNames = {
      'main-dish': 'Main Dish',
      'soup': 'Soup',
      'beverage': 'Beverage',
      'sauce-condiment': 'Sauce/Condiment'
    };
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  const getCuisineDisplayName = (cuisine: string): string => {
    const cuisineNames = {
      'malaysian': 'Malaysian',
      'thai': 'Thai',
      'indonesian': 'Indonesian'
    };
    return cuisineNames[cuisine as keyof typeof cuisineNames] || cuisine;
  };

  const getStationDisplayName = (station: string): string => {
    const stationNames = {
      'kitchen': 'Kitchen',
      'front': 'Front',
      'store': 'Store',
      'outdoor': 'Outdoor'
    };
    return stationNames[station as keyof typeof stationNames] || station;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">{error || 'No statistics available'}</p>
          <Button onClick={loadStats} variant="outline" className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const topCategory = Object.entries(stats.byCategory)
    .sort(([,a], [,b]) => b - a)[0];
  
  const topCuisine = Object.entries(stats.byCuisine)
    .sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentUpdates} updated this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topCategory ? getCategoryDisplayName(topCategory[0]) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topCategory ? `${topCategory[1]} recipes` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Cuisine</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topCuisine ? getCuisineDisplayName(topCuisine[0]) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topCuisine ? `${topCuisine[1]} recipes` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUpdates}</div>
            <p className="text-xs text-muted-foreground">
              Updated this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="cuisines">Cuisines</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recipe Distribution by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => {
                    const percentage = ((count / stats.total) * 100).toFixed(1);
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getCategoryDisplayName(category)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} recipes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cuisines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Recipe Distribution by Cuisine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byCuisine)
                  .sort(([,a], [,b]) => b - a)
                  .map(([cuisine, count]) => {
                    const percentage = ((count / stats.total) * 100).toFixed(1);
                    return (
                      <div key={cuisine} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getCuisineDisplayName(cuisine)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} recipes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-secondary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Recipe Distribution by Station
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.byStation)
                  .sort(([,a], [,b]) => b - a)
                  .map(([station, count]) => {
                    const percentage = ((count / stats.total) * 100).toFixed(1);
                    return (
                      <div key={station} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {getStationDisplayName(station)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} recipes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Export All Recipes
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              View Recent Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
