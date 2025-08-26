import { Station } from "./types";

// Import sample data from separate files
export { staffMeals, type StaffMeal } from "./staff-meals-data";
export { disposals, type Disposal } from "./disposals-data";

// Issues Data
export interface Issue {
  id: string;
  issueNumber: string; // ISS-101, ISS-102, etc.
  title: string;
  category:
    | "complaint"
    | "hygiene"
    | "wastage"
    | "recipe"
    | "disciplinary"
    | "stock-out";
  station: Station;
  description: string;
  reportedBy: string; // staff id
  targetStaff?: string; // staff id - person whose action caused the issue
  status: "open" | "investigating" | "resolved" | "dismissed";
  defaultPoints: number; // negative points based on category
  managerExtra: number; // additional points from manager
  ownerExtra: number; // additional points from owner
  totalPoints: number; // calculated field
  appliedBy?: string; // who applied the points
  appliedAt?: string;
  photo?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Purchase List Data - Enhanced with purchase completion tracking
export interface PurchaseItem {
  id: string;
  itemName: string;
  category:
    | "rice-noodles"
    | "proteins"
    | "vegetables"
    | "dairy"
    | "spices-sauces"
    | "frozen-processed"
    | "coffee-tea"
    | "soft-drinks"
    | "beverage-supplies"
    | "bakery"
    | "condiments"
    | "disposables"
    | "equipment"
    | "paper-products"
    | "cleaning"
    | "other";
  photo?: string;
  quantity: number;
  unit: string;
  preferredSupplier: string;
  neededBy?: string; // date
  urgency: "low" | "medium" | "high";
  notes?: string;
  addedBy: string; // staff id
  status:
    | "new"
    | "reviewed"
    | "ordered"
    | "received"
    | "purchased";
  reviewedBy?: string; // purchaser id
  orderedAt?: string;
  receivedAt?: string;
  purchasedPrice?: number; // RM - price paid when purchased
  purchasedDate?: string; // date when actually purchased
  purchasedBy?: string; // who completed the purchase
  createdAt: string;
}

// Suppliers Data
export interface Supplier {
  id: string;
  companyName: string;
  displayName?: string; // Short name for display
  category:
    | "vegetables"
    | "seafood"
    | "beverages"
    | "frozen-foods"
    | "equipment"
    | "grocery"
    | "dairy"
    | "bakery"
    | "condiments"
    | "other";
  primaryProducts: string[]; // Main products they supply
  contactNumber: string;
  alternateNumber?: string;
  email?: string;
  address?: string;
  picName: string; // Person in Charge
  picPosition?: string;
  picContactNumber?: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName?: string;
  paymentTerms?: string; // e.g., "Net 30", "Cash on delivery"
  minimumOrder?: string;
  deliveryDays?: string[]; // Days they deliver
  rating?: number; // 1-5 star rating
  isActive: boolean;
  description?: string;
  notes?: string;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  addedBy: string; // staff id
}

// Sample Issues Data
export const issues: Issue[] = [
  {
    id: "1",
    issueNumber: "ISS-101",
    title: "Customer said curry mee too salty",
    category: "complaint",
    station: "kitchen",
    description:
      "Customer complained that the curry mee soup base was too salty. They requested for fresh soup but we had to remake the entire dish.",
    reportedBy: "7", // Sherry
    targetStaff: "3", // Lily
    status: "open",
    defaultPoints: -50,
    managerExtra: 0,
    ownerExtra: 0,
    totalPoints: -50,
    photo:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    attachments: [],
    createdAt: "2024-08-20T14:30:00Z",
    updatedAt: "2024-08-20T14:30:00Z",
  },
  {
    id: "2",
    issueNumber: "ISS-102",
    title: "Floor near sink slippery",
    category: "hygiene",
    station: "kitchen",
    description:
      "Water spillage near the dish washing sink making the floor very slippery. Safety hazard for staff.",
    reportedBy: "8", // Ros
    status: "investigating",
    defaultPoints: -80,
    managerExtra: 0,
    ownerExtra: 0,
    totalPoints: -80,
    photo:
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
    attachments: [],
    createdAt: "2024-08-20T11:15:00Z",
    updatedAt: "2024-08-20T16:00:00Z",
  },
  {
    id: "3",
    issueNumber: "ISS-103",
    title: "Ran out of siham during dinner",
    category: "stock-out",
    station: "kitchen",
    description:
      "Fish slices finished during dinner rush. Had to turn away 3 customers who wanted fish slice noodles.",
    reportedBy: "8", // Islam
    status: "open",
    defaultPoints: -60,
    managerExtra: 0,
    ownerExtra: 0,
    totalPoints: -60,
    photo:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    attachments: [],
    createdAt: "2024-08-19T20:45:00Z",
    updatedAt: "2024-08-19T20:45:00Z",
  },
];

// Sample Suppliers Data
export let suppliers: Supplier[] = [
  {
    id: "1",
    companyName: "The Vegi Depot by Vegibest Grocery",
    displayName: "Vegi Depot",
    category: "vegetables",
    primaryProducts: [
      "Vegetables",
      "Eggs",
      "Noodles",
      "Rice",
      "Condiments",
    ],
    contactNumber: "+60123456789",
    alternateNumber: "+60198765432",
    email: "orders@vegibest.com.my",
    address: "Jalan Wholesale Market, Kuala Lumpur",
    picName: "Ahmad Hassan",
    picPosition: "Sales Manager",
    picContactNumber: "+60123456789",
    bankName: "Public Bank",
    bankAccountNumber: "1234567890",
    bankAccountName: "Vegibest Grocery Sdn Bhd",
    paymentTerms: "Net 7 days",
    minimumOrder: "RM 100",
    deliveryDays: ["Monday", "Wednesday", "Friday"],
    rating: 5,
    isActive: true,
    description:
      "Main supplier for fresh vegetables, eggs, noodles, rice, and various condiments. Excellent quality and reliability.",
    notes:
      "Primary supplier - always prioritize for vegetable orders",
    lastOrderDate: "2024-08-20",
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2024-08-20T14:30:00Z",
    addedBy: "4", // Simon
  },
  {
    id: "2",
    companyName: "Ultimate (UC) Vege",
    displayName: "UC Vege",
    category: "vegetables",
    primaryProducts: [
      "Fresh Vegetables",
      "Herbs",
      "Leafy Greens",
    ],
    contactNumber: "+60187654321",
    email: "sales@ucvege.com",
    address: "Pasar Borong Selayang, Selangor",
    picName: "Lim Wei Ming",
    picPosition: "Owner",
    picContactNumber: "+60187654321",
    bankName: "CIMB Bank",
    bankAccountNumber: "9876543210",
    bankAccountName: "Ultimate Vege Trading",
    paymentTerms: "Cash on delivery",
    minimumOrder: "RM 50",
    deliveryDays: ["Tuesday", "Thursday", "Saturday"],
    rating: 4,
    isActive: true,
    description:
      "Secondary vegetable supplier specializing in fresh produce and herbs.",
    notes:
      "Good backup supplier when Vegi Depot is out of stock",
    lastOrderDate: "2024-08-18",
    createdAt: "2024-06-15T09:00:00Z",
    updatedAt: "2024-08-18T11:00:00Z",
    addedBy: "4", // Simon
  },
  {
    id: "3",
    companyName: "Uncle Teo Beverages",
    displayName: "Uncle Teo",
    category: "beverages",
    primaryProducts: [
      "Coffee",
      "Tea",
      "Syrups",
      "Beverage Equipment",
    ],
    contactNumber: "+60123334444",
    email: "uncleteo@beverages.my",
    address: "Jalan Imbi, Kuala Lumpur",
    picName: "Teo Ah Beng",
    picPosition: "Proprietor",
    picContactNumber: "+60123334444",
    bankName: "Maybank",
    bankAccountNumber: "5555666677",
    bankAccountName: "Teo Ah Beng",
    paymentTerms: "Net 14 days",
    minimumOrder: "RM 80",
    deliveryDays: ["Monday", "Thursday"],
    rating: 5,
    isActive: true,
    description:
      "Specialized supplier for coffee, tea, and beverage-related products. Long-standing relationship.",
    notes:
      "Excellent coffee quality, personal service by Uncle Teo",
    lastOrderDate: "2024-08-19",
    createdAt: "2024-05-20T08:00:00Z",
    updatedAt: "2024-08-19T10:30:00Z",
    addedBy: "4", // Simon
  },
  {
    id: "4",
    companyName: "JM Frozen Foods",
    displayName: "JM Frozen",
    category: "frozen-foods",
    primaryProducts: [
      "Frozen Seafood",
      "Tofu",
      "Spring Rolls",
      "Dim Sum",
    ],
    contactNumber: "+60199998888",
    alternateNumber: "+60377776666",
    email: "orders@jmfrozen.com.my",
    address: "Shah Alam Industrial Area, Selangor",
    picName: "Jennifer Lim",
    picPosition: "Sales Executive",
    picContactNumber: "+60199998888",
    bankName: "RHB Bank",
    bankAccountNumber: "7777888899",
    bankAccountName: "JM Frozen Foods Sdn Bhd",
    paymentTerms: "Net 21 days",
    minimumOrder: "RM 150",
    deliveryDays: ["Tuesday", "Friday"],
    rating: 4,
    isActive: true,
    description:
      "Reliable supplier for frozen seafood, tofu, and ready-made items like spring rolls.",
    notes:
      "Good pricing for bulk orders, reliable delivery schedule",
    lastOrderDate: "2024-08-16",
    createdAt: "2024-07-01T10:00:00Z",
    updatedAt: "2024-08-16T16:00:00Z",
    addedBy: "4", // Simon
  },
  {
    id: "5",
    companyName: "Shopee Business",
    displayName: "Shopee",
    category: "equipment",
    primaryProducts: [
      "Kitchen Equipment",
      "Packaging",
      "Disposables",
      "Cleaning Supplies",
    ],
    contactNumber: "+601800188188",
    email: "business@shopee.com.my",
    address: "Online Platform",
    picName: "Customer Service",
    picPosition: "Support Team",
    bankName: "Online Payment",
    bankAccountNumber: "Multiple Payment Methods",
    paymentTerms: "Immediate payment",
    minimumOrder: "RM 25",
    rating: 3,
    isActive: true,
    description:
      "Online platform for equipment, packaging, and disposable items. Convenient for smaller purchases.",
    notes: "Good for emergency purchases and small items",
    lastOrderDate: "2024-08-21",
    createdAt: "2024-07-10T14:00:00Z",
    updatedAt: "2024-08-21T09:00:00Z",
    addedBy: "8", // Ros
  },
];

// Import purchase items from separate file
import { purchaseItems as importedPurchaseItems } from "./purchase-items-data";
export let purchaseItems = importedPurchaseItems;

// Skills Data - Skills system
export interface StaffSkill {
  id: string;
  staffId: string;
  skillName: string;
  level: "basic" | "proficient" | "expert";
  verified: boolean;
  verifiedBy?: string; // manager id
  verifiedDate?: string;
  pointsAwarded?: number; // points given when first verified
  requestedVerification: boolean;
  isExclusive?: boolean; // true if this skill is marked as exclusive to this staff member
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  hasExclusiveAssignment?: boolean; // true if any staff member has exclusive access
}

// Skills and staffSkills data from existing implementation
export const skills: Skill[] = [
  {
    id: "1",
    name: "Teh / Kopi",
    category: "Beverages",
    description: "Traditional tea and coffee preparation",
  },
  {
    id: "2",
    name: "Other drinks – serving",
    category: "Beverages",
    description: "General beverage service",
  },
  {
    id: "3",
    name: "Other drinks – jug",
    category: "Beverages",
    description: "Bulk beverage preparation",
  },
  {
    id: "4",
    name: "Herbal soup (7 types)",
    category: "Soups",
    description: "Traditional herbal soup varieties",
    hasExclusiveAssignment: true,
  },
  {
    id: "5",
    name: "Fish Slice Noodles soup",
    category: "Soups",
    description: "Fish slice noodle soup preparation",
    hasExclusiveAssignment: true,
  },
  {
    id: "6",
    name: "Curry Mee curry soup",
    category: "Soups",
    description: "Curry Mee soup base preparation",
    hasExclusiveAssignment: true,
  },
  {
    id: "7",
    name: "Steam fish sauce",
    category: "Sauces",
    description: "Steamed fish sauce preparation",
  },
  {
    id: "8",
    name: "Curry sauce",
    category: "Sauces",
    description: "General curry sauce preparation",
  },
  {
    id: "9",
    name: "Curry sauce (Indon curry chicken)",
    category: "Sauces",
    description: "Indonesian-style curry chicken sauce",
    hasExclusiveAssignment: true,
  },
  {
    id: "10",
    name: "Rendang sauce",
    category: "Sauces",
    description: "Traditional rendang sauce preparation",
  },
  {
    id: "11",
    name: "Ayam Penyet sambal",
    category: "Sauces",
    description: "Ayam Penyet chili sambal",
    hasExclusiveAssignment: true,
  },
  {
    id: "12",
    name: "Black pepper sauce",
    category: "Sauces",
    description: "Black pepper sauce preparation",
    hasExclusiveAssignment: true,
  },
  {
    id: "13",
    name: "Salted egg sauce",
    category: "Sauces",
    description: "Salted egg sauce preparation",
    hasExclusiveAssignment: true,
  },
  {
    id: "14",
    name: "Kong Pao sauce",
    category: "Sauces",
    description: "Kong Pao sauce preparation",
    hasExclusiveAssignment: true,
  },
  {
    id: "15",
    name: "Buttermilk sauce",
    category: "Sauces",
    description: "Buttermilk sauce preparation",
    hasExclusiveAssignment: true,
  },
  {
    id: "16",
    name: "Fried rice sambal",
    category: "Sauces",
    description: "Fried rice sambal preparation",
    hasExclusiveAssignment: true,
  },
  {
    id: "17",
    name: "Nasi Lemak / Mee Siam serving",
    category: "Main Dishes",
    description: "Nasi Lemak and Mee Siam service",
  },
  {
    id: "18",
    name: "Nasi Lemak / Mee Siam preparation",
    category: "Main Dishes",
    description: "Nasi Lemak and Mee Siam preparation",
  },
  {
    id: "19",
    name: "Noodles serving",
    category: "Main Dishes",
    description: "General noodle dish service",
  },
  {
    id: "20",
    name: "Ayam Penyet preparation",
    category: "Main Dishes",
    description: "Ayam Penyet dish preparation",
  },
  {
    id: "21",
    name: "Frying (fried rice & noodles)",
    category: "Cooking",
    description: "Fried rice and noodle preparation",
  },
  {
    id: "22",
    name: "Frying snacks",
    category: "Cooking",
    description: "Various fried snack preparation",
  },
  {
    id: "23",
    name: "Egg / Vegetables preparation",
    category: "Cooking",
    description: "Egg and vegetable dish preparation",
  },
  {
    id: "24",
    name: "Picker (ingredients handling)",
    category: "Kitchen Prep",
    description: "Ingredient selection and handling",
  },
  {
    id: "25",
    name: "Dessert",
    category: "Desserts",
    description: "Dessert preparation and service",
    hasExclusiveAssignment: true,
  },
];

// Staff Skills Matrix - Sample data with focus on key staff members
export let staffSkills: StaffSkill[] = [
  // Simon (Staff ID: 4) - 7 skills
  {
    id: "1",
    staffId: "4",
    skillName: "Teh / Kopi",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-15",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-07-15T10:00:00Z",
    updatedAt: "2024-07-15T10:00:00Z",
  },
  {
    id: "2",
    staffId: "4",
    skillName: "Other drinks – serving",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-15",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-07-15T10:00:00Z",
    updatedAt: "2024-07-15T10:00:00Z",
  },
  {
    id: "3",
    staffId: "4",
    skillName: "Herbal soup (7 types)",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-10",
    pointsAwarded: 50,
    requestedVerification: false,
    isExclusive: true,
    createdAt: "2024-07-10T10:00:00Z",
    updatedAt: "2024-07-10T10:00:00Z",
  },
  {
    id: "4",
    staffId: "4",
    skillName: "Dessert",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-08",
    pointsAwarded: 50,
    requestedVerification: false,
    isExclusive: true,
    createdAt: "2024-07-08T10:00:00Z",
    updatedAt: "2024-07-08T10:00:00Z",
  },

  // Lily (Staff ID: 3) - Le's skills - Multiple skills
  {
    id: "5",
    staffId: "3",
    skillName: "Ayam Penyet preparation",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-20",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-07-20T10:00:00Z",
    updatedAt: "2024-07-20T10:00:00Z",
  },
  {
    id: "6",
    staffId: "3",
    skillName: "Ayam Penyet sambal",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-20",
    pointsAwarded: 50,
    requestedVerification: false,
    isExclusive: true,
    createdAt: "2024-07-20T10:00:00Z",
    updatedAt: "2024-07-20T10:00:00Z",
  },
  {
    id: "7",
    staffId: "3",
    skillName: "Black pepper sauce",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-18",
    pointsAwarded: 50,
    requestedVerification: false,
    isExclusive: true,
    createdAt: "2024-07-18T10:00:00Z",
    updatedAt: "2024-07-18T10:00:00Z",
  },
  {
    id: "8",
    staffId: "3",
    skillName: "Fish Slice Noodles soup",
    level: "expert",
    verified: true,
    verifiedBy: "1",
    verifiedDate: "2024-07-22",
    pointsAwarded: 50,
    requestedVerification: false,
    isExclusive: true,
    createdAt: "2024-07-22T10:00:00Z",
    updatedAt: "2024-07-22T10:00:00Z",
  },

  // Bahar (Staff ID: 10) - 6 skills
  {
    id: "9",
    staffId: "10",
    skillName: "Nasi Lemak / Mee Siam serving",
    level: "expert",
    verified: true,
    verifiedBy: "4",
    verifiedDate: "2024-08-15",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-08-15T10:00:00Z",
    updatedAt: "2024-08-15T10:00:00Z",
  },
  {
    id: "10",
    staffId: "10",
    skillName: "Rendang sauce",
    level: "proficient",
    verified: true,
    verifiedBy: "4",
    verifiedDate: "2024-08-17",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-08-17T10:00:00Z",
    updatedAt: "2024-08-17T10:00:00Z",
  },
  {
    id: "11",
    staffId: "10",
    skillName: "Frying snacks",
    level: "basic",
    verified: false,
    requestedVerification: true,
    createdAt: "2024-08-18T10:00:00Z",
    updatedAt: "2024-08-18T10:00:00Z",
  },

  // Ko Sai (Staff ID: 5) - Multiple skills
  {
    id: "12",
    staffId: "5",
    skillName: "Picker (ingredients handling)",
    level: "expert",
    verified: true,
    verifiedBy: "4",
    verifiedDate: "2024-08-03",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-08-03T10:00:00Z",
    updatedAt: "2024-08-03T10:00:00Z",
  },
  {
    id: "13",
    staffId: "5",
    skillName: "Frying (fried rice & noodles)",
    level: "proficient",
    verified: true,
    verifiedBy: "4",
    verifiedDate: "2024-08-07",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-08-07T10:00:00Z",
    updatedAt: "2024-08-07T10:00:00Z",
  },

  // Thua (Staff ID: 6) - Multiple skills
  {
    id: "14",
    staffId: "6",
    skillName: "Nasi Lemak / Mee Siam preparation",
    level: "expert",
    verified: true,
    verifiedBy: "4",
    verifiedDate: "2024-08-01",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-08-01T10:00:00Z",
  },
  {
    id: "15",
    staffId: "6",
    skillName: "Egg / Vegetables preparation",
    level: "expert",
    verified: true,
    verifiedBy: "4",
    verifiedDate: "2024-08-04",
    pointsAwarded: 50,
    requestedVerification: false,
    createdAt: "2024-08-04T10:00:00Z",
    updatedAt: "2024-08-04T10:00:00Z",
  },
];

// Helper functions for CRUD operations
export const addPurchaseItem = (
  newItem: Omit<PurchaseItem, "id">,
): PurchaseItem => {
  const id = (
    Math.max(
      ...purchaseItems.map((item) => parseInt(item.id)),
      0,
    ) + 1
  ).toString();
  const item: PurchaseItem = { ...newItem, id };
  purchaseItems.push(item);
  return item;
};

export const updatePurchaseItem = (
  id: string,
  updates: Partial<PurchaseItem>,
): PurchaseItem | null => {
  const index = purchaseItems.findIndex(
    (item) => item.id === id,
  );
  if (index === -1) return null;

  purchaseItems[index] = {
    ...purchaseItems[index],
    ...updates,
  };
  return purchaseItems[index];
};

export const deletePurchaseItem = (id: string): boolean => {
  const index = purchaseItems.findIndex(
    (item) => item.id === id,
  );
  if (index === -1) return false;

  purchaseItems.splice(index, 1);
  return true;
};

export const markItemAsPurchased = (
  id: string,
  price: number,
  date: string,
  purchasedBy: string,
): PurchaseItem | null => {
  return updatePurchaseItem(id, {
    status: "purchased",
    purchasedPrice: price,
    purchasedDate: date,
    purchasedBy: purchasedBy,
  });
};

// Supplier helper functions
export const addSupplier = (
  newSupplier: Omit<Supplier, "id">,
): Supplier => {
  const id = (
    Math.max(...suppliers.map((s) => parseInt(s.id)), 0) + 1
  ).toString();
  const supplier: Supplier = { ...newSupplier, id };
  suppliers.push(supplier);
  return supplier;
};

export const updateSupplier = (
  id: string,
  updates: Partial<Supplier>,
): Supplier | null => {
  const index = suppliers.findIndex((s) => s.id === id);
  if (index === -1) return null;

  suppliers[index] = {
    ...suppliers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return suppliers[index];
};

export const deleteSupplier = (id: string): boolean => {
  const index = suppliers.findIndex((s) => s.id === id);
  if (index === -1) return false;

  suppliers.splice(index, 1);
  return true;
};

export const getSupplierById = (
  id: string,
): Supplier | undefined => {
  return suppliers.find((supplier) => supplier.id === id);
};

export const getSuppliersByCategory = (
  category: string,
): Supplier[] => {
  if (category === "all") return suppliers;
  return suppliers.filter(
    (supplier) => supplier.category === category,
  );
};

export const getActiveSuppliers = (): Supplier[] => {
  return suppliers.filter((supplier) => supplier.isActive);
};

// Skills helper functions
export const addStaffSkill = (
  newSkill: Omit<StaffSkill, "id">,
): StaffSkill => {
  const id = (
    Math.max(...staffSkills.map((s) => parseInt(s.id)), 0) + 1
  ).toString();
  const skill: StaffSkill = { ...newSkill, id };
  staffSkills.push(skill);
  return skill;
};

export const updateStaffSkill = (
  id: string,
  updates: Partial<StaffSkill>,
): StaffSkill | null => {
  const index = staffSkills.findIndex((s) => s.id === id);
  if (index === -1) return null;

  staffSkills[index] = {
    ...staffSkills[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return staffSkills[index];
};

export const deleteStaffSkill = (id: string): boolean => {
  const index = staffSkills.findIndex((s) => s.id === id);
  if (index === -1) return false;

  staffSkills.splice(index, 1);
  return true;
};

export const getStaffSkill = (
  staffId: string,
  skillName: string,
): StaffSkill | null => {
  return (
    staffSkills.find(
      (ss) =>
        ss.staffId === staffId && ss.skillName === skillName,
    ) || null
  );
};

export const getStaffSkills = (
  staffId: string,
): StaffSkill[] => {
  return staffSkills.filter((ss) => ss.staffId === staffId);
};

export const getSkillByName = (
  name: string,
): Skill | undefined => {
  return skills.find((skill) => skill.name === name);
};

export const isSkillExclusive = (
  skillName: string,
  excludeStaffId?: string,
): boolean => {
  const skillAssignments = staffSkills.filter(
    (ss) =>
      ss.skillName === skillName &&
      ss.isExclusive &&
      (excludeStaffId ? ss.staffId !== excludeStaffId : true),
  );
  return skillAssignments.length > 0;
};

// Utility functions
export const getCategoryDefaultPoints = (
  category: string,
): number => {
  const pointsMap = {
    complaint: -50,
    hygiene: -80,
    wastage: -30,
    recipe: -40,
    disciplinary: -100,
    "stock-out": -60,
  };
  return pointsMap[category as keyof typeof pointsMap] || 0;
};

export const getUrgencyColor = (urgency: string): string => {
  switch (urgency) {
    case "high":
      return "destructive";
    case "medium":
      return "warning";
    case "low":
      return "secondary";
    default:
      return "secondary";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "open":
    case "new":
      return "default";
    case "investigating":
    case "reviewed":
      return "warning";
    case "resolved":
    case "ordered":
    case "received":
      return "success";
    case "purchased":
      return "info";
    case "dismissed":
      return "secondary";
    default:
      return "default";
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case "vegetables":
      return "success";
    case "seafood":
      return "info";
    case "beverages":
      return "warning";
    case "frozen-foods":
      return "info";
    case "equipment":
      return "secondary";
    case "grocery":
      return "default";
    case "dairy":
      return "warning";
    case "bakery":
      return "success";
    case "condiments":
      return "default";
    case "other":
      return "secondary";
    case "rice-noodles":
      return "warning";
    case "proteins":
      return "destructive";
    case "spices-sauces":
      return "success";
    case "frozen-processed":
      return "info";
    case "coffee-tea":
      return "warning";
    case "soft-drinks":
      return "info";
    case "beverage-supplies":
      return "secondary";
    case "disposables":
      return "default";
    case "paper-products":
      return "secondary";
    case "cleaning":
      return "destructive";
    default:
      return "secondary";
  }
};

export const getCategoryDisplayName = (
  category: string,
): string => {
  const categoryNames = {
    vegetables: "Vegetables",
    seafood: "Seafood",
    beverages: "Beverages",
    "frozen-foods": "Frozen Foods",
    equipment: "Equipment",
    grocery: "Grocery",
    dairy: "Dairy",
    bakery: "Bakery",
    condiments: "Condiments",
    other: "Other",
    "rice-noodles": "Rice & Noodles",
    proteins: "Proteins",
    "spices-sauces": "Spices & Sauces",
    "frozen-processed": "Frozen & Processed",
    "coffee-tea": "Coffee & Tea",
    "soft-drinks": "Soft Drinks",
    "beverage-supplies": "Beverage Supplies",
    disposables: "Disposables",
    "paper-products": "Paper Products",
    cleaning: "Cleaning Supplies",
  };
  return (
    categoryNames[category as keyof typeof categoryNames] ||
    category
  );
};

// Missing functions that were being imported
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getLevelColor = (level: string): string => {
  switch (level) {
    case "basic":
      return "secondary";
    case "proficient":
      return "warning";
    case "expert":
      return "success";
    default:
      return "secondary";
  }
};

// Phone number formatting function for Malaysian numbers
export const formatPhoneNumber = (
  phoneNumber: string,
): string => {
  if (!phoneNumber) return "";

  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // Handle Malaysian phone numbers
  if (cleaned.startsWith("+60")) {
    // Format: +60 12-345 6789 or +60 3-1234 5678
    const number = cleaned.substring(3); // Remove +60
    if (number.length === 10 || number.length === 9) {
      if (number.startsWith("1")) {
        // Mobile number: +60 12-345 6789
        return `+60 ${number.substring(0, 2)}-${number.substring(2, 5)} ${number.substring(5)}`;
      } else {
        // Landline: +60 3-1234 5678
        return `+60 ${number.substring(0, 1)}-${number.substring(1, 5)} ${number.substring(5)}`;
      }
    }
  } else if (cleaned.startsWith("60")) {
    // Format without + prefix
    const number = cleaned.substring(2);
    if (number.length === 10 || number.length === 9) {
      if (number.startsWith("1")) {
        return `+60 ${number.substring(0, 2)}-${number.substring(2, 5)} ${number.substring(5)}`;
      } else {
        return `+60 ${number.substring(0, 1)}-${number.substring(1, 5)} ${number.substring(5)}`;
      }
    }
  } else if (cleaned.startsWith("0")) {
    // Local format starting with 0
    const number = cleaned.substring(1); // Remove leading 0
    if (number.length === 9 || number.length === 8) {
      if (number.startsWith("1")) {
        return `+60 ${number.substring(0, 2)}-${number.substring(2, 5)} ${number.substring(5)}`;
      } else {
        return `+60 ${number.substring(0, 1)}-${number.substring(1, 5)} ${number.substring(5)}`;
      }
    }
  }

  // Return original if no formatting rules match
  return phoneNumber;
};

export const formatCurrency = (amount: number): string => {
  return `RM${amount.toFixed(2)}`;
};

export const formatDateTime = (
  dateString: string,
  locale: string = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
): string => {
  return new Date(dateString).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getPurchasedItemsTotal = (): number => {
  return purchaseItems
    .filter(
      (item) =>
        item.status === "purchased" && item.purchasedPrice,
    )
    .reduce(
      (total, item) => total + (item.purchasedPrice || 0),
      0,
    );
};

export const getPurchasedItemsByDateRange = (
  startDate: string,
  endDate: string,
): PurchaseItem[] => {
  return purchaseItems.filter(
    (item) =>
      item.status === "purchased" &&
      item.purchasedDate &&
      item.purchasedDate >= startDate &&
      item.purchasedDate <= endDate,
  );
};