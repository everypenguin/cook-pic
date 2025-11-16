# セットアップガイド

## 前提条件

- Node.js 18以上
- PostgreSQL 12以上（またはMySQL 8以上）
- npm または yarn

## 詳細なセットアップ手順

### 1. プロジェクトのクローンと依存関係のインストール

```bash
# 依存関係をインストール
npm run install:all
```

### 2. データベースの準備

#### PostgreSQLを使用する場合

```bash
# PostgreSQLに接続
psql -U postgres

# データベースを作成
CREATE DATABASE pic_cul;

# ユーザーを作成（オプション）
CREATE USER pic_cul_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pic_cul TO pic_cul_user;
```

#### MySQLを使用する場合

```bash
mysql -u root -p

CREATE DATABASE pic_cul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pic_cul_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON pic_cul.* TO 'pic_cul_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 環境変数の設定

#### フロントエンド

`frontend/.env.local`を作成:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### バックエンド

`backend/.env`を作成:
```
PORT=3001
DATABASE_URL=postgresql://pic_cul_user:your_password@localhost:5432/pic_cul
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. データベースマイグレーション

```bash
cd backend
npm run build
npm run db:migrate
npm run db:seed
```

### 5. 開発サーバーの起動

```bash
# ルートディレクトリから
npm run dev
```

これで以下が起動します:
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:3001

### 6. 動作確認

1. **管理者ログイン**
   - http://localhost:3000/admin/login にアクセス
   - 店舗ID: `sample-store-001`
   - パスワード: `password123`

2. **メニュー投稿**
   - ログイン後、ダッシュボードから「日間メニューを投稿」をクリック
   - 画像、メニュー名、価格を入力して投稿

3. **ユーザーアクセス**
   - http://localhost:3000/user/access にアクセス
   - 店舗ID: `sample-store-001` を入力
   - メニューフィードが表示されます

## トラブルシューティング

### データベース接続エラー

- `DATABASE_URL`が正しく設定されているか確認
- データベースサーバーが起動しているか確認
- ユーザーに適切な権限が付与されているか確認

### ポートが既に使用されている

- フロントエンド: `frontend/.env.local`で`PORT`を変更
- バックエンド: `backend/.env`で`PORT`を変更
- `NEXT_PUBLIC_API_URL`も合わせて変更

### 画像が表示されない

- 現在はBase64エンコードを使用しています
- 本番環境ではAWS S3などの画像ストレージサービスを使用してください

## 本番環境へのデプロイ

### 推奨事項

1. **環境変数**
   - 本番環境用の`.env`ファイルを作成
   - `JWT_SECRET`を強力なランダム文字列に変更
   - `NODE_ENV=production`に設定

2. **データベース**
   - 本番環境用のデータベースを使用
   - 接続プールの設定を最適化

3. **画像ストレージ**
   - AWS S3またはGoogle Cloud Storageを使用
   - CDNを設定して画像配信を高速化

4. **セキュリティ**
   - HTTPSを有効化
   - CORS設定を適切に設定
   - レート制限を実装

5. **パフォーマンス**
   - データベースインデックスを最適化
   - 画像の最適化（圧縮、リサイズ）
   - キャッシュ戦略の実装











