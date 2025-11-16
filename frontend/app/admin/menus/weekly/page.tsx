'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchMenus();
  }, [weekStartDate, router]);

  const fetchMenus = async () => {
    try {
      // 管理者用API（認証トークンが必要）
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      const response = await api.get(`/weekly-menus?week_start_date=${weekStartDate}`);
      setMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch weekly menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このメニューを削除しますか？')) {
      return;
    }

    try {
      await api.delete(`/weekly-menus/${id}`);
      fetchMenus();
    } catch (error: any) {
      alert(error.response?.data?.error || '削除に失敗しました');
    }
  };

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
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-[#007AFF] hover:text-[#0051D5] transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-[#1C1C1E]">週間メニュー設定</h1>
            <div className="flex space-x-3">
              <Link
                href={`/admin/menus/weekly/csv?week=${weekStartDate}`}
                className="apple-button-secondary"
              >
                📄 CSV一括登録
              </Link>
              <Link
                href={`/admin/menus/weekly/new?week=${weekStartDate}`}
                className="apple-button-primary"
              >
                + 新規登録
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-6 animate-slide-up">
          <div className="apple-card p-6">
            <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
              週の開始日（月曜日）
            </label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="apple-input"
            />
          </div>
        </div>

        <div className="space-y-3 animate-slide-up">
          {DAYS_OF_WEEK.map((day) => {
            const menu = getMenuForDay(day.value);

            return (
              <div key={day.value} className="apple-card p-6 hover:shadow-md transition-all duration-200">
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-[#1C1C1E]">{day.full}</span>
                        {menu?.category && (
                          <span className="px-3 py-1 bg-[#F2F2F7] text-[#8E8E93] text-sm rounded-full">
                            {menu.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {menu ? (
                          <>
                            <Link
                              href={`/admin/menus/weekly/edit/${menu.id}`}
                              className="px-4 py-2 text-[#007AFF] hover:bg-[#F0F8FF] rounded-xl transition-colors text-sm"
                            >
                              編集
                            </Link>
                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm"
                            >
                              削除
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/admin/menus/weekly/new?day=${day.value}&week=${weekStartDate}`}
                            className="px-4 py-2 text-[#007AFF] hover:bg-[#F0F8FF] rounded-xl transition-colors text-sm"
                          >
                            追加
                          </Link>
                        )}
                      </div>
                    </div>
                    <p className="text-lg text-[#1C1C1E] mb-1">
                      {menu ? menu.menu_name : '未設定'}
                    </p>
                    {menu?.price && (
                      <p className="text-[#007AFF] font-semibold">
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
    </div>
  );
}
