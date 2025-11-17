import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const supabase = createServerClient();
    const { data: menus, error } = await supabase
      .from('menus')
      .select('*')
      .eq('store_id', storeId)
      .eq('menu_type', 'daily')
      .eq('date', date)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Fetched ${menus?.length || 0} menus for store ${storeId} on ${date}`);
    return NextResponse.json(menus || []);
  } catch (error: any) {
    console.error('Get daily menus error:', error);
    return NextResponse.json(
      { 
        error: 'メニューの取得に失敗しました',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

