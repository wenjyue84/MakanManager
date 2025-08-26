# Recipe CRUD Operations - Makan Moments Cafe

This document outlines the complete CRUD (Create, Read, Update, Delete) operations for the Recipes section of the Makan Moments Cafe management system.

## Overview

The Recipes section provides comprehensive recipe management capabilities including:
- **Create**: Add new recipes with detailed information
- **Read**: View recipes in grid/list views with search and filtering
- **Update**: Edit existing recipes with full validation
- **Delete**: Remove recipes with confirmation dialogs
- **Bulk Operations**: Perform actions on multiple recipes simultaneously

## Features

### 1. Recipe Management
- **Full CRUD Operations**: Complete create, read, update, and delete functionality
- **Rich Data Model**: Comprehensive recipe information including ingredients, steps, allergens, and notes
- **Photo Support**: Recipe images with fallback handling
- **Categorization**: Multiple classification systems (category, cuisine, station, tags)

### 2. User Interface
- **Dual View Modes**: Grid and list views for different user preferences
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Search & Filtering**: Advanced search with multiple filter options
- **Selection System**: Multi-select functionality for bulk operations

### 3. Advanced Features
- **Bulk Operations**: Edit, delete, or export multiple recipes at once
- **Recipe Scaling**: Dynamic ingredient scaling for different serving sizes
- **Print Support**: Recipe card printing with professional formatting
- **Export Functionality**: CSV export for data portability

## Database Schema

### Recipes Table
```sql
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    station station_type NOT NULL,
    yield VARCHAR(100) NOT NULL,
    prep_time INTEGER NOT NULL,
    tags TEXT[] DEFAULT '{}',
    photo TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]',
    steps TEXT[] NOT NULL DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Data Types
- **Category**: main-dish, soup, beverage, sauce-condiment
- **Cuisine**: malaysian, thai, indonesian
- **Station**: kitchen, front, store, outdoor
- **Allergens**: shellfish, dairy, gluten, nuts, soy, egg

## API Endpoints

### Recipe Service (`RecipeService`)

#### Get All Recipes
```typescript
static async getAllRecipes(filters?: {
  category?: string;
  cuisine?: string;
  station?: string;
  tags?: string[];
  search?: string;
}): Promise<Recipe[]>
```

#### Get Recipe by ID
```typescript
static async getRecipeById(id: string): Promise<Recipe | null>
```

#### Create Recipe
```typescript
static async createRecipe(recipeData: CreateRecipeData): Promise<Recipe>
```

#### Update Recipe
```typescript
static async updateRecipe(id: string, recipeData: UpdateRecipeData): Promise<Recipe | null>
```

#### Delete Recipe
```typescript
static async deleteRecipe(id: string): Promise<boolean>
```

#### Bulk Delete Recipes
```typescript
static async bulkDeleteRecipes(ids: string[]): Promise<{ success: string[], failed: string[] }>
```

#### Get Recipe Statistics
```typescript
static async getRecipeStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byCuisine: Record<string, number>;
  byStation: Record<string, number>;
  recentUpdates: number;
}>
```

#### Search Recipes
```typescript
static async searchRecipes(query: string, filters?: {
  category?: string;
  cuisine?: string;
  station?: string;
  tags?: string[];
  prepTimeMax?: number;
  allergens?: string[];
}): Promise<Recipe[]>
```

## Component Architecture

### Main Components

#### 1. Recipes Page (`src/components/pages/recipes.tsx`)
- Main recipe management interface
- Handles CRUD operations and state management
- Integrates all sub-components

#### 2. Recipe Create Modal (`src/components/modals/recipe-create-modal.tsx`)
- Form for creating new recipes
- Validation and error handling
- Ingredient and step management

#### 3. Recipe Edit Modal (`src/components/modals/recipe-edit-modal.tsx`)
- Form for editing existing recipes
- Pre-populated with current data
- Same validation as create modal

#### 4. Recipe Delete Modal (`src/components/modals/recipe-delete-modal.tsx`)
- Confirmation dialog for recipe deletion
- Shows recipe details before deletion
- Safety confirmation

#### 5. Recipe Bulk Actions (`src/components/recipe-bulk-actions.tsx`)
- Multi-recipe operations
- Bulk edit, delete, and export
- Selection management

### Data Flow

```
User Action → Component → Service → Database
     ↓
