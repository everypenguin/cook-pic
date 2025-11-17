'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Store {
  id: string;
  store_id: string;
  name: string;
  profile_image_url?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchStore = async () => {
      try {
        const response = await api.get('/stores/profile');
        setStore(response.data);
      } catch (error) {
        console.error('Failed to fetch store:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_store');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen particle-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 mb-4 animate-float shadow-lg">
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

  return (
    <div className="min-h-screen particle-bg">
      {/* ヘッダー */}
      <div className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">店舗管理画面</h1>
                {store && (
                  <p className="text-sm text-[#8B7355] mt-0.5">
                    {store.name} <span className="text-[#8B7355]/60">({store.store_id})</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-red-400/30"
              style={{
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4), 0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {store && (
          <div className="restaurant-card p-8 mb-8 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-4">店舗情報</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-[#8B7355]">店舗名:</span>
                    <p className="text-lg font-bold text-[#2C1810] mt-1">{store.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#8B7355]">店舗ID:</span>
                    <p className="text-lg font-bold text-[#2C1810] mt-1">{store.store_id}</p>
                  </div>
                </div>
                <Link
                  href="/admin/profile"
                  className="inline-flex items-center space-x-2 mt-6 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  <span>プロフィールを編集</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {store.profile_image_url && (
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                  <img src={store.profile_image_url} alt={store.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* メニューカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/menus/new"
            className="restaurant-card p-8 group animate-slide-up border-2 border-transparent hover:border-blue-300/50"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2C1810] mb-2 group-hover:gradient-text transition-all">日間メニューを投稿</h3>
                <p className="text-sm text-[#8B7355] leading-relaxed">今日のメニューを写真付きで投稿</p>
              </div>
              <svg className="w-6 h-6 text-[#8B7355] group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/admin/menus/weekly"
            className="restaurant-card p-8 group animate-slide-up border-2 border-transparent hover:border-green-300/50"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2C1810] mb-2 group-hover:gradient-text transition-all">週間メニュー設定</h3>
                <p className="text-sm text-[#8B7355] leading-relaxed">1週間分のメニューを設定</p>
              </div>
              <svg className="w-6 h-6 text-[#8B7355] group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/admin/menus/monthly"
            className="restaurant-card p-8 group animate-slide-up border-2 border-transparent hover:border-orange-300/50"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2C1810] mb-2 group-hover:gradient-text transition-all">月間メニュー設定</h3>
                <p className="text-sm text-[#8B7355] leading-relaxed">1ヶ月分のメニューを設定</p>
              </div>
              <svg className="w-6 h-6 text-[#8B7355] group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/admin/menus/list"
            className="restaurant-card p-8 group animate-slide-up border-2 border-transparent hover:border-purple-300/50"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2C1810] mb-2 group-hover:gradient-text transition-all">メニュー一覧・編集</h3>
                <p className="text-sm text-[#8B7355] leading-relaxed">投稿済みメニューの編集・削除</p>
              </div>
              <svg className="w-6 h-6 text-[#8B7355] group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
