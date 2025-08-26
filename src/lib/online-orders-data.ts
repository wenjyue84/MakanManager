// Online Orders Data Structure
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  lastOrderDate: string;
  preferredPaymentMethod?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  itemName: string;
  category: 'beverages' | 'main-dishes' | 'snacks' | 'desserts';
  basePrice: number;
  quantity: number;
  variants?: OrderVariant[];
  specialInstructions?: string;
  totalPrice: number; // basePrice * quantity + variant costs
}

export interface OrderVariant {
  type: 'size' | 'temperature' | 'sweetness' | 'ice' | 'extra' | 'less';
  name: string;
  priceModifier: number; // additional cost or discount
}

export interface PaymentDetails {
  method: 'cash' | 'card' | 'ewallet' | 'bank-transfer' | 'grab-pay' | 'food-panda' | 'shoppe-food';
  transactionId?: string;
  paidAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentTime?: string;
  platformFee?: number; // for third-party platforms
  netAmount: number; // after platform fees
}

export interface OnlineOrder {
  id: string;
  orderNumber: string; // ORD-001, ORD-002, etc.
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  // Order details
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  
  // Order preferences
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  numberOfPeople?: number;
  tableNumber?: string;
  deliveryAddress?: string;
  
  // Timing
  orderTime: string; // when customer placed order
  requestedTime?: string; // when customer wants to pick up/dine
  estimatedReadyTime?: string;
  actualReadyTime?: string;
  completedTime?: string;
  
  // Status tracking
  status: 'new' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  
  // Payment
  paymentDetails: PaymentDetails;
  
  // Platform info
  platform: 'website' | 'app' | 'grab-food' | 'food-panda' | 'shoppe-food' | 'phone' | 'walk-in';
  platformOrderId?: string;
  
  // Staff assignment
  assignedTo?: string; // staff id handling the order
  
  // Notes and communication
  customerRemarks?: string;
  internalNotes?: string;
  
  // Tracking
  createdAt: string;
  updatedAt: string;
}

// Sample customers data
export const customers: Customer[] = [
  {
    id: '1',
    name: 'Ahmad Rizal',
    phone: '+60123456789',
    email: 'ahmad.rizal@gmail.com',
    totalOrders: 15,
    lastOrderDate: '2024-08-23',
    preferredPaymentMethod: 'grab-pay',
    notes: 'Regular customer, prefers less sweet drinks'
  },
  {
    id: '2',
    name: 'Sarah Lim',
    phone: '+60187654321',
    email: 'sarah.lim@outlook.com',
    totalOrders: 8,
    lastOrderDate: '2024-08-22',
    preferredPaymentMethod: 'card'
  },
  {
    id: '3',
    name: 'Rajesh Kumar',
    phone: '+60199876543',
    totalOrders: 23,
    lastOrderDate: '2024-08-23',
    preferredPaymentMethod: 'ewallet',
    notes: 'VIP customer, always orders for office group'
  },
  {
    id: '4',
    name: 'Michelle Tan',
    phone: '+60166543210',
    email: 'michelle.tan@yahoo.com',
    totalOrders: 5,
    lastOrderDate: '2024-08-21',
    preferredPaymentMethod: 'food-panda'
  },
  {
    id: '5',
    name: 'David Wong',
    phone: '+60133334444',
    totalOrders: 12,
    lastOrderDate: '2024-08-20',
    preferredPaymentMethod: 'cash'
  }
];

