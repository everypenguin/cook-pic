# セットアップ実行状況

## ✅ 完了した作業

1. **データディレクトリの作成**
   - `backend/data` ディレクトリを作成しました

2. **PostgreSQLの確認**
   - PostgreSQL 18がインストールされていることを確認しました
   - psqlコマンドのパス: `C:\Program Files\PostgreSQL\18\bin\psql.exe`

## ⚠️ 必要な作業

### PostgreSQLサービスを起動する必要があります

PostgreSQLサービスが停止しているため、以下の手順で起動してください：

### 方法1: サービスから起動（推奨）

1. **Windowsキー + R** を押す
2. `services.msc` と入力してEnter
3. サービス一覧で「**postgresql-x64-18**」（または類似の名前）を探す
4. 右クリック → 「**開始**」を選択

### 方法2: PowerShellで起動（管理者権限が必要）

管理者権限でPowerShellを開いて：

```powershell
# サービス名を確認
Get-Service | Where-Object { $_.Name -like "*postgres*" }

# サービスを起動（サービス名を実際の名前に置き換えてください）
Start-Service -Name "postgresql-x64-18"
```

### 方法3: スタートメニューから起動

1. スタートメニューで「PostgreSQL」と検索
2. 「PostgreSQL 18」→「Start Server」を選択

## サービス起動後の作業

サービスが起動したら、以下のコマンドでデータベースを作成できます：

```powershell
# PostgreSQLのパスを設定
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# データベースを作成（パスワードを求められたら入力）
& $psqlPath -U postgres -c "CREATE DATABASE pic_cul;"
```

その後、環境変数を設定してマイグレーションを実行します。

## 次のステップ

1. PostgreSQLサービスを起動
2. データベースを作成
3. 環境変数を設定
4. マイグレーション実行







