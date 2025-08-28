import { PurchaseItem } from './operations-data';

export const PURCHASE_ITEM_CATEGORIES = [
  { value: 'rice-noodles', label: 'Rice & Noodles' },
  { value: 'proteins', label: 'Proteins' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'spices-sauces', label: 'Spices & Sauces' },
  { value: 'frozen-processed', label: 'Frozen & Processed' },
  { value: 'coffee-tea', label: 'Coffee & Tea' },
  { value: 'soft-drinks', label: 'Soft Drinks' },
  { value: 'beverage-supplies', label: 'Beverage Supplies' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'condiments', label: 'Condiments' },
  { value: 'disposables', label: 'Disposables' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'paper-products', label: 'Paper Products' },
  { value: 'cleaning', label: 'Cleaning Supplies' },
  { value: 'other', label: 'Other' }
] as const;

export const PURCHASE_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'received', label: 'Received' },
  { value: 'purchased', label: 'Purchased' }
] as const;

export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
] as const;

export const COMMON_UNITS = [
  'kg', 'g', 'L', 'ml', 'pieces', 'packets', 'cans', 'bottles', 'boxes', 
  'tins', 'jars', 'loaves', 'trays', 'blocks', 'pairs', 'rolls', 'sheets', 'set'
] as const;

export const DEFAULT_FORM_DATA: Omit<PurchaseItem, 'id' | 'status' | 'addedBy' | 'createdAt'> = {
  itemName: '',
  category: 'rice-noodles',
  quantity: 0,
  unit: '',
  preferredSupplier: '',
  urgency: 'medium',
  notes: ''
};