-- システム管理者機能の完全なマイグレーション
-- このファイルは、supabase/schema.sqlを実行していない場合でも動作します
-- SupabaseのSQL Editorで実行してください

-- ============================================
-- 1. 基本テーブルの作成（存在しない場合のみ）
-- ============================================

-- updated_atを自動更新する関数（存在しない場合のみ作成）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 店舗テーブル（存在しない場合のみ作成）
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- storesテーブルにroleフィールドを追加（存在しない場合のみ）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'role'
  ) THEN
    ALTER TABLE stores ADD COLUMN role VARCHAR(20) DEFAULT 'store_admin' CHECK (role IN ('store_admin', 'system_admin'));
    
    -- 既存のレコードにデフォルト値を設定
    UPDATE stores SET role = 'store_admin' WHERE role IS NULL;
  END IF;
END $$;

-- ============================================
-- 2. システム管理者テーブルの作成
-- ============================================

CREATE TABLE IF NOT EXISTS system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. インデックスの作成
-- ============================================

CREATE INDEX IF NOT EXISTS idx_system_admins_username ON system_admins(username);

-- ============================================
-- 4. Row Level Security (RLS) ポリシー
-- ============================================

-- system_adminsテーブルのRLS
ALTER TABLE system_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System admins can read all system_admins" ON system_admins;
CREATE POLICY "System admins can read all system_admins" ON system_admins
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System admins can manage system_admins" ON system_admins;
CREATE POLICY "System admins can manage system_admins" ON system_admins
  FOR ALL USING (true);

-- storesテーブルのRLS（存在する場合のみ）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'stores'
  ) THEN
    ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
    
    -- 既存のポリシーを削除
    DROP POLICY IF EXISTS "Anyone can read stores" ON stores;
    DROP POLICY IF EXISTS "Authenticated users can update their own store" ON stores;
    DROP POLICY IF EXISTS "Store admins can update their own store" ON stores;
    DROP POLICY IF EXISTS "System admins can manage all stores" ON stores;

    -- 新しいポリシーを作成
    CREATE POLICY "Anyone can read stores" ON stores
      FOR SELECT USING (true);

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

-- ============================================
-- 5. トリガーの設定
-- ============================================

-- system_adminsテーブルのトリガー
DROP TRIGGER IF EXISTS update_system_admins_updated_at ON system_admins;
CREATE TRIGGER update_system_admins_updated_at BEFORE UPDATE ON system_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- storesテーブルのトリガー（存在する場合のみ）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'stores'
  ) THEN
    DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
    CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- 6. デフォルトのシステム管理者を作成
-- ============================================

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

-- ============================================
-- 完了メッセージ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'システム管理者機能のマイグレーションが完了しました。';
  RAISE NOTICE 'デフォルトのシステム管理者アカウント:';
  RAISE NOTICE '  ユーザー名: admin';
  RAISE NOTICE '  パスワード: admin123';
  RAISE NOTICE '⚠️ 本番環境では必ずパスワードを変更してください。';
END $$;

