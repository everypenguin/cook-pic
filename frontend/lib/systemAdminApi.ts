import axios from 'axios';

// Next.js API Routesを使用（Vercelデプロイ時は自動的に/apiがベースURLになる）
// NEXT_PUBLIC_API_URLがSupabaseのURLになっている場合は、/apiに強制設定
let API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// SupabaseのURLが設定されている場合は、/apiに強制設定
if (API_URL.includes('supabase.co') || API_URL.startsWith('http')) {
  console.warn('NEXT_PUBLIC_API_URLが外部URLに設定されています。/apiに変更します。');
  API_URL = '/api';
}

const systemAdminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンを追加）
systemAdminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('system_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default systemAdminApi;

