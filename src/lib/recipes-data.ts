import { Station } from './types';

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  step: number;
  instruction: string;
  timerMinutes?: number;
}

export interface RecipeAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'main-dish' | 'soup' | 'beverage' | 'sauce-condiment';
  cuisine: 'malaysian' | 'thai' | 'indonesian';
  station: Station;
  yield: string;
  prepTimeMinutes: number;
  tags: string[];
  photo?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  allergens: ('shellfish' | 'dairy' | 'gluten' | 'nuts' | 'soy' | 'egg')[];
  attachments: RecipeAttachment[];
  notes: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Fried chicken sop',
    category: 'main-dish',
    cuisine: 'malaysian',
    station: 'kitchen',
    yield: 'Family tray',
    prepTimeMinutes: 45,
    tags: ['recipe'],
    photo: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Chicken thighs', quantity: 1.5, unit: 'kg' },
      { name: 'Garlic', quantity: 30, unit: 'g' },
      { name: 'Ginger', quantity: 20, unit: 'g' },
      { name: 'White pepper', quantity: 5, unit: 'g' },
      { name: 'Salt', quantity: 10, unit: 'g' },
      { name: 'Oil', quantity: 200, unit: 'ml' }
    ],
    steps: [
      { step: 1, instruction: 'Marinate chicken with garlic, ginger, salt and pepper', timerMinutes: 30 },
      { step: 2, instruction: 'Heat oil in deep pan until hot' },
      { step: 3, instruction: 'Fry chicken pieces until golden brown', timerMinutes: 15 },
      { step: 4, instruction: 'Remove and rest on paper towel', timerMinutes: 5 }
    ],
    allergens: [],
    attachments: [],
    notes: 'Ensure oil temperature is 170°C for best results',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-20'
  },
  {
    id: '2',
    name: 'Coffee base brewing',
    category: 'beverage',
    cuisine: 'malaysian',
    station: 'front',
    yield: 'Concentrate, 1L',
    prepTimeMinutes: 15,
    tags: ['recipe'],
    photo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Ground coffee', quantity: 200, unit: 'g' },
      { name: 'Hot water', quantity: 1, unit: 'L' },
      { name: 'Sugar syrup', quantity: 200, unit: 'ml' }
    ],
    steps: [
      { step: 1, instruction: 'Bloom coffee grounds with small amount of hot water', timerMinutes: 1 },
      { step: 2, instruction: 'Pour remaining water slowly and brew', timerMinutes: 8 },
      { step: 3, instruction: 'Filter through fine mesh' },
      { step: 4, instruction: 'Add sugar syrup and chill' }
    ],
    allergens: [],
    attachments: [],
    notes: 'Use 85°C water for optimal extraction',
    lastUpdatedBy: 'Sherry',
    lastUpdatedDate: '2024-08-19'
  },
  {
    id: '3',
    name: 'summary for brewing 4 cups (300ml ea)',
    category: 'beverage',
    cuisine: 'malaysian',
    station: 'front',
    yield: '4 × 300 ml',
    prepTimeMinutes: 10,
    tags: ['recipe', 'popular'],
    photo: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Ground coffee', quantity: 80, unit: 'g' },
      { name: 'Hot water', quantity: 1.2, unit: 'L' },
      { name: 'Sugar syrup', quantity: 80, unit: 'ml' }
    ],
    steps: [
      { step: 1, instruction: 'Use standard brewing method' },
      { step: 2, instruction: 'Divide into 4 cups' },
      { step: 3, instruction: 'Serve immediately' }
    ],
    allergens: [],
    attachments: [],
    notes: 'Popular portion size for small groups',
    lastUpdatedBy: 'Sherry',
    lastUpdatedDate: '2024-08-19'
  },
  {
    id: '4',
    name: 'Red Chili for Penyet',
    category: 'sauce-condiment',
    cuisine: 'indonesian',
    station: 'kitchen',
    yield: '500g sauce',
    prepTimeMinutes: 20,
    tags: ['recipe'],
    photo: 'https://images.unsplash.com/photo-1583432018937-ce1eb5b5f3d4?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Red chili', quantity: 300, unit: 'g' },
      { name: 'Garlic', quantity: 20, unit: 'g' },
      { name: 'Shallot', quantity: 60, unit: 'g' },
      { name: 'Sugar', quantity: 10, unit: 'g' },
      { name: 'Salt', quantity: 8, unit: 'g' },
      { name: 'Lime juice', quantity: 20, unit: 'ml' },
      { name: 'Oil', quantity: 50, unit: 'ml' }
    ],
    steps: [
      { step: 1, instruction: 'Remove seeds from chilies if less spice desired' },
      { step: 2, instruction: 'Blend all ingredients except lime juice' },
      { step: 3, instruction: 'Heat oil and fry paste', timerMinutes: 10 },
      { step: 4, instruction: 'Add lime juice and cool' }
    ],
    allergens: [],
    attachments: [],
    notes: 'Adjust chili quantity based on spice preference',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-20'
  },
  {
    id: '5',
    name: 'Tom Yam Soup Recipe',
    category: 'soup',
    cuisine: 'thai',
    station: 'kitchen',
    yield: '2L soup',
    prepTimeMinutes: 25,
    tags: ['recipe', 'popular'],
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Tom yam paste', quantity: 120, unit: 'g' },
      { name: 'Lemongrass', quantity: 2, unit: 'stalks' },
      { name: 'Kaffir lime leaves', quantity: 6, unit: 'leaves' },
      { name: 'Galangal', quantity: 20, unit: 'g' },
      { name: 'Fish sauce', quantity: 40, unit: 'ml' },
      { name: 'Lime juice', quantity: 40, unit: 'ml' },
      { name: 'Stock', quantity: 2, unit: 'L' }
    ],
    steps: [
      { step: 1, instruction: 'Bring stock to boil', timerMinutes: 10 },
      { step: 2, instruction: 'Add lemongrass, galangal, and lime leaves', timerMinutes: 5 },
      { step: 3, instruction: 'Stir in tom yam paste' },
      { step: 4, instruction: 'Season with fish sauce and lime juice' },
      { step: 5, instruction: 'Simmer and taste for balance' }
    ],
    allergens: [],
    attachments: [],
    notes: 'Balance sour, salty, and spicy flavors',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-18'
  },
  {
    id: '6',
    name: 'Fish Slices Noodles Recipe',
    category: 'main-dish',
    cuisine: 'malaysian',
    station: 'kitchen',
    yield: '4 servings',
    prepTimeMinutes: 30,
    tags: ['recipe'],
    photo: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Golden threadfin bream slices', quantity: 300, unit: 'g' },
      { name: 'Rice noodles', quantity: 400, unit: 'g' },
      { name: 'Pickled mustard', quantity: 80, unit: 'g' },
      { name: 'Tomato', quantity: 1, unit: 'piece' },
      { name: 'Ginger slices', quantity: 15, unit: 'g' },
      { name: 'Milk', quantity: 150, unit: 'ml' },
      { name: 'Stock', quantity: 1.5, unit: 'L' }
    ],
    steps: [
      { step: 1, instruction: 'Soak rice noodles until soft' },
      { step: 2, instruction: 'Bring stock to simmer with ginger' },
      { step: 3, instruction: 'Add fish slices and cook gently', timerMinutes: 5 },
      { step: 4, instruction: 'Add noodles, pickled mustard, tomato' },
      { step: 5, instruction: 'Finish with milk for creaminess' }
    ],
    allergens: ['dairy'],
    attachments: [],
    notes: 'Use fresh fish for best flavor',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-19'
  },
  {
    id: '7',
    name: 'Curry Mee Recipe',
    category: 'main-dish',
    cuisine: 'malaysian',
    station: 'kitchen',
    yield: '10L soup base',
    prepTimeMinutes: 60,
    tags: ['recipe', 'signature'],
    photo: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Curry paste', quantity: 500, unit: 'g' },
      { name: 'Coconut milk', quantity: 2, unit: 'L' },
      { name: 'Chicken pieces', quantity: 1.2, unit: 'kg' },
      { name: 'Triangular tofu', quantity: 300, unit: 'g' },
      { name: 'Long beans', quantity: 300, unit: 'g' },
      { name: 'Bean sprouts', quantity: 300, unit: 'g' },
      { name: 'Cockles', quantity: 300, unit: 'g' },
      { name: 'Stock', quantity: 7, unit: 'L' }
    ],
    steps: [
      { step: 1, instruction: 'Fry curry paste until fragrant', timerMinutes: 5 },
      { step: 2, instruction: 'Add stock and simmer curry base', timerMinutes: 20 },
      { step: 3, instruction: 'Add coconut milk gradually', timerMinutes: 5 },
      { step: 4, instruction: 'Add chicken and tofu, cook through' },
      { step: 5, instruction: 'Season and adjust consistency' }
    ],
    allergens: ['shellfish', 'dairy'],
    attachments: [],
    notes: 'Signature dish - maintain consistency across batches',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-17'
  },
  {
    id: '8',
    name: 'Thai Steamed Fish Recipe',
    category: 'main-dish',
    cuisine: 'thai',
    station: 'kitchen',
    yield: '2-3 servings',
    prepTimeMinutes: 35,
    tags: ['recipe', 'signature'],
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Whole fish', quantity: 1, unit: 'kg' },
      { name: 'Lime juice', quantity: 60, unit: 'ml' },
      { name: 'Fish sauce', quantity: 30, unit: 'ml' },
      { name: 'Chilies', quantity: 5, unit: 'pieces' },
      { name: 'Garlic', quantity: 15, unit: 'g' },
      { name: 'Sugar', quantity: 10, unit: 'g' }
    ],
    steps: [
      { step: 1, instruction: 'Clean and score fish' },
      { step: 2, instruction: 'Steam fish until cooked', timerMinutes: 15 },
      { step: 3, instruction: 'Prepare sauce with lime, fish sauce, chilies' },
      { step: 4, instruction: 'Pour sauce over steamed fish' }
    ],
    allergens: [],
    attachments: [],
    notes: 'Use fresh fish from trusted supplier',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-16'
  },
  {
    id: '9',
    name: 'Thai Sauce Recipe',
    category: 'sauce-condiment',
    cuisine: 'thai',
    station: 'kitchen',
    yield: '300ml sauce',
    prepTimeMinutes: 15,
    tags: ['recipe'],
    photo: 'https://images.unsplash.com/photo-1583432018937-ce1eb5b5f3d4?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Fish sauce', quantity: 100, unit: 'ml' },
      { name: 'Lime juice', quantity: 80, unit: 'ml' },
      { name: 'Sugar', quantity: 30, unit: 'g' },
      { name: 'Chilies', quantity: 20, unit: 'g' },
      { name: 'Garlic', quantity: 10, unit: 'g' }
    ],
    steps: [
      { step: 1, instruction: 'Pound chilies and garlic in mortar' },
      { step: 2, instruction: 'Mix with fish sauce and lime juice' },
      { step: 3, instruction: 'Add sugar and stir until dissolved' },
      { step: 4, instruction: 'Taste and adjust balance' }
    ],
    allergens: [],
    attachments: [],
    notes: 'Versatile sauce for Thai dishes',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-15'
  },
  {
    id: '10',
    name: 'Ice Lemon Tea Recipe',
    category: 'beverage',
    cuisine: 'malaysian',
    station: 'front',
    yield: '~6–7 cups',
    prepTimeMinutes: 20,
    tags: ['recipe', 'popular'],
    photo: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Tea bags', quantity: 6, unit: 'pieces' },
      { name: 'Hot water', quantity: 1.2, unit: 'L' },
      { name: 'Lemon', quantity: 3, unit: 'pieces' },
      { name: 'Sugar syrup', quantity: 250, unit: 'ml' },
      { name: 'Ice', quantity: 1, unit: 'kg' }
    ],
    steps: [
      { step: 1, instruction: 'Steep tea bags in hot water', timerMinutes: 8 },
      { step: 2, instruction: 'Remove tea bags and let cool' },
      { step: 3, instruction: 'Squeeze lemons and strain juice' },
      { step: 4, instruction: 'Mix tea, lemon juice, and sugar syrup' },
      { step: 5, instruction: 'Serve over ice' }
    ],
    allergens: [],
    attachments: [],
    notes: 'Popular refreshing drink for hot weather',
    lastUpdatedBy: 'Sherry',
    lastUpdatedDate: '2024-08-20'
  },
  {
    id: '11',
    name: 'Nasi Lemak Recipe',
    category: 'main-dish',
    cuisine: 'malaysian',
    station: 'kitchen',
    yield: '10 servings',
    prepTimeMinutes: 90,
    tags: ['recipe', 'signature'],
    photo: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
    ingredients: [
      { name: 'Rice', quantity: 1.5, unit: 'kg' },
      { name: 'Coconut milk', quantity: 1.2, unit: 'L' },
      { name: 'Pandan leaves', quantity: 5, unit: 'pieces' },
      { name: 'Sambal', quantity: 600, unit: 'g' },
      { name: 'Fried anchovies', quantity: 200, unit: 'g' },
      { name: 'Peanuts', quantity: 200, unit: 'g' },
      { name: 'Eggs', quantity: 10, unit: 'pieces' }
    ],
    steps: [
      { step: 1, instruction: 'Wash rice and drain' },
      { step: 2, instruction: 'Cook rice with coconut milk and pandan', timerMinutes: 45 },
      { step: 3, instruction: 'Prepare sambal separately' },
      { step: 4, instruction: 'Fry anchovies and peanuts until crispy' },
      { step: 5, instruction: 'Hard boil eggs and slice' },
      { step: 6, instruction: 'Serve rice with all accompaniments' }
    ],
    allergens: ['peanuts', 'egg'],
    attachments: [],
    notes: 'National dish - ensure all components are fresh',
    lastUpdatedBy: 'Lily',
    lastUpdatedDate: '2024-08-14'
  }
];

