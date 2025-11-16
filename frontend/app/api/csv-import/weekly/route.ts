import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

function getStoreIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.storeId || null;
  } catch {
    return null;
  }
}

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
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

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreIdFromToken(request);
    if (!storeId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const weekStartDate = formData.get('week_start_date') as string || getWeekStartDate(new Date());

    if (!file) {
      return NextResponse.json(
        { error: 'CSVファイルがアップロードされていません' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const records = parseCSV(csvText);

    const supabase = createServerClient();
    const results = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2;

      try {
        if (record.曜日 === undefined && record.曜日 !== '0') {
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

        const { data: menu, error } = await supabase
          .from('weekly_menus')
          .insert({
            store_id: storeId,
            day_of_week: dayOfWeek,
            menu_name: record.メニュー名.trim(),
            category: record.カテゴリー?.trim() || null,
            price: price,
            week_start_date: weekStartDate,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

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

    return NextResponse.json({
      success: results.length,
      errors: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'CSVのインポートに失敗しました' },
      { status: 500 }
    );
  }
}

