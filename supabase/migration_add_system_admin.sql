-- システム管理者テーブルの追加
-- このファイルをSupabaseのSQL Editorで実行してください
-- 
-- ⚠️ 重要: 
-- 1. このマイグレーションを実行する前に、supabase/schema.sql を実行してください
-- 2. または、supabase/migration_add_system_admin_complete.sql を使用してください
--    （こちらはstoresテーブルが存在しない場合でも動作します）

-- updated_atを自動更新する関数（存在しない場合のみ作成）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- システム管理者テーブル
CREATE TABLE IF NOT EXISTS system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- storesテーブルにroleフィールドを追加（既存のデータとの互換性のため）
-- storesテーブルが存在し、roleカラムがない場合のみ追加
DO $$ 
BEGIN
  -- storesテーブルが存在するかチェック
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'stores'
  ) THEN
    -- roleカラムが存在しない場合のみ追加
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'stores' AND column_name = 'role'
    ) THEN
      ALTER TABLE stores ADD COLUMN role VARCHAR(20) DEFAULT 'store_admin' CHECK (role IN ('store_admin', 'system_admin'));
      
      -- 既存のレコードにデフォルト値を設定
      UPDATE stores SET role = 'store_admin' WHERE role IS NULL;
    END IF;
  ELSE
    RAISE NOTICE 'storesテーブルが存在しません。先にsupabase/schema.sqlを実行してください。';
  END IF;
END $$;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_system_admins_username ON system_admins(username);

-- Row Level Security (RLS) ポリシー
ALTER TABLE system_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can read all system_admins" ON system_admins
  FOR SELECT USING (true);

CREATE POLICY "System admins can manage system_admins" ON system_admins
  FOR ALL USING (true);

-- storesテーブルのRLSポリシーを更新（システム管理者は全店舗を管理可能）
-- storesテーブルが存在する場合のみ実行
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'stores'
  ) THEN
    -- 既存のポリシーを削除（存在する場合）
    DROP POLICY IF EXISTS "Authenticated users can update their own store" ON stores;
    DROP POLICY IF EXISTS "Store admins can update their own store" ON stores;
    DROP POLICY IF EXISTS "System admins can manage all stores" ON stores;

    -- 新しいポリシーを作成
    CREATE POLICY "Store admins can update their own store" ON stores
      FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        (auth.jwt() ->> 'role' = 'store_admin' AND auth.jwt() ->> 'storeId' = store_id)
      );

    CREATE POLICY "System admins can manage all stores" ON stores
      FOR ALL USING (
        auth.role() = 'authenticated' AND 
        auth.jwt() ->> 'role' = 'system_admin'
      );
  END IF;
END $$;

-- updated_atを自動更新するトリガー
CREATE TRIGGER update_system_admins_updated_at BEFORE UPDATE ON system_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- デフォルトのシステム管理者を作成（パスワード: admin123）
-- 本番環境では必ずパスワードを変更してください
INSERT INTO system_admins (username, password_hash, name, email)
VALUES (
  'admin',
  '$2a$10$TfL2YgEWStCa.70GOP75Se2cAq24kzyP6vMBgycEnxgDs/D8cx8l.',
  'システム管理者',
  'admin@pic-cul.com'
)
ON CONFLICT (username) DO NOTHING;

-- 注意: 上記のパスワードハッシュは 'admin123' のbcryptハッシュです
-- 本番環境では必ず強力なパスワードに変更してください

