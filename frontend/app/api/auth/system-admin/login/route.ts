import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードが必要です' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: admin, error } = await supabase
      .from('system_admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      // テーブルが存在しない場合のエラー
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'システム管理者テーブルが存在しません。データベースマイグレーションを実行してください。' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    if (!admin) {
      console.error('Admin not found for username:', username);
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // システム管理者トークンを生成
    const token = Buffer.from(JSON.stringify({ 
      role: 'system_admin',
      adminId: admin.id,
      username: admin.username 
    })).toString('base64');

    return NextResponse.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error: any) {
    console.error('System admin login error:', error);
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
}

