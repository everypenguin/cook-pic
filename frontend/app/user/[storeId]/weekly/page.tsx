'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface WeeklyMenu {
  id: string;
  day_of_week: number;
  menu_name: string;
  category?: string;
  price?: number;
  image_url?: string;
  week_start_date: string;
}

interface Store {
  id: string;
  store_id: string;
  name: string;
  profile_image_url?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: '日', full: '日曜日' },
  { value: 1, label: '月', full: '月曜日' },
  { value: 2, label: '火', full: '火曜日' },
  { value: 3, label: '水', full: '水曜日' },
  { value: 4, label: '木', full: '木曜日' },
  { value: 5, label: '金', full: '金曜日' },
  { value: 6, label: '土', full: '土曜日' },
];

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function WeeklyMenuPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, storeRes] = await Promise.all([
          api.get(`/weekly-menus/${storeId}?week_start_date=${weekStartDate}`),
          api.get(`/stores/${storeId}`),
        ]);
        setMenus(menusRes.data);
        setStore(storeRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/user/access');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId, weekStartDate, router]);

  const getMenuForDay = (dayOfWeek: number): WeeklyMenu | undefined => {
    return menus.find(m => m.day_of_week === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="text-[#8E8E93]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">
      {/* 店舗プロフィールヘッダー */}
      {store && (
        <div className="bg-white border-b border-[#C6C6C8] sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-4">
              {store.profile_image_url ? (
                <img
                  src={store.profile_image_url}
                  alt={store.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                  <span className="text-2xl">🏪</span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-[#1C1C1E]">{store.name}</h1>
                <p className="text-sm text-[#8E8E93]">@{store.store_id}</p>
              </div>
            </div>
          </div>
          
          {/* 週選択 */}
          <div className="px-4 pb-4">
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#F2F2F7] rounded-xl border-none text-[#1C1C1E]"
            />
          </div>
        </div>
      )}

      {/* 週間メニュー一覧 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day) => {
            const menu = getMenuForDay(day.value);
            return (
              <div key={day.value} className="apple-card p-6">
                <div className="flex items-start space-x-4">
                  {menu?.image_url && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#F2F2F7]">
                      <img
                        src={menu.image_url}
                        alt={menu.menu_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl font-bold text-[#1C1C1E]">{day.full}</span>
                      {menu?.category && (
                        <span className="px-2 py-1 bg-[#F2F2F7] text-[#8E8E93] text-xs rounded-full">
                          {menu.category}
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-[#1C1C1E] mb-1">
                      {menu ? menu.menu_name : '未設定'}
                    </p>
                    {menu?.price && (
                      <p className="text-[#34C759] font-semibold">
                        ¥{menu.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* タブバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#C6C6C8] safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <Link
              href={`/user/${storeId}`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#8E8E93] hover:text-[#007AFF] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">ホーム</span>
            </Link>
            <Link
              href={`/user/${storeId}/daily`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#8E8E93] hover:text-[#007AFF] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">本日</span>
            </Link>
            <Link
              href={`/user/${storeId}/weekly`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#34C759]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-xs font-semibold">週間</span>
            </Link>
            <Link
              href={`/user/${storeId}/monthly`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#8E8E93] hover:text-[#FF9500] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">月間</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

