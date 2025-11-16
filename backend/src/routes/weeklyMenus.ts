import express from 'express';
import { WeeklyMenuModel } from '../models/WeeklyMenu';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// B-2: 週間メニュー設定（取得、管理者用）- 認証が必要なルートを先に定義
router.get('/', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const weekStartDate = req.query.week_start_date 
      ? new Date(req.query.week_start_date as string)
      : getWeekStartDate(new Date());

    const menus = await WeeklyMenuModel.findByStoreIdAndWeek(req.storeId!, weekStartDate);
    res.json(menus);
  } catch (error) {
    console.error('Get weekly menus error:', error);
    res.status(500).json({ error: '週間メニューの取得に失敗しました' });
  }
});

// B-2: 週間メニュー設定（作成・更新）
router.post('/', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { day_of_week, menu_name, category, price, image_url, week_start_date } = req.body;

    if (day_of_week === undefined || !menu_name || !week_start_date) {
      return res.status(400).json({ error: '曜日、メニュー名、週開始日が必要です' });
    }

    const menu = await WeeklyMenuModel.create({
      store_id: req.storeId!,
      day_of_week: parseInt(day_of_week),
      menu_name,
      category: category || null,
      price: price ? parseInt(price) : null,
      image_url: image_url || null,
      week_start_date: new Date(week_start_date),
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error('Create weekly menu error:', error);
    res.status(500).json({ error: '週間メニューの設定に失敗しました' });
  }
});

// B-2: 週間メニュー設定（更新）
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // まずメニューを取得して権限を確認
    const allMenus = await WeeklyMenuModel.findByStoreId(req.storeId!);
    const targetMenu = allMenus.find(m => m.id === id);

    if (!targetMenu) {
      return res.status(404).json({ error: 'メニューが見つかりません' });
    }

    const updatedMenu = await WeeklyMenuModel.update(id, req.body);
    res.json(updatedMenu);
  } catch (error) {
    console.error('Update weekly menu error:', error);
    res.status(500).json({ error: '週間メニューの更新に失敗しました' });
  }
});

// B-2: 週間メニュー設定（削除）
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await WeeklyMenuModel.delete(id);
    res.json({ message: '週間メニューを削除しました' });
  } catch (error) {
    console.error('Delete weekly menu error:', error);
    res.status(500).json({ error: '週間メニューの削除に失敗しました' });
  }
});

// C-2: 週間メニュー表示（公開、ユーザー用）- パラメータ付きルートは最後
router.get('/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params;
    const weekStartDate = req.query.week_start_date 
      ? new Date(req.query.week_start_date as string)
      : getWeekStartDate(new Date());

    const menus = await WeeklyMenuModel.findByStoreIdAndWeek(store_id, weekStartDate);
    res.json(menus);
  } catch (error) {
    console.error('Get weekly menus error:', error);
    res.status(500).json({ error: '週間メニューの取得に失敗しました' });
  }
});

export default router;
