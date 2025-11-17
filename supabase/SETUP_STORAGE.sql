-- Supabase Storageバケット「images」の設定
-- このファイルをSupabaseのSQL Editorで実行してください
-- 
-- 注意: Storageバケット自体はSupabaseダッシュボードから作成する必要があります
-- 1. Supabaseダッシュボード → Storage → New bucket
-- 2. バケット名: images
-- 3. Public bucket: 有効にする
-- 4. このSQLスクリプトを実行してRLSポリシーを設定

-- ============================================
-- Storageバケット「images」のRLSポリシー設定
-- ============================================

-- 注意: StorageバケットはSupabaseダッシュボードから作成してください
-- このSQLスクリプトはRLSポリシーのみを設定します

-- 全員が読み取り可能（公開バケット）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLSポリシー: 全員が読み取り可能
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Storage RLSポリシー: 認証済みユーザーがアップロード可能
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Storage RLSポリシー: 認証済みユーザーが更新可能
CREATE POLICY IF NOT EXISTS "Authenticated users can update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Storage RLSポリシー: 認証済みユーザーが削除可能
CREATE POLICY IF NOT EXISTS "Authenticated users can delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 確認メッセージ
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Storage RLSポリシーを設定しました！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  重要: Storageバケット「images」が存在するか確認してください';
  RAISE NOTICE '';
  RAISE NOTICE 'バケットが存在しない場合:';
  RAISE NOTICE '1. Supabaseダッシュボード → Storage';
  RAISE NOTICE '2. 「New bucket」をクリック';
  RAISE NOTICE '3. バケット名: images';
  RAISE NOTICE '4. 「Public bucket」を有効にする';
  RAISE NOTICE '5. 「Create bucket」をクリック';
  RAISE NOTICE '';
  RAISE NOTICE 'これで画像のアップロードが可能になります。';
END $$;

