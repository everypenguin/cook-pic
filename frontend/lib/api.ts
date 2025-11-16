import axios from 'axios';

// Next.js API Routesを使用（Vercelデプロイ時は自動的に/apiがベースURLになる）
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60秒のタイムアウト（大きな画像のアップロードに対応）
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// リクエストインターセプター（認証トークンを追加）
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;






