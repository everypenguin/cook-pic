-- テスト用店舗の作成
-- このファイルをSupabaseのSQL Editorで実行してください

-- テスト店舗を作成（パスワード: test123）
INSERT INTO stores (store_id, name, password_hash, profile_image_url)
VALUES (
  'test-store-001',
  'テスト店舗',
  '$2a$10$Hcf.11uvFhRfUQsE8.fXfeCpozdgjvOX.HCoyzWPK9L2d/sZAU4Fe',
  NULL
)
ON CONFLICT (store_id) DO UPDATE
SET 
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash;

-- 確認メッセージ
DO $$
BEGIN
  RAISE NOTICE 'テスト店舗を作成しました:';
  RAISE NOTICE '  店舗ID: test-store-001';
  RAISE NOTICE '  パスワード: test123';
  RAISE NOTICE '';
  RAISE NOTICE 'ログイン情報:';
  RAISE NOTICE '  URL: /admin/login';
  RAISE NOTICE '  店舗ID: test-store-001';
  RAISE NOTICE '  パスワード: test123';
END $$;

-- 注意: 上記のパスワードハッシュは 'test123' のbcryptハッシュです
-- 実際のパスワードハッシュを生成するには、Node.jsで以下を実行:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('test123', 10).then(hash => console.log(hash));

