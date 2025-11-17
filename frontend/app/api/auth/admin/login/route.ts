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

    console.log('Login attempt for store_id:', store_id);

    const supabase = createServerClient();
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('store_id', store_id)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // テーブルが存在しない場合のエラー
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: '店舗テーブルが存在しません。データベースマイグレーションを実行してください。', details: error.message },
          { status: 500 }
        );
      }
      
      // レコードが見つからない場合
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '店舗IDが見つかりません。店舗IDを確認してください。', details: `店舗ID: ${store_id}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'データベースエラーが発生しました', details: error.message },
        { status: 500 }
      );
    }

    if (!store) {
      console.error('Store not found for store_id:', store_id);
      return NextResponse.json(
        { error: '店舗IDが見つかりません。店舗IDを確認してください。', details: `店舗ID: ${store_id}` },
        { status: 404 }
      );
    }

    console.log('Store found:', store.store_id, store.name);

    const isValidPassword = await bcrypt.compare(password, store.password_hash);
    if (!isValidPassword) {
      console.error('Invalid password for store_id:', store_id);
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
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

