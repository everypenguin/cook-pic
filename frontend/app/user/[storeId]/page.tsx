'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Store {
  id: string;
  store_id: string;
  name: string;
  profile_image_url?: string;
}

export default function UserStorePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await api.get(`/stores/${storeId}`);
        setStore(response.data);
      } catch (error) {
        console.error('Failed to fetch store:', error);
        router.push('/user/access');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId, router]);

  if (loading) {
    return (
      <div className="min-h-screen theme-user particle-bg-user flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-button gradient-button-user mb-4 animate-float shadow-lg">
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

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen theme-user particle-bg-user pb-24">
      {/* 店舗プロフィールヘッダー */}
      <div className="glass-user border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {store.profile_image_url ? (
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white/50">
                  <img
                    src={store.profile_image_url}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl gradient-button gradient-button-user flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🏪</span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold gradient-text gradient-text-user">{store.name}</h1>
                <p className="text-sm text-[#8B7355]">@{store.store_id}</p>
              </div>
            </div>
            <Link
              href="/user/access"
              className="px-4 py-2 bg-white/80 border-2 border-green-500/30 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 text-sm"
            >
              店舗を変更
            </Link>
          </div>
        </div>
      </div>

      {/* メニュー選択カード */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-6">
          <Link
            href={`/user/${storeId}/calendar`}
            className="restaurant-card restaurant-card-user p-8 group animate-slide-up border-2 border-transparent hover:border-green-300/50"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #FFB3A7 0%, #FFC4BA 100%)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#2C1810] mb-2 group-hover:gradient-text-user transition-all">カレンダー献立表</h2>
                <p className="text-[#8B7355]">日次・週間・月間メニューをカレンダー形式で確認</p>
              </div>
              <svg className="w-6 h-6 text-[#8B7355] group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* タブバー */}
      <div className="fixed bottom-0 left-0 right-0 glass-user border-t border-white/20 backdrop-blur-xl safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <Link
              href={`/user/${storeId}`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-green-600 font-semibold"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
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
