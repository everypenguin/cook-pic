import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { store_id } = await request.json();

    if (!store_id) {
      return NextResponse.json(
        { error: '店舗IDが必要です' },
        { status: 400 }
      );
    }

    const { data: store, error } = await supabase
      .from('stores')
      .select('id, store_id, name, profile_image_url')
      .eq('store_id', store_id)
      .single();

    if (error || !store) {
      return NextResponse.json(
        { error: '店舗が見つかりません' },
        { status: 404 }
      );
    }

    // アクセスログを記録（オプション）
    await supabase.from('user_accesses').insert({ store_id });

    return NextResponse.json({ store });
  } catch (error: any) {
    console.error('User access error:', error);
    return NextResponse.json(
      { error: 'アクセスに失敗しました' },
      { status: 500 }
    );
  }
}

