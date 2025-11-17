'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface DailyMenu {
  id: string;
  name: string;
  category?: string;
  price: number;
  image_url?: string;
  is_pinned?: boolean;
  date: string;
}

interface WeeklyMenu {
  id: string;
  day_of_week: number;
  menu_name: string;
  category?: string;
  price?: number;
  image_url?: string;
  week_start_date: string;
}

interface MonthlyMenu {
  id: string;
  menu_name: string;
  category?: string;
  price?: number;
  image_url?: string;
  month: number;
  year: number;
}

interface Store {
  id: string;
  store_id: string;
  name: string;
  profile_image_url?: string;
}

interface DayMenu {
  date: string;
  dailyMenus: DailyMenu[];
  weeklyMenu?: WeeklyMenu;
  monthlyMenus: MonthlyMenu[];
}

const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const days: Date[] = [];
  
  // 月の最初の日の曜日を取得（0=日曜日）
  const firstDayOfWeek = firstDay.getDay();
  
  // 前月の日付を追加（カレンダーの空白を埋める）
  const prevMonth = new Date(year, month - 2, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month - 2, prevMonth.getDate() - i));
  }
  
  // 今月の日付を追加
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month - 1, i));
  }
  
  // 次月の日付を追加（カレンダーの空白を埋める）
  const remainingDays = 42 - days.length; // 6週間分
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
}

