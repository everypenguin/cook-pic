export interface Store {
  id: string;
  store_id: string;
  name: string;
  password_hash: string;
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Menu {
  id: string;
  store_id: string;
  name: string;
  category?: string;
  price: number;
  image_url: string;
  menu_type: 'daily' | 'weekly' | 'monthly';
  date: Date;
  is_pinned?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WeeklyMenu {
  id: string;
  store_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  menu_name: string;
  category?: string;
  price?: number;
  image_url?: string;
  week_start_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MonthlyMenu {
  id: string;
  store_id: string;
  menu_name: string;
  category?: string;
  price?: number;
  image_url?: string;
  month: number; // 1-12
  year: number;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserAccess {
  id: string;
  store_id: string;
  user_id?: string;
  accessed_at: Date;
}