// Sample online orders data
export let onlineOrders: OnlineOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerId: '1',
    customerName: 'Ahmad Rizal',
    customerPhone: '+60123456789',
    customerEmail: 'ahmad.rizal@gmail.com',
    items: [
      {
        id: '1',
        itemName: 'Teh Tarik',
        category: 'beverages',
        basePrice: 3.50,
        quantity: 2,
        variants: [
          { type: 'sweetness', name: 'Less Sweet', priceModifier: 0 },
          { type: 'temperature', name: 'Hot', priceModifier: 0 }
        ],
        specialInstructions: 'Extra creamy please',
        totalPrice: 7.00
      },
      {
        id: '2',
        itemName: 'Nasi Lemak with Ayam Rendang',
        category: 'main-dishes',
        basePrice: 12.90,
        quantity: 1,
        variants: [
          { type: 'extra', name: 'Extra Sambal', priceModifier: 1.00 }
        ],
        totalPrice: 13.90
      },
      {
        id: '3',
        itemName: 'Kuih Lapis',
        category: 'desserts',
        basePrice: 2.50,
        quantity: 3,
        totalPrice: 7.50
      }
    ],
    subtotal: 28.40,
    taxAmount: 0.00,
    serviceCharge: 0.00,
    deliveryFee: 0.00,
    discount: 0.00,
    totalAmount: 28.40,
    orderType: 'takeaway',
    numberOfPeople: 2,
    orderTime: '2024-08-23T14:30:00Z',
    requestedTime: '2024-08-23T15:00:00Z',
    estimatedReadyTime: '2024-08-23T14:55:00Z',
    actualReadyTime: '2024-08-23T14:52:00Z',
    status: 'ready',
    priority: 'normal',
    paymentDetails: {
      method: 'grab-pay',
      transactionId: 'GP-789123456',
      paidAmount: 28.40,
      paymentStatus: 'paid',
      paymentTime: '2024-08-23T14:31:00Z',
      netAmount: 28.40
    },
    platform: 'grab-food',
    platformOrderId: 'GF-2024082301',
    assignedTo: '3', // Lily
    customerRemarks: 'Please pack separately for office sharing',
    createdAt: '2024-08-23T14:30:00Z',
    updatedAt: '2024-08-23T14:52:00Z'
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerId: '2',
    customerName: 'Sarah Lim',
    customerPhone: '+60187654321',
    customerEmail: 'sarah.lim@outlook.com',
    items: [
      {
        id: '4',
        itemName: 'Iced Coffee',
        category: 'beverages',
        basePrice: 4.90,
        quantity: 1,
        variants: [
          { type: 'size', name: 'Large', priceModifier: 1.50 },
          { type: 'ice', name: 'Less Ice', priceModifier: 0 },
          { type: 'extra', name: 'Extra Shot', priceModifier: 2.00 }
        ],
        totalPrice: 8.40
      },
      {
        id: '5',
        itemName: 'Chicken Curry Mee',
        category: 'main-dishes',
        basePrice: 11.50,
        quantity: 1,
        variants: [
          { type: 'extra', name: 'Extra Prawns', priceModifier: 3.00 }
        ],
        specialInstructions: 'Medium spicy level',
        totalPrice: 14.50
      }
    ],
    subtotal: 22.90,
    taxAmount: 1.37,
    serviceCharge: 0.00,
    deliveryFee: 5.00,
    discount: 2.00,
    totalAmount: 27.27,
    orderType: 'delivery',
    deliveryAddress: 'Block 123, Jalan Merdeka, Apartment 5-2, 50000 KL',
    orderTime: '2024-08-23T13:15:00Z',
    requestedTime: '2024-08-23T14:00:00Z',
    estimatedReadyTime: '2024-08-23T13:45:00Z',
    status: 'preparing',
    priority: 'normal',
    paymentDetails: {
      method: 'card',
      transactionId: 'CC-456789123',
      paidAmount: 27.27,
      paymentStatus: 'paid',
      paymentTime: '2024-08-23T13:16:00Z',
      netAmount: 27.27
    },
    platform: 'food-panda',
    platformOrderId: 'FP-2024082302',
    assignedTo: '10', // Bahar
    customerRemarks: 'Please call when arriving, security guard at entrance',
    internalNotes: 'Customer has food allergies - check ingredients',
    createdAt: '2024-08-23T13:15:00Z',
    updatedAt: '2024-08-23T13:35:00Z'
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerId: '3',
    customerName: 'Rajesh Kumar',
    customerPhone: '+60199876543',
    items: [
      {
        id: '6',
        itemName: 'Teh O Ais',
        category: 'beverages',
        basePrice: 2.80,
        quantity: 5,
        variants: [
          { type: 'sweetness', name: 'Normal Sweet', priceModifier: 0 }
        ],
        totalPrice: 14.00
      },
      {
        id: '7',
        itemName: 'Mee Goreng',
        category: 'main-dishes',
        basePrice: 8.90,
        quantity: 3,
        totalPrice: 26.70
      },
      {
        id: '8',
        itemName: 'Fish & Chips',
        category: 'main-dishes',
        basePrice: 15.90,
        quantity: 2,
        variants: [
          { type: 'extra', name: 'Extra Fries', priceModifier: 3.00 }
        ],
        totalPrice: 37.80
      }
    ],
    subtotal: 78.50,
    taxAmount: 0.00,
    serviceCharge: 7.85,
    deliveryFee: 0.00,
    discount: 5.00,
    totalAmount: 81.35,
    orderType: 'dine-in',
    numberOfPeople: 5,
    tableNumber: 'T-08',
    orderTime: '2024-08-23T12:00:00Z',
    requestedTime: '2024-08-23T12:30:00Z',
    estimatedReadyTime: '2024-08-23T12:25:00Z',
    actualReadyTime: '2024-08-23T12:28:00Z',
    completedTime: '2024-08-23T13:15:00Z',
    status: 'completed',
    priority: 'normal',
    paymentDetails: {
      method: 'ewallet',
      transactionId: 'TNG-987654321',
      paidAmount: 81.35,
      paymentStatus: 'paid',
      paymentTime: '2024-08-23T13:16:00Z',
      netAmount: 81.35
    },
    platform: 'website',
    assignedTo: '4', // Simon
    customerRemarks: 'Office lunch meeting, please serve all together',
    internalNotes: 'VIP customer - priority handling',
    createdAt: '2024-08-23T12:00:00Z',
    updatedAt: '2024-08-23T13:15:00Z'
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customerId: '4',
    customerName: 'Michelle Tan',
    customerPhone: '+60166543210',
    customerEmail: 'michelle.tan@yahoo.com',
    items: [
      {
        id: '9',
        itemName: 'Green Tea Latte',
        category: 'beverages',
        basePrice: 5.50,
        quantity: 1,
        variants: [
          { type: 'temperature', name: 'Iced', priceModifier: 0 },
          { type: 'sweetness', name: 'Half Sweet', priceModifier: 0 }
        ],
        totalPrice: 5.50
      },
      {
        id: '10',
        itemName: 'Ayam Penyet',
        category: 'main-dishes',
        basePrice: 13.90,
        quantity: 1,
        variants: [
          { type: 'extra', name: 'Extra Sambal', priceModifier: 1.00 }
        ],
        specialInstructions: 'Medium spicy, separate sambal please',
        totalPrice: 14.90
      }
    ],
    subtotal: 20.40,
    taxAmount: 1.22,
    serviceCharge: 0.00,
    deliveryFee: 4.50,
    discount: 0.00,
    totalAmount: 26.12,
    orderType: 'delivery',
    deliveryAddress: 'Condo Vista, Tower A, Level 15, Unit 3A, 47500 Subang Jaya',
    orderTime: '2024-08-23T11:45:00Z',
    requestedTime: '2024-08-23T12:30:00Z',
    estimatedReadyTime: '2024-08-23T12:15:00Z',
    status: 'confirmed',
    priority: 'normal',
    paymentDetails: {
      method: 'food-panda',
      transactionId: 'FP-567891234',
      paidAmount: 26.12,
      paymentStatus: 'paid',
      paymentTime: '2024-08-23T11:46:00Z',
      platformFee: 2.61,
      netAmount: 23.51
    },
    platform: 'food-panda',
    platformOrderId: 'FP-2024082304',
    assignedTo: '6', // Thua
    customerRemarks: 'Please ring doorbell, working from home',
    createdAt: '2024-08-23T11:45:00Z',
    updatedAt: '2024-08-23T11:50:00Z'
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    customerId: '5',
    customerName: 'David Wong',
    customerPhone: '+60133334444',
    items: [
      {
        id: '11',
        itemName: 'Kopi O',
        category: 'beverages',
        basePrice: 2.20,
        quantity: 1,
        variants: [
          { type: 'sweetness', name: 'Extra Sweet', priceModifier: 0 }
        ],
        totalPrice: 2.20
      },
      {
        id: '12',
        itemName: 'Roti Canai',
        category: 'main-dishes',
        basePrice: 1.80,
        quantity: 2,
        totalPrice: 3.60
      },
      {
        id: '13',
        itemName: 'Curry Chicken',
        category: 'main-dishes',
        basePrice: 6.50,
        quantity: 1,
        specialInstructions: 'Extra gravy please',
        totalPrice: 6.50
      }
    ],
    subtotal: 12.30,
    taxAmount: 0.00,
    serviceCharge: 0.00,
    deliveryFee: 0.00,
    discount: 1.00,
    totalAmount: 11.30,
    orderType: 'takeaway',
    orderTime: '2024-08-23T08:30:00Z',
    requestedTime: '2024-08-23T08:45:00Z',
    estimatedReadyTime: '2024-08-23T08:42:00Z',
    actualReadyTime: '2024-08-23T08:40:00Z',
    completedTime: '2024-08-23T08:45:00Z',
    status: 'completed',
    priority: 'normal',
    paymentDetails: {
      method: 'cash',
      paidAmount: 11.30,
      paymentStatus: 'paid',
      paymentTime: '2024-08-23T08:45:00Z',
      netAmount: 11.30
    },
    platform: 'phone',
    assignedTo: '7', // Sherry
    customerRemarks: 'Regular breakfast order',
    internalNotes: 'Customer always punctual for pickup',
    createdAt: '2024-08-23T08:30:00Z',
    updatedAt: '2024-08-23T08:45:00Z'
  },
  {
    id: '6',
    orderNumber: 'ORD-006',
    customerId: '1',
    customerName: 'Ahmad Rizal',
    customerPhone: '+60123456789',
    items: [
      {
        id: '14',
        itemName: 'Iced Milo',
        category: 'beverages',
        basePrice: 4.20,
        quantity: 1,
        variants: [
          { type: 'sweetness', name: 'Less Sweet', priceModifier: 0 },
          { type: 'extra', name: 'Extra Milo Powder', priceModifier: 1.00 }
        ],
        totalPrice: 5.20
      }
    ],
    subtotal: 5.20,
    taxAmount: 0.00,
    serviceCharge: 0.00,
    deliveryFee: 0.00,
    discount: 0.00,
    totalAmount: 5.20,
    orderType: 'takeaway',
    orderTime: '2024-08-23T16:20:00Z',
    status: 'new',
    priority: 'normal',
    paymentDetails: {
      method: 'grab-pay',
      paidAmount: 5.20,
      paymentStatus: 'pending',
      netAmount: 5.20
    },
    platform: 'app',
    customerRemarks: 'Quick pickup, just the drink',
    createdAt: '2024-08-23T16:20:00Z',
    updatedAt: '2024-08-23T16:20:00Z'
  }
];

