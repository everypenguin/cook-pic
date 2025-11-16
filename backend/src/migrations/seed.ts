import pool from '../config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    // サンプル店舗を作成
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const result = await pool.query(
      `INSERT INTO stores (store_id, name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (store_id) DO NOTHING
       RETURNING *`,
      ['sample-store-001', 'サンプル店舗', passwordHash]
    );

    if (result.rows.length > 0) {
      console.log('Sample store created:', result.rows[0].store_id);
      console.log('Login credentials:');
      console.log('  Store ID: sample-store-001');
      console.log('  Password: password123');
    } else {
      console.log('Sample store already exists');
    }

    console.log('Database seeding completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await pool.end();
    process.exit(1);
  }
}

seed();

