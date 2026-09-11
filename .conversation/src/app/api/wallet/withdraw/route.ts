import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, destination_info } = await req.json();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Mablagh ghair s7i7' }, { status: 400 });
    }

    if (user.balance < numAmount) {
      return NextResponse.json({ error: 'Rasid dyalk ma kafich l had l-sahb' }, { status: 400 });
    }

    if (!destination_info) {
      return NextResponse.json({ error: 'Dakhel ma3loumat l-sahb (RIB / Nom / CIN)' }, { status: 400 });
    }

    const db = getDb();
    const withdrawId = 'WIT-' + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();

    // Deduct from user balance immediately (escrow until processed)
    const newBalance = user.balance - numAmount;
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, user.id);

    // Record withdrawal request
    db.prepare(`
      INSERT INTO withdrawal_requests (id, user_id, amount, method, destination_info, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
    `).run(withdrawId, user.id, numAmount, method, destination_info.trim(), createdAt);

    // Record transaction
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
      VALUES (?, ?, 'WITHDRAWAL', ?, ?, ?, ?, ?)
    `).run('tx_' + Math.random().toString(36).substring(2, 9), user.id, -numAmount, newBalance, `Talab Sahb #${withdrawId} (${method})`, withdrawId, createdAt);

    return NextResponse.json({
      success: true,
      message: 'Talab l-sahb tsjel b naja7 w ghay-traitih l-admin',
      requestId: withdrawId,
      newBalance
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const withdrawals = db.prepare(`
      SELECT * FROM withdrawal_requests WHERE user_id = ? ORDER BY created_at DESC
    `).all(user.id);

    return NextResponse.json({ withdrawals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
