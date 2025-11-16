-- Supabase用データベーススキーマ
-- このファイルをSupabaseのSQL Editorで実行してください

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 日間メニューテーブル
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('daily', 'weekly', 'monthly')),
  date DATE NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 週間メニューテーブル（テキストのみ）
CREATE TABLE IF NOT EXISTS weekly_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  menu_name VARCHAR(255) NOT NULL,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, day_of_week, week_start_date)
);

-- 月間メニューテーブル（テキストのみ）
CREATE TABLE IF NOT EXISTS monthly_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  menu_name VARCHAR(255) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, month, year, menu_name)
);

-- ユーザーアクセスログテーブル
CREATE TABLE IF NOT EXISTS user_accesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_menus_store_date ON menus(store_id, date);
CREATE INDEX IF NOT EXISTS idx_menus_store_type ON menus(store_id, menu_type);
CREATE INDEX IF NOT EXISTS idx_weekly_menus_store_week ON weekly_menus(store_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_monthly_menus_store_month ON monthly_menus(store_id, year, month);
CREATE INDEX IF NOT EXISTS idx_user_accesses_store ON user_accesses(store_id, accessed_at);

-- Row Level Security (RLS) ポリシー
-- 店舗テーブル: 全員が読み取り可能、認証済みユーザーのみ更新可能
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stores" ON stores
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update their own store" ON stores
  FOR UPDATE USING (auth.role() = 'authenticated');

-- メニューテーブル: 全員が読み取り可能、認証済みユーザーのみ書き込み可能
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read menus" ON menus
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert menus" ON menus
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their own menus" ON menus
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their own menus" ON menus
  FOR DELETE USING (auth.role() = 'authenticated');

-- 週間メニューテーブル
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read weekly_menus" ON weekly_menus
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage weekly_menus" ON weekly_menus
  FOR ALL USING (auth.role() = 'authenticated');

-- 月間メニューテーブル
ALTER TABLE monthly_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read monthly_menus" ON monthly_menus
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage monthly_menus" ON monthly_menus
  FOR ALL USING (auth.role() = 'authenticated');

-- ユーザーアクセスログテーブル
ALTER TABLE user_accesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert user_accesses" ON user_accesses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read user_accesses" ON user_accesses
  FOR SELECT USING (auth.role() = 'authenticated');

-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを設定
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_menus_updated_at BEFORE UPDATE ON weekly_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_menus_updated_at BEFORE UPDATE ON monthly_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

