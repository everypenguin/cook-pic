import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// 認証ミドルウェア（簡易版）
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

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreIdFromToken(request);
    if (!storeId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { name, category, price, image_url, date } = await request.json();

    if (!name || price === undefined || !image_url) {
      return NextResponse.json(
        { error: 'メニュー名、価格、画像URLが必要です' },
        { status: 400 }
      );
    }

    // Base64画像のサイズチェック（10MB制限）
    if (image_url.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '画像サイズが大きすぎます（10MB以下）' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: menu, error } = await supabase
      .from('menus')
      .insert({
        store_id: storeId,
        name,
        category: category || null,
        price: parseInt(price),
        image_url,
        menu_type: 'daily',
        date: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(menu, { status: 201 });
  } catch (error: any) {
    console.error('Create menu error:', error);
    return NextResponse.json(
      { 
        error: 'メニューの投稿に失敗しました',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

