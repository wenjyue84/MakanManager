"use client";

import React from 'react';
import { Eye, Edit, Trash2, CheckCircle, MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { 
  formatCurrency, 
  getUrgencyColor, 
  getStatusColor, 
  getCategoryColor, 
  getCategoryDisplayName,
  type PurchaseItem 
} from '../../../lib/operations-data';

interface PurchaseTableRowProps {
  item: PurchaseItem;
  isManagement: boolean;
  purchasingPerm: boolean;
  onView: (item: PurchaseItem) => void;
  onEdit: (item: PurchaseItem) => void;
  onDelete: (item: PurchaseItem) => void;
  onMarkAsPurchased: (item: PurchaseItem) => void;
  onReview: (item: PurchaseItem) => void;
  onOrder: (item: PurchaseItem) => void;
  onOpenDetail: () => void;
}

export function PurchaseTableRow({ 
  item, 
  isManagement,
  purchasingPerm,
  onView,
  onEdit,
  onDelete,
  onMarkAsPurchased,
  onReview,
  onOrder,
  onOpenDetail
}: PurchaseTableRowProps) {
  const handleRowClick = () => {
    onView(item);
    onOpenDetail();
  };

  return (
    <TableRow className="cursor-pointer hover:bg-accent/50" onClick={handleRowClick}>
      <TableCell>
        <div>
          <div className="font-medium">{item.itemName}</div>
          <div className="text-sm text-muted-foreground">{item.notes}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getCategoryColor(item.category)}>
          {getCategoryDisplayName(item.category)}
        </Badge>
      </TableCell>
      <TableCell>
        <div>
          <span className="font-medium">{item.quantity}</span>
          <span className="text-muted-foreground ml-1">{item.unit}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{item.preferredSupplier}</div>
      </TableCell>
      <TableCell>
        <Badge variant={getUrgencyColor(item.urgency)}>
          {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusColor(item.status)}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        {item.status === 'purchased' && item.purchasedPrice ? (
          <div>
            <div className="font-medium text-success">
              {formatCurrency(item.purchasedPrice)}
            </div>
            <div className="text-xs text-muted-foreground">
              {item.purchasedDate}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline">
            <Eye className="size-3 mr-1" />
            View
          </Button>
          {purchasingPerm && item.status === 'new' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onReview(item);
              }}
            >
              Review
            </Button>
          )}
          {purchasingPerm && item.status === 'reviewed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onOrder(item);
              }}
            >
              Order
            </Button>
          )}
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
              Purchase
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
                  Edit Item
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                  className="text-destructive"
                >
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}