Response ← Service ← Database
     ↓
UI Update ← Component ← Response
```

## Usage Examples

### Creating a Recipe
```typescript
const newRecipe = await RecipeService.createRecipe({
  name: "Nasi Lemak",
  category: "main-dish",
  cuisine: "malaysian",
  station: "kitchen",
  yield: "4 servings",
  prepTimeMinutes: 45,
  tags: ["signature", "traditional"],
  ingredients: [
    { name: "Rice", quantity: 2, unit: "cups" },
    { name: "Coconut milk", quantity: 400, unit: "ml" }
  ],
  steps: [
    { step: 1, instruction: "Wash rice thoroughly", timerMinutes: 5 },
    { step: 2, instruction: "Cook with coconut milk", timerMinutes: 20 }
  ],
  allergens: [],
  notes: "Traditional Malaysian breakfast dish"
}, currentUser);
```

### Updating a Recipe
```typescript
const updatedRecipe = await RecipeService.updateRecipe(recipeId, {
  prepTimeMinutes: 50,
  tags: ["signature", "traditional", "popular"]
}, currentUser);
```

### Deleting a Recipe
```typescript
const success = await RecipeService.deleteRecipe(recipeId);
if (success) {
  console.log("Recipe deleted successfully");
}
```

### Bulk Operations
```typescript
// Bulk delete
const result = await RecipeService.bulkDeleteRecipes(['id1', 'id2', 'id3']);
console.log(`Deleted: ${result.success.length}, Failed: ${result.failed.length}`);

// Bulk edit
const updatePromises = selectedRecipes.map(recipe =>
  RecipeService.updateRecipe(recipe.id, { category: 'main-dish' }, currentUser)
);
await Promise.all(updatePromises);
```

## Security & Permissions

### Role-Based Access Control
- **Management Only**: Create, edit, and delete operations
- **Staff**: View and search recipes
- **Kitchen Staff**: Access to recipe details and scaling

### Data Validation
- Required field validation
- Ingredient and step validation
- Photo requirement checks
- Allergen safety information

## Error Handling

### Service Layer Errors
- Database connection failures
- Validation errors
- Permission denied errors
- Network timeouts

### UI Error Handling
- Toast notifications for success/error
- Form validation feedback
- Loading states during operations
- Graceful fallbacks for missing data

## Performance Considerations

### Database Optimization
- Indexed fields for common queries
- Efficient JSONB operations for ingredients
- Pagination support for large datasets

### Frontend Optimization
- Lazy loading of recipe images
- Debounced search input
- Efficient state management
- Memoized filtering and sorting

## Future Enhancements

### Planned Features
- **Recipe Versioning**: Track changes and rollback capability
- **Recipe Sharing**: Export/import between locations
- **Nutritional Information**: Calorie and macro tracking
- **Recipe Analytics**: Popularity and usage statistics
- **Mobile App**: Native mobile recipe access

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live changes
- **Offline Support**: Service worker for offline recipe access
- **Image Optimization**: Automatic image compression and resizing
- **Search Enhancement**: Full-text search with fuzzy matching

## Troubleshooting

### Common Issues

#### Recipe Not Saving
- Check database connection
- Verify user permissions
- Validate required fields
- Check console for errors

#### Images Not Loading
- Verify image URL validity
- Check file permissions
- Ensure proper image format
- Fallback to placeholder

#### Bulk Operations Failing
- Verify recipe IDs exist
- Check user permissions
- Monitor database performance
- Review error logs

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG_RECIPES=true
```

## Support

For technical support or feature requests:
- **Email**: tech@makanmoments.com
- **Documentation**: [Internal Wiki](https://wiki.makanmoments.com)
- **Issue Tracker**: [GitHub Issues](https://github.com/makanmoments/manager/issues)

---

*Last updated: December 2024*
*Version: 1.0.0*
