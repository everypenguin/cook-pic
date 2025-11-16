# Supabase + Vercel 移行完了ガイド

このプロジェクトはSupabaseバックエンドとVercelフロントエンドに移行されました。

## 📋 移行内容

### ✅ 完了した作業

1. **Supabaseクライアント設定**
   - `frontend/lib/supabase.ts` - Supabaseクライアント設定

2. **データベーススキーマ**
   - `supabase/schema.sql` - Supabase用データベーススキーマ

3. **Next.js API Routes**
   - 認証: `/api/auth/admin/login`, `/api/auth/user/access`
   - メニュー: `/api/menus/daily`, `/api/menus/[id]`, `/api/menus/[id]/pin`
   - 週間メニュー: `/api/weekly-menus`
   - 月間メニュー: `/api/monthly-menus`
   - ストア: `/api/stores/[storeId]`, `/api/stores/profile`
   - アップロード: `/api/upload/image/base64`
   - CSVインポート: `/api/csv-import/weekly`, `/api/csv-import/monthly`

4. **Supabase Storage統合**
   - 画像アップロード機能をSupabase Storageに移行

5. **Vercel設定**
   - `vercel.json` - Vercelデプロイ設定

6. **環境変数設定**
   - `frontend/.env.example` - 環境変数テンプレート

## 🚀 セットアップ手順

詳細な手順は `SUPABASE_MIGRATION.md` を参照してください。

### クイックスタート

1. **Supabaseプロジェクトの作成**
   ```bash
   # Supabaseダッシュボードでプロジェクトを作成
   # https://supabase.com/
   ```

2. **データベーススキーマの適用**
   - SupabaseダッシュボードのSQL Editorで `supabase/schema.sql` を実行

3. **Storageバケットの作成**
   - Storageで `images` バケットを作成（公開設定）

4. **環境変数の設定**
   ```bash
   cd frontend
   cp .env.example .env.local
   # .env.localを編集してSupabaseの認証情報を設定
   ```

5. **依存関係のインストール**
   ```bash
   cd frontend
   npm install
   ```

6. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 🌐 Vercelへのデプロイ

1. **GitHubリポジトリにプッシュ**
   ```bash
   git add .
   git commit -m "Supabase + Vercel移行"
   git push
   ```

2. **Vercelでプロジェクトを作成**
   - [Vercel](https://vercel.com/)にアクセス
   - GitHubリポジトリを接続
   - プロジェクト設定:
     - Root Directory: `frontend`
     - Framework: Next.js

3. **環境変数の設定**
   - Vercelダッシュボードで以下を設定:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

4. **デプロイ**
   - 「Deploy」をクリック

## 📁 プロジェクト構造

```
frontend/
├── app/
│   ├── api/              # Next.js API Routes
│   │   ├── auth/         # 認証API
│   │   ├── menus/        # メニューAPI
│   │   ├── stores/       # ストアAPI
│   │   ├── upload/       # アップロードAPI
│   │   └── csv-import/   # CSVインポートAPI
│   └── ...
├── lib/
│   ├── supabase.ts       # Supabaseクライアント
│   └── api.ts            # APIクライアント（更新済み）
└── ...

supabase/
└── schema.sql            # データベーススキーマ

vercel.json               # Vercel設定
```

## 🔧 主な変更点

### APIエンドポイント

**変更前:**
```
http://localhost:3001/api/menus/daily/:storeId
```

**変更後:**
```
/api/menus/daily/:storeId  (Next.js API Routes)
```

### 画像ストレージ

**変更前:**
- AWS S3 または ローカルストレージ

**変更後:**
- Supabase Storage (`images` バケット)

### データベース

**変更前:**
- PostgreSQL (独自サーバー) または SQLite

**変更後:**
- Supabase PostgreSQL

## 📝 注意事項

1. **認証トークン**
   - 現在は簡易的なBase64エンコードトークンを使用
   - 本番環境ではSupabase Authへの移行を推奨

2. **RLSポリシー**
   - SupabaseのRow Level Securityが有効
   - 必要に応じてポリシーを調整

3. **Storageポリシー**
   - 画像は公開バケットに保存
   - セキュリティ要件に応じてポリシーを調整

## 🐛 トラブルシューティング

詳細は `SUPABASE_MIGRATION.md` の「トラブルシューティング」セクションを参照してください。

## 📚 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

