"use client";

import React, { useState, useMemo } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import { PurchaseStats } from './purchase-list/purchase-stats';
import { PurchaseFilters } from './purchase-list/purchase-filters';
import { PurchaseItemCard } from './purchase-list/purchase-item-card';
import { PurchaseTableRow } from './purchase-list/purchase-table-row';
import { PurchaseDialogs } from './purchase-list/purchase-dialogs';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table';
import { getActiveSuppliers, type PurchaseItem } from '../../lib/operations-data';
import {
  filterPurchaseItems,
  calculatePurchaseStats,
  getUniqueSuppliers,
  initializePurchaseForm,
  initializePurchaseData,
  validatePurchaseItem,
  validatePurchaseData
} from '../../lib/purchase-list-helpers';
import { PurchaseItemsService } from '../../lib/services/purchase-items.service';
import { toast } from 'sonner@2.0.3';

export function PurchaseListPage() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  // State for dialogs and forms
  const [selectedItem, setSelectedItem] = useState<PurchaseItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState(initializePurchaseForm());
  const [purchaseData, setPurchaseData] = useState(initializePurchaseData());
  const [items, setItems] = useState<PurchaseItem[]>([]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  React.useEffect(() => {
    PurchaseItemsService.getAllItems().then(setItems).catch(() => {
      toast.error('Failed to load purchase items');
    });
  }, []);


  const isManagement = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );
  const purchasingPerm = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen'].includes(role)
  );
  const activeSuppliers = useMemo(() => getActiveSuppliers(), []);

  // Computed values
  const filteredItems = useMemo(() => {
    return filterPurchaseItems(items, {
      searchQuery,
      selectedCategory,
      selectedStatus,
      selectedUrgency,
      selectedSupplier
    });
  }, [items, searchQuery, selectedCategory, selectedStatus, selectedUrgency, selectedSupplier]);

  const stats = useMemo(() => calculatePurchaseStats(items), [items]);
  const supplierNames = getUniqueSuppliers(items);

  const itemsBySupplier = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      (acc[item.preferredSupplier] ||= []).push(item);
      return acc;
    }, {} as Record<string, PurchaseItem[]>);
  }, [filteredItems]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || 
    selectedStatus !== 'all' || selectedUrgency !== 'all' || selectedSupplier !== 'all';

  // Handlers
  const handleCreateItem = () => {
    setFormData(initializePurchaseForm());
    setIsCreateOpen(true);
  };

  const handleEditItem = (item: PurchaseItem) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      preferredSupplier: item.preferredSupplier,
      neededBy: item.neededBy || '',
      urgency: item.urgency,
      status: item.status,
      notes: item.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveItem = async () => {
    if (!validatePurchaseItem(formData)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEditOpen && selectedItem) {
        const updated = await PurchaseItemsService.updateItem(selectedItem.id, formData);
        if (updated) {
          setItems(prev => prev.map(it => (it.id === updated.id ? updated : it)));
          toast.success(`Item "${formData.itemName}" updated successfully`);
          setIsEditOpen(false);
          setSelectedItem(null);
        }
      } else {
        const created = await PurchaseItemsService.createItem(formData);
        setItems(prev => [created, ...prev]);
        toast.success(`Item "${formData.itemName}" added to purchase list`);
        setIsCreateOpen(false);
      }
    } catch {
      toast.error('Failed to save item');
    }
  };

  const handleMarkAsPurchased = async () => {
    if (!selectedItem || !validatePurchaseData(purchaseData)) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const updated = await PurchaseItemsService.updateStatus(selectedItem.id, 'purchased', {
        price: purchaseData.price,
        date: purchaseData.date,
        staffId: currentUser.id
      });
      if (updated) {
        setItems(prev => prev.map(it => (it.id === updated.id ? updated : it)));
        toast.success(`Item marked as purchased! Cost: RM${purchaseData.price.toFixed(2)}`);
        setIsPurchaseOpen(false);
        setIsDetailOpen(false);
        setPurchaseData(initializePurchaseData());
      }
    } catch {
      toast.error('Failed to mark item as purchased');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      const success = await PurchaseItemsService.deleteItem(selectedItem.id);
      if (success) {
        setItems(prev => prev.filter(i => i.id !== selectedItem.id));
        toast.success(`Item "${selectedItem.itemName}" removed from purchase list`);
        setIsDeleteDialogOpen(false);
        setIsDetailOpen(false);
        setSelectedItem(null);
      }
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleReviewItem = async (item: PurchaseItem) => {
    if (!purchasingPerm) {
      toast.error('You do not have permission to review items');
      return;
    }
    const updated = await PurchaseItemsService.updateStatus(item.id, 'reviewed', {
      staffId: currentUser.id
    });
    if (updated) {
      setItems(prev => prev.map(it => (it.id === updated.id ? updated : it)));
    }
  };

  const handleOrderItem = async (item: PurchaseItem) => {
    if (!purchasingPerm) {
      toast.error('You do not have permission to order items');
      return;
    }
    const updated = await PurchaseItemsService.updateStatus(item.id, 'ordered', {
      date: new Date().toISOString(),
      staffId: currentUser.id
    });
    if (updated) {
      setItems(prev => prev.map(it => (it.id === updated.id ? updated : it)));
    }
  };

  const handleWhatsAppSupplier = (supplier: string) => {
    const info = activeSuppliers.find(
      s => s.displayName === supplier || s.companyName === supplier
    );
    const phone = info?.picContactNumber || info?.contactNumber;
    if (!phone) {
      toast.error('No contact number for supplier');
      return;
    }
    const lines = itemsBySupplier[supplier].map(
      it => `- ${it.itemName} (${it.quantity} ${it.unit})`
    );
    const message = `Order Request for ${supplier}:\n${lines.join('\n')}`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedUrgency('all');
    setSelectedSupplier('all');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase List</h1>
            <p className="text-muted-foreground">Manage inventory purchases and track costs</p>
          </div>
          
          {isManagement && (
            <Button onClick={handleCreateItem} className="flex items-center gap-2">
              <Plus className="size-4" />
              Add Item
            </Button>
          )}
        </div>

        {/* Statistics */}
        <PurchaseStats stats={stats} />

        {/* Filters */}
        <PurchaseFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedUrgency={selectedUrgency}
          setSelectedUrgency={setSelectedUrgency}
          selectedSupplier={selectedSupplier}
          setSelectedSupplier={setSelectedSupplier}
          supplierNames={supplierNames}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Items List */}
        <div>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="size-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-muted-foreground">
                No items found. {isManagement ? 'Add your first purchase item!' : 'Contact management to add items.'}
              </div>
            </div>
          ) : (
            Object.entries(itemsBySupplier).map(([supplier, supplierItems]) => (
              <div key={supplier} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{supplier}</h3>
                  {purchasingPerm && (
                    <Button size="sm" onClick={() => handleWhatsAppSupplier(supplier)}>
                      WhatsApp
                    </Button>
                  )}
                </div>
                {isMobile ? (
                  <div className="grid gap-4">
                    {supplierItems.map((item) => (
                      <PurchaseItemCard
                        key={item.id}
                        item={item}
                        isManagement={isManagement}
                        purchasingPerm={purchasingPerm}
                        onView={setSelectedItem}
                        onEdit={handleEditItem}
                        onDelete={(item) => {
                          setSelectedItem(item);
                          setIsDeleteDialogOpen(true);
                        }}
                        onMarkAsPurchased={(item) => {
                          setSelectedItem(item);
                          setIsPurchaseOpen(true);
                        }}
                        onReview={handleReviewItem}
                        onOrder={handleOrderItem}
                        onOpenDetail={() => setIsDetailOpen(true)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Urgency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierItems.map((item) => (
                          <PurchaseTableRow
                            key={item.id}
                            item={item}
                            isManagement={isManagement}
                            purchasingPerm={purchasingPerm}
                            onView={setSelectedItem}
                            onEdit={handleEditItem}
                            onDelete={(item) => {
                              setSelectedItem(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            onMarkAsPurchased={(item) => {
                              setSelectedItem(item);
                              setIsPurchaseOpen(true);
                            }}
                            onReview={handleReviewItem}
                            onOrder={handleOrderItem}
                            onOpenDetail={() => setIsDetailOpen(true)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      <PurchaseDialogs
        selectedItem={selectedItem}
        formData={formData}
        setFormData={setFormData}
        purchaseData={purchaseData}
        setPurchaseData={setPurchaseData}
        isDetailOpen={isDetailOpen}
        setIsDetailOpen={setIsDetailOpen}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        isPurchaseOpen={isPurchaseOpen}
        setIsPurchaseOpen={setIsPurchaseOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isManagement={isManagement}
        purchasingPerm={purchasingPerm}
        suppliers={getActiveSuppliers()}
        onSave={handleSaveItem}
        onMarkAsPurchased={handleMarkAsPurchased}
        onDelete={handleDeleteItem}
        onEdit={handleEditItem}
        onReview={handleReviewItem}
        onOrder={handleOrderItem}
      />
    </>
  );
}