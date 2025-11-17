# 環境変数の設定ミス修正ガイド

## ⚠️ 重要な注意事項

`NEXT_PUBLIC_API_URL`は**必ず `/api` に設定**してください。

SupabaseのURL（`https://xxx.supabase.co`）を設定してはいけません。

## 🔧 Vercelでの環境変数設定

### 正しい設定

Vercelダッシュボードの「Settings」→「Environment Variables」で以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://tlbfhkskeyclobnkpxxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_API_URL=/api
```

### 間違った設定（削除または修正が必要）

```
NEXT_PUBLIC_API_URL=https://tlbfhkskeyclobnkpxxn.supabase.co  ❌ 間違い
NEXT_PUBLIC_API_URL=http://localhost:3001  ❌ 本番環境では間違い
```

## 🛠️ 修正方法

### 1. Vercelで環境変数を修正

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」を開く
4. `NEXT_PUBLIC_API_URL`を確認
5. 値が`/api`でない場合、以下に変更：
   - 値: `/api`
   - 環境: Production, Preview, Development すべてに適用
6. 「Save」をクリック
7. 新しいデプロイを実行

### 2. コード側の修正

コード側でも、SupabaseのURLが設定されている場合は自動的に`/api`に変更するように修正しました。

## 📝 環境変数の説明

| 環境変数 | 値 | 説明 |
|---------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | SupabaseのAnon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | SupabaseのService Role Key |
| `NEXT_PUBLIC_API_URL` | `/api` | Next.js API RoutesのベースURL（**必ず `/api`**） |

## 🔍 確認方法

ブラウザの開発者ツール（F12）で確認：

1. 「Network」タブを開く
2. ログインを試みる
3. リクエストURLを確認：
   - ✅ 正しい: `https://your-domain.vercel.app/api/auth/admin/login`
   - ❌ 間違い: `https://xxx.supabase.co/auth/admin/login`

## 🚀 修正後の手順

1. Vercelで環境変数を修正
2. 新しいデプロイを実行
3. ブラウザのキャッシュをクリア
4. 再度ログインを試みる

