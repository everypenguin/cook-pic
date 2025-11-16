# pgAdminでデータベースを作成する方法

## 手順

### 1. pgAdminを起動

1. スタートメニューから「pgAdmin 4」を検索して起動
2. 初回起動時はマスターパスワードの設定を求められます（任意のパスワードを設定）

### 2. PostgreSQLサーバーに接続

1. 左側のサーバー一覧で「Servers」を展開
2. 「PostgreSQL 16」（またはインストールしたバージョン）をクリック
3. パスワードを求められたら、PostgreSQLインストール時に設定したパスワードを入力

### 3. データベースを作成

1. 「Databases」を右クリック
2. 「Create」→「Database...」を選択
3. 以下の情報を入力：
   - **Database**: `pic_cul`
   - **Owner**: `postgres`（デフォルト）
4. 「Save」をクリック

### 4. 接続情報を確認

1. サーバー名（例: PostgreSQL 16）を右クリック
2. 「Properties」を選択
3. 「Connection」タブを開く
4. 以下の情報を確認：
   - **Host**: `localhost`（通常）
   - **Port**: `5432`（通常）
   - **Maintenance database**: `postgres`（通常）
   - **Username**: `postgres`（通常）
   - **Password**: PostgreSQLインストール時に設定したパスワード

### 5. backend/.envファイルを設定

`backend/.env`ファイルを編集：

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:あなたのパスワード@localhost:5432/pic_cul
STORAGE_TYPE=local
PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

**重要**: `あなたのパスワード`の部分を、PostgreSQLインストール時に設定したパスワードに変更してください。

### 6. マイグレーション実行

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

### 7. 開発サーバー起動

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








