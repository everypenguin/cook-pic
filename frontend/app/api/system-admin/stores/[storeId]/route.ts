import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

function getSystemAdminFromToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.role === 'system_admin';
  } catch {
    return false;
  }
}

// 店舗情報取得
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!getSystemAdminFromToken(request)) {
      return NextResponse.json(
        { error: 'システム管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { storeId } = params;
    const supabase = createServerClient();
    const { data: store, error } = await supabase
      .from('stores')
      .select('id, store_id, name, profile_image_url, created_at, updated_at')
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
    console.error('Get store error:', error);
    return NextResponse.json(
      { error: '店舗情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 店舗更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!getSystemAdminFromToken(request)) {
      return NextResponse.json(
        { error: 'システム管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { storeId } = params;
    const updates = await request.json();
    const supabase = createServerClient();

    // パスワードが含まれている場合はハッシュ化
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const { data: store, error } = await supabase
      .from('stores')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', storeId)
      .select('id, store_id, name, profile_image_url, created_at, updated_at')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(store);
  } catch (error: any) {
    console.error('Update store error:', error);
    return NextResponse.json(
      { error: '店舗情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 店舗削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!getSystemAdminFromToken(request)) {
      return NextResponse.json(
        { error: 'システム管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { storeId } = params;
    const supabase = createServerClient();
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('store_id', storeId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: '店舗を削除しました' });
  } catch (error: any) {
    console.error('Delete store error:', error);
    return NextResponse.json(
      { error: '店舗の削除に失敗しました' },
      { status: 500 }
    );
  }
}

