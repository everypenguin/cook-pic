# Pic_cul - 店舗メニュー管理システム

SNS風のUI/UXを持つ店舗メニュー管理・表示システムです。

## 機能概要

### 管理者機能（A系）
- **A-1**: 管理者ログイン（店舗IDとパスワード）
- **A-2**: ユーザーアクセス（QRコード読み取り + 店舗ID入力）
- **A-3**: パスワードリセット（オプション）

### メニュー管理機能（B系）
- **B-1**: 日間メニュー投稿（写真必須、SNS風投稿画面）
- **B-2**: 週間メニュー設定（テキストのみ、ストーリーズ風）
- **B-3**: 月間メニュー設定（テキストのみ、ハイライト風）
- **B-4**: メニューの編集・削除
- **B-5**: 店舗情報管理（プロフィール編集風）

### ユーザー表示機能（C系）
- **C-1**: 日間メニュー表示（フィード形式、いいね機能付き）
- **C-2**: 週間メニュー表示（ストーリーズ/ハイライト風）
- **C-3**: 月間メニュー表示（カレンダー/アーカイブ風）
- **C-4**: 店舗プロフィール表示
- **C-5**: メニュー検索（ハッシュタグ検索風、オプション）

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: 
  - 開発環境: SQLite（セットアップ不要）
  - 本番環境: PostgreSQL（推奨）
- **画像管理**: 
  - 開発環境: ローカルファイルシステム
  - 本番環境: AWS S3 / Google Cloud Storage

## 開発環境ログイン情報

### 管理者ログイン
- **URL**: http://localhost:3000/admin/login
- **店舗ID**: `sample-store-001`
- **パスワード**: `password123`

### データベース接続情報
- **データベース名**: `pic_cul`
- **ユーザー名**: `postgres`
- **パスワード**: `postgres`

詳細は [開発環境ログイン情報.md](./開発環境ログイン情報.md) を参照してください。

## クイックスタート

### 開発環境（PostgreSQL使用）

1. **依存関係のインストール**
   ```bash
   npm run install:all
   ```

2. **環境変数の設定**
   - `backend/.env` を作成（PostgreSQL用の設定）
   - `frontend/.env.local` を作成

3. **PostgreSQLデータベースの作成**
   ```powershell
   # PostgreSQLに接続してデータベースを作成
   $psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
   $env:PGPASSWORD = "postgres"
   & $psqlPath -U postgres -c "CREATE DATABASE pic_cul;"
   ```

4. **データベースマイグレーション**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **開発サーバー起動**
   ```bash
   npm run dev
   ```

6. **ブラウザでアクセス**
   - 管理者ログイン: http://localhost:3000/admin/login
   - 店舗ID: `sample-store-001`
   - パスワード: `password123`

詳細は [開発環境ログイン情報.md](./開発環境ログイン情報.md) を参照してください。

### 本番環境（PostgreSQL + S3使用）

詳細は [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) を参照してください。

## 環境別設定

### 開発環境
- **データベース**: SQLite（`backend/data/pic_cul.db`）
- **ストレージ**: ローカルファイル（`backend/uploads/`）
- **設定**: `DB_TYPE=sqlite`, `STORAGE_TYPE=local`

### 本番環境
- **データベース**: PostgreSQL
- **ストレージ**: AWS S3
- **設定**: `DB_TYPE=postgres`, `STORAGE_TYPE=s3`

環境変数で簡単に切り替え可能です。

## プロジェクト構造

```
Pic_cul/
├── frontend/          # Next.js フロントエンド
│   ├── app/          # App Router
│   ├── components/   # React コンポーネント
│   └── lib/          # ユーティリティ
├── backend/          # Express バックエンド
│   ├── src/
│   │   ├── routes/   # API ルート
│   │   ├── models/   # データベースモデル
│   │   ├── middleware/# ミドルウェア
│   │   ├── config/   # 設定（DB、ストレージ）
│   │   └── utils/    # ユーティリティ
│   ├── migrations/   # データベースマイグレーション
│   └── data/         # SQLiteデータベース（開発環境）
└── package.json      # ルートパッケージ設定
```

## 要件

- **可用性**: 24時間365日稼働
- **性能**: メニュー表示は3秒以内
- **セキュリティ**: パスワードハッシュ化、SSL/TLS保護
- **拡張性**: 店舗数・メニュー種類の増加に対応
- **保守性**: シンプルで統一されたコードベース
- **ユーザビリティ**: スマートフォン向け、白基調のミニマルデザイン

## ドキュメント

- [QUICK_START_SQLITE.md](./QUICK_START_SQLITE.md) - SQLite版クイックスタート
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - 環境別セットアップガイド
- [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) - 詳細インストールガイド（PostgreSQL版）
