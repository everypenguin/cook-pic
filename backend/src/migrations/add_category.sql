-- カテゴリーカラムを追加するマイグレーション

-- 日間メニューテーブルにカテゴリーを追加
ALTER TABLE menus ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- 週間メニューテーブルにカテゴリーと価格を追加
ALTER TABLE weekly_menus ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE weekly_menus ADD COLUMN IF NOT EXISTS price INTEGER;

-- 月間メニューテーブルにカテゴリーと価格を追加
ALTER TABLE monthly_menus ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE monthly_menus ADD COLUMN IF NOT EXISTS price INTEGER;