// Helper functions for online orders management
export const addOnlineOrder = (newOrder: Omit<OnlineOrder, 'id' | 'orderNumber'>): OnlineOrder => {
  const id = (Math.max(...onlineOrders.map(o => parseInt(o.id)), 0) + 1).toString();
  const orderNumber = `ORD-${id.padStart(3, '0')}`;
  const order: OnlineOrder = { ...newOrder, id, orderNumber };
  onlineOrders.push(order);
  return order;
};

export const updateOnlineOrder = (id: string, updates: Partial<OnlineOrder>): OnlineOrder | null => {
  const index = onlineOrders.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  onlineOrders[index] = { ...onlineOrders[index], ...updates, updatedAt: new Date().toISOString() };
  return onlineOrders[index];
};

export const deleteOnlineOrder = (id: string): boolean => {
  const index = onlineOrders.findIndex(o => o.id === id);
  if (index === -1) return false;
  
  onlineOrders.splice(index, 1);
  return true;
};

export const getOrdersByStatus = (status: string): OnlineOrder[] => {
  return onlineOrders.filter(order => order.status === status);
};

export const getOrdersByPlatform = (platform: string): OnlineOrder[] => {
  return onlineOrders.filter(order => order.platform === platform);
};

export const getOrdersByCustomer = (customerId: string): OnlineOrder[] => {
  return onlineOrders.filter(order => order.customerId === customerId);
};