// Helper functions
export const getRecipeById = (id: string): Recipe | undefined => {
  return recipes.find(recipe => recipe.id === id);
};

export const getRecipesByCategory = (category: string): Recipe[] => {
  if (category === 'all') return recipes;
  return recipes.filter(recipe => recipe.category === category);
};

export const getRecipesByCuisine = (cuisine: string): Recipe[] => {
  if (cuisine === 'all') return recipes;
  return recipes.filter(recipe => recipe.cuisine === cuisine);
};

export const getRecipesByStation = (station: string): Recipe[] => {
  if (station === 'all') return recipes;
  return recipes.filter(recipe => recipe.station === station);
};

export const searchRecipes = (query: string): Recipe[] => {
  if (!query) return recipes;
  const searchTerm = query.toLowerCase();
  return recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm) ||
    recipe.ingredients.some(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm)
    ) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

export const scaleRecipe = (recipe: Recipe, scaleFactor: number): Recipe => {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: Math.round(ingredient.quantity * scaleFactor * 100) / 100
    }))
  };
};

export const getCategoryDisplayName = (category: string): string => {
  const categoryNames = {
    'main-dish': 'Main Dish',
    'soup': 'Soup',
    'beverage': 'Beverage',
    'sauce-condiment': 'Sauce/Condiment'
  };
  return categoryNames[category as keyof typeof categoryNames] || category;
};

export const getCuisineDisplayName = (cuisine: string): string => {
  const cuisineNames = {
    'malaysian': 'Malaysian',
    'thai': 'Thai',
    'indonesian': 'Indonesian'
  };
  return cuisineNames[cuisine as keyof typeof cuisineNames] || cuisine;
};

export const getAllergenIcon = (allergen: string): string => {
  const allergenIcons = {
    'shellfish': '🦐',
    'dairy': '🥛',
    'gluten': '🌾',
    'nuts': '🥜',
    'soy': '🫘',
    'egg': '🥚'
  };
  return allergenIcons[allergen as keyof typeof allergenIcons] || '⚠️';
};

export const getAllergenDisplayName = (allergen: string): string => {
  const allergenNames = {
    'shellfish': 'Shellfish',
    'dairy': 'Dairy',
    'gluten': 'Gluten',
    'nuts': 'Nuts',
    'soy': 'Soy',
    'egg': 'Egg'
  };
  return allergenNames[allergen as keyof typeof allergenNames] || allergen;
};