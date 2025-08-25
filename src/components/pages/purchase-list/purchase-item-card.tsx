"use client";

import React from 'react';
import { Calendar, Package, User, MoreHorizontal, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { staffMembers } from '../../../lib/staff-data';
import { 
  formatCurrency, 
  formatDateTime, 
  getUrgencyColor, 
  getStatusColor, 
  getCategoryColor, 
  getCategoryDisplayName,
  type PurchaseItem 
} from '../../../lib/operations-data';

interface PurchaseItemCardProps {
  item: PurchaseItem;
  isManagement: boolean;
  onView: (item: PurchaseItem) => void;
  onEdit: (item: PurchaseItem) => void;
  onDelete: (item: PurchaseItem) => void;
  onMarkAsPurchased: (item: PurchaseItem) => void;
  onOpenDetail: () => void;
}

export function PurchaseItemCard({ 
  item, 
  isManagement, 
  onView, 
  onEdit, 
  onDelete, 
  onMarkAsPurchased, 
  onOpenDetail 
}: PurchaseItemCardProps) {
  const addedBy = staffMembers.find(member => member.id === item.addedBy);
  
  const handleCardClick = () => {
    onView(item);
    onOpenDetail();
  };

  return (
    <Card className="cursor-pointer hover:bg-accent/50" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{item.itemName}</h4>
              <div className="text-sm text-muted-foreground">
                {item.quantity} {item.unit} from {item.preferredSupplier}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getCategoryColor(item.category)} className="text-xs">
                  {getCategoryDisplayName(item.category)}
                </Badge>
                <Badge variant={getUrgencyColor(item.urgency)} className="text-xs">
                  {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                </Badge>
                <Badge variant={getStatusColor(item.status)} className="text-xs">
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              {item.status === 'purchased' && item.purchasedPrice ? (
                <div className="text-sm">
                  <div className="font-medium text-success">
                    {formatCurrency(item.purchasedPrice)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.purchasedDate}
                  </div>
                </div>
              ) : item.neededBy ? (
                <div className="text-xs text-muted-foreground">
                  <Calendar className="size-3 inline mr-1" />
                  {item.neededBy}
                </div>
              ) : null}
            </div>
          </div>

          {item.notes && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {item.notes}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3" />
              <span>Added by {addedBy?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              {item.status !== 'purchased' && isManagement && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsPurchased(item);
                  }}
                >
                  <CheckCircle className="size-3 mr-1" />
                  Mark Purchased
                </Button>
              )}
              {isManagement && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}>
                      <Edit className="size-3 mr-2" />
                      Edit Item
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="size-3 mr-2" />
                      Delete Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}