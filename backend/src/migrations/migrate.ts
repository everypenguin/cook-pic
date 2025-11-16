import pool from '../config/database';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    const dbType = process.env.DB_TYPE || 'sqlite';
    let schemaPath: string;
    
    if (dbType === 'sqlite') {
      schemaPath = path.resolve(__dirname, 'schema.sqlite.sql');
    } else {
      schemaPath = path.resolve(__dirname, 'schema.sql');
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // SQLiteの場合は複数のステートメントを分割して実行
    if (dbType === 'sqlite') {
      const statements = schema.split(';').filter(s => s.trim().length > 0);
      for (const statement of statements) {
        if (statement.trim()) {
          await pool.query(statement);
        }
      }
    } else {
      await pool.query(schema);
    }
    
    console.log(`Database migration completed successfully (${dbType})`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();
