'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';

// QRコードリーダーを動的インポート（SSRを無効化）
const QRCodeReader = dynamic(() => import('@/components/QRCodeReader'), {
  ssr: false,
});

export default function UserAccessPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrMode, setQrMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!storeId.trim()) {
      setError('店舗IDを入力してください');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/user/access', {
        store_id: storeId.trim(),
      });

      localStorage.setItem('current_store', JSON.stringify(response.data.store));
      router.push(`/user/${storeId.trim()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'アクセスに失敗しました');
      setLoading(false);
    }
  };

  const handleQrScan = async (result: string) => {
    // QRコードから店舗IDを抽出
    const scannedStoreId = result.trim();
    setStoreId(scannedStoreId);
    setQrMode(false);
    setError('');
    setLoading(true);
    
    // QRコードスキャン後、自動的にアクセス
    if (scannedStoreId) {
      try {
        const response = await api.post('/auth/user/access', {
          store_id: scannedStoreId,
        });

        localStorage.setItem('current_store', JSON.stringify(response.data.store));
        router.push(`/user/${scannedStoreId}`);
      } catch (err: any) {
        setError(err.response?.data?.error || 'アクセスに失敗しました');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-[#1C1C1E] text-center mb-2">店舗メニューにアクセス</h1>
          <p className="text-[#8E8E93] text-center">QRコードをスキャンするか、店舗IDを入力してください</p>
        </div>
        
        {!qrMode ? (
          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
            {/* 店舗ID入力 */}
            <div className="apple-card p-6">
              <label htmlFor="store_id" className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
                店舗ID <span className="text-red-500">*</span>
              </label>
              <input
                id="store_id"
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                required
                placeholder="例: sample-store-001"
                className="apple-input"
                autoFocus
              />
            </div>

            {error && (
              <div className="apple-card p-4 bg-red-50 border border-red-200 animate-fade-in">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full apple-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  アクセス中...
                </span>
              ) : (
                'メニューを見る'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C6C6C8]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#F2F2F7] text-[#8E8E93]">または</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setQrMode(true)}
              className="w-full apple-button-secondary"
            >
              📷 QRコードをスキャン
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="apple-card p-6">
              <h2 className="text-xl font-bold text-[#1C1C1E] mb-4 text-center">QRコードをスキャン</h2>
              <p className="text-[#8E8E93] text-center mb-4 text-sm">
                カメラをQRコードに向けてください
              </p>
              <QRCodeReader
                onScanSuccess={handleQrScan}
                onError={(err) => {
                  setError(err);
                  setQrMode(false);
                }}
              />
            </div>
            <button
              onClick={() => {
                setQrMode(false);
                setError('');
              }}
              className="w-full apple-button-secondary"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
