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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-[#1C1C1E]">店舗管理画面</h1>
          <button
            onClick={handleLogout}
            className="text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
          >
            ログアウト
          </button>
        </div>

        {store && (
          <div className="apple-card p-6 mb-8 animate-slide-up">
            <h2 className="text-xl font-bold text-[#1C1C1E] mb-4">店舗情報</h2>
            <div className="space-y-2">
              <p className="text-[#1C1C1E]">
                <span className="font-semibold text-[#8E8E93]">店舗名:</span> {store.name}
              </p>
              <p className="text-[#1C1C1E]">
                <span className="font-semibold text-[#8E8E93]">店舗ID:</span> {store.store_id}
              </p>
            </div>
            <Link
              href="/admin/profile"
              className="inline-block mt-4 text-[#007AFF] hover:text-[#0051D5] transition-colors"
            >
              プロフィールを編集
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
          <Link
            href="/admin/menus/new"
            className="apple-card p-8 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-[#007AFF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1C1C1E]">日間メニューを投稿</h2>
            </div>
            <p className="text-[#8E8E93]">今日のメニューを写真付きで投稿</p>
          </Link>

          <Link
            href="/admin/menus/weekly"
            className="apple-card p-8 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-[#34C759] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1C1C1E]">週間メニュー設定</h2>
            </div>
            <p className="text-[#8E8E93]">1週間分のメニューを設定</p>
          </Link>

          <Link
            href="/admin/menus/monthly"
            className="apple-card p-8 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-[#FF9500] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1C1C1E]">月間メニュー設定</h2>
            </div>
            <p className="text-[#8E8E93]">1ヶ月分のメニューを設定</p>
          </Link>

          <Link
            href="/admin/menus/list"
            className="apple-card p-8 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-[#5856D6] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1C1C1E]">メニュー一覧・編集</h2>
            </div>
            <p className="text-[#8E8E93]">投稿済みメニューの編集・削除</p>
          </Link>
        </div>
      </div>
    </div>
  );
}






