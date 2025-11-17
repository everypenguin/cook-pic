'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import systemAdminApi from '@/lib/systemAdminApi';

interface SystemAdmin {
  id: string;
  username: string;
  name: string;
  email?: string;
}

export default function SystemAdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<SystemAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeCount, setStoreCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('system_admin_token');
    if (!token) {
      router.push('/system-admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        const adminData = localStorage.getItem('system_admin');
        if (adminData) {
          setAdmin(JSON.parse(adminData));
        }

        // 店舗数と管理者数を取得
        const [storesRes, adminsRes] = await Promise.all([
          systemAdminApi.get('/system-admin/stores/count'),
          systemAdminApi.get('/system-admin/admins/count'),
        ]);

        setStoreCount(storesRes.data.count || 0);
        setAdminCount(adminsRes.data.count || 0);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/system-admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('system_admin_token');
    localStorage.removeItem('system_admin');
    router.push('/system-admin/login');
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
      {/* ヘッダー */}
      <div className="bg-white border-b border-[#C6C6C8] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1C1C1E]">システム管理</h1>
              <p className="text-sm text-[#8E8E93] mt-1">
                {admin?.name} ({admin?.username})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#FF3B30] text-white rounded-xl hover:bg-[#D70015] transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8E8E93] text-sm mb-1">登録店舗数</p>
                <p className="text-3xl font-bold text-[#1C1C1E]">{storeCount}</p>
              </div>
              <div className="w-12 h-12 bg-[#007AFF] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8E8E93] text-sm mb-1">システム管理者数</p>
                <p className="text-3xl font-bold text-[#1C1C1E]">{adminCount}</p>
              </div>
              <div className="w-12 h-12 bg-[#34C759] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* メニューカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 店舗管理 */}
          <Link
            href="/system-admin/stores"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#007AFF] bg-opacity-10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">店舗管理</h3>
                <p className="text-sm text-[#8E8E93]">店舗の登録・編集・削除</p>
              </div>
              <svg className="w-5 h-5 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* システム管理者管理 */}
          <Link
            href="/system-admin/admins"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#34C759] bg-opacity-10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">システム管理者管理</h3>
                <p className="text-sm text-[#8E8E93]">システム管理者の追加・編集</p>
              </div>
              <svg className="w-5 h-5 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* 利用統計 */}
          <Link
            href="/system-admin/analytics"
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#FF9500] bg-opacity-10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FF9500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1C1C1E] mb-1">利用統計</h3>
                <p className="text-sm text-[#8E8E93]">アクセス数や利用状況の確認</p>
              </div>
              <svg className="w-5 h-5 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

