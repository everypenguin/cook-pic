import express from 'express';
import { StoreModel } from '../models/Store';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// B-5: 店舗情報管理（取得）
router.get('/profile', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const store = await StoreModel.findByStoreId(req.storeId!);
    if (!store) {
      return res.status(404).json({ error: '店舗が見つかりません' });
    }

    res.json({
      id: store.id,
      store_id: store.store_id,
      name: store.name,
      profile_image_url: store.profile_image_url,
    });
  } catch (error) {
    console.error('Get store profile error:', error);
    res.status(500).json({ error: '店舗情報の取得に失敗しました' });
  }
});

// B-5: 店舗情報管理（更新）
router.put('/profile', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const store = await StoreModel.findByStoreId(req.storeId!);
    if (!store) {
      return res.status(404).json({ error: '店舗が見つかりません' });
    }

    const updatedStore = await StoreModel.update(store.id, req.body);
    res.json({
      id: updatedStore.id,
      store_id: updatedStore.store_id,
      name: updatedStore.name,
      profile_image_url: updatedStore.profile_image_url,
    });
  } catch (error) {
    console.error('Update store profile error:', error);
    res.status(500).json({ error: '店舗情報の更新に失敗しました' });
  }
});

// C-4: 店舗プロフィール表示（公開）
router.get('/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params;
    const store = await StoreModel.findByStoreId(store_id);

    if (!store) {
      return res.status(404).json({ error: '店舗が見つかりません' });
    }

    res.json({
      id: store.id,
      store_id: store.store_id,
      name: store.name,
      profile_image_url: store.profile_image_url,
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: '店舗情報の取得に失敗しました' });
  }
});

export default router;











