'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function WeeklyMenuCsvPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekStartDate = searchParams.get('week') || getWeekStartDate(new Date());

  const [file, setFile] = useState<File | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(weekStartDate);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('CSVファイルを選択してください');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) {
      setError('CSVファイルを選択してください');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('week_start_date', selectedWeek);

      const response = await api.post('/csv-import/weekly', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      if (response.data.success > 0) {
        setTimeout(() => {
          router.push('/admin/menus/weekly');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'CSVのインポートに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = '曜日,カテゴリー,メニュー名,価格\n1,ランチ,本日のランチセット,1200\n2,ディナー,本日のディナー,2500';
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '週間メニュー_テンプレート.csv';
    link.click();
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
          <h1 className="text-4xl font-bold text-[#1C1C1E]">CSV一括登録</h1>
          <p className="text-[#8E8E93] mt-2">週間メニューをCSVファイルで一括登録できます</p>
        </div>

        <div className="space-y-6 animate-slide-up">
          {/* CSVフォーマット説明 */}
          <div className="apple-card p-6">
            <h2 className="text-xl font-bold text-[#1C1C1E] mb-4">CSVフォーマット</h2>
            <div className="bg-[#F2F2F7] rounded-xl p-4 mb-4">
              <code className="text-sm text-[#1C1C1E]">
                曜日,カテゴリー,メニュー名,価格<br />
                1,ランチ,本日のランチセット,1200<br />
                2,ディナー,本日のディナー,2500
              </code>
            </div>
            <div className="space-y-2 text-sm text-[#8E8E93]">
              <p><strong className="text-[#1C1C1E]">曜日:</strong> 0=日曜日、1=月曜日、2=火曜日...6=土曜日</p>
              <p><strong className="text-[#1C1C1E]">カテゴリー:</strong> 任意（例: ランチ、ディナー、デザート）</p>
              <p><strong className="text-[#1C1C1E]">メニュー名:</strong> 必須</p>
              <p><strong className="text-[#1C1C1E]">価格:</strong> 任意（数値のみ）</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="mt-4 apple-button-secondary"
            >
              📥 テンプレートをダウンロード
            </button>
          </div>

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

          {/* ファイル選択 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="apple-card p-6">
              <label className="block text-sm font-semibold text-[#8E8E93] mb-3 uppercase tracking-wide">
                CSVファイル <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-[#C6C6C8] rounded-xl p-8 text-center hover:border-[#007AFF] transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                  id="csv-file"
                />
                <label htmlFor="csv-file" className="cursor-pointer">
                  {file ? (
                    <div>
                      <p className="text-[#1C1C1E] font-semibold">{file.name}</p>
                      <p className="text-[#8E8E93] text-sm mt-2">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 mx-auto mb-4 text-[#8E8E93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-[#1C1C1E] font-semibold">CSVファイルを選択</p>
                      <p className="text-[#8E8E93] text-sm mt-2">またはドラッグ&ドロップ</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="apple-card p-4 bg-red-50 border border-red-200 animate-fade-in">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className={`apple-card p-6 animate-fade-in ${result.errors > 0 ? 'border-2 border-yellow-300' : 'border-2 border-green-300'}`}>
                <h3 className="text-lg font-bold text-[#1C1C1E] mb-4">インポート結果</h3>
                <div className="space-y-2">
                  <p className="text-green-600">✅ 成功: {result.success}件</p>
                  {result.errors > 0 && (
                    <p className="text-red-600">❌ エラー: {result.errors}件</p>
                  )}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 bg-red-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-red-600 mb-2">エラー詳細:</p>
                      <ul className="text-sm text-red-600 space-y-1">
                        {result.errors.map((err: string, index: number) => (
                          <li key={index}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {result.success > 0 && (
                  <p className="text-[#8E8E93] text-sm mt-4">2秒後に週間メニューページにリダイレクトします...</p>
                )}
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
                disabled={loading || !file}
                className="flex-1 apple-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    インポート中...
                  </span>
                ) : (
                  'インポート'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}






