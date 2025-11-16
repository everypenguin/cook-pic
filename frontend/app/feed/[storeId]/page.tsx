'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function FeedPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [menus, setMenus] = useState<Menu[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, storeRes] = await Promise.all([
          api.get(`/menus/daily/${storeId}`),
          api.get(`/stores/${storeId}`),
        ]);
        setMenus(menusRes.data);
        setStore(storeRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 店舗プロフィールヘッダー */}
      {store && (
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-4">
            {store.profile_image_url ? (
              <img
                src={store.profile_image_url}
                alt={store.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{store.name}</h1>
              <p className="text-sm text-gray-500">@{store.store_id}</p>
            </div>
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
          const displayMenus: (Menu | null)[] = [...allMenus];
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
    </div>
  );
}