export const getOrdersByDateRange = (startDate: string, endDate: string): OnlineOrder[] => {
  return onlineOrders.filter(order => 
    order.orderTime >= startDate && order.orderTime <= endDate
  );
};

// Status and platform color helpers
export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'new': return 'default';
    case 'confirmed': return 'warning';
    case 'preparing': return 'warning';
    case 'ready': return 'success';
    case 'completed': return 'success';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
};

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'failed': return 'destructive';
    case 'refunded': return 'secondary';
    default: return 'secondary';
  }
};

export const getPlatformColor = (platform: string): string => {
  switch (platform) {
    case 'website':
    case 'app': return 'primary';
    case 'grab-food': return 'success';
    case 'food-panda': return 'warning';
    case 'shoppe-food': return 'destructive';
    case 'phone': return 'secondary';
    case 'walk-in': return 'default';
    default: return 'secondary';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'warning';
    case 'normal': return 'secondary';
    default: return 'secondary';
  }
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return `RM${amount.toFixed(2)}`;
};

export const formatDateTime = (
  dateString: string,
  locale: string = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
): string => {
  return new Date(dateString).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (
  dateString: string,
  locale: string = typeof navigator !== 'undefined' ? navigator.language : 'en-US'
): string => {
  return new Date(dateString).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateOrderStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = onlineOrders.filter(order => 
    order.orderTime.startsWith(today)
  );
  
  const totalRevenue = todayOrders
    .filter(order => order.paymentDetails.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);
    
  const platformBreakdown = onlineOrders.reduce((acc, order) => {
    acc[order.platform] = (acc[order.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalOrders: onlineOrders.length,
    todayOrders: todayOrders.length,
    totalRevenue,
    pendingOrders: getOrdersByStatus('new').length + getOrdersByStatus('confirmed').length,
    preparingOrders: getOrdersByStatus('preparing').length,
    readyOrders: getOrdersByStatus('ready').length,
    platformBreakdown
  };
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

export const updateCustomerOrderCount = (customerId: string): void => {
  const customer = customers.find(c => c.id === customerId);
  if (customer) {
    const customerOrders = getOrdersByCustomer(customerId);
    customer.totalOrders = customerOrders.length;
    customer.lastOrderDate = new Date().toISOString().split('T')[0];
  }
};