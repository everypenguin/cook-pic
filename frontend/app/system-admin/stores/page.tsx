'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import systemAdminApi from '@/lib/systemAdminApi';

interface Store {
  id: string;
  store_id: string;
  name: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function SystemAdminStoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    store_id: '',
    name: '',
    password: '',
    profile_image_url: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('system_admin_token');
    if (!token) {
      router.push('/system-admin/login');
      return;
    }

    fetchStores();
  }, [router]);

  const fetchStores = async () => {
    try {
      const response = await systemAdminApi.get('/system-admin/stores');
      setStores(response.data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await systemAdminApi.post('/system-admin/stores', formData);
      setShowCreateModal(false);
      setFormData({ store_id: '', name: '', password: '', profile_image_url: '' });
      fetchStores();
    } catch (error: any) {
      alert(error.response?.data?.error || '店舗の作成に失敗しました');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    try {
      await systemAdminApi.put(`/system-admin/stores/${editingStore.store_id}`, formData);
      setEditingStore(null);
      setFormData({ store_id: '', name: '', password: '', profile_image_url: '' });
      fetchStores();
    } catch (error: any) {
      alert(error.response?.data?.error || '店舗の更新に失敗しました');
    }
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm('本当にこの店舗を削除しますか？')) return;

    try {
      await systemAdminApi.delete(`/system-admin/stores/${storeId}`);
      fetchStores();
    } catch (error: any) {
      alert(error.response?.data?.error || '店舗の削除に失敗しました');
    }
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setFormData({
      store_id: store.store_id,
      name: store.name,
      password: '',
      profile_image_url: store.profile_image_url || '',
    });
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
            <div className="flex items-center space-x-4">
              <Link href="/system-admin/dashboard" className="text-[#007AFF] hover:underline">
                ← ダッシュボード
              </Link>
              <h1 className="text-2xl font-bold text-[#1C1C1E]">店舗管理</h1>
            </div>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setEditingStore(null);
                setFormData({ store_id: '', name: '', password: '', profile_image_url: '' });
              }}
              className="px-4 py-2 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] transition-colors"
            >
              新規店舗追加
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F2F2F7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1E]">店舗ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1E]">店舗名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1E]">作成日</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1C1C1E]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C6C6C8]">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-[#F2F2F7]">
                  <td className="px-6 py-4 text-sm text-[#1C1C1E]">{store.store_id}</td>
                  <td className="px-6 py-4 text-sm text-[#1C1C1E]">{store.name}</td>
                  <td className="px-6 py-4 text-sm text-[#8E8E93]">
                    {new Date(store.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(store)}
                        className="px-3 py-1 text-sm text-[#007AFF] hover:bg-[#007AFF] hover:bg-opacity-10 rounded-lg transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(store.store_id)}
                        className="px-3 py-1 text-sm text-[#FF3B30] hover:bg-[#FF3B30] hover:bg-opacity-10 rounded-lg transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 作成/編集モーダル */}
      {(showCreateModal || editingStore) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-[#1C1C1E] mb-4">
              {editingStore ? '店舗編集' : '新規店舗追加'}
            </h2>
            <form onSubmit={editingStore ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-2">店舗ID</label>
                <input
                  type="text"
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                  className="w-full px-4 py-2 border border-[#C6C6C8] rounded-xl"
                  required
                  disabled={!!editingStore}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-2">店舗名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#C6C6C8] rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                  パスワード{editingStore && '（変更する場合のみ入力）'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-[#C6C6C8] rounded-xl"
                  required={!editingStore}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-2">プロフィール画像URL</label>
                <input
                  type="url"
                  value={formData.profile_image_url}
                  onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-[#C6C6C8] rounded-xl"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] transition-colors"
                >
                  {editingStore ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingStore(null);
                    setFormData({ store_id: '', name: '', password: '', profile_image_url: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-[#8E8E93] text-white rounded-xl hover:bg-[#636366] transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

