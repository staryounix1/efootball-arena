import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import crypto from 'node:crypto';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const db = getDb();
    let query = `
      SELECT m.*, 
             u1.username as creator_name, u1.efootball_id as creator_efootball_id, u1.avatar as creator_avatar,
             u2.username as opponent_name, u2.efootball_id as opponent_efootball_id, u2.avatar as opponent_avatar,
             w.username as winner_name
      FROM matches m
      LEFT JOIN users u1 ON m.creator_id = u1.id
      LEFT JOIN users u2 ON m.opponent_id = u2.id
      LEFT JOIN users w ON m.winner_id = w.id
    `;
    const params: any[] = [];

    if (status) {
      query += ` WHERE m.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY m.created_at DESC LIMIT 50`;

    const matches = db.prepare(query).all(...params);
    return NextResponse.json({ matches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, stake, platform = 'Mobile' } = await req.json();
    const numStake = parseFloat(stake);

    if (isNaN(numStake) || numStake < 5) {
      return NextResponse.json({ error: 'A9al mablagh l l-challenge houwa 5 DH' }, { status: 400 });
    }

    // Check user balance
    const db = getDb();
    const currentUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id) as any;

    if (!currentUser || currentUser.balance < numStake) {
      return NextResponse.json({ 
        error: `Rasid dyalk (${currentUser?.balance || 0} DH) ma kafich. Khassk tchhan l-hisab dyalk qbel.` 
      }, { status: 400 });
    }

    // Commission rate (default 10%)
    const commissionSetting = db.prepare("SELECT value FROM platform_settings WHERE key = 'commission_rate'").get() as any;
    const commissionRate = commissionSetting ? parseFloat(commissionSetting.value) : 0.10;

    // Total pot is 2 * stake. Winner gets total - commission.
    const totalPot = numStake * 2;
    const prize = totalPot * (1 - commissionRate);

    const matchId = 'match_' + crypto.randomBytes(5).toString('hex');
    const now = new Date().toISOString();

    // Deduct stake from creator (ESCROW)
    const newBalance = currentUser.balance - numStake;
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, user.id);

    // Record escrow transaction
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
      VALUES (?, ?, 'MATCH_STAKE', ?, ?, ?, ?, ?)
    `).run('tx_' + Math.random().toString(36).substring(2, 9), user.id, -numStake, newBalance, `Mise 1v1 Match #${matchId}`, matchId, now);

    // Create match
    db.prepare(`
      INSERT INTO matches (id, title, game, platform, stake, prize, creator_id, status, created_at, updated_at)
      VALUES (?, ?, 'eFootball', ?, ?, ?, ?, 'OPEN', ?, ?)
    `).run(matchId, title || `Challenge 1v1 (${numStake} DH)`, platform, numStake, prize, user.id, now, now);

    return NextResponse.json({
      success: true,
      matchId,
      newBalance
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
