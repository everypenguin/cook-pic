'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type MenuType = 'daily' | 'weekly' | 'monthly';

interface CategoryOption {
  id: string;
  name: string;
}

interface DailyMenuItem {
  id: string;
  category_id: string;
  name: string;
  price: string;
}

const MENU_TABS: { value: MenuType; label: string; description: string }[] = [
  { value: 'daily', label: '日間メニュー', description: '本日のメニューをまとめて登録' },
  { value: 'weekly', label: '週間メニュー', description: '曜日ごとのメニューを設定' },
  { value: 'monthly', label: '月間メニュー', description: 'カレンダー表示用のメニューを登録' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: '日曜日' },
  { value: 1, label: '月曜日' },
  { value: 2, label: '火曜日' },
  { value: 3, label: '水曜日' },
  { value: 4, label: '木曜日' },
  { value: 5, label: '金曜日' },
  { value: 6, label: '土曜日' },
];

const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, idx) => new Date().getFullYear() - 2 + idx);

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function MenuSettingsContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const initialType = useMemo<MenuType>(() => {
    const typeParam = searchParams?.get('type');
    if (typeParam === 'weekly' || typeParam === 'monthly') return typeParam;
    return 'daily';
  }, [searchParams]);

  const [menuType, setMenuType] = useState<MenuType>(initialType);

  useEffect(() => {
    setMenuType(initialType);
  }, [initialType]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/stores/categories');
        setCategories(response.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const defaultWeekStart = searchParams?.get('weekStart') || searchParams?.get('week') || getWeekStartDate(new Date());
  const defaultDay = searchParams?.get('day') ? parseInt(searchParams.get('day') as string, 10) : 1;
  const defaultYear = searchParams?.get('year') ? parseInt(searchParams.get('year') as string, 10) : new Date().getFullYear();
  const defaultMonth = searchParams?.get('month') ? parseInt(searchParams.get('month') as string, 10) : new Date().getMonth() + 1;

  return (
    <div className="min-h-screen bg-base-off">
      <div className="max-w-4xl mx-auto px-4 py-section">
        <div className="mb-section animate-fade-in">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-element"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </Link>
          <h1 className="text-4xl font-bold text-text mb-2">メニュー設定</h1>
          <p className="text-text-light">日間・週間・月間メニューを1画面で登録できます。</p>
        </div>

        <div className="restaurant-card restaurant-card-store-admin p-element mb-section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MENU_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setMenuType(tab.value)}
                className={`p-4 rounded-lg text-left transition-all ${
                  menuType === tab.value
                    ? 'border-2 border-store-admin-primary bg-store-admin-primary/5 text-store-admin-primary'
                    : 'border border-gray-200 hover:border-store-admin-primary/40'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-wide mb-1">{tab.label}</p>
                <p className="text-sm text-text-light">{tab.description}</p>
              </button>
            ))}
          </div>
        </div>

        {menuType === 'daily' && <DailyMenuForm categories={categories} />}
        {menuType === 'weekly' && (
          <WeeklyMenuForm
            categories={categories}
            defaultWeekStart={defaultWeekStart}
            defaultDayOfWeek={defaultDay}
          />
        )}
        {menuType === 'monthly' && (
          <MonthlyMenuForm
            categories={categories}
            defaultYear={defaultYear}
            defaultMonth={defaultMonth}
          />
        )}
      </div>
    </div>
  );
}

export default function NewMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base-off flex items-center justify-center text-text-light">読み込み中...</div>}>
      <MenuSettingsContent />
    </Suspense>
  );
}

function DailyMenuForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [items, setItems] = useState<DailyMenuItem[]>([
    {
      id: Date.now().toString(),
      category_id: '',
      name: '',
      price: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    if (categories.length === 0) return;
    setItems((prev) =>
      prev.map((item) =>
        item.category_id ? item : { ...item, category_id: categories[0].id }
      )
    );
  }, [categories]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        category_id: categories[0]?.id || '',
        name: '',
        price: '',
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof DailyMenuItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessCount(0);

    const invalid = items.filter((item) => !item.name.trim());
    if (invalid.length) {
      setError('すべてのメニューで「メニュー名」を入力してください。');
      return;
    }

    setLoading(true);

    try {
      const date = new Date().toISOString();
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          await api.post('/menus/daily', {
            category_id: item.category_id || null,
            name: item.name.trim(),
            price: item.price ? parseInt(item.price, 10) : null,
            image_url: null,
            date,
          });
          success++;
          setSuccessCount(success);
        } catch (err: any) {
          failed++;
          const message =
            err.response?.data?.error ||
            err.response?.data?.details ||
            err.message ||
            '登録に失敗しました';
          errors.push(`メニュー${i + 1}: ${message}`);
        }

        if (i < items.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
      }

      if (failed > 0) {
        setError(`${success}件登録・${failed}件失敗\n${errors.join('\n')}`);
        setLoading(false);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error(error);
      setError('メニューの投稿に失敗しました');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-element animate-slide-up">
      {items.map((item, index) => (
        <div key={item.id} className="apple-card p-element relative">
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="absolute top-4 right-4 text-text-light hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <p className="text-lg font-semibold text-text mb-4">メニュー {index + 1}</p>

          <div className="mb-element">
            <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
              カテゴリー
            </label>
            {categories.length ? (
              <select
                value={item.category_id}
                onChange={(e) => updateItem(item.id, 'category_id', e.target.value)}
                className="apple-input"
              >
                <option value="">未分類</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-text-light">
                カテゴリーがありません。<Link href="/admin/profile" className="text-primary underline">プロフィール</Link>から追加できます。
              </p>
            )}
          </div>

          <div className="mb-element">
            <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
              メニュー名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              className="apple-input"
              placeholder="例: 本日のランチセット"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
              価格（円）
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={item.price}
                onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                className="apple-input pr-12"
                placeholder="例: 1200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light">円</span>
            </div>
          </div>
        </div>
      ))}

      {items.length < 10 && (
        <button type="button" onClick={addItem} className="w-full apple-button-secondary py-4">
          + メニューを追加（{items.length}/10）
        </button>
      )}

      {error && (
        <div className="apple-card p-4 bg-red-50 border border-red-200 animate-fade-in">
          <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
        </div>
      )}

      {loading && successCount > 0 && (
        <div className="apple-card p-4 bg-blue-50 border border-blue-200 animate-fade-in">
          <p className="text-blue-600 text-sm">
            {successCount}/{items.length} 件を登録しました...
          </p>
        </div>
      )}

      <div className="flex space-x-4 pt-element">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 apple-button-secondary"
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 apple-button-primary disabled:opacity-50"
        >
          {loading ? '投稿中...' : `すべて投稿する（${items.length}件）`}
        </button>
      </div>
    </form>
  );
}

function WeeklyMenuForm({
  categories,
  defaultWeekStart,
  defaultDayOfWeek,
}: {
  categories: CategoryOption[];
  defaultWeekStart: string;
  defaultDayOfWeek: number;
}) {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(defaultWeekStart);
  const [dayOfWeek, setDayOfWeek] = useState(defaultDayOfWeek);
  const [categoryId, setCategoryId] = useState('');
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!menuName.trim()) {
      setError('メニュー名を入力してください。');
      return;
    }

    setLoading(true);
    try {
      await api.post('/weekly-menus', {
        day_of_week: dayOfWeek,
        menu_name: menuName.trim(),
        category_id: categoryId || null,
        price: price ? parseInt(price, 10) : null,
        image_url: null,
        week_start_date: weekStart,
      });
      router.push(`/admin/menus/weekly?week=${weekStart}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || '登録に失敗しました');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-element animate-slide-up">
      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          週の開始日（月曜日） <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          className="apple-input"
          required
        />
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-element uppercase tracking-wide">
          曜日 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => setDayOfWeek(day.value)}
              className={`py-3 rounded-lg border-2 transition-all ${
                dayOfWeek === day.value
                  ? 'border-store-admin-primary bg-store-admin-primary/5 text-store-admin-primary'
                  : 'border-gray-200 hover:border-store-admin-primary/40'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          カテゴリー
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="apple-input"
        >
          <option value="">未分類</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          メニュー名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          className="apple-input"
          placeholder="例: 週替わりパスタ"
          required
        />
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          価格（円）
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="apple-input pr-12"
            placeholder="例: 1200"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light">円</span>
        </div>
      </div>

      {error && (
        <div className="apple-card p-4 bg-red-50 border border-red-200 animate-fade-in">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex space-x-4 pt-element">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 apple-button-secondary"
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 apple-button-primary disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録する'}
        </button>
      </div>
    </form>
  );
}

function MonthlyMenuForm({
  categories,
  defaultYear,
  defaultMonth,
}: {
  categories: CategoryOption[];
  defaultYear: number;
  defaultMonth: number;
}) {
  const router = useRouter();
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [categoryId, setCategoryId] = useState('');
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!menuName.trim()) {
      setError('メニュー名を入力してください。');
      return;
    }

    setLoading(true);
    try {
      await api.post('/monthly-menus', {
        menu_name: menuName.trim(),
        category_id: categoryId || null,
        price: price ? parseInt(price, 10) : null,
        image_url: null,
        month,
        year,
      });
      router.push(`/admin/menus/monthly?year=${year}&month=${month}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || '登録に失敗しました');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-element animate-slide-up">
      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          年 <span className="text-red-500">*</span>
        </label>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="apple-input"
          required
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          月 <span className="text-red-500">*</span>
        </label>
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="apple-input"
          required
        >
          {MONTHS.map((label, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          カテゴリー
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="apple-input"
        >
          <option value="">未分類</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          メニュー名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          className="apple-input"
          placeholder="例: 季節のスペシャルプレート"
          required
        />
      </div>

      <div className="apple-card p-element">
        <label className="block text-sm font-semibold text-text-light mb-2 uppercase tracking-wide">
          価格（円）
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="apple-input pr-12"
            placeholder="例: 1500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light">円</span>
        </div>
      </div>

      {error && (
        <div className="apple-card p-4 bg-red-50 border border-red-200 animate-fade-in">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex space-x-4 pt-element">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 apple-button-secondary"
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 apple-button-primary disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録する'}
        </button>
      </div>
    </form>
  );
}

