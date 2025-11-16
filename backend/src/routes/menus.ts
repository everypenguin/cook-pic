import express from 'express';
import { MenuModel } from '../models/Menu';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// B-1: 日間メニュー投稿
router.post('/daily', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, category, price, image_url, date } = req.body;

    // デバッグログ
    console.log('Create menu request:', {
      storeId: req.storeId,
      name,
      category,
      price,
      image_url_length: image_url?.length,
      date,
    });

    if (!req.storeId) {
      console.error('Store ID is missing');
      return res.status(401).json({ error: '認証が必要です' });
    }

    if (!name || price === undefined || !image_url) {
      return res.status(400).json({ error: 'メニュー名、価格、画像URLが必要です' });
    }

    // Base64画像のサイズチェック（10MB制限）
    if (image_url.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: '画像サイズが大きすぎます（10MB以下）' });
    }

    try {
      const menu = await MenuModel.create({
        store_id: req.storeId,
        name,
        category: category || null,
        price: parseInt(price),
        image_url,
        menu_type: 'daily',
        date: date ? new Date(date) : new Date(),
      });

      console.log('Menu created successfully:', menu.id);
      res.status(201).json(menu);
    } catch (dbError: any) {
      console.error('Database error in menu creation:', dbError);
      throw dbError; // エラーを再スローして、外側のcatchブロックで処理
    }
  } catch (error: any) {
    console.error('Create menu error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'メニューの投稿に失敗しました',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// B-4: メニューの編集
router.put('/:id', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const menu = await MenuModel.findById(id);

    if (!menu) {
      return res.status(404).json({ error: 'メニューが見つかりません' });
    }

    if (menu.store_id !== req.storeId) {
      return res.status(403).json({ error: 'このメニューを編集する権限がありません' });
    }

    const updatedMenu = await MenuModel.update(id, req.body);
    res.json(updatedMenu);
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'メニューの更新に失敗しました' });
  }
});

// B-4: メニューの削除
router.delete('/:id', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const menu = await MenuModel.findById(id);

    if (!menu) {
      return res.status(404).json({ error: 'メニューが見つかりません' });
    }

    if (menu.store_id !== req.storeId) {
      return res.status(403).json({ error: 'このメニューを削除する権限がありません' });
    }

    await MenuModel.delete(id);
    res.json({ message: 'メニューを削除しました' });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'メニューの削除に失敗しました' });
  }
});

// C-1: 日間メニュー表示
router.get('/daily/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params;
    const date = req.query.date ? new Date(req.query.date as string) : new Date();

    const menus = await MenuModel.findByStoreIdAndDate(store_id, date, 'daily');
    res.json(menus);
  } catch (error) {
    console.error('Get daily menus error:', error);
    res.status(500).json({ error: 'メニューの取得に失敗しました' });
  }
});

// ピン留め機能
router.put('/:id/pin', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { is_pinned } = req.body;

    const menu = await MenuModel.findById(id);
    if (!menu) {
      return res.status(404).json({ error: 'メニューが見つかりません' });
    }

    if (menu.store_id !== req.storeId) {
      return res.status(403).json({ error: 'このメニューを編集する権限がありません' });
    }

    const updatedMenu = await MenuModel.update(id, { is_pinned: Boolean(is_pinned) });
    res.json(updatedMenu);
  } catch (error) {
    console.error('Pin menu error:', error);
    res.status(500).json({ error: 'ピン留めの更新に失敗しました' });
  }
});

export default router;






