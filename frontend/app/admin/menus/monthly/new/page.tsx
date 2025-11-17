'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { resizeForList } from '@/lib/imageUtils';

const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

function NewMonthlyMenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  const [category, setCategory] = useState('');
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(yearParam ? parseInt(yearParam) : new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(monthParam ? parseInt(monthParam) : new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!menuName.trim()) {
      setError('メニュー名を入力してください');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        // 画像をリサイズ（一覧表示用、最大800px）
        const resizedImage = await resizeForList(imageFile, 800);
        
        // 画像をSupabase Storageにアップロード
        try {
          const uploadResponse = await api.post('/upload/image/base64', {
            base64: resizedImage,
            filename: imageFile.name || `monthly-menu-${Date.now()}.jpg`,
          });
          
          if (uploadResponse.data?.url) {
            imageUrl = uploadResponse.data.url;
          } else {
            console.warn('画像アップロードのURLが取得できませんでした。Base64を直接使用します。');
            imageUrl = resizedImage;
          }
        } catch (uploadError: any) {
          console.error('画像アップロードエラー:', uploadError);
          const uploadErrorMsg = uploadError.response?.data?.error || uploadError.message || '画像のアップロードに失敗しました';
          console.warn('画像アップロードに失敗しましたが、Base64を直接使用して続行します。', uploadErrorMsg);
          imageUrl = resizedImage;
        }
      }

      await api.post('/monthly-menus', {
        menu_name: menuName.trim(),
        category: category.trim() || null,
        price: price ? parseInt(price) : null,
        image_url: imageUrl,
        month: selectedMonth,
        year: selectedYear,
      });

      router.push('/admin/menus/monthly');
    } catch (err: any) {
      console.error('メニュー登録エラー:', err);
      let errorMsg = 'メニューの登録に失敗しました';
      
      if (err.response) {
        errorMsg = err.response.data?.error || err.response.data?.details || `HTTP ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMsg = 'ネットワークエラー: サーバーに接続できませんでした。';
      } else {
        errorMsg = err.message || 'リクエストの送信に失敗しました';
      }
      
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Link
            href="/admin/menus/monthly"
            className="inline-flex items-center text-[#007AFF] hover:text-[#0051D5] transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            月間メニューに戻る
          </Link>
          <h1 className="text-4xl font-bold text-[#1C1C1E]">月間メニューを登録</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {/* 年月選択 */}
          <div className="apple-card p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
                  年 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="apple-input"
                  required
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
                  月 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="apple-input"
                  required
                >
                  {MONTHS.map((month, index) => (
                    <option key={index + 1} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 画像プレビュー */}
          <div className="apple-card p-6">
            <label className="block text-sm font-semibold text-[#8E8E93] mb-4 uppercase tracking-wide">
              メニュー写真（任意）
            </label>
            <div className="w-full aspect-square bg-[#F2F2F7] rounded-2xl overflow-hidden relative group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#8E8E93]">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">画像を選択してください（任意）</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* カテゴリー */}
          <div className="apple-card p-6">
            <label htmlFor="category" className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
              カテゴリー
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例: ランチ、ディナー、デザート"
              className="apple-input"
            />
          </div>

          {/* メニュー名 */}
          <div className="apple-card p-6">
            <label htmlFor="menuName" className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
              メニュー名 <span className="text-red-500">*</span>
            </label>
            <input
              id="menuName"
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              required
              placeholder="例: 本日のランチセット"
              className="apple-input"
            />
          </div>

          {/* 価格 */}
          <div className="apple-card p-6">
            <label htmlFor="price" className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
              価格（円）
            </label>
            <div className="relative">
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                placeholder="例: 1200"
                className="apple-input pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93]">円</span>
            </div>
          </div>

          {error && (
            <div className="apple-card p-4 bg-red-50 border border-red-200 animate-fade-in">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 apple-button-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 apple-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登録中...
                </span>
              ) : (
                '登録する'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewMonthlyMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">読み込み中...</div>}>
      <NewMonthlyMenuContent />
    </Suspense>
  );
}

