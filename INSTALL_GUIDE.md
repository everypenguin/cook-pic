# インストールガイド（Windows版）

このガイドでは、Windows環境でPic_culプロジェクトをセットアップする手順を説明します。

## 必要なソフトウェア

1. **Node.js** (v18以上) - 既にインストール済み ✅
2. **PostgreSQL** (v12以上) - インストールが必要
3. **Git** (オプション) - バージョン管理用

## ステップ1: PostgreSQLのインストール

### 方法A: PostgreSQL公式インストーラー（推奨）

1. **PostgreSQLをダウンロード**
   - https://www.postgresql.org/download/windows/ にアクセス
   - 「Download the installer」をクリック
   - 「PostgreSQL 16.x」または最新版をダウンロード

2. **インストール実行**
   - ダウンロードしたインストーラーを実行
   - 「Next」をクリック
   - インストール先を選択（デフォルトでOK）
   - コンポーネント選択（すべて選択でOK）
   - データディレクトリを選択（デフォルトでOK）

3. **パスワード設定**
   - **重要**: `postgres`ユーザーのパスワードを設定
   - 例: `postgres` または `password123`
   - このパスワードは後で使用します

4. **ポート設定**
   - デフォルトポート: `5432`（変更不要）

5. **ロケール設定**
   - 「Default locale」を選択（日本語環境なら「Japanese, Japan」）

6. **インストール完了**
   - 「Finish」をクリック
   - 「Stack Builder」はスキップしてOK

### 方法B: Dockerを使用（簡単）

Docker Desktopがインストールされている場合：

```powershell
# PostgreSQLコンテナを起動
docker run --name pic-cul-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pic_cul -p 5432:5432 -d postgres

# 起動確認
docker ps
```

**Docker Desktopのインストール**:
- https://www.docker.com/products/docker-desktop/ からダウンロード
- インストール後、Docker Desktopを起動

### 方法C: Chocolateyを使用（開発者向け）

```powershell
# Chocolateyがインストールされている場合
choco install postgresql
```

## ステップ2: PostgreSQLの動作確認

### コマンドプロンプトまたはPowerShellで確認

```powershell
# PostgreSQLに接続（パスワードを求められます）
psql -U postgres

# 接続できたら以下を実行
SELECT version();

# 終了
\q
```

**接続できない場合**:
- PostgreSQLのサービスが起動しているか確認
- 環境変数PATHにPostgreSQLのbinディレクトリが追加されているか確認
- 通常は `C:\Program Files\PostgreSQL\16\bin` をPATHに追加

## ステップ3: プロジェクトの環境変数設定

### 3-1. フロントエンドの環境変数

`frontend/.env.local` ファイルを作成：

```powershell
# frontendディレクトリに移動
cd frontend

# .env.localファイルを作成（メモ帳で作成してもOK）
notepad .env.local
```

以下の内容を入力：

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

保存して閉じる。

### 3-2. バックエンドの環境変数

`backend/.env` ファイルを作成：

```powershell
# プロジェクトルートに戻る
cd ..

# backendディレクトリに移動
cd backend

# .envファイルを作成
notepad .env
```

以下の内容を入力（**パスワード部分を実際の値に変更**）：

```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pic_cul
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development

# AWS S3設定（オプション、本番環境で使用）
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=ap-northeast-1
```

**重要**: `DATABASE_URL`の`postgres:postgres`部分を変更：
- 1つ目の`postgres`: PostgreSQLのユーザー名（通常は`postgres`）
- 2つ目の`postgres`: PostgreSQLのパスワード（インストール時に設定したもの）

例：
- パスワードが`password123`の場合: `postgresql://postgres:password123@localhost:5432/pic_cul`

保存して閉じる。

## ステップ4: データベースの作成

### PostgreSQLに接続してデータベースを作成

```powershell
# PostgreSQLに接続（パスワードを求められます）
psql -U postgres
```

接続できたら、以下を実行：

```sql
-- データベースを作成
CREATE DATABASE pic_cul;

-- 作成確認
\l

-- 終了
\q
```

**エラーが出る場合**:
- データベースが既に存在する場合: `ERROR: database "pic_cul" already exists` → 問題ありません
- 接続できない場合: PostgreSQLサービスが起動しているか確認

## ステップ5: データベースマイグレーション

プロジェクトのルートディレクトリで：

```powershell
# backendディレクトリに移動
cd backend

# マイグレーション実行（テーブル作成）
npm run db:migrate

# シードデータ作成（サンプル店舗作成）
npm run db:seed
```

