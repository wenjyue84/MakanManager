import { PurchaseItem } from './operations-data';

export const validatePurchaseItem = (formData: {
  itemName: string;
  unit: string;
  preferredSupplier: string;
  quantity: number;
}): boolean => {
  return !!(formData.itemName && formData.unit && formData.preferredSupplier && formData.quantity > 0);
};

export const validatePurchaseData = (purchaseData: {
  price: number;
  date: string;
}): boolean => {
  return purchaseData.price > 0 && !!purchaseData.date;
};

export const filterPurchaseItems = (
  items: PurchaseItem[],
  filters: {
    searchQuery: string;
    selectedCategory: string;
    selectedStatus: string;
    selectedUrgency: string;
    selectedSupplier: string;
  }
): PurchaseItem[] => {
  const { searchQuery, selectedCategory, selectedStatus, selectedUrgency, selectedSupplier } = filters;
  
  return items.filter(item => {
    if (searchQuery && !item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.preferredSupplier.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedUrgency !== 'all' && item.urgency !== selectedUrgency) return false;
    if (selectedSupplier !== 'all' && item.preferredSupplier !== selectedSupplier) return false;
    return true;
  });
};

export const calculatePurchaseStats = (items: PurchaseItem[]) => {
  const total = items.length;
  const pending = items.filter(item => ['new', 'reviewed', 'ordered'].includes(item.status)).length;
  const purchased = items.filter(item => item.status === 'purchased').length;
  const totalCost = items
    .filter(item => item.status === 'purchased' && item.purchasedPrice)
    .reduce((total, item) => total + (item.purchasedPrice || 0), 0);
  const urgentItems = items.filter(item => item.urgency === 'high' && item.status !== 'purchased').length;
  
  return {
    total,
    pending,
    purchased,
    totalCost,
    urgentItems
  };
};

export const getUniqueCategories = (items: PurchaseItem[]): string[] => {
  return Array.from(new Set(items.map(item => item.category)));
};

export const getUniqueSuppliers = (items: PurchaseItem[]): string[] => {
  return Array.from(new Set(items.map(item => item.preferredSupplier)));
};

export const initializePurchaseForm = () => ({
  itemName: '',
  category: 'rice-noodles' as PurchaseItem['category'],
  quantity: 0,
  unit: '',
  preferredSupplier: '',
  neededBy: '',
  urgency: 'medium' as PurchaseItem['urgency'],
  notes: ''
});

export const initializePurchaseData = () => ({
  price: 0,
  date: new Date().toISOString().split('T')[0]
});