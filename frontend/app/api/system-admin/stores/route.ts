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

// 店舗一覧取得
export async function GET(request: NextRequest) {
  try {
    if (!getSystemAdminFromToken(request)) {
      return NextResponse.json(
        { error: 'システム管理者権限が必要です' },
        { status: 403 }
      );
    }

    const supabase = createServerClient();
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, store_id, name, profile_image_url, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(stores || []);
  } catch (error: any) {
    console.error('Get stores error:', error);
    return NextResponse.json(
      { error: '店舗一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 店舗作成
export async function POST(request: NextRequest) {
  try {
    if (!getSystemAdminFromToken(request)) {
      return NextResponse.json(
        { error: 'システム管理者権限が必要です' },
        { status: 403 }
      );
    }

    const { store_id, name, password, profile_image_url } = await request.json();

    if (!store_id || !name || !password) {
      return NextResponse.json(
        { error: '店舗ID、店舗名、パスワードが必要です' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const supabase = createServerClient();
    const { data: store, error } = await supabase
      .from('stores')
      .insert({
        store_id,
        name,
        password_hash: passwordHash,
        profile_image_url: profile_image_url || null,
        role: 'store_admin',
      })
      .select('id, store_id, name, profile_image_url, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'この店舗IDは既に使用されています' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(store, { status: 201 });
  } catch (error: any) {
    console.error('Create store error:', error);
    return NextResponse.json(
      { error: '店舗の作成に失敗しました' },
      { status: 500 }
    );
  }
}

