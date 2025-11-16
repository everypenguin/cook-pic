import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;

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

