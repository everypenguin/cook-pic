import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StoreModel } from '../models/Store';

const router = express.Router();

// A-1: 管理者ログイン
router.post('/admin/login', async (req, res) => {
  try {
    const { store_id, password } = req.body;

    if (!store_id || !password) {
      return res.status(400).json({ error: '店舗IDとパスワードが必要です' });
    }

    const store = await StoreModel.findByStoreId(store_id);
    if (!store) {
      return res.status(401).json({ error: '店舗IDまたはパスワードが正しくありません' });
    }

    const isValidPassword = await bcrypt.compare(password, store.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '店舗IDまたはパスワードが正しくありません' });
    }

    const token = jwt.sign(
      { storeId: store.store_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      store: {
        id: store.id,
        store_id: store.store_id,
        name: store.name,
        profile_image_url: store.profile_image_url,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
});

// A-2: ユーザーアクセス（店舗ID検証）
router.post('/user/access', async (req, res) => {
  try {
    const { store_id } = req.body;

    if (!store_id) {
      return res.status(400).json({ error: '店舗IDが必要です' });
    }

    const store = await StoreModel.findByStoreId(store_id);
    if (!store) {
      return res.status(404).json({ error: '店舗が見つかりません' });
    }

    // アクセスログを記録（オプション）
    // await UserAccessModel.create(store_id);

    res.json({
      store: {
        id: store.id,
        store_id: store.store_id,
        name: store.name,
        profile_image_url: store.profile_image_url,
      },
    });
  } catch (error) {
    console.error('User access error:', error);
    res.status(500).json({ error: 'アクセスに失敗しました' });
  }
});

export default router;






