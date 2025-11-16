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

    const supabase = createServerClient();
    const { data: store, error } = await supabase
      .from('stores')
      .select('id, store_id, name, profile_image_url')
      .eq('store_id', storeId)
      .single();

    if (error || !store) {
      return NextResponse.json(
        { error: '店舗が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error: any) {
    console.error('Get store profile error:', error);
    return NextResponse.json(
      { error: '店舗情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storeId = getStoreIdFromToken(request);
    if (!storeId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const supabase = createServerClient();

    const { data: updatedStore, error } = await supabase
      .from('stores')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', storeId)
      .select('id, store_id, name, profile_image_url')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(updatedStore);
  } catch (error: any) {
    console.error('Update store profile error:', error);
    return NextResponse.json(
      { error: '店舗情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

