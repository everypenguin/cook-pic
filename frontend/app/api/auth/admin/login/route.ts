import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { store_id, password } = await request.json();

    if (!store_id || !password) {
      return NextResponse.json(
        { error: '店舗IDとパスワードが必要です' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('store_id', store_id)
      .single();

    if (error || !store) {
      return NextResponse.json(
        { error: '店舗IDまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, store.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '店舗IDまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // JWTトークンを生成（簡易版、本番環境ではSupabase Authを使用することを推奨）
    const token = Buffer.from(JSON.stringify({ storeId: store.store_id })).toString('base64');

    return NextResponse.json({
      token,
      store: {
        id: store.id,
        store_id: store.store_id,
        name: store.name,
        profile_image_url: store.profile_image_url,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
}

