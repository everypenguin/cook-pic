import express from 'express';
import multer from 'multer';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { WeeklyMenuModel } from '../models/WeeklyMenu';
import { MonthlyMenuModel } from '../models/MonthlyMenu';

// csv-parseの動的インポート
let csvParse: any;
try {
  csvParse = require('csv-parse/sync');
} catch (e) {
  // csv-parseがインストールされていない場合のフォールバック
  csvParse = {
    parse: (text: string, options: any) => {
      // シンプルなCSVパーサー（フォールバック）
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) return [];
      
      const headers = lines[0].split(',').map(h => h.trim());
      const records = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        records.push(record);
      }
      
      return records;
    }
  };
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CSV一括登録: 週間メニュー
router.post('/weekly', authenticateAdmin, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSVファイルがアップロードされていません' });
    }

    const weekStartDate = req.body.week_start_date || getWeekStartDate(new Date());

    // CSVをパース
    const records = csvParse.parse(req.file.buffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // ヘッダー行を考慮

      try {
        // バリデーション
        if (!record.曜日 && record.曜日 !== '0') {
          errors.push(`行${rowNumber}: 曜日が指定されていません`);
          continue;
        }

        const dayOfWeek = parseInt(record.曜日);
        if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
          errors.push(`行${rowNumber}: 曜日は0-6の数値で指定してください（0=日曜日、1=月曜日...）`);
          continue;
        }

        if (!record.メニュー名 || !record.メニュー名.trim()) {
          errors.push(`行${rowNumber}: メニュー名が指定されていません`);
          continue;
        }

        const price = record.価格 ? parseInt(record.価格) : null;
        if (record.価格 && (isNaN(price) || price < 0)) {
          errors.push(`行${rowNumber}: 価格は0以上の数値で指定してください`);
          continue;
        }

        // メニューを登録
        const menu = await WeeklyMenuModel.create({
          store_id: req.storeId!,
          day_of_week: dayOfWeek,
          menu_name: record.メニュー名.trim(),
          category: record.カテゴリー?.trim() || null,
          price: price,
          week_start_date: new Date(weekStartDate),
        });

        results.push({
          row: rowNumber,
          day_of_week: dayOfWeek,
          menu_name: menu.menu_name,
          status: 'success',
        });
      } catch (error: any) {
        errors.push(`行${rowNumber}: ${error.message || '登録に失敗しました'}`);
      }
    }

    res.json({
      success: results.length,
      errors: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'CSVのインポートに失敗しました' });
  }
});

// CSV一括登録: 月間メニュー
router.post('/monthly', authenticateAdmin, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSVファイルがアップロードされていません' });
    }

    const year = req.body.year ? parseInt(req.body.year) : new Date().getFullYear();
    const month = req.body.month ? parseInt(req.body.month) : new Date().getMonth() + 1;

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: '年と月を正しく指定してください' });
    }

    // CSVをパース
    const records = csvParse.parse(req.file.buffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // ヘッダー行を考慮

      try {
        // バリデーション
        if (!record.メニュー名 || !record.メニュー名.trim()) {
          errors.push(`行${rowNumber}: メニュー名が指定されていません`);
          continue;
        }

        const price = record.価格 ? parseInt(record.価格) : null;
        if (record.価格 && (isNaN(price) || price < 0)) {
          errors.push(`行${rowNumber}: 価格は0以上の数値で指定してください`);
          continue;
        }

        // メニューを登録
        const menu = await MonthlyMenuModel.create({
          store_id: req.storeId!,
          menu_name: record.メニュー名.trim(),
          category: record.カテゴリー?.trim() || null,
          price: price,
          month: month,
          year: year,
        });

        results.push({
          row: rowNumber,
          menu_name: menu.menu_name,
          status: 'success',
        });
      } catch (error: any) {
        errors.push(`行${rowNumber}: ${error.message || '登録に失敗しました'}`);
      }
    }

    res.json({
      success: results.length,
      errors: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'CSVのインポートに失敗しました' });
  }
});

// 週の開始日を取得（月曜日）
function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default router;

