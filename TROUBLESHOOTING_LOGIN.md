# ログインできない場合のトラブルシューティング

## 🔍 問題の特定

### 1. どのログインができないか確認

- **システム管理者ログイン** (`/system-admin/login`)
- **店舗管理者ログイン** (`/admin/login`)
- **利用者アクセス** (`/user/access`)

## 🛠️ システム管理者ログインができない場合

### チェック1: データベースにシステム管理者が存在するか

SupabaseのSQL Editorで以下を実行：

```sql
-- supabase/check_system_admin.sql を実行
```

または、直接確認：

```sql
SELECT * FROM system_admins WHERE username = 'admin';
```

**結果が空の場合**: システム管理者が作成されていません
- `supabase/migration_add_system_admin.sql` または `migration_add_system_admin_complete.sql` を実行してください

### チェック2: パスワードが正しいか

デフォルトの認証情報：
- **ユーザー名**: `admin`
- **パスワード**: `admin123`

### チェック3: 環境変数が設定されているか

Vercelの環境変数を確認：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### チェック4: ブラウザのコンソールエラーを確認

1. ブラウザの開発者ツールを開く（F12）
2. 「Console」タブを確認
3. エラーメッセージを確認

### 解決方法

1. **システム管理者を再作成**:

```sql
-- Supabase SQL Editorで実行
DELETE FROM system_admins WHERE username = 'admin';

INSERT INTO system_admins (username, password_hash, name, email)
VALUES (
  'admin',
  '$2a$10$TfL2YgEWStCa.70GOP75Se2cAq24kzyP6vMBgycEnxgDs/D8cx8l.',
  'システム管理者',
  'admin@pic-cul.com'
);
```

2. **パスワードをリセット**:

新しいパスワードのbcryptハッシュを生成（Node.jsで実行）：

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('新しいパスワード', 10).then(hash => console.log(hash));
```

生成したハッシュで更新：

```sql
UPDATE system_admins 
SET password_hash = '生成したハッシュ'
WHERE username = 'admin';
```

## 🏪 店舗管理者ログインができない場合

### チェック1: 店舗が存在するか

SupabaseのSQL Editorで以下を実行：

```sql
-- supabase/check_stores.sql を実行
```

または、直接確認：

```sql
SELECT store_id, name FROM stores;
```

**結果が空の場合**: 店舗が作成されていません
- システム管理者でログインして店舗を作成してください

### チェック2: 店舗IDとパスワードが正しいか

- システム管理者でログイン
- 「店舗管理」ページで店舗一覧を確認
- 正しい店舗IDとパスワードを使用しているか確認

### チェック3: パスワードをリセット

システム管理者でログインして、店舗のパスワードを変更：

1. 「店舗管理」→「編集」をクリック
2. 新しいパスワードを入力
3. 「更新」をクリック

## 👥 利用者アクセスができない場合

### チェック1: 店舗IDが正しいか

- 店舗IDにスペースや特殊文字が含まれていないか確認
- 大文字・小文字を正確に入力

### チェック2: 店舗が存在するか

```sql
SELECT store_id, name FROM stores WHERE store_id = '入力した店舗ID';
```

## 🔧 一般的な解決方法

### 1. データベースマイグレーションの再実行

```sql
-- 完全なマイグレーションを実行
-- supabase/migration_add_system_admin_complete.sql の内容を実行
```

### 2. 環境変数の確認

Vercelダッシュボードで以下を確認：
- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key

### 3. ブラウザのキャッシュをクリア

1. ブラウザの開発者ツールを開く（F12）
2. 「Application」タブ → 「Storage」→ 「Clear site data」
3. ページをリロード

### 4. ローカルストレージをクリア

ブラウザのコンソールで実行：

```javascript
localStorage.clear();
```

### 5. ネットワークエラーを確認

1. ブラウザの開発者ツールを開く（F12）
2. 「Network」タブを開く
3. ログインを試みる
4. `/api/auth/system-admin/login` または `/api/auth/admin/login` のリクエストを確認
5. エラーレスポンスを確認

## 📝 デバッグ用SQLクエリ

### システム管理者の確認

```sql
-- システム管理者一覧
SELECT username, name, email, created_at FROM system_admins;

-- 特定のユーザー名で検索
SELECT * FROM system_admins WHERE username = 'admin';
```

### 店舗の確認

```sql
-- 店舗一覧（パスワードハッシュは非表示）
SELECT store_id, name, created_at FROM stores;

-- 特定の店舗IDで検索
SELECT store_id, name FROM stores WHERE store_id = 'sample-store-001';
```

### テーブルの存在確認

```sql
-- すべてのテーブルを確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## 🆘 それでも解決しない場合

1. **Vercelのログを確認**
   - Vercelダッシュボード → 「Deployments」→ 最新のデプロイ → 「Functions」タブ
   - エラーログを確認

2. **Supabaseのログを確認**
   - Supabaseダッシュボード → 「Logs」→ 「Postgres Logs」
   - エラーメッセージを確認

3. **エラーメッセージを記録**
   - ブラウザのコンソールエラー
   - ネットワークタブのエラーレスポンス
   - Vercelの関数ログ

これらの情報を元に、さらに詳しく調査できます。

