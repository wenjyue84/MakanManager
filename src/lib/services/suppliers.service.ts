import { query } from '../database';
import { Supplier } from '../types';

export class SuppliersService {
  async getAllSuppliers(): Promise<Supplier[]> {
    const result = await query(`
      SELECT
        id,
        name,
        contact_person as "contactPerson",
        phone,
        email,
        address,
        categories,
        payment_terms as "paymentTerms",
        delivery_days as "deliveryDays",
        notes,
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM suppliers
      ORDER BY created_at DESC
    `);

    return result.rows.map(this.mapRowToSupplier);
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    const result = await query(`
      SELECT
        id,
        name,
        contact_person as "contactPerson",
        phone,
        email,
        address,
        categories,
        payment_terms as "paymentTerms",
        delivery_days as "deliveryDays",
        notes,
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM suppliers
      WHERE id = $1
    `, [id]);

    return result.rows.length > 0 ? this.mapRowToSupplier(result.rows[0]) : null;
  }

  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const result = await query(`
      INSERT INTO suppliers (
        name, contact_person, phone, email, address,
        categories, payment_terms, delivery_days, notes, active
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING
        id,
        name,
        contact_person as "contactPerson",
        phone,
        email,
        address,
        categories,
        payment_terms as "paymentTerms",
        delivery_days as "deliveryDays",
        notes,
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [
      data.name,
      data.contactPerson || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.categories || [],
      data.paymentTerms || null,
      data.deliveryDays || [],
      data.notes || null,
      data.active
    ]);

    return this.mapRowToSupplier(result.rows[0]);
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let param = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${param++}`);
      values.push(data.name);
    }
    if (data.contactPerson !== undefined) {
      fields.push(`contact_person = $${param++}`);
      values.push(data.contactPerson);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${param++}`);
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${param++}`);
      values.push(data.email);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${param++}`);
      values.push(data.address);
    }
    if (data.categories !== undefined) {
      fields.push(`categories = $${param++}`);
      values.push(data.categories);
    }
    if (data.paymentTerms !== undefined) {
      fields.push(`payment_terms = $${param++}`);
      values.push(data.paymentTerms);
    }
    if (data.deliveryDays !== undefined) {
      fields.push(`delivery_days = $${param++}`);
      values.push(data.deliveryDays);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${param++}`);
      values.push(data.notes);
    }
    if (data.active !== undefined) {
      fields.push(`active = $${param++}`);
      values.push(data.active);
    }

    if (fields.length === 0) {
      return this.getSupplierById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(`
      UPDATE suppliers
      SET ${fields.join(', ')}
      WHERE id = $${param}
      RETURNING
        id,
        name,
        contact_person as "contactPerson",
        phone,
        email,
        address,
        categories,
        payment_terms as "paymentTerms",
        delivery_days as "deliveryDays",
        notes,
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, values);

    return result.rows.length > 0 ? this.mapRowToSupplier(result.rows[0]) : null;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await query('DELETE FROM suppliers WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async getSuppliersByCategory(category: string): Promise<Supplier[]> {
    if (category === 'all') {
      return this.getAllSuppliers();
    }

    const result = await query(`
      SELECT
        id,
        name,
        contact_person as "contactPerson",
        phone,
        email,
        address,
        categories,
        payment_terms as "paymentTerms",
        delivery_days as "deliveryDays",
        notes,
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM suppliers
      WHERE $1 = ANY(categories)
      ORDER BY created_at DESC
    `, [category]);

    return result.rows.map(this.mapRowToSupplier);
  }

  async getActiveSuppliers(): Promise<Supplier[]> {
    const result = await query(`
      SELECT
        id,
        name,
        contact_person as "contactPerson",
        phone,
        email,
        address,
        categories,
        payment_terms as "paymentTerms",
        delivery_days as "deliveryDays",
        notes,
        active,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM suppliers
      WHERE active = true
      ORDER BY created_at DESC
    `);

    return result.rows.map(this.mapRowToSupplier);
  }

  private mapRowToSupplier(row: any): Supplier {
    return {
      id: row.id,
      name: row.name,
      contactPerson: row.contactPerson || undefined,
      phone: row.phone || undefined,
      email: row.email || undefined,
      address: row.address || undefined,
      categories: row.categories || [],
      paymentTerms: row.paymentTerms || undefined,
      deliveryDays: row.deliveryDays || [],
      notes: row.notes || undefined,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}

export const suppliersService = new SuppliersService();
