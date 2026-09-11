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
    const disputes = db.prepare(`
      SELECT m.*, 
             u1.username as creator_name, u1.efootball_id as creator_efootball_id, u1.whatsapp as creator_whatsapp,
             u2.username as opponent_name, u2.efootball_id as opponent_efootball_id, u2.whatsapp as opponent_whatsapp
      FROM matches m
      JOIN users u1 ON m.creator_id = u1.id
      JOIN users u2 ON m.opponent_id = u2.id
      WHERE m.status = 'DISPUTE'
      ORDER BY m.updated_at DESC
    `).all();

    return NextResponse.json({ disputes });
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

    const { matchId, decision, winnerId } = await req.json();
    const db = getDb();

    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
    if (!match || match.status !== 'DISPUTE') {
      return NextResponse.json({ error: 'Match non trouvé ou pas en litige' }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (decision === 'PICK_WINNER') {
      if (!winnerId || (winnerId !== match.creator_id && winnerId !== match.opponent_id)) {
        return NextResponse.json({ error: 'Khtar l-fayez s7i7' }, { status: 400 });
      }

      const loserId = winnerId === match.creator_id ? match.opponent_id : match.creator_id;

      // Credit winner
      const winner = db.prepare('SELECT balance, wins FROM users WHERE id = ?').get(winnerId) as any;
      const newBal = winner.balance + match.prize;
      db.prepare('UPDATE users SET balance = ?, wins = wins + 1 WHERE id = ?').run(newBal, winnerId);
      db.prepare('UPDATE users SET losses = losses + 1 WHERE id = ?').run(loserId);

      // Record transaction
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, ?, 'MATCH_WIN', ?, ?, ?, ?, ?)
      `).run('tx_' + Math.random().toString(36).substring(2, 9), winnerId, match.prize, newBal, `Rbeh 1v1 apres arbitrage Admin #${match.id}`, match.id, now);

      db.prepare(`
        UPDATE matches 
        SET status = 'COMPLETED', winner_id = ?, dispute_reason = 'Hal l-khilaf mn taraf Admin: Fayez houwa ' || ?, updated_at = ?
        WHERE id = ?
      `).run(winnerId, winnerId, now, matchId);

      return NextResponse.json({ success: true, message: 'L-khilaf t-7all w t-siftat l-jaiza l l-rabeh!' });
    } else if (decision === 'REFUND_BOTH') {
      // Refund both creator and opponent their stakes
      const creator = db.prepare('SELECT balance FROM users WHERE id = ?').get(match.creator_id) as any;
      const opponent = db.prepare('SELECT balance FROM users WHERE id = ?').get(match.opponent_id) as any;

      const newCreatorBal = creator.balance + match.stake;
      const newOpponentBal = opponent.balance + match.stake;

      db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newCreatorBal, match.creator_id);
      db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newOpponentBal, match.opponent_id);

      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, ?, 'MATCH_REFUND', ?, ?, ?, ?, ?)
      `).run('tx_' + Math.random().toString(36).substring(2, 9), match.creator_id, match.stake, newCreatorBal, `Rjoo3 mise match annulé par Admin #${match.id}`, match.id, now);

      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, ?, 'MATCH_REFUND', ?, ?, ?, ?, ?)
      `).run('tx_' + Math.random().toString(36).substring(2, 9), match.opponent_id, match.stake, newOpponentBal, `Rjoo3 mise match annulé par Admin #${match.id}`, match.id, now);

      db.prepare(`
        UPDATE matches 
        SET status = 'CANCELLED', dispute_reason = 'Match annulé par Admin w rj3o les mises l bjouj', updated_at = ?
        WHERE id = ?
      `).run(now, matchId);

      return NextResponse.json({ success: true, message: 'Match annulé w rj3o l-flous l bjouj la3ibin.' });
    }

    return NextResponse.json({ error: 'Decision inconnue' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
