'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { resizeForList } from '@/lib/imageUtils';

const DAYS_OF_WEEK = [
  { value: 0, label: '日曜日' },
  { value: 1, label: '月曜日' },
  { value: 2, label: '火曜日' },
  { value: 3, label: '水曜日' },
  { value: 4, label: '木曜日' },
  { value: 5, label: '金曜日' },
  { value: 6, label: '土曜日' },
];

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function NewWeeklyMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dayOfWeek = searchParams.get('day') ? parseInt(searchParams.get('day')!) : null;
  const weekStartDate = searchParams.get('week') || getWeekStartDate(new Date());

  const [category, setCategory] = useState('');
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(dayOfWeek ?? 1);
  const [selectedWeek, setSelectedWeek] = useState(weekStartDate);
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
        imageUrl = await resizeForList(imageFile, 800);
      }

      await api.post('/weekly-menus', {
        day_of_week: selectedDay,
        menu_name: menuName.trim(),
        category: category.trim() || null,
        price: price ? parseInt(price) : null,
        image_url: imageUrl,
        week_start_date: selectedWeek,
      });

      router.push('/admin/menus/weekly');
    } catch (err: any) {
      setError(err.response?.data?.error || 'メニューの登録に失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Link
            href="/admin/menus/weekly"
            className="inline-flex items-center text-[#007AFF] hover:text-[#0051D5] transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            週間メニューに戻る
          </Link>
          <h1 className="text-4xl font-bold text-[#1C1C1E]">週間メニューを登録</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {/* 週の開始日 */}
          <div className="apple-card p-6">
            <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
              週の開始日（月曜日）
            </label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="apple-input"
              required
            />
          </div>

          {/* 曜日選択 */}
          <div className="apple-card p-6">
            <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
              曜日 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setSelectedDay(day.value)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedDay === day.value
                      ? 'border-[#007AFF] bg-[#F0F8FF] text-[#007AFF]'
                      : 'border-[#C6C6C8] bg-white text-[#1C1C1E] hover:border-[#007AFF]'
                  }`}
                >
                  {day.label}
                </button>
              ))}
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

