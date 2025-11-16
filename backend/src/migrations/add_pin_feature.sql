-- ピン留め機能と画像追加のマイグレーション

-- menusテーブルにピン留めフラグを追加
ALTER TABLE menus ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- 週間メニューテーブルに画像URLを追加
ALTER TABLE weekly_menus ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 月間メニューテーブルに画像URLを追加
ALTER TABLE monthly_menus ADD COLUMN IF NOT EXISTS image_url TEXT;

-- インデックス追加（ピン留めメニューの検索用）
CREATE INDEX IF NOT EXISTS idx_menus_pinned ON menus(store_id, is_pinned, date DESC);






