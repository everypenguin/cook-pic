-- ユーザーテーブルの追加

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーアクセスログテーブルにユーザーIDを追加（既存テーブルの場合）
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_accesses' AND column_name='user_id') THEN
    ALTER TABLE user_accesses ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_accesses_user ON user_accesses(user_id, accessed_at);






