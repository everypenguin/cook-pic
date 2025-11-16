-- SQLite用スキーマ（開発環境）

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  store_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile_image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 日間メニューテーブル
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  menu_type TEXT NOT NULL CHECK (menu_type IN ('daily', 'weekly', 'monthly')),
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- 週間メニューテーブル（テキストのみ）
CREATE TABLE IF NOT EXISTS weekly_menus (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  store_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  menu_name TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
  UNIQUE(store_id, day_of_week, week_start_date)
);

-- 月間メニューテーブル（テキストのみ）
CREATE TABLE IF NOT EXISTS monthly_menus (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  store_id TEXT NOT NULL,
  menu_name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
  UNIQUE(store_id, month, year, menu_name)
);

-- ユーザーアクセスログテーブル
CREATE TABLE IF NOT EXISTS user_accesses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))),
  store_id TEXT NOT NULL,
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_menus_store_date ON menus(store_id, date);
CREATE INDEX IF NOT EXISTS idx_menus_store_type ON menus(store_id, menu_type);
CREATE INDEX IF NOT EXISTS idx_weekly_menus_store_week ON weekly_menus(store_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_monthly_menus_store_month ON monthly_menus(store_id, year, month);
CREATE INDEX IF NOT EXISTS idx_user_accesses_store ON user_accesses(store_id, accessed_at);








