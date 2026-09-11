import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json({ error: 'Dakhel username/email w l-mot de passe' }, { status: 400 });
    }

    const db = getDb();
    const cleanLogin = login.trim().toLowerCase();

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(username) = ? OR LOWER(email) = ?
    `).get(cleanLogin, cleanLogin) as any;

    if (!user) {
      return NextResponse.json({ error: 'Username awla Mot de passe ghalat' }, { status: 401 });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Username awla Mot de passe ghalat' }, { status: 401 });
    }

    const token = signToken({ id: user.id, username: user.username, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        efootball_id: user.efootball_id,
        whatsapp: user.whatsapp,
        balance: user.balance,
        role: user.role,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Mochkil f l-server' }, { status: 500 });
  }
}
