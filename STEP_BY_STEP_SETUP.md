# 一から丁寧にセットアップする方法

## ステップ1: pgAdminでデータベースを作成（SQL不要）

### 1-1. pgAdminを起動

1. Windowsのスタートメニューを開く
2. 「pgAdmin 4」と入力して検索
3. 「pgAdmin 4」をクリックして起動
4. ブラウザが開いてpgAdminの画面が表示されます

### 1-2. サーバーに接続

1. 左側のツリーで「Servers」を展開（クリック）
2. 「PostgreSQL 16」（または表示されているバージョン）をクリック
3. パスワードを求められたら、PostgreSQLインストール時に設定したパスワードを入力
   - パスワードを忘れた場合は、後でリセット方法を説明します

### 1-3. データベースを作成（GUI操作のみ）

1. 左側のツリーで「Databases」を右クリック
2. 「Create」にマウスを合わせる
3. 「Database...」をクリック
4. 以下の画面で：
   - **Database name**: `pic_cul` と入力
   - 他の設定はそのままでOK
5. 画面下部の「Save」ボタンをクリック
6. 左側のツリーに「pic_cul」というデータベースが表示されれば成功です

**これでSQLを実行する必要はありません！**

## ステップ2: 接続情報を確認

### 2-1. サーバーのプロパティを確認

1. 左側のツリーで「PostgreSQL 16」（サーバー名）を右クリック
2. 「Properties」をクリック
3. 「Connection」タブをクリック
4. 以下の情報をメモしてください：
   - **Host name/address**: 通常は `localhost` または `127.0.0.1`
   - **Port**: 通常は `5432`
   - **Username**: 通常は `postgres`
   - **Password**: PostgreSQLインストール時に設定したパスワード

## ステップ3: 環境変数ファイルを作成・編集

### 3-1. backend/.envファイルを確認

1. エクスプローラーで `C:\Users\ngf005148\Desktop\webapps\Pic_cul\backend` フォルダを開く
2. `.env` というファイルがあるか確認
   - 見えない場合は、エクスプローラーの「表示」タブで「隠しファイル」にチェックを入れる

### 3-2. .envファイルを編集

`.env`ファイルをメモ帳で開いて、以下の内容に書き換えます：

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:あなたのパスワード@localhost:5432/pic_cul
STORAGE_TYPE=local
PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

**重要**: `あなたのパスワード`の部分を、ステップ2で確認したパスワードに置き換えてください。

例：パスワードが `mypassword123` の場合：
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/pic_cul
```

### 3-3. ファイルを保存

1. メモ帳で「ファイル」→「名前を付けて保存」
2. ファイル名が `.env` になっていることを確認
3. 「保存」をクリック

## ステップ4: マイグレーション実行（テーブル作成）

### 4-1. PowerShellを開く

1. Windowsのスタートメニューを開く
2. 「PowerShell」と入力
3. 「Windows PowerShell」を右クリック
4. 「管理者として実行」を選択（必須ではありませんが、推奨）

### 4-2. プロジェクトフォルダに移動

PowerShellで以下のコマンドを入力してEnterキーを押します：

```powershell
cd C:\Users\ngf005148\Desktop\webapps\Pic_cul\backend
```

### 4-3. マイグレーション実行

以下のコマンドを1つずつ実行します：

```powershell
npm run db:migrate
```

成功すると以下のメッセージが表示されます：
```
Database migration completed successfully (postgres)
```

### 4-4. サンプルデータ作成

```powershell
npm run db:seed
```

成功すると以下のメッセージが表示されます：
```
Sample store created: sample-store-001
Login credentials:
  Store ID: sample-store-001
  Password: password123
Database seeding completed successfully
```

## ステップ5: 開発サーバー起動

### 5-1. プロジェクトルートに移動

```powershell
cd ..
```

### 5-2. 開発サーバー起動

```powershell
npm run dev
```

以下のようなメッセージが表示されれば成功です：
```
[0] ▲ Next.js 14.0.4
[0] - Local:        http://localhost:3000
[1] Server is running on http://localhost:3001
```

### 5-3. ブラウザでアクセス

1. ブラウザを開く
2. 以下のURLにアクセス：
   - **管理者ログイン**: http://localhost:3000/admin/login
   - **ユーザーアクセス**: http://localhost:3000/user/access

### 5-4. ログイン

管理者ログインページで：
- **店舗ID**: `sample-store-001`
- **パスワード**: `password123`

を入力して「ログイン」をクリック

## トラブルシューティング

### パスワードを忘れた場合

1. pgAdminでサーバーに接続できない場合、PostgreSQLのパスワードをリセットする必要があります
2. または、WindowsのサービスからPostgreSQLサービスを確認できます

### マイグレーションエラーが出る場合

- `backend/.env`の`DATABASE_URL`が正しいか確認
- PostgreSQLサービスが起動しているか確認（pgAdminで接続できれば起動しています）

### ポートが使用されているエラー

- 他のアプリケーションがポート3000や3001を使用している可能性があります
- そのアプリケーションを終了するか、別のポートを使用してください







