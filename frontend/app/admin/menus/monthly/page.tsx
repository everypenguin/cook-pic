'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { resizeForList } from '@/lib/imageUtils';

interface MonthlyMenu {
  id: string;
  menu_name: string;
  category?: string;
  price?: number;
  image_url?: string;
  month: number;
  year: number;
}

const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

export default function MonthlyMenuPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<MonthlyMenu[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchMenus();
  }, [selectedYear, selectedMonth, router]);

  const fetchMenus = async () => {
    try {
      // 管理者用API（認証トークンが必要）
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      const response = await api.get(`/monthly-menus?year=${selectedYear}&month=${selectedMonth}`);
      setMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch monthly menus:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAdd = async () => {
    if (!menuName.trim()) {
      alert('メニュー名を入力してください');
      return;
    }

    try {
      let imageUrl = null;
      if (imageFile) {
        // 画像をリサイズ（一覧表示用、最大800px）
        imageUrl = await resizeForList(imageFile, 800);
      }

      await api.post('/monthly-menus', {
        menu_name: menuName.trim(),
        category: category.trim() || null,
        price: price ? parseInt(price) : null,
        image_url: imageUrl,
        month: selectedMonth,
        year: selectedYear,
      });
      setMenuName('');
      setCategory('');
      setPrice('');
      setImageFile(null);
      setImagePreview('');
      setIsAdding(false);
      fetchMenus();
    } catch (error: any) {
      alert(error.response?.data?.error || '追加に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このメニューを削除しますか？')) {
      return;
    }

    try {
      await api.delete(`/monthly-menus/${id}`);
      fetchMenus();
    } catch (error: any) {
      alert(error.response?.data?.error || '削除に失敗しました');
    }
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-[#007AFF] hover:text-[#0051D5] transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ダッシュボードに戻る
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-[#1C1C1E]">月間メニュー設定</h1>
            <div className="flex space-x-3">
              <Link
                href={`/admin/menus/monthly/csv?year=${selectedYear}&month=${selectedMonth}`}
                className="apple-button-secondary"
              >
                📄 CSV一括登録
              </Link>
              <Link
                href={`/admin/menus/monthly/new?year=${selectedYear}&month=${selectedMonth}`}
                className="apple-button-primary"
              >
                + 新規登録
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-6 animate-slide-up">
          <div className="apple-card p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
                  年
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="apple-input"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
                  月
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="apple-input"
                >
                  {MONTHS.map((month, index) => (
                    <option key={index + 1} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-4">
            {selectedYear}年{selectedMonth}月のメニュー
          </h2>
          
          {menus.length === 0 ? (
            <div className="apple-card p-12 text-center">
              <p className="text-[#8E8E93] text-lg">メニューが設定されていません</p>
              <Link
                href={`/admin/menus/monthly/new?year=${selectedYear}&month=${selectedMonth}`}
                className="inline-block mt-4 apple-button-primary"
              >
                最初のメニューを追加
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="apple-card p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    {menu.image_url && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#F2F2F7]">
                        <img
                          src={menu.image_url}
                          alt={menu.menu_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <p className="text-lg font-semibold text-[#1C1C1E]">{menu.menu_name}</p>
                        {menu.category && (
                          <span className="px-3 py-1 bg-[#F2F2F7] text-[#8E8E93] text-sm rounded-full">
                            {menu.category}
                          </span>
                        )}
                      </div>
                      {menu.price && (
                        <p className="text-[#007AFF] font-semibold mb-3">
                          ¥{menu.price.toLocaleString()}
                        </p>
                      )}
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/admin/menus/monthly/edit/${menu.id}`}
                          className="px-4 py-2 text-[#007AFF] hover:bg-[#F0F8FF] rounded-xl transition-colors text-sm"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
