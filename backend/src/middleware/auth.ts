import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StoreModel } from '../models/Store';

export interface AuthRequest extends Request {
  storeId?: string;
  store?: any;
}

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('No authorization header');
      return res.status(401).json({ error: '認証トークンが必要です' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      console.error('No token in authorization header');
      return res.status(401).json({ error: '認証トークンが必要です' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { storeId: string };
    
    if (!decoded.storeId) {
      console.error('No storeId in token:', decoded);
      return res.status(401).json({ error: '無効なトークンです' });
    }

    const store = await StoreModel.findByStoreId(decoded.storeId);

    if (!store) {
      console.error('Store not found:', decoded.storeId);
      return res.status(401).json({ error: '店舗が見つかりません' });
    }

    req.storeId = decoded.storeId;
    req.store = store;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: '認証に失敗しました' });
  }
};






