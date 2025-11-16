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
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;

    const supabase = createServerClient();
    const { data: menus, error } = await supabase
      .from('monthly_menus')
      .select('*')
      .eq('store_id', storeId)
      .eq('year', year)
      .eq('month', month)
      .order('menu_name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(menus || []);
  } catch (error: any) {
    console.error('Get monthly menus error:', error);
    return NextResponse.json(
      { error: '月間メニューの取得に失敗しました' },
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

    const { menu_name, category, price, image_url, month, year } = await request.json();

    if (!menu_name || !month || !year) {
      return NextResponse.json(
        { error: 'メニュー名、月、年が必要です' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: menu, error } = await supabase
      .from('monthly_menus')
      .insert({
        store_id: storeId,
        menu_name,
        category: category || null,
        price: price ? parseInt(price) : null,
        image_url: image_url || null,
        month: parseInt(month),
        year: parseInt(year),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(menu, { status: 201 });
  } catch (error: any) {
    console.error('Create monthly menu error:', error);
    return NextResponse.json(
      { error: '月間メニューの設定に失敗しました' },
      { status: 500 }
    );
  }
}

