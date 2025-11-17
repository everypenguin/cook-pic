# 店舗管理者ログインができない場合のトラブルシューティング

## 🔍 エラー: 401 Unauthorized

`POST /api/auth/admin/login 401 (Unauthorized)` エラーが発生している場合の対処法です。

## 📋 確認手順

### 1. データベースに店舗が存在するか確認

SupabaseのSQL Editorで以下を実行：

```sql
-- 店舗一覧を確認
SELECT store_id, name, created_at FROM stores;

-- 店舗が存在しない場合
SELECT COUNT(*) AS store_count FROM stores;
```

**結果が0の場合**: 店舗が作成されていません

### 2. テスト店舗を作成

SupabaseのSQL Editorで以下を実行：

```sql
-- supabase/create_test_store.sql の内容を実行
```

または、直接実行：

```sql
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
```

**テストログイン情報**:
- 店舗ID: `test-store-001`
- パスワード: `test123`

### 3. システム管理者で店舗を作成

1. システム管理者でログイン (`/system-admin/login`)
   - ユーザー名: `admin`
   - パスワード: `admin123`

2. 「店舗管理」ページに移動

3. 「新規店舗追加」をクリック

4. 店舗情報を入力：
   - 店舗ID: 任意（例: `my-store-001`）
   - 店舗名: 任意（例: `マイ店舗`）
   - パスワード: 任意（例: `mypassword123`）

5. 「作成」をクリック

### 4. パスワードを確認

店舗のパスワードが正しいか確認：

```sql
-- 特定の店舗のパスワードハッシュを確認（表示のみ）
SELECT store_id, name FROM stores WHERE store_id = 'your-store-id';
```

パスワードをリセットする場合：

```sql
-- 新しいパスワードのbcryptハッシュを生成（Node.jsで実行）
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('新しいパスワード', 10).then(hash => console.log(hash));

-- Supabase SQL Editorで実行
UPDATE stores 
SET password_hash = '生成したbcryptハッシュ'
WHERE store_id = 'your-store-id';
```

## 🛠️ よくある原因と解決方法

### 原因1: 店舗が存在しない

**症状**: `401 Unauthorized` エラー

**解決方法**:
1. システム管理者でログイン
2. 店舗を作成
3. 作成した店舗IDとパスワードでログイン

### 原因2: 店舗IDが間違っている

**症状**: `401 Unauthorized` または `404 Not Found` エラー

**解決方法**:
1. 店舗IDにスペースや特殊文字が含まれていないか確認
2. 大文字・小文字を正確に入力
3. データベースで店舗IDを確認：

```sql
SELECT store_id FROM stores;
```

### 原因3: パスワードが間違っている

**症状**: `401 Unauthorized` エラー

**解決方法**:
1. パスワードを再確認
2. システム管理者で店舗のパスワードをリセット

### 原因4: データベース接続エラー

**症状**: `500 Internal Server Error` または `データベースエラー`

**解決方法**:
1. Vercelの環境変数を確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Supabaseのプロジェクトがアクティブか確認
3. Service Role Keyが正しいか確認

## 🔍 デバッグ方法

### 1. ブラウザのコンソールを確認

1. ブラウザの開発者ツールを開く（F12）
2. 「Console」タブを確認
3. エラーメッセージを確認

### 2. ネットワークタブを確認

1. ブラウザの開発者ツールを開く（F12）
2. 「Network」タブを開く
3. ログインを試みる
4. `/api/auth/admin/login` のリクエストを確認
5. レスポンスの内容を確認

### 3. Vercelのログを確認

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Deployments」→ 最新のデプロイ → 「Functions」タブ
4. `/api/auth/admin/login` のログを確認

### 4. Supabaseのログを確認

1. Supabaseダッシュボードにログイン
2. 「Logs」→ 「Postgres Logs」を確認
3. エラーメッセージを確認

## 📝 テスト用店舗の作成

### 方法1: SQLで直接作成

```sql
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
```

### 方法2: システム管理者から作成

1. `/system-admin/login` にアクセス
2. システム管理者でログイン
3. 「店舗管理」→「新規店舗追加」
4. 店舗情報を入力して作成

## ✅ 確認チェックリスト

- [ ] データベースに店舗が存在する
- [ ] 店舗IDが正しい
- [ ] パスワードが正しい
- [ ] Vercelの環境変数が正しく設定されている
- [ ] Supabaseのプロジェクトがアクティブ
- [ ] ブラウザのコンソールにエラーがない

## 🆘 それでも解決しない場合

1. **Vercelのログを確認**
   - エラーメッセージの詳細を確認

2. **Supabaseのログを確認**
   - データベースクエリのエラーを確認

3. **エラーメッセージを記録**
   - ブラウザのコンソールエラー
   - ネットワークタブのエラーレスポンス
   - Vercelの関数ログ

これらの情報を元に、さらに詳しく調査できます。

