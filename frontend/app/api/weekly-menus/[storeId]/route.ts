import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get('week_start_date')
      ? new Date(searchParams.get('week_start_date')!)
      : getWeekStartDate(new Date());

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

