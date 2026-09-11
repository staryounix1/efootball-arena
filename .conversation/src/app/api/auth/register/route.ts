import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, email, password, efootball_id, whatsapp } = await req.json();

    if (!username || !email || !password || !efootball_id || !whatsapp) {
      return NextResponse.json({ error: '3ammar jami3 l-ma3loumat (All fields required)' }, { status: 400 });
    }

    const db = getDb();

    // Check if user or email exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username.trim(), email.trim());
    if (existing) {
      return NextResponse.json({ error: 'Username awla Email deja msta3mel' }, { status: 400 });
    }

    const id = 'usr_' + crypto.randomBytes(6).toString('hex');
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, efootball_id, whatsapp, balance, role, wins, losses, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0.0, 'USER', 0, 0, ?)
    `);

    insert.run(id, username.trim(), email.trim().toLowerCase(), password_hash, efootball_id.trim(), whatsapp.trim(), createdAt);

    const token = signToken({ id, username: username.trim(), role: 'USER' });

    const response = NextResponse.json({
      success: true,
      user: {
        id,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        efootball_id: efootball_id.trim(),
        whatsapp: whatsapp.trim(),
        balance: 0.0,
        role: 'USER',
        wins: 0,
        losses: 0
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