export default function CalendarMenuPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  
  const [store, setStore] = useState<Store | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayMenus, setDayMenus] = useState<Map<string, DayMenu>>(new Map());
  const [loading, setLoading] = useState(true);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const days = getDaysInMonth(year, month);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await api.get(`/stores/${storeId}`);
        setStore(response.data);
      } catch (error) {
        console.error('Failed to fetch store:', error);
        router.push('/user/access');
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId, router]);

  useEffect(() => {
    const fetchMenus = async () => {
      if (!storeId) return;
      
      setLoading(true);
      try {
        const weekStartDate = getWeekStartDate(new Date(year, month - 1, 1));
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        
        // 月の最初の日と最後の日を取得
        const firstDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
        
        // 並列でデータを取得
        const [weeklyRes, monthlyRes] = await Promise.all([
          api.get(`/weekly-menus/by-store/${storeId}?week_start_date=${weekStartDate}`),
          api.get(`/monthly-menus/by-store/${storeId}?year=${year}&month=${month}`),
        ]);
        
        const weeklyMenus: WeeklyMenu[] = weeklyRes.data || [];
        const monthlyMenus: MonthlyMenu[] = monthlyRes.data || [];
        
        // 各日のメニューを取得
        const menuMap = new Map<string, DayMenu>();
        
        for (const day of days) {
          const dateStr = day.toISOString().split('T')[0];
          const dayOfWeek = day.getDay();
          
          // その日の日次メニューを取得
          try {
            const dailyRes = await api.get(`/menus/daily/${storeId}?date=${dateStr}`);
            const dailyMenus: DailyMenu[] = dailyRes.data || [];
            
            // 週間メニューを取得
            const weeklyMenu = weeklyMenus.find(m => {
              const menuDate = new Date(m.week_start_date);
              const menuDayOfWeek = menuDate.getDay();
              const diff = Math.floor((day.getTime() - menuDate.getTime()) / (1000 * 60 * 60 * 24));
              return diff >= 0 && diff < 7 && (menuDayOfWeek + diff) % 7 === m.day_of_week;
            });
            
            menuMap.set(dateStr, {
              date: dateStr,
              dailyMenus,
              weeklyMenu,
              monthlyMenus,
            });
          } catch (error) {
            // 日次メニューが取得できない場合は空配列
            const weeklyMenu = weeklyMenus.find(m => m.day_of_week === dayOfWeek);
            menuMap.set(dateStr, {
              date: dateStr,
              dailyMenus: [],
              weeklyMenu,
              monthlyMenus,
            });
          }
        }
        
        setDayMenus(menuMap);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchMenus();
    }
  }, [storeId, year, month]);

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getMenuCount = (dateStr: string): number => {
    const dayMenu = dayMenus.get(dateStr);
    if (!dayMenu) return 0;
    
    let count = dayMenu.dailyMenus.length;
    if (dayMenu.weeklyMenu) count += 1;
    count += dayMenu.monthlyMenus.length;
    return count;
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month - 1 + delta, 1));
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-menu particle-bg-menu flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-button gradient-button-menu mb-4 animate-float shadow-lg">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-[#8B7355] font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  const selectedDayMenu = selectedDate ? dayMenus.get(selectedDate) : null;

  return (
    <div className="min-h-screen theme-menu particle-bg-menu pb-24">
      {/* ヘッダー */}
      {store && (
        <div className="glass-menu border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {store.profile_image_url ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50">
                    <img
                      src={store.profile_image_url}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl gradient-button gradient-button-menu flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏪</span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold gradient-text gradient-text-menu">{store.name}</h1>
                  <p className="text-sm text-[#8B7355]">@{store.store_id}</p>
                </div>
              </div>
              <Link
                href={`/user/${storeId}`}
                className="px-4 py-2 bg-white/80 border-2 border-orange-500/30 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-300 text-sm"
              >
                ホーム
              </Link>
            </div>
            
            {/* 月選択 */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg"
              >
                <svg className="w-6 h-6 text-[#FFB3A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-2xl font-bold gradient-text gradient-text-menu">
                {year}年{month}月
              </h2>
              
              <button
                onClick={() => changeMonth(1)}
                className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg"
              >
                <svg className="w-6 h-6 text-[#FFB3A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* カレンダー */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS_OF_WEEK.map((day, index) => (
            <div
              key={index}
              className="text-center py-2 text-sm font-bold text-[#8B7355]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayMenu = dayMenus.get(dateStr);
            const menuCount = getMenuCount(dateStr);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={index}
                onClick={() => isCurrentMonthDay && handleDateClick(dateStr)}
                className={`
                  restaurant-card restaurant-card-menu p-2 min-h-[80px] cursor-pointer transition-all duration-300
                  ${!isCurrentMonthDay ? 'opacity-40' : ''}
                  ${isTodayDay ? 'ring-2 ring-[#FFB3A7] ring-offset-2' : ''}
                  ${isSelected ? 'ring-2 ring-[#FF6B35] ring-offset-2 scale-105' : ''}
                  ${isCurrentMonthDay ? 'hover:scale-105 hover:shadow-lg' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-bold mb-1 ${isTodayDay ? 'text-[#FF6B35]' : 'text-[#2C1810]'}`}>
                    {day.getDate()}
                  </div>
                  
                  {menuCount > 0 && (
                    <div className="flex-1 flex flex-col gap-1">
                      {dayMenu?.dailyMenus.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-[#FF6B35]" title="日次メニュー"></span>
                          <span className="text-xs text-[#8B7355] truncate">
                            {dayMenu.dailyMenus.length}件
                          </span>
                        </div>
                      )}
                      
                      {dayMenu?.weeklyMenu && (
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-[#A8D5BA]" title="週間メニュー"></span>
                          <span className="text-xs text-[#8B7355] truncate">
                            {dayMenu.weeklyMenu.menu_name}
                          </span>
                        </div>
                      )}
                      
                      {dayMenu?.monthlyMenus.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-[#B19CD9]" title="月間メニュー"></span>
                          <span className="text-xs text-[#8B7355] truncate">
                            {dayMenu.monthlyMenus.length}件
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#FF6B35]"></span>
            <span className="text-[#8B7355]">日次メニュー</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#A8D5BA]"></span>
            <span className="text-[#8B7355]">週間メニュー</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#B19CD9]"></span>
            <span className="text-[#8B7355]">月間メニュー</span>
          </div>
        </div>
      </div>

      {/* 選択された日の詳細 */}
      {selectedDayMenu && selectedDate && (
        <div className="fixed bottom-0 left-0 right-0 glass-menu border-t-2 border-white/30 backdrop-blur-xl z-40 max-h-[60vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold gradient-text gradient-text-menu">
                {new Date(selectedDate).getMonth() + 1}月{new Date(selectedDate).getDate()}日のメニュー
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* 日次メニュー */}
              {selectedDayMenu.dailyMenus.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#8B7355] mb-2 flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF6B35]"></span>
                    <span>日次メニュー</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedDayMenu.dailyMenus.map((menu) => (
                      <div key={menu.id} className="restaurant-card restaurant-card-menu p-3">
                        <p className="text-sm font-semibold text-[#2C1810] mb-1">{menu.name}</p>
                        {menu.category && (
                          <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full mb-1">
                            {menu.category}
                          </span>
                        )}
                        <p className="text-base font-bold gradient-text gradient-text-menu">
                          ¥{menu.price.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 週間メニュー */}
              {selectedDayMenu.weeklyMenu && (
                <div>
                  <h4 className="text-sm font-bold text-[#8B7355] mb-2 flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#A8D5BA]"></span>
                    <span>週間メニュー</span>
                  </h4>
                  <div className="restaurant-card restaurant-card-menu p-4">
                    <p className="text-base font-semibold text-[#2C1810] mb-1">
                      {selectedDayMenu.weeklyMenu.menu_name}
                    </p>
                    {selectedDayMenu.weeklyMenu.category && (
                      <span className="inline-block px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full mb-2">
                        {selectedDayMenu.weeklyMenu.category}
                      </span>
                    )}
                    {selectedDayMenu.weeklyMenu.price && (
                      <p className="text-lg font-bold gradient-text gradient-text-menu">
                        ¥{selectedDayMenu.weeklyMenu.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 月間メニュー */}
              {selectedDayMenu.monthlyMenus.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#8B7355] mb-2 flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#B19CD9]"></span>
                    <span>月間メニュー</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedDayMenu.monthlyMenus.map((menu) => (
                      <div key={menu.id} className="restaurant-card restaurant-card-menu p-3">
                        <p className="text-sm font-semibold text-[#2C1810] mb-1">{menu.menu_name}</p>
                        {menu.category && (
                          <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full mb-1">
                            {menu.category}
                          </span>
                        )}
                        {menu.price && (
                          <p className="text-base font-bold gradient-text gradient-text-menu">
                            ¥{menu.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* メニューがない場合 */}
              {selectedDayMenu.dailyMenus.length === 0 && !selectedDayMenu.weeklyMenu && selectedDayMenu.monthlyMenus.length === 0 && (
                <div className="restaurant-card restaurant-card-menu p-8 text-center">
                  <p className="text-[#8B7355]">この日はメニューが設定されていません</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* タブバー */}
      <div className="fixed bottom-0 left-0 right-0 glass-menu border-t border-white/20 backdrop-blur-xl safe-area-inset-bottom z-30">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <Link
              href={`/user/${storeId}`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#8B7355] hover:text-green-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">ホーム</span>
            </Link>
            <Link
              href={`/user/${storeId}/calendar`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-orange-600 font-semibold"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-xs">カレンダー</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

