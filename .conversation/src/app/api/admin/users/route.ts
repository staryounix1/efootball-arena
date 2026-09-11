import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Mamnoo3 (Admin only)' }, { status: 403 });
    }

    const db = getDb();
    const users = db.prepare(`
      SELECT id, username, email, efootball_id, whatsapp, balance, role, wins, losses, created_at
      FROM users
      WHERE role != 'ADMIN'
      ORDER BY created_at DESC
    `).all();

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Mamnoo3 (Admin only)' }, { status: 403 });
    }

    const { userId, amount, reason } = await req.json();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount === 0) {
      return NextResponse.json({ error: 'Mablagh ghair s7i7' }, { status: 400 });
    }

    const db = getDb();
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!targetUser) {
      return NextResponse.json({ error: 'La3ib non trouvé' }, { status: 404 });
    }

    const newBalance = Math.max(0, targetUser.balance + numAmount);
    const now = new Date().toISOString();

    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, userId);

    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
      VALUES (?, ?, 'ADMIN_ADJUST', ?, ?, ?, ?, ?)
    `).run(
      'tx_' + Math.random().toString(36).substring(2, 9),
      userId,
      numAmount,
      newBalance,
      reason || (numAmount > 0 ? `Ziyadat rasid yadawiyan mn taraf Admin` : `Khasm rasid mn taraf Admin`),
      admin.id,
      now
    );

    return NextResponse.json({
      success: true,
      message: `Rasid dyal ${targetUser.username} t-beddel: ${newBalance} DH`,
      newBalance
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
