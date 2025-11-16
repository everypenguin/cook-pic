# pgAdminなしでセットアップする方法

pgAdminがインストールされていない場合でも、データベースを作成できます。

## 方法1: PostgreSQLコマンドラインツールを使用（推奨）

### ステップ1: PostgreSQLのインストール場所を確認

PostgreSQLがインストールされている場合、コマンドラインツール（psql）が利用できます。

### ステップ2: psqlのパスを確認

PowerShellで以下を実行：

```powershell
Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 FullName
```

見つかった場合は、そのパスをメモしてください。

### ステップ3: データベースを作成

見つかったパスを使用してデータベースを作成：

```powershell
# 例：PostgreSQL 16がインストールされている場合
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE pic_cul;"
```

パスワードを求められたら、PostgreSQLインストール時に設定したパスワードを入力してください。

## 方法2: SQLiteを使用（最も簡単）

PostgreSQLのセットアップが難しい場合、SQLiteを使用できます。

### ステップ1: Visual Studio Build Toolsをインストール

SQLiteを使用するには、Visual Studio Build Toolsが必要です。

1. https://visualstudio.microsoft.com/downloads/ にアクセス
2. 「Build Tools for Visual Studio」をダウンロード
3. インストール時に「C++によるデスクトップ開発」を選択
4. インストール後、PowerShellを再起動

### ステップ2: 環境変数を設定

`backend/.env`ファイルを以下のように設定：

```env
DB_TYPE=sqlite
DATABASE_URL=./data/pic_cul.db
STORAGE_TYPE=local
PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

### ステップ3: データディレクトリを作成

```powershell
cd C:\Users\ngf005148\Desktop\webapps\Pic_cul\backend
mkdir data
```

### ステップ4: 依存関係をインストール

```powershell
npm install
```

### ステップ5: マイグレーション実行

```powershell
npm run db:migrate
npm run db:seed
```

## 方法3: Dockerを使用（PostgreSQLがインストールされていない場合）

Docker Desktopがインストールされている場合：

### ステップ1: Docker Desktopをインストール

1. https://www.docker.com/products/docker-desktop/ からダウンロード
2. インストール後、Docker Desktopを起動

### ステップ2: PostgreSQLコンテナを起動

```powershell
docker run --name pic-cul-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pic_cul -p 5432:5432 -d postgres
```

### ステップ3: 環境変数を設定

`backend/.env`ファイルを以下のように設定：

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pic_cul
STORAGE_TYPE=local
PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

### ステップ4: マイグレーション実行

```powershell
cd C:\Users\ngf005148\Desktop\webapps\Pic_cul\backend
npm run db:migrate
npm run db:seed
```

## 方法4: PostgreSQLを再インストール（pgAdmin付き）

PostgreSQLを再インストールして、pgAdminも一緒にインストールする方法：

1. https://www.postgresql.org/download/windows/ にアクセス
2. PostgreSQLをダウンロード
3. インストール時に「pgAdmin 4」にチェックを入れる
4. インストール後、pgAdminを使用してデータベースを作成

## 推奨される方法

**PostgreSQLが既にインストールされている場合**: 方法1（psqlコマンドライン）

**PostgreSQLがインストールされていない場合**: 方法2（SQLite）または方法3（Docker）

**最も簡単な方法**: 方法2（SQLite）ですが、Visual Studio Build Toolsのインストールが必要です







