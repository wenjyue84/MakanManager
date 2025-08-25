"use client";

import React from 'react';
import { Edit, Trash2, Calendar, DollarSign, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { staffMembers } from '../../../lib/staff-data';
import { PURCHASE_ITEM_CATEGORIES, URGENCY_LEVELS, COMMON_UNITS } from '../../../lib/purchase-list-constants';
import { 
  formatCurrency, 
  formatDateTime, 
  getCategoryColor, 
  getCategoryDisplayName,
  getStatusColor,
  getUrgencyColor,
  type PurchaseItem,
  type Supplier 
} from '../../../lib/operations-data';

interface PurchaseDialogsProps {
  selectedItem: PurchaseItem | null;
  formData: any;
  setFormData: (data: any) => void;
  purchaseData: { price: number; date: string };
  setPurchaseData: (data: { price: number; date: string }) => void;
  isDetailOpen: boolean;
  setIsDetailOpen: (open: boolean) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  isPurchaseOpen: boolean;
  setIsPurchaseOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isManagement: boolean;
  suppliers: Supplier[];
  onSave: () => void;
  onMarkAsPurchased: () => void;
  onDelete: () => void;
  onEdit: (item: PurchaseItem) => void;
}

export function PurchaseDialogs({
  selectedItem,
  formData,
  setFormData,
  purchaseData,
  setPurchaseData,
  isDetailOpen,
  setIsDetailOpen,
  isCreateOpen,
  setIsCreateOpen,
  isEditOpen,
  setIsEditOpen,
  isPurchaseOpen,
  setIsPurchaseOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isManagement,
  suppliers,
  onSave,
  onMarkAsPurchased,
  onDelete,
  onEdit
}: PurchaseDialogsProps) {
  const getUserById = (id: string) => {
    return staffMembers.find(member => member.id === id);
  };

  return (
    <>
      {/* Item Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedItem.itemName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getCategoryColor(selectedItem.category)}>
                      {getCategoryDisplayName(selectedItem.category)}
                    </Badge>
                    <Badge variant={getStatusColor(selectedItem.status)}>
                      {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Purchase item details and history
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quantity:</span> {selectedItem.quantity} {selectedItem.unit}
                  </div>
                  <div>
                    <span className="font-medium">Supplier:</span> {selectedItem.preferredSupplier}
                  </div>
                  <div>
                    <span className="font-medium">Urgency:</span>{' '}
                    <Badge variant={getUrgencyColor(selectedItem.urgency)}>
                      {selectedItem.urgency}
                    </Badge>
                  </div>
                  {selectedItem.neededBy && (
                    <div>
                      <span className="font-medium">Needed by:</span> {selectedItem.neededBy}
                    </div>
                  )}
                </div>

                {selectedItem.status === 'purchased' && selectedItem.purchasedPrice && (
                  <div className="bg-success/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Purchase Completed</span>
                      <span className="text-success font-bold">
                        {formatCurrency(selectedItem.purchasedPrice)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Purchased on {selectedItem.purchasedDate} by{' '}
                      {getUserById(selectedItem.purchasedBy || '')?.name}
                    </div>
                  </div>
                )}

                {selectedItem.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedItem.notes}</p>
                  </div>
                )}

                <Separator />

                <div className="text-xs text-muted-foreground">
                  <div>Added by {getUserById(selectedItem.addedBy)?.name} on {formatDateTime(selectedItem.createdAt)}</div>
                </div>
              </div>

              <DialogFooter>
                {selectedItem.status !== 'purchased' && isManagement && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDetailOpen(false);
                      setIsPurchaseOpen(true);
                    }}
                  >
                    <DollarSign className="size-4 mr-2" />
                    Mark as Purchased
                  </Button>
                )}
                {isManagement && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDetailOpen(false);
                      onEdit(selectedItem);
                    }}
                  >
                    <Edit className="size-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Item Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Purchase Item' : 'Add New Purchase Item'}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? 'Update item details' : 'Add a new item to the purchase list'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  value={formData.itemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                  placeholder="e.g., White rice (for Nasi Lemak)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURCHASE_ITEM_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, unit: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_UNITS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency</Label>
                <Select value={formData.urgency} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, urgency: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map(urgency => (
                      <SelectItem key={urgency.value} value={urgency.value}>
                        {urgency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preferred Supplier *</Label>
                <Select value={formData.preferredSupplier} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, preferredSupplier: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.displayName || supplier.companyName}>
                        {supplier.displayName || supplier.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Needed By</Label>
                <Input
                  type="date"
                  value={formData.neededBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, neededBy: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this item..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setIsEditOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              <Save className="size-4 mr-2" />
              {isEditOpen ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Purchased Dialog */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Purchased</DialogTitle>
            <DialogDescription>
              Record the purchase details for this item
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium">{selectedItem.itemName}</h3>
                <div className="text-sm text-muted-foreground">
                  {selectedItem.quantity} {selectedItem.unit} from {selectedItem.preferredSupplier}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Price (RM) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={purchaseData.price}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Purchase Date *</Label>
                  <Input
                    type="date"
                    value={purchaseData.date}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Total Cost:</span>{' '}
                  <span className="text-lg font-bold text-success">
                    {formatCurrency(purchaseData.price || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onMarkAsPurchased}>
              <DollarSign className="size-4 mr-2" />
              Mark as Purchased
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Purchase Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{selectedItem?.itemName}" from the purchase list? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4 mr-2" />
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}