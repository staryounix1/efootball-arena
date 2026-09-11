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
    const requests = db.prepare(`
      SELECT r.*, u.username, u.email, u.efootball_id, u.balance as current_balance
      FROM recharge_requests r
      JOIN users u ON r.user_id = u.id
      ORDER BY 
        CASE WHEN r.status = 'PENDING' THEN 0 ELSE 1 END,
        r.created_at DESC
    `).all();

    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Mamnoo3 (Admin only)' }, { status: 403 });
    }

    const { requestId, action, admin_notes } = await req.json();
    const db = getDb();

    const request = db.prepare(`
      SELECT r.*, u.username, u.balance 
      FROM recharge_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(requestId) as any;

    if (!request) {
      return NextResponse.json({ error: 'Talab non trouvé' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: `Had l-talab deja traité (${request.status})` }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      // Add balance to user
      const newBalance = request.balance + request.amount;
      db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, request.user_id);

      // Update request status
      db.prepare(`
        UPDATE recharge_requests 
        SET status = 'APPROVED', admin_notes = ?, processed_at = ?
        WHERE id = ?
      `).run(admin_notes || 'Validé par l Admin', now, requestId);

      // Record transaction
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, ?, 'DEPOSIT', ?, ?, ?, ?, ?)
      `).run(
        'tx_' + Math.random().toString(36).substring(2, 9),
        request.user_id,
        request.amount,
        newBalance,
        `Chahn rasid #${request.id} (+${request.amount} DH)`,
        request.id,
        now
      );

      return NextResponse.json({
        success: true,
        message: `T-validat l-3amaliya! ${request.amount} DH t-zadit l hisab ${request.username}. Nouveau solde: ${newBalance} DH`,
        newBalance
      });
    } else if (action === 'reject') {
      db.prepare(`
        UPDATE recharge_requests 
        SET status = 'REJECTED', admin_notes = ?, processed_at = ?
        WHERE id = ?
      `).run(admin_notes || 'Refusé par l Admin', now, requestId);

      return NextResponse.json({
        success: true,
        message: `Talab #${request.id} trfed.`
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
