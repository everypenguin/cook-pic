import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import menuRoutes from './routes/menus';
import weeklyMenuRoutes from './routes/weeklyMenus';
import monthlyMenuRoutes from './routes/monthlyMenus';
import storeRoutes from './routes/stores';
import uploadRoutes from './routes/upload';
import csvImportRoutes from './routes/csvImport';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
// Base64画像を含むリクエストに対応するため、リクエストサイズ制限を50MBに設定
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ルート
app.get('/', (req, res) => {
  res.json({ message: 'Pic_cul API Server' });
});

// 静的ファイル配信（ローカルストレージ用）
app.use('/uploads', express.static('uploads'));

// API ルート
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/weekly-menus', weeklyMenuRoutes);
app.use('/api/monthly-menus', monthlyMenuRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/csv-import', csvImportRoutes);

// エラーハンドリング
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

