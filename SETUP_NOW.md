# 今すぐセットアップする方法

## 問題
`better-sqlite3`のインストールにVisual Studio Build Toolsが必要ですが、インストールが面倒です。

## 解決策：PostgreSQLを使用（推奨）

PostgreSQLは既にインストールされているようなので、それを使用しましょう。

### ステップ1: 環境変数の設定

`backend/.env`ファイルを確認・編集：

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:あなたのパスワード@localhost:5432/pic_cul
STORAGE_TYPE=local
PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

**重要**: `あなたのパスワード`の部分を、PostgreSQLインストール時に設定したパスワードに変更してください。

### ステップ2: データベースの作成

```powershell
psql -U postgres
```

接続後：
```sql
CREATE DATABASE pic_cul;
\q
```

### ステップ3: マイグレーション実行

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

### ステップ4: 開発サーバー起動

```powershell
cd ..
npm run dev
```

これで以下にアクセスできます：
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:3001

## ログイン情報

- 店舗ID: `sample-store-001`
- パスワード: `password123`








