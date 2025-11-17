'use client';

export default function HomePage() {
  return (
    <div className="min-h-screen particle-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* ヘッダー */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-button mb-8 animate-float">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">Pic_cul</h1>
          <p className="text-xl md:text-2xl text-[#8B7355] font-medium">店舗メニュー管理システム</p>
          <p className="text-base text-[#8B7355]/70 mt-2">美味しい管理を、もっと簡単に</p>
        </div>

        {/* メインカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* システム管理者カード */}
          <a
            href="/system-admin/login"
            className="restaurant-card p-8 group animate-slide-up border-2 border-transparent hover:border-purple-300/50"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#2C1810] mb-3 group-hover:gradient-text transition-all">システム管理者</h2>
              <p className="text-[#8B7355] text-sm leading-relaxed mb-6">
                店舗管理・ユーザー管理ができます
              </p>
              <div className="flex items-center justify-center space-x-2 text-purple-600 font-semibold group-hover:text-purple-700 transition-colors">
                <span>ログイン</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

          {/* 店舗管理者カード */}
          <a
            href="/admin/login"
            className="restaurant-card p-8 group animate-slide-up border-2 border-transparent hover:border-blue-300/50"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#2C1810] mb-3 group-hover:gradient-text transition-all">店舗管理</h2>
              <p className="text-[#8B7355] text-sm leading-relaxed mb-6">
                メニューの登録・編集・削除ができます
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                <span>ログイン</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

          {/* ユーザーカード */}
          <a
            href="/user/access"
            className="restaurant-card p-8 group animate-slide-up border-2 border-transparent hover:border-green-300/50"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#2C1810] mb-3 group-hover:gradient-text transition-all">利用者</h2>
              <p className="text-[#8B7355] text-sm leading-relaxed mb-6">
                店舗メニューを閲覧できます
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                <span>メニューを見る</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        </div>

        {/* フッター */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-[#8B7355] mb-8 text-lg">
            店舗メニューを簡単に管理・閲覧できるシステム
          </p>
          
          {/* ログインページへの直接リンク */}
          <div className="glass restaurant-card p-6 inline-block">
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/system-admin/login"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>システム管理者</span>
              </a>
              <span className="text-[#8B7355]/40 self-center">|</span>
              <a
                href="/admin/login"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>店舗管理</span>
              </a>
              <span className="text-[#8B7355]/40 self-center">|</span>
              <a
                href="/user/access"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>利用者アクセス</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
