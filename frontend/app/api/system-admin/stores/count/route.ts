import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
  try {
    if (!getSystemAdminFromToken(request)) {
      return NextResponse.json(
        { error: 'システム管理者権限が必要です' },
        { status: 403 }
      );
    }

    const supabase = createServerClient();
    const { count, error } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error: any) {
    console.error('Get stores count error:', error);
    return NextResponse.json(
      { error: '店舗数の取得に失敗しました' },
      { status: 500 }
    );
  }
}

