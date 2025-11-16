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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = getStoreIdFromToken(request);
    if (!storeId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { id } = params;
    const updates = await request.json();
    const supabase = createServerClient();

    // 権限チェック
    const { data: menu, error: fetchError } = await supabase
      .from('weekly_menus')
      .select('store_id')
      .eq('id', id)
      .single();

    if (fetchError || !menu || menu.store_id !== storeId) {
      return NextResponse.json(
        { error: 'メニューが見つかりません' },
        { status: 404 }
      );
    }

    const { data: updatedMenu, error } = await supabase
      .from('weekly_menus')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedMenu);
  } catch (error: any) {
    console.error('Update weekly menu error:', error);
    return NextResponse.json(
      { error: '週間メニューの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = getStoreIdFromToken(request);
    if (!storeId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { id } = params;
    const supabase = createServerClient();

    // 権限チェック
    const { data: menu, error: fetchError } = await supabase
      .from('weekly_menus')
      .select('store_id')
      .eq('id', id)
      .single();

    if (fetchError || !menu || menu.store_id !== storeId) {
      return NextResponse.json(
        { error: 'メニューが見つかりません' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('weekly_menus')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: '週間メニューを削除しました' });
  } catch (error: any) {
    console.error('Delete weekly menu error:', error);
    return NextResponse.json(
      { error: '週間メニューの削除に失敗しました' },
      { status: 500 }
    );
  }
}

