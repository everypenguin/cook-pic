# 環境別セットアップガイド

このプロジェクトは、開発環境と本番環境で異なるデータベースとストレージを使用できるように設計されています。

## 開発環境（ローカル）

### データベース: SQLite
- **メリット**: セットアップ不要、軽量、高速
- **用途**: ローカル開発、テスト

### ストレージ: ローカルファイル
- **メリット**: 設定不要、無料
- **用途**: 開発時の画像保存

## 本番環境

### データベース: PostgreSQL
- **メリット**: 本格的なRDBMS、スケーラブル、高可用性
- **用途**: 本番環境でのデータ管理

### ストレージ: AWS S3
- **メリット**: スケーラブル、CDN対応、高可用性
- **用途**: 本番環境での画像配信

## 環境変数の設定

### 開発環境（`backend/.env`）

```env
# データベースタイプ
DB_TYPE=sqlite

# SQLiteデータベースのパス
DATABASE_URL=./data/pic_cul.db

# ストレージタイプ
STORAGE_TYPE=local

PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

### 本番環境（`backend/.env`）

```env
# データベースタイプ
DB_TYPE=postgres

# PostgreSQL接続情報
DATABASE_URL=postgresql://user:password@host:5432/pic_cul

# ストレージタイプ
STORAGE_TYPE=s3

PORT=3001
JWT_SECRET=your-production-secret-key-here
NODE_ENV=production

# AWS S3設定
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=ap-northeast-1
```

## セットアップ手順

### 開発環境のセットアップ

1. **環境変数ファイルの作成**
   ```powershell
   cd backend
   copy .env.example .env
   ```

2. **依存関係のインストール**
   ```powershell
   npm install
   ```

3. **データディレクトリの作成**
   ```powershell
   mkdir data
   ```

4. **データベースマイグレーション**
   ```powershell
   npm run db:migrate
   npm run db:seed
   ```

5. **開発サーバー起動**
   ```powershell
   npm run dev
   ```

### 本番環境のセットアップ

1. **PostgreSQLデータベースの準備**
   - RDS、Heroku Postgres、または自前のPostgreSQLサーバーを用意

2. **AWS S3バケットの作成**
   - S3バケットを作成
   - パブリック読み取りアクセスを設定
   - CORS設定を追加（必要に応じて）

3. **環境変数の設定**
   - `.env`ファイルに本番環境用の設定を記入

4. **データベースマイグレーション**
   ```powershell
   npm run build
   npm run db:migrate:prod
   npm run db:seed:prod
   ```

5. **アプリケーションの起動**
   ```powershell
   npm start
   ```

## データベースの切り替え

環境変数`DB_TYPE`を変更するだけで、データベースを切り替えられます：

- `DB_TYPE=sqlite` → SQLiteを使用
- `DB_TYPE=postgres` → PostgreSQLを使用

## ストレージの切り替え

環境変数`STORAGE_TYPE`を変更するだけで、ストレージを切り替えられます：

- `STORAGE_TYPE=local` → ローカルファイルシステムを使用
- `STORAGE_TYPE=s3` → AWS S3を使用

## 画像のアップロード

### 開発環境（ローカルストレージ）

画像は`backend/uploads/`ディレクトリに保存され、`http://localhost:3001/uploads/{filename}`でアクセスできます。

### 本番環境（AWS S3）

画像はS3バケットにアップロードされ、S3のURLでアクセスできます。

## トラブルシューティング

### SQLiteデータベースが見つからない

- `data`ディレクトリが作成されているか確認
- `DATABASE_URL`のパスが正しいか確認

### PostgreSQL接続エラー

- PostgreSQLが起動しているか確認
- `DATABASE_URL`の接続情報が正しいか確認
- ファイアウォール設定を確認

### S3アップロードエラー

- AWS認証情報が正しいか確認
- S3バケットが存在するか確認
- IAMポリシーで適切な権限が付与されているか確認

## マイグレーション

開発環境と本番環境で異なるスキーマファイルを使用：

- **開発環境**: `schema.sqlite.sql`（SQLite用）
- **本番環境**: `schema.sql`（PostgreSQL用）

マイグレーションスクリプトは自動的に適切なスキーマファイルを選択します。








