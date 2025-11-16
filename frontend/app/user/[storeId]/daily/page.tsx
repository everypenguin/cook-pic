'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Menu {
  id: string;
  name: string;
  category?: string;
  price: number;
  image_url: string;
  is_pinned?: boolean;
  created_at: string;
}

interface Store {
  id: string;
  store_id: string;
  name: string;
  profile_image_url?: string;
}

export default function DailyMenuPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [menus, setMenus] = useState<Menu[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, storeRes] = await Promise.all([
          api.get(`/menus/daily/${storeId}?date=${selectedDate}`),
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
  }, [storeId, selectedDate, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="text-[#8E8E93]">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
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
          
          {/* 日付選択 */}
          <div className="px-4 pb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#F2F2F7] rounded-xl border-none text-[#1C1C1E]"
            />
          </div>
        </div>
      )}

      {/* メニューカードグリッド */}
      <div className="pb-20 px-4 py-6">
        {(() => {
          // ピン留めメニューと通常メニューを分離
          const pinnedMenus = menus.filter(m => m.is_pinned);
          const normalMenus = menus.filter(m => !m.is_pinned);
          const allMenus = [...pinnedMenus, ...normalMenus].slice(0, 10); // 最大10枚
          
          // 表示するカード数を決定（最低4枚、最大10枚）
          const displayCount = Math.max(4, Math.min(allMenus.length, 10));
          
          // 空のスロットを追加して4枚以上にする
          const displayMenus = [...allMenus];
          while (displayMenus.length < displayCount) {
            displayMenus.push(null);
          }
          
          return (
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {displayMenus.map((menu, index) => (
                <div
                  key={menu?.id || `empty-${index}`}
                  className={`apple-card p-3 ${menu?.is_pinned ? 'border-2 border-[#007AFF]' : ''} ${!menu ? 'opacity-50' : ''}`}
                >
                  {menu ? (
                    <>
                      {/* ピン留めバッジ */}
                      {menu.is_pinned && (
                        <div className="mb-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-[#007AFF] text-white text-[10px] rounded-full">
                            📌
                          </span>
                        </div>
                      )}
                      
                      {/* メニュー画像 */}
                      <div className="w-full aspect-square bg-[#F2F2F7] rounded-xl overflow-hidden mb-2 flex items-center justify-center">
                        <img
                          src={menu.image_url}
                          alt={menu.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* メニュー情報 */}
                      <div>
                        <h3 className="text-sm font-bold text-[#1C1C1E] mb-1 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{menu.name}</h3>
                        {menu.category && (
                          <span className="inline-block px-1.5 py-0.5 bg-[#F2F2F7] text-[#8E8E93] text-[10px] rounded-full mb-1">
                            {menu.category}
                          </span>
                        )}
                        <p className="text-base font-bold text-[#007AFF] mt-1">
                          ¥{menu.price.toLocaleString()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-square bg-[#F2F2F7] rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-[#C6C6C8] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-[10px] text-[#8E8E93]">未登録</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
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
              className="flex flex-col items-center space-y-1 py-2 px-4 text-[#007AFF]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-xs font-semibold">本日</span>
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

