import { PurchaseItem } from './operations-data';

// Comprehensive Purchase Items with all cafe inventory
export const purchaseItems: PurchaseItem[] = [
  // 1. FOOD INGREDIENTS - Rice & Noodles
  {
    id: '1',
    itemName: 'White rice (for Nasi Lemak & fried rice)',
    category: 'rice-noodles',
    quantity: 25,
    unit: 'kg',
    preferredSupplier: 'Vegi Depot',
    neededBy: '2024-08-25',
    urgency: 'high',
    notes: 'Premium jasmine rice for main dishes',
    addedBy: '3', // Lily
    status: 'purchased',
    reviewedBy: '4', // Simon
    orderedAt: '2024-08-20T09:00:00Z',
    receivedAt: '2024-08-21T10:00:00Z',
    purchasedPrice: 85.50,
    purchasedDate: '2024-08-21',
    purchasedBy: '4', // Simon
    createdAt: '2024-08-20T08:00:00Z'
  },
  {
    id: '2',
    itemName: 'White bread/sandwich loaf',
    category: 'rice-noodles',
    quantity: 10,
    unit: 'loaves',
    preferredSupplier: 'Fresh Bakery',
    neededBy: '2024-08-24',
    urgency: 'high',
    notes: 'For toast and sandwiches - daily need',
    addedBy: '7', // Sherry
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-22T07:00:00Z',
    receivedAt: '2024-08-22T09:00:00Z',
    purchasedPrice: 28.00,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-22T06:30:00Z'
  },
  {
    id: '3',
    itemName: 'Mee Siam (rice vermicelli)',
    category: 'rice-noodles',
    quantity: 10,
    unit: 'packets',
    preferredSupplier: 'Vegi Depot',
    urgency: 'medium',
    addedBy: '6', // Thua
    status: 'new',
    createdAt: '2024-08-22T10:00:00Z'
  },
  {
    id: '4',
    itemName: 'Kueh Teow (flat rice noodles) - besar',
    category: 'rice-noodles',
    quantity: 8,
    unit: 'packets',
    preferredSupplier: 'Vegi Depot',
    urgency: 'medium',
    addedBy: '3', // Lily
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T11:00:00Z',
    createdAt: '2024-08-22T09:30:00Z'
  },

  // Proteins
  {
    id: '5',
    itemName: 'Chicken whole leg quarters',
    category: 'proteins',
    quantity: 15,
    unit: 'kg',
    preferredSupplier: 'JM Frozen',
    neededBy: '2024-08-24',
    urgency: 'high',
    notes: 'For Ayam Penyet and other chicken dishes',
    addedBy: '3', // Lily
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T10:00:00Z',
    createdAt: '2024-08-21T15:00:00Z'
  },
  {
    id: '6',
    itemName: 'Eggs (trays of 30)',
    category: 'proteins',
    quantity: 5,
    unit: 'trays',
    preferredSupplier: 'Vegi Depot',
    neededBy: '2024-08-23',
    urgency: 'high',
    notes: 'High turnover item - order regularly',
    addedBy: '8', // Ros
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T16:00:00Z',
    receivedAt: '2024-08-22T08:00:00Z',
    purchasedPrice: 75.00,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T15:30:00Z'
  },
  {
    id: '7',
    itemName: 'Fresh prawns',
    category: 'proteins',
    quantity: 4,
    unit: 'kg',
    preferredSupplier: 'JM Frozen',
    urgency: 'medium',
    addedBy: '3', // Lily
    status: 'new',
    createdAt: '2024-08-22T15:00:00Z'
  },

  // Vegetables & Fresh Produce
  {
    id: '8',
    itemName: 'Salad leaves and lettuce',
    category: 'vegetables',
    quantity: 3,
    unit: 'kg',
    preferredSupplier: 'UC Vege',
    neededBy: '2024-08-23',
    urgency: 'high',
    notes: 'For Ayam Penyet sides and salads',
    addedBy: '3', // Lily
    status: 'received',
    reviewedBy: '4',
    orderedAt: '2024-08-21T10:00:00Z',
    receivedAt: '2024-08-22T08:00:00Z',
    createdAt: '2024-08-21T09:00:00Z'
  },
  {
    id: '9',
    itemName: 'Onions',
    category: 'vegetables',
    quantity: 6,
    unit: 'kg',
    preferredSupplier: 'Vegi Depot',
    urgency: 'high',
    notes: 'Essential for most dishes',
    addedBy: '3', // Lily
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T12:00:00Z',
    createdAt: '2024-08-21T12:00:00Z'
  },
  {
    id: '10',
    itemName: 'Lemongrass',
    category: 'vegetables',
    quantity: 20,
    unit: 'stalks',
    preferredSupplier: 'UC Vege',
    urgency: 'high',
    notes: 'For Tom Yam and Thai dishes',
    addedBy: '3', // Lily
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T14:00:00Z',
    receivedAt: '2024-08-22T10:00:00Z',
    purchasedPrice: 12.00,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T13:00:00Z'
  },

  // Dairy & Eggs
  {
    id: '11',
    itemName: 'Fresh milk (for beverages)',
    category: 'dairy',
    quantity: 6,
    unit: 'liters',
    preferredSupplier: 'Dairy Farm',
    neededBy: '2024-08-24',
    urgency: 'high',
    notes: 'For coffee, tea, and cooking',
    addedBy: '4', // Simon
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T08:00:00Z',
    createdAt: '2024-08-21T15:00:00Z'
  },
  {
    id: '12',
    itemName: 'Cheese slices',
    category: 'dairy',
    quantity: 5,
    unit: 'packets',
    preferredSupplier: 'Dairy Farm',
    urgency: 'medium',
    notes: 'For toast and sandwiches',
    addedBy: '7', // Sherry
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T16:00:00Z',
    receivedAt: '2024-08-22T11:00:00Z',
    purchasedPrice: 42.50,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T16:00:00Z'
  },

  // Spices, Sauces & Seasonings
  {
    id: '13',
    itemName: 'Cooking oil (Buruh 17kg tin)',
    category: 'spices-sauces',
    quantity: 1,
    unit: 'tin',
    preferredSupplier: 'Lotus\'s',
    neededBy: '2024-08-25',
    urgency: 'high',
    notes: 'Bulk cooking oil for frying',
    addedBy: '4', // Simon
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T09:00:00Z',
    createdAt: '2024-08-21T17:00:00Z'
  },
  {
    id: '14',
    itemName: 'Tom Yam paste',
    category: 'spices-sauces',
    quantity: 5,
    unit: 'jars',
    preferredSupplier: 'NSK',
    urgency: 'high',
    notes: 'Essential for Tom Yam dishes',
    addedBy: '3', // Lily
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T10:00:00Z',
    receivedAt: '2024-08-22T12:00:00Z',
    purchasedPrice: 67.50,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T09:30:00Z'
  },
  {
    id: '15',
    itemName: 'Sambal paste (for Nasi Lemak)',
    category: 'spices-sauces',
    quantity: 3,
    unit: 'jars',
    preferredSupplier: 'NSK',
    urgency: 'high',
    notes: 'For Nasi Lemak and fried rice',
    addedBy: '10', // Bahar
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T13:00:00Z',
    createdAt: '2024-08-21T19:00:00Z'
  },

  // Coffee & Tea
  {
    id: '16',
    itemName: 'Uncle Teo Coffee Powder C2',
    category: 'coffee-tea',
    quantity: 5,
    unit: 'packets',
    preferredSupplier: 'Uncle Teo',
    neededBy: '2024-08-25',
    urgency: 'high',
    notes: 'Main coffee for all coffee drinks',
    addedBy: '4', // Simon
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T08:00:00Z',
    receivedAt: '2024-08-22T13:00:00Z',
    purchasedPrice: 125.00,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T07:30:00Z'
  },
  {
    id: '17',
    itemName: 'Uncle Teo Ceylon Tea Powder',
    category: 'coffee-tea',
    quantity: 3,
    unit: 'packets',
    preferredSupplier: 'Uncle Teo',
    urgency: 'high',
    notes: 'Main tea for all tea drinks',
    addedBy: '4', // Simon
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T14:00:00Z',
    createdAt: '2024-08-21T21:00:00Z'
  },

  // Beverage Supplies
  {
    id: '18',
    itemName: 'Paper cups (hot drinks)',
    category: 'beverage-supplies',
    quantity: 1000,
    unit: 'pieces',
    preferredSupplier: 'Shopee',
    urgency: 'high',
    notes: 'For hot coffee and tea',
    addedBy: '4', // Simon
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T15:00:00Z',
    receivedAt: '2024-08-22T14:00:00Z',
    purchasedPrice: 65.00,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T14:30:00Z'
  },
  {
    id: '19',
    itemName: 'Plastic cups (cold drinks)',
    category: 'beverage-supplies',
    quantity: 1000,
    unit: 'pieces',
    preferredSupplier: 'Shopee',
    urgency: 'high',
    notes: 'For iced drinks and takeaway',
    addedBy: '4', // Simon
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T15:00:00Z',
    createdAt: '2024-08-21T23:00:00Z'
  },

  // Condiments
  {
    id: '20',
    itemName: 'Kaya (coconut jam)',
    category: 'condiments',
    quantity: 6,
    unit: 'jars',
    preferredSupplier: 'Fresh Bakery',
    urgency: 'medium',
    notes: 'For toast and breakfast items',
    addedBy: '7', // Sherry
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T16:30:00Z',
    receivedAt: '2024-08-22T15:00:00Z',
    purchasedPrice: 48.00,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T16:00:00Z'
  },

  // Disposables
  {
    id: '21',
    itemName: 'Food containers (rice size)',
    category: 'disposables',
    quantity: 200,
    unit: 'pieces',
    preferredSupplier: 'Shopee',
    urgency: 'high',
    notes: 'For takeaway rice dishes',
    addedBy: '8', // Ros
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T16:00:00Z',
    createdAt: '2024-08-22T00:00:00Z'
  },

  // Cleaning
  {
    id: '22',
    itemName: 'Dishwashing liquid',
    category: 'cleaning',
    quantity: 5,
    unit: 'bottles',
    preferredSupplier: 'Shopee',
    urgency: 'high',
    addedBy: '8', // Ros
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T17:00:00Z',
    createdAt: '2024-08-22T02:00:00Z'
  },
  {
    id: '23',
    itemName: 'Hand sanitizer (70% alcohol)',
    category: 'cleaning',
    quantity: 6,
    unit: 'bottles',
    preferredSupplier: 'Shopee',
    urgency: 'high',
    notes: 'KKM-compliant sanitizer',
    addedBy: '4', // Simon
    status: 'purchased',
    reviewedBy: '4',
    orderedAt: '2024-08-21T17:30:00Z',
    receivedAt: '2024-08-22T16:00:00Z',
    purchasedPrice: 78.00,
    purchasedDate: '2024-08-22',
    purchasedBy: '4',
    createdAt: '2024-08-21T17:00:00Z'
  },
  {
    id: '24',
    itemName: 'Disposable gloves (food grade)',
    category: 'cleaning',
    quantity: 10,
    unit: 'boxes',
    preferredSupplier: 'Shopee',
    urgency: 'high',
    addedBy: '4', // Simon
    status: 'ordered',
    reviewedBy: '4',
    orderedAt: '2024-08-22T18:00:00Z',
    createdAt: '2024-08-22T03:00:00Z'
  },

  // Additional items for comprehensive inventory
  {
    id: '25',
    itemName: 'Soy sauce (light)',
    category: 'spices-sauces',
    quantity: 3,
    unit: 'bottles',
    preferredSupplier: 'NSK',
    urgency: 'high',
    addedBy: '3', // Lily
    status: 'reviewed',
    reviewedBy: '4',
    createdAt: '2024-08-21T18:00:00Z'
  },
  {
    id: '26',
    itemName: 'Coca-Cola (cans)',
    category: 'soft-drinks',
    quantity: 48,
    unit: 'cans',
    preferredSupplier: 'Lotus\'s',
    urgency: 'medium',
    addedBy: '7', // Sherry
    status: 'reviewed',
    reviewedBy: '4',
    createdAt: '2024-08-21T22:00:00Z'
  },
  {
    id: '27',
    itemName: 'Chopping boards (color-coded)',
    category: 'equipment',
    quantity: 6,
    unit: 'set',
    preferredSupplier: 'Shopee',
    urgency: 'medium',
    notes: 'Different colors for different food types',
    addedBy: '4', // Simon
    status: 'reviewed',
    reviewedBy: '4',
    createdAt: '2024-08-22T04:00:00Z'
  },
  {
    id: '28',
    itemName: 'Paper towels (kitchen)',
    category: 'paper-products',
    quantity: 10,
    unit: 'rolls',
    preferredSupplier: 'Shopee',
    urgency: 'high',
    notes: 'For kitchen cleaning',
    addedBy: '4', // Simon
    status: 'reviewed',
    reviewedBy: '4',
    createdAt: '2024-08-22T01:00:00Z'
  },
  {
    id: '29',
    itemName: 'Non-slip safety shoes',
    category: 'other',
    quantity: 6,
    unit: 'pairs',
    preferredSupplier: 'Shopee',
    urgency: 'medium',
    notes: 'For kitchen staff safety',
    addedBy: '4', // Simon
    status: 'reviewed',
    reviewedBy: '4',
    createdAt: '2024-08-22T05:00:00Z'
  },
  {
    id: '30',
    itemName: 'Fresh chilies (mixed)',
    category: 'vegetables',
    quantity: 1,
    unit: 'kg',
    preferredSupplier: 'UC Vege',
    urgency: 'high',
    notes: 'For sambals and spicy dishes',
    addedBy: '3', // Lily
    status: 'reviewed',
    reviewedBy: '4',
    createdAt: '2024-08-21T14:00:00Z'
  }
];