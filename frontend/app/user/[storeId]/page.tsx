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
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="text-[#8E8E93]">読み込み中...</div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">
      {/* 店舗プロフィールヘッダー */}
      <div className="bg-white border-b border-[#C6C6C8] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
              <div>
                <h1 className="text-xl font-bold text-[#1C1C1E]">{store.name}</h1>
                <p className="text-sm text-[#8E8E93]">@{store.store_id}</p>
              </div>
            </div>
            <Link
              href="/user/access"
              className="text-[#007AFF] text-sm hover:text-[#0051D5] transition-colors"
            >
              店舗を変更
            </Link>
          </div>
        </div>
      </div>

      {/* メニュー選択カード */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 animate-slide-up">
          <Link
            href={`/user/${storeId}/daily`}
            className="apple-card p-8 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-[#007AFF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">本日のメニュー</h2>
                <p className="text-[#8E8E93]">今日のメニューを確認</p>
              </div>
              <svg className="w-6 h-6 text-[#8E8E93] group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href={`/user/${storeId}/weekly`}
            className="apple-card p-8 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-[#34C759] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">週間メニュー</h2>
                <p className="text-[#8E8E93]">1週間分のメニューを確認</p>
              </div>
              <svg className="w-6 h-6 text-[#8E8E93] group-hover:text-[#34C759] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href={`/user/${storeId}/monthly`}
            className="apple-card p-8 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-[#FF9500] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">月間メニュー</h2>
                <p className="text-[#8E8E93]">1ヶ月分のメニューを確認</p>
              </div>
              <svg className="w-6 h-6 text-[#8E8E93] group-hover:text-[#FF9500] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* タブバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#C6C6C8] safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <Link
              href={`/user/${storeId}`}
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#007AFF]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="text-xs font-semibold">ホーム</span>
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
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#8E8E93] hover:text-[#34C759] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">週間</span>
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






