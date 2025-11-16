# Supabase移行ガイド

このプロジェクトをSupabaseバックエンドとVercelフロントエンドに移行する手順です。

## 1. Supabaseプロジェクトのセットアップ

### 1.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPIキーをメモ

### 1.2 データベーススキーマの適用

1. Supabaseダッシュボードの「SQL Editor」を開く
2. `supabase/schema.sql`の内容をコピー＆ペースト
3. 「Run」をクリックしてスキーマを適用

### 1.3 Storageバケットの作成

1. Supabaseダッシュボードの「Storage」を開く
2. 「Create a new bucket」をクリック
3. バケット名: `images`
4. Public bucket: 有効にする
5. 「Create bucket」をクリック

### 1.4 Storageポリシーの設定

Storageの「Policies」タブで以下のポリシーを追加：

**アップロードポリシー（認証済みユーザーのみ）:**
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

**読み取りポリシー（全員）:**
```sql
CREATE POLICY "Anyone can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

## 2. 環境変数の設定

### 2.1 ローカル開発環境

`frontend/.env.local`ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_API_URL=/api
```

### 2.2 Vercel環境変数の設定

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」を開く
3. 以下の環境変数を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key

## 3. 依存関係のインストール

```bash
cd frontend
npm install
```

必要なパッケージは既に`package.json`に含まれています：
- `@supabase/supabase-js`: Supabaseクライアント
- `bcryptjs`: パスワードハッシュ化（認証用）

## 4. 開発サーバーの起動

```bash
cd frontend
npm run dev
```

## 5. Vercelへのデプロイ

### 5.1 Vercelプロジェクトの作成

1. [Vercel](https://vercel.com/)にアクセスしてアカウントを作成
2. GitHubリポジトリを接続
3. プロジェクト設定：
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 5.2 環境変数の設定

Vercelダッシュボードで環境変数を設定（上記2.2参照）

### 5.3 デプロイ

1. 「Deploy」をクリック
2. デプロイが完了したら、URLが表示されます

## 6. 既存データの移行（オプション）

既存のPostgreSQLデータベースからSupabaseにデータを移行する場合：

1. PostgreSQLからデータをエクスポート
2. SupabaseのSQL Editorでインポート

または、Supabaseの「Database」→「Table Editor」で手動でデータを入力

## 7. 動作確認

### 7.1 認証の確認

- `/admin/login`でログインできることを確認

### 7.2 メニュー機能の確認

- メニューの作成、編集、削除ができることを確認
- 画像のアップロードがSupabase Storageに保存されることを確認

### 7.3 公開ページの確認

- `/feed/[storeId]`でメニューが表示されることを確認

## 8. トラブルシューティング

### 画像が表示されない

- Supabase Storageのバケットが公開設定になっているか確認
- Storageポリシーが正しく設定されているか確認

### 認証エラー

- 環境変数が正しく設定されているか確認
- SupabaseのRLSポリシーが正しく設定されているか確認

### APIエラー

- Next.js API Routesが正しく動作しているか確認
- Vercelのログを確認

## 9. 次のステップ

- Supabase Authを使用した認証システムへの移行（推奨）
- Edge Functionsを使用したサーバーレス関数の追加
- リアルタイム機能の追加（Supabase Realtime）

