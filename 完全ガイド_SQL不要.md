# 完全ガイド：SQLを手動で実行する必要はありません！

## 重要なポイント

**SQLを手動で実行する必要はありません！**
マイグレーションスクリプトが自動的にSQLを実行してくれます。

必要なのは：
1. pgAdminでデータベースを作成するだけ（GUI操作のみ、SQL不要）
2. 環境変数を設定
3. マイグレーションコマンドを実行（これが自動的にSQLを実行）

---

## ステップ1: pgAdminでデータベースを作成（SQL不要）

### 1-1. pgAdminを起動

1. **Windowsキー**を押す
2. 「pgAdmin」と入力
3. 「pgAdmin 4」をクリック
4. ブラウザが自動的に開きます

### 1-2. サーバーに接続

1. 左側のツリーで「**Servers**」をクリックして展開
2. 「**PostgreSQL 16**」（または表示されているバージョン）をクリック
3. パスワード入力画面が表示されたら：
   - PostgreSQLインストール時に設定したパスワードを入力
   - 「Save password」にチェックを入れると次回から自動入力されます
   - 「OK」をクリック

### 1-3. データベースを作成（GUI操作のみ）

1. 左側のツリーで「**Databases**」を**右クリック**
2. メニューが表示されます：
   ```
   Create
   Refresh
   Properties
   ```
3. 「**Create**」にマウスを合わせる
4. サブメニューが表示されます：
   ```
   Database...
   Schema...
   ```
5. 「**Database...**」をクリック

### 1-4. データベース名を入力

新しいウィンドウが開きます：

1. **「General」タブ**が選択されていることを確認
2. **「Database」**という欄に `pic_cul` と入力
   - 大文字小文字は区別されますが、小文字で入力してください
3. 他の設定はそのままでOKです
4. 画面下部の「**Save**」ボタンをクリック

### 1-5. 確認

左側のツリーで「Databases」を展開すると、「**pic_cul**」というデータベースが表示されれば成功です！

**これで完了です。SQLを実行する必要はありません！**

---

## ステップ2: PostgreSQLのパスワードを確認

### 2-1. サーバーのプロパティを開く

1. 左側のツリーで「**PostgreSQL 16**」（サーバー名）を**右クリック**
2. 「**Properties**」をクリック

### 2-2. 接続情報を確認

1. 「**Connection**」タブをクリック
2. 以下の情報を確認：
   - **Host name/address**: `localhost` または `127.0.0.1`
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: ここに表示されているパスワードをメモしてください
     - パスワードが表示されない場合は、PostgreSQLインストール時に設定したパスワードを思い出してください

---

## ステップ3: 環境変数ファイルを設定

### 3-1. ファイルを開く

1. エクスプローラーを開く
2. 以下のパスに移動：
   ```
   C:\Users\ngf005148\Desktop\webapps\Pic_cul\backend
   ```
3. `.env` というファイルを探す
   - 見つからない場合は、メモ帳で新規作成してください

### 3-2. ファイルを編集

`.env`ファイルをメモ帳で開いて、以下の内容を**そのままコピー**して貼り付けます：

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:あなたのパスワード@localhost:5432/pic_cul
STORAGE_TYPE=local
PORT=3001
JWT_SECRET=dev-secret-key-change-this-in-production
NODE_ENV=development
```

### 3-3. パスワードを置き換え

**重要**: `あなたのパスワード`の部分を、ステップ2で確認したパスワードに置き換えてください。

**例：**
- パスワードが `mypassword123` の場合：
  ```env
  DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/pic_cul
  ```

- パスワードが `postgres` の場合：
  ```env
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pic_cul
  ```

### 3-4. ファイルを保存

1. メモ帳で「**ファイル**」→「**名前を付けて保存**」
2. ファイル名が `.env` になっていることを確認
3. 「**保存**」をクリック

---

## ステップ4: マイグレーション実行（自動でSQLが実行されます）

### 4-1. PowerShellを開く

1. **Windowsキー**を押す
2. 「**PowerShell**」と入力
3. 「**Windows PowerShell**」を右クリック
4. 「**管理者として実行**」を選択（推奨）

### 4-2. プロジェクトフォルダに移動

PowerShellで以下のコマンドを**1行ずつ**入力して、**Enterキー**を押します：

```powershell
cd C:\Users\ngf005148\Desktop\webapps\Pic_cul\backend
```

### 4-3. マイグレーション実行（これが自動的にSQLを実行します）

以下のコマンドを入力してEnterキーを押します：

```powershell
npm run db:migrate
```

**何が起こるか：**
- マイグレーションスクリプトが自動的に `schema.sql` ファイルを読み込みます
- そのSQLが自動的にPostgreSQLで実行されます
- テーブルが自動的に作成されます

**成功すると以下のメッセージが表示されます：**
```
Database migration completed successfully (postgres)
```

**エラーが出た場合：**
- `backend/.env`の`DATABASE_URL`が正しいか確認してください
- パスワードが正しいか確認してください
- PostgreSQLサービスが起動しているか確認してください（pgAdminで接続できれば起動しています）

### 4-4. サンプルデータ作成

以下のコマンドを入力してEnterキーを押します：

```powershell
npm run db:seed
```

**成功すると以下のメッセージが表示されます：**
```
Sample store created: sample-store-001
Login credentials:
  Store ID: sample-store-001
  Password: password123
Database seeding completed successfully
```

**これでデータベースのセットアップは完了です！**

---

## ステップ5: 開発サーバー起動

### 5-1. プロジェクトルートに移動

```powershell
cd ..
```

### 5-2. 開発サーバー起動

```powershell
npm run dev
```

**以下のようなメッセージが表示されれば成功です：**
```
[0] ▲ Next.js 14.0.4
[0] - Local:        http://localhost:3000
[1] Server is running on http://localhost:3001
```

### 5-3. ブラウザでアクセス

1. ブラウザを開く（Chrome、Edge、Firefoxなど）
2. アドレスバーに以下のURLを入力：
   ```
   http://localhost:3000/admin/login
   ```
3. Enterキーを押す

### 5-4. ログイン

ログイン画面で以下を入力：

- **店舗ID**: `sample-store-001`
- **パスワード**: `password123`

「**ログイン**」ボタンをクリック

**これで管理画面にアクセスできます！**

---

## まとめ

**SQLを手動で実行する必要はありません！**

必要な作業：
1. ✅ pgAdminでデータベースを作成（GUI操作のみ）
2. ✅ `.env`ファイルにパスワードを設定
3. ✅ `npm run db:migrate`を実行（自動的にSQLが実行される）
4. ✅ `npm run db:seed`を実行（サンプルデータが作成される）
5. ✅ `npm run dev`で開発サーバー起動

**これだけです！**

---

## よくある質問

### Q: SQLを手動で実行する必要はありますか？
A: いいえ、必要ありません。`npm run db:migrate`コマンドが自動的にSQLを実行します。

### Q: pgAdminでSQLを実行する必要はありますか？
A: いいえ、必要ありません。データベースを作成するだけでOKです。

### Q: パスワードがわかりません
A: pgAdminのサーバープロパティで確認できます。または、PostgreSQLインストール時に設定したパスワードを思い出してください。

### Q: エラーが出ました
A: `backend/.env`の`DATABASE_URL`が正しいか確認してください。特にパスワード部分が正しいか確認してください。







