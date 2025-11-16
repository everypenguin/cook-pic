import pool from '../config/database';
import { User } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user.email, user.password_hash, user.name || null]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<User>): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.password_hash !== undefined) {
      fields.push(`password_hash = $${paramCount++}`);
      values.push(updates.password_hash);
    }
    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }
}






