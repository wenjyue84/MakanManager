"use client";

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Eye,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Package2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Utensils,
  Car,
  Home,
  CreditCard,
  Smartphone,
  Truck
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { currentUser } from '../../lib/data';
import { staffMembers } from '../../lib/staff-data';
import { 
  onlineOrders,
  customers,
  updateOnlineOrder,
  getOrdersByStatus,
  getOrdersByPlatform,
  getOrderStatusColor,
  getPaymentStatusColor,
  getPlatformColor,
  getPriorityColor,
  formatCurrency,
  formatDateTime,
  formatTime,
  calculateOrderStats,
  getCustomerById,
  type OnlineOrder,
  type Customer,
  type OrderItem
} from '../../lib/online-orders-data';
import { toast } from "sonner@2.0.3";

export function OnlineOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = useMemo(() => calculateOrderStats(), []);

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    return onlineOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPlatform = platformFilter === 'all' || order.platform === platformFilter;
      
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [searchTerm, statusFilter, platformFilter]);

  const handleOrderClick = (order: OnlineOrder) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    const updated = updateOnlineOrder(orderId, { 
      status: newStatus as any,
      actualReadyTime: newStatus === 'ready' ? new Date().toISOString() : undefined,
      completedTime: newStatus === 'completed' ? new Date().toISOString() : undefined
    });

    if (updated) {
      toast.success(`Order ${updated.orderNumber} status updated to ${newStatus}`);
      setSelectedOrder(updated);
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    switch (orderType) {
      case 'dine-in': return <Utensils className="size-4" />;
      case 'takeaway': return <Package2 className="size-4" />;
      case 'delivery': return <Truck className="size-4" />;
      default: return <Package2 className="size-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'website':
      case 'app': return <Smartphone className="size-4" />;
      case 'phone': return <Phone className="size-4" />;
      case 'walk-in': return <Users className="size-4" />;
      default: return <Package2 className="size-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <DollarSign className="size-4" />;
      case 'card': return <CreditCard className="size-4" />;
      default: return <Smartphone className="size-4" />;
    }
  };

  // Component for order card (mobile)
  const OrderCard = ({ order }: { order: OnlineOrder }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOrderClick(order)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-medium">{order.orderNumber}</div>
            <div className="text-sm text-muted-foreground">{order.customerName}</div>
            <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-primary">{formatCurrency(order.totalAmount)}</div>
            <div className="text-xs text-muted-foreground">{formatTime(order.orderTime)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          {getOrderTypeIcon(order.orderType)}
          <span className="text-sm capitalize">{order.orderType}</span>
          {order.numberOfPeople && (
            <>
              <Users className="size-3 ml-2" />
              <span className="text-sm">{order.numberOfPeople}</span>
            </>
          )}
          {order.tableNumber && (
            <span className="text-sm text-muted-foreground">• Table {order.tableNumber}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getOrderStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge variant={getPlatformColor(order.platform)} className="text-xs">
              {order.platform}
            </Badge>
          </div>
          <Badge variant={getPaymentStatusColor(order.paymentDetails.paymentStatus)} className="text-xs">
            {order.paymentDetails.paymentStatus}
          </Badge>
        </div>
        
        {order.customerRemarks && (
          <div className="mt-2 text-xs text-muted-foreground bg-accent/50 p-2 rounded">
            💬 {order.customerRemarks}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Online Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders from all platforms
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/order-form">View Order form as Guest</Link>
          </Button>
        </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="app">Mobile App</SelectItem>
                  <SelectItem value="grab-food">Grab Food</SelectItem>
                  <SelectItem value="food-panda">FoodPanda</SelectItem>
                  <SelectItem value="shoppe-food">Shopee Food</SelectItem>
                  <SelectItem value="phone">Phone Order</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Package2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <div className="text-xs text-muted-foreground">orders placed today</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className="text-xs text-muted-foreground">today's total</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preparing</CardTitle>
              <Clock className="size-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.preparingOrders}</div>
              <div className="text-xs text-muted-foreground">orders in kitchen</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
              <CheckCircle className="size-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.readyOrders}</div>
              <div className="text-xs text-muted-foreground">ready for pickup</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {isMobile ? (
          <div>
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders found matching your filters
              </div>
            )}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleOrderClick(order)}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOrderTypeIcon(order.orderType)}
                        <span className="capitalize">{order.orderType}</span>
                        {order.numberOfPeople && (
                          <>
                            <Users className="size-3" />
                            <span>{order.numberOfPeople}</span>
                          </>
                        )}
                        {order.tableNumber && (
                          <span className="text-muted-foreground">• {order.tableNumber}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatTime(order.orderTime)}</div>
                        {order.requestedTime && (
                          <div className="text-muted-foreground">
                            Ready: {formatTime(order.requestedTime)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOrderStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPlatformIcon(order.platform)}
                        <Badge variant={getPlatformColor(order.platform)} className="text-xs">
                          {order.platform}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(order.paymentDetails.method)}
                        <Badge variant={getPaymentStatusColor(order.paymentDetails.paymentStatus)} className="text-xs">
                          {order.paymentDetails.paymentStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick(order);
                      }}>
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders found matching your filters
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>Order {selectedOrder.orderNumber}</span>
                  <Badge variant={getOrderStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                  <Badge variant={getPlatformColor(selectedOrder.platform)}>
                    {selectedOrder.platform}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Placed on {formatDateTime(selectedOrder.orderTime)}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="customer">Customer Info</TabsTrigger>
                  <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Items ({selectedOrder.items.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{item.itemName}</div>
                              <div className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × {formatCurrency(item.basePrice)}
                              </div>
                              {item.variants && item.variants.length > 0 && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {item.variants.map((variant, index) => (
                                    <span key={index} className="inline-block mr-2 bg-accent px-2 py-1 rounded text-xs">
                                      {variant.name}
                                      {variant.priceModifier !== 0 && ` (${variant.priceModifier > 0 ? '+' : ''}${formatCurrency(variant.priceModifier)})`}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {item.specialInstructions && (
                                <div className="text-sm text-warning-foreground bg-warning/10 p-2 rounded mt-2">
                                  💬 {item.specialInstructions}
                                </div>
                              )}
                            </div>
                            <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>
                        {selectedOrder.taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                          </div>
                        )}
                        {selectedOrder.serviceCharge > 0 && (
                          <div className="flex justify-between">
                            <span>Service Charge</span>
                            <span>{formatCurrency(selectedOrder.serviceCharge)}</span>
                          </div>
                        )}
                        {selectedOrder.deliveryFee > 0 && (
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                          </div>
                        )}
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between text-success">
                            <span>Discount</span>
                            <span>-{formatCurrency(selectedOrder.discount)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-medium text-lg">
                          <span>Total</span>
                          <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Remarks */}
                  {selectedOrder.customerRemarks && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Remarks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-accent/50 p-3 rounded-lg">
                          💬 {selectedOrder.customerRemarks}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="customer" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                          <AvatarFallback>{selectedOrder.customerName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedOrder.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {getCustomerById(selectedOrder.customerId)?.totalOrders || 1} orders
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Phone Number</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="size-4" />
                            <span>{selectedOrder.customerPhone}</span>
                          </div>
                        </div>
                        
                        {selectedOrder.customerEmail && (
                          <div>
                            <Label>Email</Label>
                            <div className="mt-1">{selectedOrder.customerEmail}</div>
                          </div>
                        )}
                        
                        <div>
                          <Label>Order Type</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getOrderTypeIcon(selectedOrder.orderType)}
                            <span className="capitalize">{selectedOrder.orderType}</span>
                          </div>
                        </div>
                        
                        {selectedOrder.numberOfPeople && (
                          <div>
                            <Label>Number of People</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Users className="size-4" />
                              <span>{selectedOrder.numberOfPeople}</span>
                            </div>
                          </div>
                        )}
                        
                        {selectedOrder.tableNumber && (
                          <div>
                            <Label>Table Number</Label>
                            <div className="mt-1">{selectedOrder.tableNumber}</div>
                          </div>
                        )}
                        
                        {selectedOrder.deliveryAddress && (
                          <div className="col-span-2">
                            <Label>Delivery Address</Label>
                            <div className="flex items-start gap-2 mt-1">
                              <MapPin className="size-4 mt-0.5" />
                              <span>{selectedOrder.deliveryAddress}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Payment Method</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getPaymentMethodIcon(selectedOrder.paymentDetails.method)}
                            <span className="capitalize">{selectedOrder.paymentDetails.method.replace('-', ' ')}</span>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Payment Status</Label>
                          <div className="mt-1">
                            <Badge variant={getPaymentStatusColor(selectedOrder.paymentDetails.paymentStatus)}>
                              {selectedOrder.paymentDetails.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                        
                        {selectedOrder.paymentDetails.transactionId && (
                          <div>
                            <Label>Transaction ID</Label>
                            <div className="mt-1 font-mono text-sm">{selectedOrder.paymentDetails.transactionId}</div>
                          </div>
                        )}
                        
                        <div>
                          <Label>Amount Paid</Label>
                          <div className="mt-1 font-medium">{formatCurrency(selectedOrder.paymentDetails.paidAmount)}</div>
                        </div>
                        
                        {selectedOrder.paymentDetails.platformFee && (
                          <div>
                            <Label>Platform Fee</Label>
                            <div className="mt-1 text-destructive">-{formatCurrency(selectedOrder.paymentDetails.platformFee)}</div>
                          </div>
                        )}
                        
                        <div>
                          <Label>Net Amount</Label>
                          <div className="mt-1 font-medium text-success">{formatCurrency(selectedOrder.paymentDetails.netAmount)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tracking" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Status & Timing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status Update Buttons */}
                      {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                        <div className="flex gap-2 flex-wrap">
                          {selectedOrder.status === 'new' && (
                            <Button size="sm" onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}>
                              <CheckCircle className="size-4 mr-1" />
                              Confirm Order
                            </Button>
                          )}
                          {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'new') && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedOrder.id, 'preparing')}>
                              <Clock className="size-4 mr-1" />
                              Start Preparing
                            </Button>
                          )}
                          {selectedOrder.status === 'preparing' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(selectedOrder.id, 'ready')}>
                              <CheckCircle className="size-4 mr-1" />
                              Mark Ready
                            </Button>
                          )}
                          {selectedOrder.status === 'ready' && (
                            <Button size="sm" onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}>
                              <CheckCircle className="size-4 mr-1" />
                              Complete Order
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}>
                            <XCircle className="size-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {/* Timing Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Order Placed</Label>
                          <div className="mt-1">{formatDateTime(selectedOrder.orderTime)}</div>
                        </div>
                        
                        {selectedOrder.requestedTime && (
                          <div>
                            <Label>Requested Ready Time</Label>
                            <div className="mt-1">{formatDateTime(selectedOrder.requestedTime)}</div>
                          </div>
                        )}
                        
                        {selectedOrder.estimatedReadyTime && (
                          <div>
                            <Label>Estimated Ready Time</Label>
                            <div className="mt-1">{formatDateTime(selectedOrder.estimatedReadyTime)}</div>
                          </div>
                        )}
                        
                        {selectedOrder.actualReadyTime && (
                          <div>
                            <Label>Actual Ready Time</Label>
                            <div className="mt-1 text-success">{formatDateTime(selectedOrder.actualReadyTime)}</div>
                          </div>
                        )}
                        
                        {selectedOrder.completedTime && (
                          <div>
                            <Label>Completed Time</Label>
                            <div className="mt-1 text-success">{formatDateTime(selectedOrder.completedTime)}</div>
                          </div>
                        )}
                      </div>

                      {/* Staff Assignment */}
                      {selectedOrder.assignedTo && (
                        <div>
                          <Label>Assigned To</Label>
                          <div className="mt-1">
                            {staffMembers.find(s => s.id === selectedOrder.assignedTo)?.name || 'Unknown Staff'}
                          </div>
                        </div>
                      )}

                      {/* Internal Notes */}
                      {selectedOrder.internalNotes && (
                        <div>
                          <Label>Internal Notes</Label>
                          <div className="mt-1 bg-muted p-3 rounded-lg">
                            {selectedOrder.internalNotes}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}