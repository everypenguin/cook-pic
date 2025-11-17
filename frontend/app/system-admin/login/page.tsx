'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SystemAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('=== Login Request ===');
      console.log('Endpoint: /auth/system-admin/login-supabase-auth');
      console.log('Email:', email);
      
      const response = await api.post('/auth/system-admin/login-supabase-auth', {
        email,
        password,
      });
      
      console.log('=== Login Success ===');
      console.log('Response:', response.data);

      localStorage.setItem('system_admin_token', response.data.token);
      localStorage.setItem('system_admin', JSON.stringify(response.data.admin));
      router.push('/system-admin/dashboard');
    } catch (err: any) {
      console.error('=== Login Error ===');
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      
      const errorMessage = err.response?.data?.error || err.response?.data?.details || 'ログインに失敗しました';
      const errorDetails = err.response?.data?.details;
      const errorSolution = err.response?.data?.solution;
      
      let fullError = errorMessage;
      if (errorDetails && errorDetails !== errorMessage) {
        fullError += '\n\n' + errorDetails;
      }
      if (errorSolution) {
        fullError += '\n\n解決方法: ' + errorSolution;
      }
      
      setError(fullError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-system-admin particle-bg-system-admin flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* ロゴ・タイトルエリア */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-button gradient-button-system-admin mb-6 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text gradient-text-system-admin mb-3">システム管理者</h1>
          <p className="text-[#2C1810] text-lg font-semibold">美味しい管理を、もっと簡単に</p>
        </div>

        {/* ログインフォーム */}
        <div className="glass restaurant-card restaurant-card-system-admin p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl whitespace-pre-wrap animate-fade-in">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-[#2C1810]">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#2C1810]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="restaurant-input restaurant-input-system-admin w-full pl-12 pr-4"
                  placeholder="admin@admin.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-[#2C1810]">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#2C1810]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="restaurant-input restaurant-input-system-admin w-full pl-12 pr-4"
                  placeholder="パスワードを入力"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-primary-system-admin w-full text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ログイン中...</span>
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>
        </div>

        {/* フッターリンク */}
        <div className="mt-8 text-center animate-fade-in">
          <a
            href="/admin/login"
            className="inline-flex items-center space-x-2 text-[#2C1810] hover:text-[#FF6B35] transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>店舗管理者ログインへ</span>
          </a>
        </div>
      </div>
    </div>
  );
}
