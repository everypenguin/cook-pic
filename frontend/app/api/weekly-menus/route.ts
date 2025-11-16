import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreIdFromToken(request);
    if (!storeId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get('week_start_date')
      ? new Date(searchParams.get('week_start_date')!)
      : getWeekStartDate(new Date());

    const supabase = createServerClient();
    const { data: menus, error } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('store_id', storeId)
      .eq('week_start_date', weekStartDate.toISOString().split('T')[0])
      .order('day_of_week', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(menus || []);
  } catch (error: any) {
    console.error('Get weekly menus error:', error);
    return NextResponse.json(
      { error: '週間メニューの取得に失敗しました' },
      { status: 500 }
    );
  }
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

    const { day_of_week, menu_name, category, price, image_url, week_start_date } = await request.json();

    if (day_of_week === undefined || !menu_name || !week_start_date) {
      return NextResponse.json(
        { error: '曜日、メニュー名、週開始日が必要です' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: menu, error } = await supabase
      .from('weekly_menus')
      .insert({
        store_id: storeId,
        day_of_week: parseInt(day_of_week),
        menu_name,
        category: category || null,
        price: price ? parseInt(price) : null,
        image_url: image_url || null,
        week_start_date: new Date(week_start_date).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(menu, { status: 201 });
  } catch (error: any) {
    console.error('Create weekly menu error:', error);
    return NextResponse.json(
      { error: '週間メニューの設定に失敗しました' },
      { status: 500 }
    );
  }
}

