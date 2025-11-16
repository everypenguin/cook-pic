import pool from '../config/database';
import { MonthlyMenu } from '../types';

export class MonthlyMenuModel {
  static async findByStoreIdAndMonth(
    storeId: string,
    year: number,
    month: number
  ): Promise<MonthlyMenu[]> {
    const result = await pool.query(
      `SELECT * FROM monthly_menus 
       WHERE store_id = $1 AND year = $2 AND month = $3
       ORDER BY menu_name ASC`,
      [storeId, year, month]
    );
    return result.rows;
  }

  static async findByStoreId(storeId: string): Promise<MonthlyMenu[]> {
    const result = await pool.query(
      `SELECT * FROM monthly_menus 
       WHERE store_id = $1
       ORDER BY year DESC, month DESC, menu_name ASC`,
      [storeId]
    );
    return result.rows;
  }

  static async create(menu: Omit<MonthlyMenu, 'id' | 'created_at' | 'updated_at'>): Promise<MonthlyMenu> {
    const result = await pool.query(
      `INSERT INTO monthly_menus (store_id, menu_name, category, price, image_url, month, year)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (store_id, month, year, menu_name) 
       DO UPDATE SET category = $3, price = $4, image_url = $5, updated_at = NOW()
       RETURNING *`,
      [menu.store_id, menu.menu_name, menu.category || null, menu.price || null, menu.image_url || null, menu.month, menu.year]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<MonthlyMenu>): Promise<MonthlyMenu> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.menu_name !== undefined) {
      fields.push(`menu_name = $${paramCount++}`);
      values.push(updates.menu_name);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(updates.price);
    }
    if (updates.image_url !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(updates.image_url);
    }
    if (updates.month !== undefined) {
      fields.push(`month = $${paramCount++}`);
      values.push(updates.month);
    }
    if (updates.year !== undefined) {
      fields.push(`year = $${paramCount++}`);
      values.push(updates.year);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE monthly_menus SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM monthly_menus WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}

