"use client";

import React, { useState, useMemo } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { currentUser } from '../../lib/data';
import { PurchaseStats } from './purchase-list/purchase-stats';
import { PurchaseFilters } from './purchase-list/purchase-filters';
import { PurchaseItemCard } from './purchase-list/purchase-item-card';
import { PurchaseTableRow } from './purchase-list/purchase-table-row';
import { PurchaseDialogs } from './purchase-list/purchase-dialogs';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  purchaseItems,
  addPurchaseItem,
  updatePurchaseItem,
  deletePurchaseItem,
  markItemAsPurchased,
  getActiveSuppliers,
  type PurchaseItem 
} from '../../lib/operations-data';
import {
  filterPurchaseItems,
  calculatePurchaseStats,
  getUniqueCategories,
  getUniqueSuppliers,
  initializePurchaseForm,
  initializePurchaseData,
  validatePurchaseItem,
  validatePurchaseData
} from '../../lib/purchase-list-helpers';
import { toast } from "sonner@2.0.3";

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

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  // Computed values
  const filteredItems = useMemo(() => {
    return filterPurchaseItems(purchaseItems, {
      searchQuery,
      selectedCategory,
      selectedStatus,
      selectedUrgency,
      selectedSupplier
    });
  }, [searchQuery, selectedCategory, selectedStatus, selectedUrgency, selectedSupplier]);

  const stats = useMemo(() => calculatePurchaseStats(purchaseItems), []);
  const categories = getUniqueCategories(purchaseItems);
  const supplierNames = getUniqueSuppliers(purchaseItems);

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
      notes: item.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveItem = () => {
    if (!validatePurchaseItem(formData)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditOpen && selectedItem) {
      const updated = updatePurchaseItem(selectedItem.id, formData);
      if (updated) {
        toast.success(`Item "${formData.itemName}" updated successfully`);
        setIsEditOpen(false);
        setSelectedItem(null);
      } else {
        toast.error('Failed to update item');
      }
    } else {
      addPurchaseItem({
        ...formData,
        status: 'new',
        addedBy: currentUser.id,
        createdAt: new Date().toISOString()
      });
      toast.success(`Item "${formData.itemName}" added to purchase list`);
      setIsCreateOpen(false);
    }
  };

  const handleMarkAsPurchased = () => {
    if (!selectedItem || !validatePurchaseData(purchaseData)) {
      toast.error('Please enter a valid price');
      return;
    }

    const updated = markItemAsPurchased(
      selectedItem.id, 
      purchaseData.price, 
      purchaseData.date, 
      currentUser.id
    );
    
    if (updated) {
      toast.success(`Item marked as purchased! Cost: RM${purchaseData.price.toFixed(2)}`);
      setIsPurchaseOpen(false);
      setIsDetailOpen(false);
      setPurchaseData(initializePurchaseData());
    } else {
      toast.error('Failed to mark item as purchased');
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    
    const success = deletePurchaseItem(selectedItem.id);
    if (success) {
      toast.success(`Item "${selectedItem.itemName}" removed from purchase list`);
      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedItem(null);
    } else {
      toast.error('Failed to delete item');
    }
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
            <>
              {isMobile ? (
                <div className="grid gap-4">
                  {filteredItems.map((item) => (
                    <PurchaseItemCard 
                      key={item.id} 
                      item={item}
                      isManagement={isManagement}
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
                      {filteredItems.map((item) => (
                        <PurchaseTableRow 
                          key={item.id} 
                          item={item}
                          isManagement={isManagement}
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
                          onOpenDetail={() => setIsDetailOpen(true)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
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
        suppliers={getActiveSuppliers()}
        onSave={handleSaveItem}
        onMarkAsPurchased={handleMarkAsPurchased}
        onDelete={handleDeleteItem}
        onEdit={handleEditItem}
      />
    </>
  );
}