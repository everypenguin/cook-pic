-- システム管理者の存在確認と作成
-- このファイルをSupabaseのSQL Editorで実行してください

-- 1. system_adminsテーブルが存在するか確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'system_admins'
) AS table_exists;

-- 2. システム管理者が存在するか確認
SELECT COUNT(*) AS admin_count FROM system_admins;

-- 3. システム管理者一覧を表示
SELECT id, username, name, email, created_at FROM system_admins;

-- 4. システム管理者が存在しない場合、作成する
INSERT INTO system_admins (username, password_hash, name, email)
SELECT 
  'admin',
  '$2a$10$TfL2YgEWStCa.70GOP75Se2cAq24kzyP6vMBgycEnxgDs/D8cx8l.',
  'システム管理者',
  'admin@pic-cul.com'
WHERE NOT EXISTS (
  SELECT 1 FROM system_admins WHERE username = 'admin'
);

-- 5. 確認メッセージ
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM system_admins WHERE username = 'admin') INTO admin_exists;
  IF admin_exists THEN
    RAISE NOTICE 'システム管理者アカウントが存在します:';
    RAISE NOTICE '  ユーザー名: admin';
    RAISE NOTICE '  パスワード: admin123';
  ELSE
    RAISE NOTICE 'システム管理者アカウントを作成しました:';
    RAISE NOTICE '  ユーザー名: admin';
    RAISE NOTICE '  パスワード: admin123';
  END IF;
END $$;

