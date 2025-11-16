'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Store {
  id: string;
  store_id: string;
  name: string;
  profile_image_url?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        setName(response.data.name);
      } catch (error) {
        console.error('Failed to fetch store:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await api.put('/stores/profile', {
        name,
      });
      setStore(response.data);
      alert('プロフィールを更新しました');
    } catch (err: any) {
      setError(err.response?.data?.error || 'プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">プロフィール編集</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="store_id" className="block text-sm font-medium text-gray-700 mb-2">
              店舗ID
            </label>
            <input
              id="store_id"
              type="text"
              value={store?.store_id || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-sm text-gray-500">店舗IDは変更できません</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              店舗名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}











