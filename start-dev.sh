#!/bin/bash

echo "========================================"
echo "Pic_cul 開発サーバー起動スクリプト"
echo "========================================"
echo ""

echo "[1/3] バックエンドサーバーを起動中..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo "[2/3] フロントエンドサーバーを起動中..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

echo "[3/3] ブラウザを開いています..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000
fi

echo ""
echo "========================================"
echo "開発サーバーが起動しました！"
echo "========================================"
echo ""
echo "利用者側: http://localhost:3000"
echo "管理者側: http://localhost:3000/admin/login"
echo ""
echo "店舗ID: sample-store-001"
echo "パスワード: password123"
echo ""
echo "サーバーを停止する場合は、Ctrl+C を押してください。"
echo ""

# プロセス終了時のクリーンアップ
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait






