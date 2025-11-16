# クイックスタートガイド

## 現在の状況
✅ プロジェクト構造作成済み
✅ 依存関係インストール済み
✅ 環境変数ファイル作成済み

## 次のステップ

### 1. データベースの準備

#### PostgreSQLがインストールされている場合

```powershell
# PostgreSQLに接続してデータベースを作成
psql -U postgres

# データベースを作成
CREATE DATABASE pic_cul;

# 終了
\q
```

#### PostgreSQLがインストールされていない場合

**オプションA: PostgreSQLをインストール**
- https://www.postgresql.org/download/windows/ からダウンロード
- インストール時にパスワードを設定（例: `postgres`）

**オプションB: Dockerを使用（推奨）**
```powershell
docker run --name pic-cul-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pic_cul -p 5432:5432 -d postgres
```

**オプションC: 開発用SQLiteを使用（簡単）**
- `backend/.env`の`DATABASE_URL`を変更する必要があります
- 後で実装可能

### 2. データベース接続設定の確認

`backend/.env`ファイルを開いて、データベース接続情報を確認・修正してください：

```
DATABASE_URL=postgresql://ユーザー名:パスワード@localhost:5432/pic_cul
```

例：
- ユーザー名: `postgres`
- パスワード: `postgres`（インストール時に設定したもの）
- データベース名: `pic_cul`

### 3. データベースマイグレーション実行

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

これで以下が作成されます：
- データベーステーブル（stores, menus, weekly_menus, monthly_menus, user_accesses）
- サンプル店舗（店舗ID: `sample-store-001`, パスワード: `password123`）

### 4. 開発サーバーの起動

プロジェクトのルートディレクトリで：

```powershell
npm run dev
```

これで以下が起動します：
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:3001

### 5. 動作確認

#### 管理者ログイン
1. ブラウザで http://localhost:3000/admin/login を開く
2. 店舗ID: `sample-store-001`
3. パスワード: `password123`
4. ログイン後、ダッシュボードが表示されます

#### メニュー投稿
1. ダッシュボードから「日間メニューを投稿」をクリック
2. 画像、メニュー名、価格を入力
3. 「投稿する」をクリック

#### ユーザーアクセス
1. http://localhost:3000/user/access を開く
2. 店舗ID: `sample-store-001` を入力
3. 「メニューを見る」をクリック
4. または「QRコードをスキャン」でQRコードを読み取る

## トラブルシューティング

### データベース接続エラー

**エラー**: `connect ECONNREFUSED 127.0.0.1:5432`

**解決策**:
1. PostgreSQLが起動しているか確認
2. `backend/.env`の`DATABASE_URL`が正しいか確認
3. ポート5432が使用可能か確認

### ポートが既に使用されている

**エラー**: `Port 3000 is already in use`

**解決策**:
- 他のアプリケーションを終了するか
- `frontend/.env.local`で`PORT=3002`などに変更

### マイグレーションエラー

**エラー**: `relation "stores" already exists`

**解決策**:
- テーブルが既に存在する場合は正常です
- 再実行したい場合は、データベースを削除して再作成

## 次の開発ステップ

1. ✅ 基本機能実装済み
2. 🔄 週間・月間メニュー機能の実装
3. 🔄 画像アップロード（AWS S3統合）
4. 🔄 メニュー検索機能
5. 🔄 パスワードリセット機能

## 参考リンク

- [README.md](./README.md) - プロジェクト概要
- [SETUP.md](./SETUP.md) - 詳細セットアップガイド











