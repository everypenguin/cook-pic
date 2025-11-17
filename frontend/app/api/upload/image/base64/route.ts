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
    
    console.log('Uploading image to Supabase Storage:', {
      bucket: 'images',
      filePath,
      bufferSize: buffer.length,
      contentType: `image/${extension === 'png' ? 'png' : 'jpeg'}`,
    });
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: `image/${extension === 'png' ? 'png' : 'jpeg'}`,
        upsert: true, // 既存ファイルを上書き可能にする
      });

    if (error) {
      console.error('Supabase Storage upload error:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error,
      });
      
      // より詳細なエラーメッセージを返す
      let errorMessage = '画像のアップロードに失敗しました';
      if (error.message?.includes('Bucket not found')) {
        errorMessage = 'Storageバケット「images」が見つかりません。Supabaseダッシュボードでバケットを作成してください。';
      } else if (error.message?.includes('new row violates row-level security')) {
        errorMessage = 'StorageのRLSポリシーが設定されていません。SupabaseダッシュボードでStorageポリシーを設定してください。';
      } else if (error.message) {
        errorMessage = `画像のアップロードに失敗しました: ${error.message}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.message,
          code: error.statusCode,
        },
        { status: 500 }
      );
    }

    console.log('Image uploaded successfully:', data);

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: error.message || '画像のアップロードに失敗しました',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

