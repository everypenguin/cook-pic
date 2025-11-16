export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1C1C1E', marginBottom: '16px' }}>Pic_cul</h1>
          <p style={{ fontSize: '20px', color: '#8E8E93' }}>店舗メニュー管理システム</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* 管理者カード */}
          <a
            href="/admin/login"
            style={{
              display: 'block',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#007AFF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="40" height="40" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1C1C1E', marginBottom: '8px' }}>管理者</h2>
              <p style={{ color: '#8E8E93', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                メニューの登録・編集・削除ができます
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#007AFF' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', marginRight: '8px' }}>ログイン</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>

          {/* ユーザーカード */}
          <a
            href="/user/access"
            style={{
              display: 'block',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#34C759', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="40" height="40" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1C1C1E', marginBottom: '8px' }}>利用者</h2>
              <p style={{ color: '#8E8E93', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                店舗メニューを閲覧できます
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#34C759' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', marginRight: '8px' }}>メニューを見る</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        </div>

        {/* フッター */}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#8E8E93' }}>
            店舗メニューを簡単に管理・閲覧できるシステム
          </p>
        </div>
      </div>
    </div>
  );
}
