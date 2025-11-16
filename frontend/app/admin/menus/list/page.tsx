'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Menu {
  id: string;
  name: string;
  category?: string;
  price: number;
  image_url: string;
  menu_type: 'daily' | 'weekly' | 'monthly';
  date: string;
  is_pinned?: boolean;
  created_at: string;
}

export default function MenuListPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchMenus();
  }, [router]);

  const fetchMenus = async () => {
    try {
      // 日間メニューを取得（簡易実装）
      const response = await api.get(`/menus/daily/sample-store-001`);
      setMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await api.put(`/menus/${id}/pin`, { is_pinned: !isPinned });
      fetchMenus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'ピン留めの更新に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このメニューを削除しますか？')) {
      return;
    }

    try {
      await api.delete(`/menus/${id}`);
      fetchMenus();
    } catch (error: any) {
      alert(error.response?.data?.error || '削除に失敗しました');
    }
  };

  const filteredMenus = filterType === 'all' 
    ? menus 
    : menus.filter(m => m.menu_type === filterType);

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
          <h1 className="text-4xl font-bold text-[#1C1C1E]">メニュー一覧・編集</h1>
        </div>

        {/* フィルター */}
        <div className="mb-6 animate-slide-up">
          <div className="apple-card p-4">
            <div className="flex space-x-2">
              {(['all', 'daily', 'weekly', 'monthly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    filterType === type
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-white text-[#1C1C1E] hover:bg-[#F2F2F7]'
                  }`}
                >
                  {type === 'all' ? 'すべて' : type === 'daily' ? '日間' : type === 'weekly' ? '週間' : '月間'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* メニュー一覧 */}
        <div className="space-y-3 animate-slide-up">
          {filteredMenus.length === 0 ? (
            <div className="apple-card p-12 text-center">
              <p className="text-[#8E8E93] text-lg">メニューがありません</p>
            </div>
          ) : (
            filteredMenus.map((menu) => (
              <div
                key={menu.id}
                className={`apple-card p-6 hover:shadow-md transition-all duration-200 ${
                  menu.is_pinned ? 'border-2 border-[#007AFF]' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#F2F2F7]">
                    <img
                      src={menu.image_url}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {menu.is_pinned && (
                            <span className="px-2 py-1 bg-[#007AFF] text-white text-xs rounded-full">
                              📌 ピン留め
                            </span>
                          )}
                          <h3 className="text-lg font-bold text-[#1C1C1E]">{menu.name}</h3>
                          {menu.category && (
                            <span className="px-3 py-1 bg-[#F2F2F7] text-[#8E8E93] text-sm rounded-full">
                              {menu.category}
                            </span>
                          )}
                        </div>
                        <p className="text-[#007AFF] font-semibold mb-2">
                          ¥{menu.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-[#8E8E93]">
                          {new Date(menu.date).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4">
                      <button
                        onClick={() => handlePin(menu.id, menu.is_pinned || false)}
                        className={`px-4 py-2 rounded-xl transition-colors text-sm ${
                          menu.is_pinned
                            ? 'bg-[#007AFF] text-white'
                            : 'bg-[#F2F2F7] text-[#8E8E93] hover:bg-[#E0E0E0]'
                        }`}
                      >
                        {menu.is_pinned ? '📌 ピン留め解除' : '📌 ピン留め'}
                      </button>
                      <Link
                        href={`/admin/menus/edit/${menu.id}`}
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
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
