import pool from '../config/database';
import { WeeklyMenu } from '../types';

export class WeeklyMenuModel {
  static async findByStoreIdAndWeek(
    storeId: string,
    weekStartDate: Date
  ): Promise<WeeklyMenu[]> {
    const result = await pool.query(
      `SELECT * FROM weekly_menus 
       WHERE store_id = $1 AND week_start_date = $2
       ORDER BY day_of_week ASC`,
      [storeId, weekStartDate]
    );
    return result.rows;
  }

  static async findByStoreId(storeId: string): Promise<WeeklyMenu[]> {
    const result = await pool.query(
      `SELECT * FROM weekly_menus 
       WHERE store_id = $1
       ORDER BY week_start_date DESC, day_of_week ASC`,
      [storeId]
    );
    return result.rows;
  }

  static async create(menu: Omit<WeeklyMenu, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyMenu> {
    const result = await pool.query(
      `INSERT INTO weekly_menus (store_id, day_of_week, menu_name, category, price, image_url, week_start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (store_id, day_of_week, week_start_date) 
       DO UPDATE SET menu_name = $3, category = $4, price = $5, image_url = $6, updated_at = NOW()
       RETURNING *`,
      [menu.store_id, menu.day_of_week, menu.menu_name, menu.category || null, menu.price || null, menu.image_url || null, menu.week_start_date]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<WeeklyMenu>): Promise<WeeklyMenu> {
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
    if (updates.day_of_week !== undefined) {
      fields.push(`day_of_week = $${paramCount++}`);
      values.push(updates.day_of_week);
    }
    if (updates.week_start_date !== undefined) {
      fields.push(`week_start_date = $${paramCount++}`);
      values.push(updates.week_start_date);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE weekly_menus SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM weekly_menus WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}

