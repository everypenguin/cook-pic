import dotenv from 'dotenv';

dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite'; // 'sqlite' or 'postgres'

let pool: any;

if (dbType === 'sqlite') {
  // SQLite（開発環境用）
  const Database = require('better-sqlite3');
  const dbPath = process.env.DATABASE_URL || './data/pic_cul.db';
  const db = new Database(dbPath);
  
  // 外部キー制約を有効化
  db.pragma('foreign_keys = ON');
  
  // PostgreSQL互換のインターフェースを提供
  pool = {
    query: async (text: string, params?: any[]) => {
      try {
        // PostgreSQL構文をSQLite構文に変換
        let sqliteText = text
          .replace(/NOW()/gi, "datetime('now')")
          .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')")
          .replace(/DATE\(([^)]+)\)/gi, "date($1)");
        
        // RETURNING句を処理
        const hasReturning = /RETURNING\s+\*/i.test(sqliteText);
        let returnId: string | null = null;
        
        if (hasReturning) {
          // RETURNING句を削除し、最後にINSERTされたIDを取得する準備
          sqliteText = sqliteText.replace(/\s+RETURNING\s+\*/i, '');
          
          // INSERT文の場合、lastInsertRowidを取得
          if (/INSERT\s+INTO/i.test(sqliteText)) {
            const tableMatch = sqliteText.match(/INSERT\s+INTO\s+(\w+)/i);
            if (tableMatch) {
              returnId = tableMatch[1];
            }
          }
        }
        
        // ON CONFLICT句をSQLite形式に変換
        sqliteText = sqliteText.replace(/ON CONFLICT \(([^)]+)\) DO NOTHING/gi, 
          (match, columns) => {
            const columnList = columns.split(',').map((c: string) => c.trim()).join(', ');
            return `ON CONFLICT(${columnList}) DO NOTHING`;
          });
        
        // パラメータ化クエリをSQLite形式に変換（$1, $2... → ?, ?...）
        if (params && params.length > 0) {
          let paramIndex = 1;
          sqliteText = sqliteText.replace(/\$(\d+)/g, () => {
            paramIndex++;
            return '?';
          });
        }
        
        const stmt = db.prepare(sqliteText);
        
        if (text.trim().toUpperCase().startsWith('SELECT') || text.trim().toUpperCase().startsWith('WITH')) {
          // SELECT文の場合
          const result = params && params.length > 0 ? stmt.all(...params) : stmt.all();
          return { rows: result, rowCount: result.length };
        } else if (hasReturning && returnId) {
          // INSERT文でRETURNING句がある場合
          const runResult = params && params.length > 0 ? stmt.run(...params) : stmt.run();
          const lastId = runResult.lastInsertRowid;
          
          // 挿入された行を取得（rowidを使用）
          const selectStmt = db.prepare(`SELECT * FROM ${returnId} WHERE rowid = ?`);
          const insertedRow = selectStmt.get(lastId);
          
          return { rows: insertedRow ? [insertedRow] : [], rowCount: insertedRow ? 1 : 0 };
        } else if (hasReturning) {
          // UPDATE/DELETE文でRETURNING句がある場合
          const runResult = params && params.length > 0 ? stmt.run(...params) : stmt.run();
          // SQLiteではUPDATE/DELETEのRETURNINGはサポートされていないため、空の結果を返す
          return { rows: [], rowCount: runResult.changes || 0 };
        } else {
          // INSERT, UPDATE, DELETE文の場合
          const result = params && params.length > 0 ? stmt.run(...params) : stmt.run();
          return { rows: [], rowCount: result.changes || 0 };
        }
      } catch (error) {
        console.error('SQLite query error:', error);
        console.error('Query:', text);
        throw error;
      }
    },
    end: async () => {
      db.close();
    },
  };
} else {
  // PostgreSQL（本番環境用）
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

export default pool;
