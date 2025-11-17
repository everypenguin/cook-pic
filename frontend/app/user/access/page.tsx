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
    const scannedStoreId = result.trim();
    setStoreId(scannedStoreId);
    setQrMode(false);
    setError('');
    setLoading(true);
    
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
    <div className="min-h-screen particle-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* ヘッダー */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-green-700 mb-6 animate-float shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">店舗メニューにアクセス</h1>
          <p className="text-[#8B7355] text-lg">QRコードをスキャンするか、店舗IDを入力してください</p>
        </div>
        
        {!qrMode ? (
          <div className="glass restaurant-card p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="store_id" className="block text-sm font-semibold text-[#2C1810]">
                  店舗ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    id="store_id"
                    type="text"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    required
                    placeholder="例: sample-store-001"
                    className="restaurant-input w-full pl-12 pr-4"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl animate-fade-in">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>アクセス中...</span>
                  </span>
                ) : (
                  'メニューを見る'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-[#8B7355]/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/70 text-[#8B7355] font-medium">または</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQrMode(true)}
                className="w-full px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span>QRコードをスキャン</span>
                </span>
              </button>
            </form>
          </div>
        ) : (
          <div className="glass restaurant-card p-8 animate-slide-up space-y-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text mb-2 text-center">QRコードをスキャン</h2>
              <p className="text-[#8B7355] text-center text-sm">
                カメラをQRコードに向けてください
              </p>
            </div>
            <QRCodeReader
              onScanSuccess={handleQrScan}
              onError={(err) => {
                setError(err);
                setQrMode(false);
              }}
            />
            <button
              onClick={() => {
                setQrMode(false);
                setError('');
              }}
              className="w-full px-6 py-3 bg-white border-2 border-[#8B7355] text-[#8B7355] rounded-xl font-bold hover:bg-[#8B7355]/10 transition-all duration-300"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
