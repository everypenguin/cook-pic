# トラブルシューティングガイド

## better-sqlite3のインストールエラー

### 問題
`better-sqlite3`のインストール時に以下のエラーが発生：
```
gyp ERR! find VS You need to install the latest version of Visual Studio
```

### 原因
`better-sqlite3`はネイティブモジュールのため、WindowsではVisual Studio Build Toolsが必要です。

### 解決策

#### 方法1: Visual Studio Build Toolsをインストール（推奨）

1. **Visual Studio Build Toolsをダウンロード**
   - https://visualstudio.microsoft.com/downloads/ にアクセス
   - 「Build Tools for Visual Studio」をダウンロード

2. **インストール**
   - インストーラーを実行
   - 「C++によるデスクトップ開発」ワークロードを選択
   - インストール

3. **再インストール**
   ```powershell
   cd backend
   npm install
   ```

#### 方法2: PostgreSQLを使用（簡単）

SQLiteの代わりにPostgreSQLを使用する場合：

1. **環境変数を変更**
   `backend/.env`を編集：
   ```env
   DB_TYPE=postgres
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pic_cul
   ```

2. **PostgreSQLをインストール**
   - https://www.postgresql.org/download/windows/ からインストール
   - またはDockerを使用：
     ```powershell
     docker run --name pic-cul-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pic_cul -p 5432:5432 -d postgres
     ```

3. **データベースを作成**
   ```powershell
   psql -U postgres
   CREATE DATABASE pic_cul;
   \q
   ```

4. **マイグレーション実行**
   ```powershell
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

#### 方法3: 事前ビルド済みバイナリを使用

`better-sqlite3`の事前ビルド済みバイナリをダウンロード：

```powershell
cd backend
npm install better-sqlite3 --build-from-source=false
```

ただし、Node.js 22.21.0用のバイナリが存在しない可能性があります。

## 開発サーバーにアクセスできない

### 確認事項

1. **開発サーバーが起動しているか**
   ```powershell
   npm run dev
   ```
   以下のメッセージが表示されるはず：
   ```
   Server is running on http://localhost:3001
   ```

2. **ポートが使用されているか**
   ```powershell
   netstat -ano | findstr ":3000 :3001"
   ```

3. **環境変数が正しく設定されているか**
   - `frontend/.env.local`に`NEXT_PUBLIC_API_URL=http://localhost:3001`が設定されているか確認

4. **ブラウザでアクセス**
   - http://localhost:3000 （フロントエンド）
   - http://localhost:3001 （バックエンド）

## データベース接続エラー

### SQLiteの場合
- `backend/data/`ディレクトリが存在するか確認
- `backend/data/pic_cul.db`ファイルが作成されているか確認

### PostgreSQLの場合
- PostgreSQLサービスが起動しているか確認
- `DATABASE_URL`が正しいか確認
- データベース`pic_cul`が作成されているか確認

## その他の問題

### 依存関係の再インストール
```powershell
# プロジェクトルートで
npm run install:all

# または個別に
cd frontend
npm install
cd ../backend
npm install
```

### キャッシュのクリア
```powershell
# フロントエンド
cd frontend
rm -r .next
npm run dev

# バックエンド
cd backend
rm -r dist
npm run build
```








