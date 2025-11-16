# Vercelデプロイチェックリスト

## ✅ 完了した作業

### 1. コード修正
- [x] TypeScriptエラーの修正
- [x] CSVインポートのバグ修正
- [x] 動的ルートの競合解決（`[id]`と`[storeId]`）
- [x] APIルートに`force-dynamic`設定を追加
- [x] ESLint設定ファイルの追加
- [x] Viewport設定の修正

### 2. セキュリティ
- [x] 認証チェックの実装確認
- [x] 入力値の検証確認
- [x] エラーハンドリングの確認

### 3. 設定ファイル
- [x] `vercel.json`の最適化
- [x] `next.config.js`の確認
- [x] `tsconfig.json`の確認

## 📋 デプロイ前の確認事項

### 環境変数の設定（Vercelダッシュボード）

以下の環境変数をVercelのプロジェクト設定で設定してください：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_API_URL=/api
```

### Vercelプロジェクト設定

1. **Root Directory**: `frontend` に設定
2. **Framework**: Next.js（自動検出）
3. **Build Command**: `npm run build`（自動検出）
4. **Output Directory**: `.next`（自動検出）
5. **Install Command**: `npm install`（自動検出）

## 🚀 デプロイ手順

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Vercelデプロイ準備完了"
   git push origin main
   ```

2. **Vercelでプロジェクトを作成**
   - [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
   - 「Add New...」→「Project」をクリック
   - GitHubリポジトリを選択
   - Root Directoryを`frontend`に設定
   - 環境変数を設定

3. **デプロイ実行**
   - 「Deploy」をクリック
   - ビルドが完了するまで待機

## 🔍 デプロイ後の確認

- [ ] トップページが表示される
- [ ] `/admin/login`でログインできる
- [ ] メニューの作成・編集ができる
- [ ] 画像のアップロードが動作する
- [ ] `/feed/[storeId]`でメニューが表示される
- [ ] 週間・月間メニューが表示される

## 📝 注意事項

1. **環境変数**: 本番環境では必ず正しいSupabaseの認証情報を設定してください
2. **ビルド時間**: 初回ビルドは2-5分かかる場合があります
3. **エラー確認**: ビルドエラーが発生した場合は、Vercelのログを確認してください

## 🆘 トラブルシューティング

### ビルドエラーが発生する場合
- Vercelのビルドログを確認
- 環境変数が正しく設定されているか確認
- ローカルで`npm run build`が成功するか確認

### 画像が表示されない場合
- Supabase Storageのバケットが公開設定になっているか確認
- `NEXT_PUBLIC_SUPABASE_URL`が正しく設定されているか確認

### APIエラーが発生する場合
- Vercelの関数ログを確認
- Supabaseの接続設定を確認

