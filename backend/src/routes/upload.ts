import express from 'express';
import multer from 'multer';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { uploadImage, uploadFromBase64 } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Multer設定（メモリストレージ）
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  },
});

// 画像アップロード（ファイル）
router.post('/image', authenticateAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像ファイルが必要です' });
    }

    const extension = req.file.originalname.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${extension}`;
    
    const result = await uploadImage(req.file, filename);
    
    res.json({ url: result.url });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || '画像のアップロードに失敗しました' });
  }
});

// 画像アップロード（Base64）
router.post('/image/base64', authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const { base64, filename } = req.body;
    
    if (!base64) {
      return res.status(400).json({ error: 'Base64文字列が必要です' });
    }

    const extension = filename?.split('.').pop() || 'jpg';
    const uploadFilename = filename || `${uuidv4()}.${extension}`;
    
    const result = await uploadFromBase64(base64, uploadFilename);
    
    res.json({ url: result.url });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || '画像のアップロードに失敗しました' });
  }
});

export default router;








