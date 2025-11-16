import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { randomUUID } from 'crypto';

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

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreIdFromToken(request);
    if (!storeId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { base64, filename } = await request.json();

    if (!base64) {
      return NextResponse.json(
        { error: 'Base64文字列が必要です' },
        { status: 400 }
      );
    }

    // Base64文字列から画像データを抽出
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // ファイル拡張子を決定
    const extension = filename?.split('.').pop() || 'jpg';
    const uploadFilename = filename || `${randomUUID()}.${extension}`;
    const filePath = `menus/${storeId}/${uploadFilename}`;

    // Supabase Storageにアップロード
    const supabase = createServerClient();
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: `image/${extension === 'png' ? 'png' : 'jpeg'}`,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}

