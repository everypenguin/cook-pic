'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { resizeForList } from '@/lib/imageUtils';

interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: string;
  imageFile: File | null;
  imagePreview: string;
}

export default function NewMenuPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: Date.now().toString(),
      category: '',
      name: '',
      price: '',
      imageFile: null,
      imagePreview: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(0);

  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      {
        id: Date.now().toString(),
        category: '',
        name: '',
        price: '',
        imageFile: null,
        imagePreview: '',
      },
    ]);
  };

  const removeMenuItem = (id: string) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((item) => item.id !== id));
    }
  };

  const updateMenuItem = (id: string, field: keyof MenuItem, value: string | File | null) => {
    setMenuItems(
      menuItems.map((item) => {
        if (item.id === id) {
          if (field === 'imageFile' && value instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setMenuItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, imagePreview: reader.result as string } : i))
              );
            };
            reader.readAsDataURL(value);
            return { ...item, imageFile: value };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateMenuItem(id, 'imageFile', file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessCount(0);

    // バリデーション
    const invalidItems = menuItems.filter(
      (item) => !item.imageFile || !item.name.trim() || !item.price || parseInt(item.price) <= 0
    );

    if (invalidItems.length > 0) {
      setError('すべてのメニュー項目で、画像、メニュー名、価格を正しく入力してください');
      return;
    }

    setLoading(true);

    try {
      const date = new Date().toISOString();
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      // 各メニューを順番に登録
      for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        try {
          // 画像をリサイズ（一覧表示用、最大800px）
          const resizedImage = await resizeForList(item.imageFile!, 800);

          // Base64画像のサイズをチェック（10MB制限）
          if (resizedImage.length > 10 * 1024 * 1024) {
            throw new Error('画像サイズが大きすぎます。別の画像を選択してください。');
          }

          // 画像をSupabase Storageにアップロード
          let imageUrl = resizedImage; // フォールバック用
          try {
            const uploadResponse = await api.post('/upload/image/base64', {
              base64: resizedImage,
              filename: item.imageFile?.name || `menu-${Date.now()}-${i}.jpg`,
            });
            
            if (uploadResponse.data?.url) {
              imageUrl = uploadResponse.data.url;
              console.log('画像アップロード成功:', imageUrl);
            } else {
              console.warn('画像アップロードのURLが取得できませんでした。Base64を直接使用します。');
            }
          } catch (uploadError: any) {
            console.error('画像アップロードエラー:', uploadError);
            const uploadErrorMsg = uploadError.response?.data?.error || uploadError.message || '画像のアップロードに失敗しました';
            console.warn('画像アップロードに失敗しましたが、Base64を直接使用して続行します。', uploadErrorMsg);
            // エラーを記録するが、処理は続行（Base64を使用）
          }

          await api.post('/menus/daily', {
            category: item.category.trim() || null,
            name: item.name.trim(),
            price: parseInt(item.price),
            image_url: imageUrl,
            date: date,
          });

          success++;
          setSuccessCount(success);
          
          // 複数リクエストの負荷を軽減するため、少し待機（最後のリクエスト以外）
          if (i < menuItems.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms待機
          }
        } catch (err: any) {
          failed++;
          let errorMsg = '登録に失敗しました';
          
          if (err.response) {
            // サーバーからの応答がある場合
            const responseError = err.response.data?.error || err.response.data?.details || err.response.statusText;
            errorMsg = `HTTP ${err.response.status}: ${responseError}`;
            console.error(`メニュー${i + 1} 登録エラー:`, {
              status: err.response.status,
              error: err.response.data,
              menuName: item.name,
            });
          } else if (err.request) {
            // リクエストは送信されたが、応答がない場合（Network Error）
            errorMsg = 'ネットワークエラー: サーバーに接続できませんでした。';
            console.error('Network Error details:', {
              message: err.message,
              code: err.code,
              config: {
                url: err.config?.url,
                method: err.config?.method,
                baseURL: err.config?.baseURL,
              }
            });
          } else {
            // リクエスト設定中にエラーが発生した場合
            errorMsg = err.message || 'リクエストの送信に失敗しました';
            console.error('Request setup error:', err);
          }
          
          errors.push(`メニュー${i + 1} (${item.name || '無名'}): ${errorMsg}`);
        }
      }

      if (failed > 0) {
        setError(
          `${success}件の登録に成功しましたが、${failed}件の登録に失敗しました。\n${errors.join('\n')}`
        );
        setLoading(false);
      } else {
        // すべて成功した場合、ダッシュボードに遷移
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      console.error('Menu creation error:', err);
      setError('メニューの投稿に失敗しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <div className="max-w-2xl mx-auto px-4 py-8">
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
            <h1 className="text-4xl font-bold text-[#1C1C1E]">日間メニューを投稿</h1>
            <button
              type="button"
              onClick={addMenuItem}
              className="apple-button-secondary text-sm px-4 py-2"
            >
              + メニューを追加
            </button>
          </div>
          <p className="text-[#8E8E93] mt-2">複数のメニューを一度に登録できます（最大10件）</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {menuItems.map((item, index) => (
            <div key={item.id} className="apple-card p-6 relative">
              {/* 削除ボタン */}
              {menuItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMenuItem(item.id)}
                  className="absolute top-4 right-4 text-[#8E8E93] hover:text-red-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="mb-4">
                <span className="text-lg font-bold text-[#1C1C1E]">メニュー {index + 1}</span>
              </div>

              {/* 画像プレビュー */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#8E8E93] mb-2 uppercase tracking-wide">
                  メニュー写真 <span className="text-red-500">*</span>
                </label>
                <div className="w-full aspect-square bg-[#F2F2F7] rounded-2xl overflow-hidden relative group">
                  {item.imagePreview ? (
                    <img
                      src={item.imagePreview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8E8E93]">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">画像を選択してください</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(item.id, e)}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* カテゴリー */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#8E8E93] mb-2 uppercase tracking-wide">
                  カテゴリー
                </label>
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => updateMenuItem(item.id, 'category', e.target.value)}
                  placeholder="例: ランチ、ディナー、デザート"
                  className="apple-input"
                />
              </div>

              {/* メニュー名 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#8E8E93] mb-2 uppercase tracking-wide">
                  メニュー名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                  required
                  placeholder="例: 本日のランチセット"
                  className="apple-input"
                />
              </div>

              {/* 価格 */}
              <div>
                <label className="block text-sm font-semibold text-[#8E8E93] mb-2 uppercase tracking-wide">
                  価格（円） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)}
                    required
                    min="0"
                    placeholder="例: 1200"
                    className="apple-input pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93]">円</span>
                </div>
              </div>
            </div>
          ))}

          {/* メニュー追加ボタン（下部） */}
          {menuItems.length < 10 && (
            <button
              type="button"
              onClick={addMenuItem}
              className="w-full apple-button-secondary py-4"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                メニューを追加（{menuItems.length}/10）
              </span>
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
                {successCount}/{menuItems.length} 件の登録が完了しました...
              </p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
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
              className="flex-1 apple-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {successCount > 0 ? `投稿中... (${successCount}/${menuItems.length})` : '投稿中...'}
                </span>
              ) : (
                `すべて投稿する (${menuItems.length}件)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
