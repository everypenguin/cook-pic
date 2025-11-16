import pool from '../config/database';
import { Menu } from '../types';

export class MenuModel {
  static async findByStoreIdAndDate(
    storeId: string,
    date: Date,
    menuType: 'daily' | 'weekly' | 'monthly'
  ): Promise<Menu[]> {
    const result = await pool.query(
      `SELECT * FROM menus 
       WHERE store_id = $1 AND menu_type = $2 AND DATE(date) = DATE($3)
       ORDER BY is_pinned DESC, created_at DESC`,
      [storeId, menuType, date]
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Menu | null> {
    const result = await pool.query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(menu: Omit<Menu, 'id' | 'created_at' | 'updated_at'>): Promise<Menu> {
    try {
      console.log('MenuModel.create - Input:', {
        store_id: menu.store_id,
        name: menu.name,
        category: menu.category,
        price: menu.price,
        image_url_length: menu.image_url?.length,
        menu_type: menu.menu_type,
        date: menu.date,
      });

      const result = await pool.query(
        `INSERT INTO menus (store_id, name, category, price, image_url, menu_type, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [menu.store_id, menu.name, menu.category || null, menu.price, menu.image_url, menu.menu_type, menu.date]
      );

      console.log('MenuModel.create - Result:', result.rows[0] ? 'Success' : 'No rows returned');
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error('メニューの作成に失敗しました: データベースから結果が返されませんでした');
      }

      return result.rows[0];
    } catch (error: any) {
      console.error('MenuModel.create - Error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Menu>): Promise<Menu> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
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
    if (updates.date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(updates.date);
    }
    if (updates.is_pinned !== undefined) {
      fields.push(`is_pinned = $${paramCount++}`);
      values.push(updates.is_pinned);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE menus SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM menus WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}