**成功すると以下が表示されます**:
```
Database migration completed successfully
Sample store created: sample-store-001
Login credentials:
  Store ID: sample-store-001
  Password: password123
Database seeding completed successfully
```

**エラーが出る場合**:
- `DATABASE_URL`が正しいか確認
- PostgreSQLが起動しているか確認
- データベース`pic_cul`が作成されているか確認

## ステップ6: 開発サーバーの起動

プロジェクトのルートディレクトリで：

```powershell
# ルートディレクトリに移動（まだbackendにいる場合）
cd ..

# 開発サーバーを起動
npm run dev
```

**成功すると以下が表示されます**:
```
> pic-cul@1.0.0 dev
> concurrently "npm run dev:frontend" "npm run dev:backend"

[0] > pic-cul-frontend@1.0.0 dev
[0] > next dev
[0] 
[0]   ▲ Next.js 14.0.4
[0]   - Local:        http://localhost:3000
[0] 
[1] > pic-cul-backend@1.0.0 dev
[1] > tsx watch src/index.ts
[1] Server is running on http://localhost:3001
```

## ステップ7: 動作確認

### ブラウザでアクセス

1. **管理者ログイン画面**
   - http://localhost:3000/admin/login を開く
   - 店舗ID: `sample-store-001`
   - パスワード: `password123`
   - 「ログイン」をクリック

2. **ダッシュボード**
   - ログイン後、管理画面が表示されます
   - 「日間メニューを投稿」をクリック

3. **メニュー投稿**
   - 画像を選択（必須）
   - メニュー名を入力
   - 価格を入力
   - 「投稿する」をクリック

4. **ユーザーアクセス**
   - 新しいタブで http://localhost:3000/user/access を開く
   - 店舗ID: `sample-store-001` を入力
   - 「メニューを見る」をクリック
   - 投稿したメニューが表示されます

## トラブルシューティング

### PostgreSQLに接続できない

**エラー**: `psql: コマンドが見つかりません`

**解決策**:
1. PostgreSQLのbinディレクトリをPATHに追加
   - 通常: `C:\Program Files\PostgreSQL\16\bin`
2. 環境変数の設定:
   - 「システムのプロパティ」→「環境変数」
   - 「Path」を編集
   - PostgreSQLのbinディレクトリを追加

### データベース接続エラー

**エラー**: `connect ECONNREFUSED 127.0.0.1:5432`

**解決策**:
1. PostgreSQLサービスが起動しているか確認
   - 「サービス」アプリを開く
   - `postgresql-x64-16` が「実行中」か確認
   - 停止している場合は「開始」をクリック

2. ポート5432が使用可能か確認
   ```powershell
   netstat -an | findstr 5432
   ```

### マイグレーションエラー

**エラー**: `relation "stores" already exists`

**解決策**:
- テーブルが既に存在する場合は正常です
- 再実行したい場合:
  ```sql
  -- PostgreSQLに接続
  psql -U postgres -d pic_cul
  
  -- すべてのテーブルを削除
  DROP TABLE IF EXISTS user_accesses CASCADE;
  DROP TABLE IF EXISTS monthly_menus CASCADE;
  DROP TABLE IF EXISTS weekly_menus CASCADE;
  DROP TABLE IF EXISTS menus CASCADE;
  DROP TABLE IF EXISTS stores CASCADE;
  
  -- 終了
  \q
  ```
  その後、再度マイグレーションを実行

### ポートが既に使用されている

**エラー**: `Port 3000 is already in use`

**解決策**:
1. 使用中のプロセスを確認:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. プロセスを終了するか、別のポートを使用
3. `frontend/.env.local`で`PORT=3002`などに変更

## 次のステップ

セットアップが完了したら、以下を参照してください：

- [README.md](./README.md) - プロジェクト概要
- [QUICK_START.md](./QUICK_START.md) - クイックスタートガイド

## よくある質問

**Q: PostgreSQLのパスワードを忘れた場合は？**
A: PostgreSQLの設定ファイルを編集するか、再インストールが必要です。

**Q: Dockerを使わずに開発できますか？**
A: はい、PostgreSQLを直接インストールすれば問題ありません。

**Q: データベースをリセットしたい場合は？**
A: データベースを削除して再作成し、マイグレーションを再実行してください。

**Q: 本番環境へのデプロイ方法は？**
A: [SETUP.md](./SETUP.md)の「本番環境へのデプロイ」セクションを参照してください。










