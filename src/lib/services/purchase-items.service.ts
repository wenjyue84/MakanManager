import { query } from '../database';
import { currentUser } from '../data';
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

export class PurchaseItemsService {
  private static mapRow(row: any): PurchaseItem {
    return {
      id: row.id,
      itemName: row.item_name,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      preferredSupplier: row.preferred_supplier,
      neededBy: row.needed_by || undefined,
      urgency: row.urgency,
      notes: row.notes || undefined,
      addedBy: row.added_by,
      status: row.status,
      reviewedBy: row.reviewed_by || undefined,
      orderedAt: row.ordered_at || undefined,
      receivedAt: row.received_at || undefined,
      purchasedPrice: row.purchased_price || undefined,
      purchasedDate: row.purchased_date || undefined,
      purchasedBy: row.purchased_by || undefined,
      createdAt: row.created_at
    } as PurchaseItem;
  }

  static async getAllItems(): Promise<PurchaseItem[]> {
    const result = await query(
      `SELECT * FROM purchase_items ORDER BY created_at DESC`
    );
    return result.rows.map(this.mapRow);
  }

  static async createItem(data: CreatePurchaseItemData): Promise<PurchaseItem> {
    const result = await query(
      `INSERT INTO purchase_items (
        item_name, category, quantity, unit, preferred_supplier, needed_by,
        urgency, notes, added_by, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'new')
      RETURNING *`,
      [
        data.itemName,
        data.category,
        data.quantity,
        data.unit,
        data.preferredSupplier,
        data.neededBy || null,
        data.urgency,
        data.notes || null,
        currentUser.id
      ]
    );
    return this.mapRow(result.rows[0]);
  }

  static async updateItem(id: string, data: UpdatePurchaseItemData): Promise<PurchaseItem | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const addField = (cond: boolean, sql: string, value: any) => {
      if (cond) {
        fields.push(`${sql} = $${idx++}`);
        values.push(value);
      }
    };

    addField(data.itemName !== undefined, 'item_name', data.itemName);
    addField(data.category !== undefined, 'category', data.category);
    addField(data.quantity !== undefined, 'quantity', data.quantity);
    addField(data.unit !== undefined, 'unit', data.unit);
    addField(data.preferredSupplier !== undefined, 'preferred_supplier', data.preferredSupplier);
    addField(data.neededBy !== undefined, 'needed_by', data.neededBy);
    addField(data.urgency !== undefined, 'urgency', data.urgency);
    addField(data.notes !== undefined, 'notes', data.notes);
    addField(data.status !== undefined, 'status', data.status);
    addField(data.reviewedBy !== undefined, 'reviewed_by', data.reviewedBy);
    addField(data.orderedAt !== undefined, 'ordered_at', data.orderedAt);
    addField(data.receivedAt !== undefined, 'received_at', data.receivedAt);
    addField(data.purchasedPrice !== undefined, 'purchased_price', data.purchasedPrice);
    addField(data.purchasedDate !== undefined, 'purchased_date', data.purchasedDate);
    addField(data.purchasedBy !== undefined, 'purchased_by', data.purchasedBy);

    if (fields.length === 0) {
      return this.getItemById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE purchase_items SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows.length ? this.mapRow(result.rows[0]) : null;
  }

  static async deleteItem(id: string): Promise<boolean> {
    const result = await query('DELETE FROM purchase_items WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async getItemById(id: string): Promise<PurchaseItem | null> {
    const result = await query('SELECT * FROM purchase_items WHERE id = $1', [id]);
    return result.rows.length ? this.mapRow(result.rows[0]) : null;
  }

  static async updateStatus(
    id: string,
    status: PurchaseItem['status'],
    options: { price?: number; date?: string; staffId?: string } = {}
  ): Promise<PurchaseItem | null> {
    const data: UpdatePurchaseItemData = { status };
    if (status === 'reviewed') {
      data.reviewedBy = options.staffId || currentUser.id;
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
      data.purchasedBy = options.staffId || currentUser.id;
    }
    return this.updateItem(id, data);
  }
}

export default PurchaseItemsService;
