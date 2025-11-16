import express from 'express';
import { MonthlyMenuModel } from '../models/MonthlyMenu';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// B-3: 月間メニュー設定（取得、管理者用）- 認証が必要なルートを先に定義
router.get('/', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

    const menus = await MonthlyMenuModel.findByStoreIdAndMonth(req.storeId!, year, month);
    res.json(menus);
  } catch (error) {
    console.error('Get monthly menus error:', error);
    res.status(500).json({ error: '月間メニューの取得に失敗しました' });
  }
});

// 月間メニュー取得（ユーザー用、認証不要）- パラメータ付きルートは後
router.get('/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

    const menus = await MonthlyMenuModel.findByStoreIdAndMonth(store_id, year, month);
    res.json(menus);
  } catch (error) {
    console.error('Get monthly menus error:', error);
    res.status(500).json({ error: '月間メニューの取得に失敗しました' });
  }
});

// B-3: 月間メニュー設定（作成）
router.post('/', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { menu_name, category, price, image_url, month, year } = req.body;

    if (!menu_name || !month || !year) {
      return res.status(400).json({ error: 'メニュー名、月、年が必要です' });
    }

    const menu = await MonthlyMenuModel.create({
      store_id: req.storeId!,
      menu_name,
      category: category || null,
      price: price ? parseInt(price) : null,
      image_url: image_url || null,
      month: parseInt(month),
      year: parseInt(year),
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error('Create monthly menu error:', error);
    res.status(500).json({ error: '月間メニューの設定に失敗しました' });
  }
});

// B-3: 月間メニュー設定（更新）
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // まずメニューを取得して権限を確認
    const allMenus = await MonthlyMenuModel.findByStoreId(req.storeId!);
    const targetMenu = allMenus.find(m => m.id === id);

    if (!targetMenu) {
      return res.status(404).json({ error: 'メニューが見つかりません' });
    }

    const updatedMenu = await MonthlyMenuModel.update(id, req.body);
    res.json(updatedMenu);
  } catch (error) {
    console.error('Update monthly menu error:', error);
    res.status(500).json({ error: '月間メニューの更新に失敗しました' });
  }
});

// B-3: 月間メニュー設定（削除）
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await MonthlyMenuModel.delete(id);
    res.json({ message: '月間メニューを削除しました' });
  } catch (error) {
    console.error('Delete monthly menu error:', error);
    res.status(500).json({ error: '月間メニューの削除に失敗しました' });
  }
});

// C-3: 月間メニュー表示（公開）
router.get('/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

    const menus = await MonthlyMenuModel.findByStoreIdAndMonth(store_id, year, month);
    res.json(menus);
  } catch (error) {
    console.error('Get monthly menus error:', error);
    res.status(500).json({ error: '月間メニューの取得に失敗しました' });
  }
});

export default router;

