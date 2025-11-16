import pool from '../config/database';
import { Store } from '../types';

export class StoreModel {
  static async findByStoreId(storeId: string): Promise<Store | null> {
    const result = await pool.query(
      'SELECT * FROM stores WHERE store_id = $1',
      [storeId]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Store | null> {
    const result = await pool.query(
      'SELECT * FROM stores WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(storeId: string, name: string, passwordHash: string): Promise<Store> {
    const result = await pool.query(
      `INSERT INTO stores (store_id, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [storeId, name, passwordHash]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Store>): Promise<Store> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.profile_image_url !== undefined) {
      fields.push(`profile_image_url = $${paramCount++}`);
      values.push(updates.profile_image_url);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE stores SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }
}











