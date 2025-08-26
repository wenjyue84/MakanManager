# Supplier CRUD Operations - README

## Overview
This document outlines the database-backed CRUD (Create, Read, Update, Delete) operations for suppliers in the Makan Manager application.

## Data Model
Suppliers are stored in the `suppliers` table with the following fields:
- `id` (UUID, primary key)
- `name` (string, required)
- `contact_person` (string)
- `phone` (string)
- `email` (string)
- `address` (text)
- `categories` (text[])
- `payment_terms` (string)
- `delivery_days` (text[])
- `notes` (text)
- `active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Service Layer
The `SuppliersService` in `src/lib/services/suppliers.service.ts` provides the following methods:
- `getAllSuppliers()` – List all suppliers
- `getSupplierById(id)` – Retrieve a single supplier
- `createSupplier(data)` – Create a new supplier
- `updateSupplier(id, data)` – Update an existing supplier
- `deleteSupplier(id)` – Remove a supplier
- `getSuppliersByCategory(category)` – Filter suppliers by category
- `getActiveSuppliers()` – List only active suppliers

Each method uses parameterized queries and returns typed results via the `Supplier` interface.

## Usage
```ts
import { suppliersService } from './lib/services/suppliers.service';

const suppliers = await suppliersService.getAllSuppliers();
```

This service forms the foundation for future API endpoints and UI integration for managing suppliers.
