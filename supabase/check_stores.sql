-- 店舗の存在確認
-- このファイルをSupabaseのSQL Editorで実行してください

-- 1. storesテーブルが存在するか確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'stores'
) AS table_exists;

-- 2. 店舗数を確認
SELECT COUNT(*) AS store_count FROM stores;

-- 3. 店舗一覧を表示（パスワードハッシュは非表示）
SELECT 
  id, 
  store_id, 
  name, 
  profile_image_url, 
  role,
  created_at, 
  updated_at 
FROM stores 
ORDER BY created_at DESC;

-- 4. 店舗が存在しない場合のメッセージ
DO $$
DECLARE
  store_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO store_count FROM stores;
  IF store_count = 0 THEN
    RAISE NOTICE '店舗が登録されていません。';
    RAISE NOTICE 'システム管理者でログインして、店舗を作成してください。';
  ELSE
    RAISE NOTICE '登録されている店舗数: %', store_count;
  END IF;
END $$;

