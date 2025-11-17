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
    
    // Service Role Keyの確認
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json(
        { 
          error: 'サーバー設定エラー',
          details: 'SUPABASE_SERVICE_ROLE_KEYが設定されていません。Vercelの環境変数を確認してください。',
        },
        { status: 500 }
      );
    }
    
    console.log('Uploading image to Supabase Storage:', {
      bucket: 'images',
      filePath,
      bufferSize: buffer.length,
      contentType: `image/${extension === 'png' ? 'png' : 'jpeg'}`,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKeyLength: serviceRoleKey?.length || 0,
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
        error: JSON.stringify(error, null, 2),
      });
      
      // より詳細なエラーメッセージを返す
      let errorMessage = '画像のアップロードに失敗しました';
      let errorDetails = error.message || 'Unknown error';
      
      if (error.message?.includes('Bucket not found') || error.message?.includes('does not exist')) {
        errorMessage = 'Storageバケット「images」が見つかりません。';
        errorDetails = 'Supabaseダッシュボード → Storage → 「New bucket」で「images」バケットを作成し、「Public bucket」を有効にしてください。';
      } else if (error.message?.includes('new row violates row-level security') || error.message?.includes('RLS')) {
        errorMessage = 'StorageのRLSポリシーが設定されていません。';
        errorDetails = 'Supabase SQL Editorで supabase/SETUP_STORAGE.sql を実行してください。';
      } else if (error.message?.includes('JWT')) {
        errorMessage = '認証エラーが発生しました。';
        errorDetails = 'Service Role Keyが正しく設定されているか確認してください。';
      } else if (error.message) {
        errorMessage = `画像のアップロードに失敗しました: ${error.message}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          code: error.statusCode,
          fullError: process.env.NODE_ENV === 'development' ? JSON.stringify(error, null, 2) : undefined,
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

