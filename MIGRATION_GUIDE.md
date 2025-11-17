# データベースマイグレーションガイド

## 📋 マイグレーションの実行順序

### 方法1: 段階的なマイグレーション（推奨）

既存のデータベースがある場合や、段階的にマイグレーションを実行したい場合：

1. **基本スキーマの実行**
   ```sql
   -- supabase/schema.sql を実行
   ```
   これにより、`stores`、`menus`、`weekly_menus`、`monthly_menus`などの基本テーブルが作成されます。

2. **システム管理者機能の追加**
   ```sql
   -- supabase/migration_add_system_admin.sql を実行
   ```
   これにより、`system_admins`テーブルとシステム管理者機能が追加されます。

### 方法2: 完全なマイグレーション（新規セットアップ向け）

新規にデータベースをセットアップする場合：

```sql
-- supabase/migration_add_system_admin_complete.sql を実行
```

このファイルは、`stores`テーブルが存在しない場合でも動作します。

## 🚀 実行手順

### Supabaseで実行する場合

1. Supabaseダッシュボードにログイン
2. 「SQL Editor」を開く
3. マイグレーションファイルの内容をコピー＆ペースト
4. 「Run」をクリックして実行

### エラーが発生した場合

#### エラー: `relation "stores" does not exist`

**原因**: `stores`テーブルが存在しない

**解決方法**:
- 方法1: 先に`supabase/schema.sql`を実行してから、`migration_add_system_admin.sql`を実行
- 方法2: `supabase/migration_add_system_admin_complete.sql`を使用（推奨）

#### エラー: `column "role" already exists`

**原因**: `role`カラムが既に存在する

**解決方法**: 
- このエラーは無視して問題ありません
- マイグレーションは`IF NOT EXISTS`チェックを含んでいるため、既存のカラムはスキップされます

#### エラー: `policy already exists`

**原因**: RLSポリシーが既に存在する

**解決方法**:
- マイグレーションファイルは`DROP POLICY IF EXISTS`を含んでいるため、再実行しても問題ありません

## ✅ マイグレーション後の確認

マイグレーションが成功したか確認：

```sql
-- system_adminsテーブルが作成されたか確認
SELECT * FROM system_admins;

-- storesテーブルにroleカラムが追加されたか確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stores' AND column_name = 'role';

-- デフォルトのシステム管理者が作成されたか確認
SELECT username, name FROM system_admins WHERE username = 'admin';
```

## 🔐 デフォルトアカウント

マイグレーション実行後、以下のデフォルトアカウントが作成されます：

- **ユーザー名**: `admin`
- **パスワード**: `admin123`
- **名前**: システム管理者

⚠️ **重要**: 本番環境では必ずパスワードを変更してください。

## 📚 関連ファイル

- `supabase/schema.sql` - 基本スキーマ
- `supabase/migration_add_system_admin.sql` - システム管理者機能の追加（storesテーブル必須）
- `supabase/migration_add_system_admin_complete.sql` - 完全なマイグレーション（新規セットアップ向け）

