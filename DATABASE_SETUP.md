# データベースセットアップ方法

## 方法1: pgAdminを使用（推奨）

PostgreSQLがインストールされている場合、pgAdminを使用してデータベースを作成できます。

### 手順

1. **pgAdminを起動**
   - スタートメニューから「pgAdmin 4」を起動

2. **サーバーに接続**
   - 左側のサーバー一覧から「PostgreSQL」を展開
   - パスワードを入力して接続

3. **データベースを作成**
   - 「Databases」を右クリック
   - 「Create」→「Database...」を選択
   - Database name: `pic_cul`
   - 「Save」をクリック

4. **接続情報を確認**
   - サーバーを右クリック→「Properties」
   - 「Connection」タブでポート番号を確認（通常は5432）

## 方法2: PostgreSQLのパスを追加

PostgreSQLがインストールされているが、PATHに追加されていない場合：

1. **PostgreSQLのインストール場所を確認**
   - 通常は `C:\Program Files\PostgreSQL\16\bin` または類似のパス

2. **環境変数に追加**
   - 「システムのプロパティ」→「環境変数」
   - 「Path」を編集
   - PostgreSQLのbinディレクトリを追加
   - 例: `C:\Program Files\PostgreSQL\16\bin`

3. **PowerShellを再起動**

4. **データベースを作成**
   ```powershell
   psql -U postgres
   CREATE DATABASE pic_cul;
   \q
   ```

## 方法3: Dockerを使用（簡単）

Docker Desktopがインストールされている場合：

```powershell
# PostgreSQLコンテナを起動
docker run --name pic-cul-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pic_cul -p 5432:5432 -d postgres

# 接続確認
docker ps
```

この場合、`backend/.env`は以下のように設定：
```env
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pic_cul
```

## 方法4: SQLiteを使用（Visual Studio Build Toolsが必要）

SQLiteを使用する場合、`better-sqlite3`のインストールにVisual Studio Build Toolsが必要です。

### Visual Studio Build Toolsのインストール

1. https://visualstudio.microsoft.com/downloads/ にアクセス
2. 「Build Tools for Visual Studio」をダウンロード
3. インストール時に「C++によるデスクトップ開発」を選択
4. インストール後、PowerShellを再起動
5. `cd backend` → `npm install`

## 推奨される方法

**PostgreSQLが既にインストールされている場合**: 方法1（pgAdmin）が最も簡単です。

**PostgreSQLがインストールされていない場合**: 方法3（Docker）が最も簡単です。

**SQLiteを使いたい場合**: Visual Studio Build Toolsをインストールする必要があります。








