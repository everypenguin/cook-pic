@echo off
echo ========================================
echo Pic_cul 開発サーバー起動スクリプト
echo ========================================
echo.

echo [1/3] バックエンドサーバーを起動中...
start "Pic_cul Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] フロントエンドサーバーを起動中...
start "Pic_cul Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] ブラウザを開いています...
start http://localhost:3000

echo.
echo ========================================
echo 開発サーバーが起動しました！
echo ========================================
echo.
echo 利用者側: http://localhost:3000
echo 管理者側: http://localhost:3000/admin/login
echo.
echo 店舗ID: sample-store-001
echo パスワード: password123
echo.
echo このウィンドウは閉じても構いません。
echo サーバーを停止する場合は、各サーバーウィンドウで Ctrl+C を押してください。
echo.
pause






