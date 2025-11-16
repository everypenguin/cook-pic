# SQLite版クイックスタートガイド

開発環境でSQLiteを使用する場合の簡単なセットアップ手順です。

## 前提条件

- Node.js 18以上がインストール済み ✅
- PostgreSQLのインストールは不要 ✅

## セットアップ手順

### 1. 依存関係のインストール

```powershell
npm run install:all
```

### 2. 環境変数ファイルの作成

**`backend/.env`** を作成：

```env
DB_TYPE=sqlite
DATABASE_URL=./data/pic_cul.db
STORAGE_TYPE=local
PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

**`frontend/.env.local`** を作成：

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. データディレクトリの作成

```powershell
cd backend
mkdir data
cd ..
```

### 4. データベースマイグレーション

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

これで以下が作成されます：
- SQLiteデータベースファイル: `backend/data/pic_cul.db`
- サンプル店舗（店舗ID: `sample-store-001`, パスワード: `password123`）

### 5. 開発サーバーの起動

プロジェクトのルートディレクトリで：

```powershell
npm run dev
```

### 6. 動作確認

1. **管理者ログイン**: http://localhost:3000/admin/login
   - 店舗ID: `sample-store-001`
   - パスワード: `password123`

2. **メニュー投稿**: ダッシュボードから「日間メニューを投稿」

3. **ユーザーアクセス**: http://localhost:3000/user/access
   - 店舗ID: `sample-store-001` を入力

## データベースファイルの場所

SQLiteデータベースファイルは以下の場所に作成されます：
- `backend/data/pic_cul.db`

このファイルを削除すると、データベースがリセットされます。

## 本番環境への移行

本番環境では、`backend/.env`を以下のように変更：

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@host:5432/pic_cul
STORAGE_TYPE=s3
# ... その他の設定
```

詳細は [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) を参照してください。








