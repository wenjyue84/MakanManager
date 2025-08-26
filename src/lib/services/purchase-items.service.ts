import type { PurchaseItem } from '../operations-data';

export interface CreatePurchaseItemData {
  itemName: string;
  category: PurchaseItem['category'];
  quantity: number;
  unit: string;
  preferredSupplier: string;
  neededBy?: string;
  urgency: PurchaseItem['urgency'];
  notes?: string;
}

export interface UpdatePurchaseItemData extends Partial<CreatePurchaseItemData> {
  status?: PurchaseItem['status'];
  reviewedBy?: string;
  orderedAt?: string;
  receivedAt?: string;
  purchasedPrice?: number;
  purchasedDate?: string;
  purchasedBy?: string;
}

// Mock purchase items data
const mockPurchaseItems: PurchaseItem[] = [
  {
    id: '1',
    itemName: 'Fresh Vegetables',
    category: 'ingredients',
    quantity: 10,
    unit: 'kg',
    preferredSupplier: 'Fresh Market Supplier',
    urgency: 'medium',
    status: 'new',
    addedBy: '1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    itemName: 'Rice',
    category: 'ingredients',
    quantity: 25,
    unit: 'kg',
    preferredSupplier: 'Bulk Foods Ltd',
    urgency: 'low',
    status: 'reviewed',
    addedBy: '2',
    reviewedBy: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export class PurchaseItemsService {
  static async getAllItems(): Promise<PurchaseItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockPurchaseItems]);
      }, 100);
    });
  }

  static async createItem(data: CreatePurchaseItemData): Promise<PurchaseItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem: PurchaseItem = {
          id: `item-${Date.now()}`,
          itemName: data.itemName,
          category: data.category,
          quantity: data.quantity,
          unit: data.unit,
          preferredSupplier: data.preferredSupplier,
          neededBy: data.neededBy,
          urgency: data.urgency,
          notes: data.notes,
          status: 'new',
          addedBy: '1', // Current user ID
          createdAt: new Date().toISOString()
        };
        
        mockPurchaseItems.unshift(newItem);
        resolve(newItem);
      }, 100);
    });
  }

  static async updateItem(id: string, data: UpdatePurchaseItemData): Promise<PurchaseItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const itemIndex = mockPurchaseItems.findIndex(item => item.id === id);
        if (itemIndex === -1) {
          resolve(null);
          return;
        }

        const updatedItem = {
          ...mockPurchaseItems[itemIndex],
          ...data,
          id // Preserve original ID
        };

        mockPurchaseItems[itemIndex] = updatedItem;
        resolve(updatedItem);
      }, 100);
    });
  }

  static async deleteItem(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const itemIndex = mockPurchaseItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          mockPurchaseItems.splice(itemIndex, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 50);
    });
  }

  static async getItemById(id: string): Promise<PurchaseItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockPurchaseItems.find(item => item.id === id);
        resolve(item || null);
      }, 50);
    });
  }

  static async updateStatus(
    id: string,
    status: PurchaseItem['status'],
    options: { price?: number; date?: string; staffId?: string } = {}
  ): Promise<PurchaseItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const itemIndex = mockPurchaseItems.findIndex(item => item.id === id);
        if (itemIndex === -1) {
          resolve(null);
          return;
        }

        const data: UpdatePurchaseItemData = { status };
        
        if (status === 'reviewed') {
          data.reviewedBy = options.staffId || '1';
        }
        if (status === 'ordered') {
          data.orderedAt = options.date || new Date().toISOString();
        }
        if (status === 'received') {
          data.receivedAt = options.date || new Date().toISOString();
        }
        if (status === 'purchased') {
          data.purchasedPrice = options.price;
          data.purchasedDate = options.date;
          data.purchasedBy = options.staffId || '1';
        }

        const updatedItem = {
          ...mockPurchaseItems[itemIndex],
          ...data
        };

        mockPurchaseItems[itemIndex] = updatedItem;
        resolve(updatedItem);
      }, 100);
    });
  }
}

export default PurchaseItemsService;