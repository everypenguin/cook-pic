-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 日間メニューテーブル
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('daily', 'weekly', 'monthly')),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 週間メニューテーブル（テキストのみ）
CREATE TABLE IF NOT EXISTS weekly_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  menu_name VARCHAR(255) NOT NULL,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, day_of_week, week_start_date)
);

-- 月間メニューテーブル（テキストのみ）
CREATE TABLE IF NOT EXISTS monthly_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  menu_name VARCHAR(255) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, month, year, menu_name)
);

-- ユーザーアクセスログテーブル
CREATE TABLE IF NOT EXISTS user_accesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_menus_store_date ON menus(store_id, date);
CREATE INDEX IF NOT EXISTS idx_menus_store_type ON menus(store_id, menu_type);
CREATE INDEX IF NOT EXISTS idx_weekly_menus_store_week ON weekly_menus(store_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_monthly_menus_store_month ON monthly_menus(store_id, year, month);
CREATE INDEX IF NOT EXISTS idx_user_accesses_store ON user_accesses(store_id, accessed_at);











