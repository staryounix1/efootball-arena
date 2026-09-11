import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const match = db.prepare(`
      SELECT m.*, 
             u1.username as creator_name, u1.efootball_id as creator_efootball_id, u1.whatsapp as creator_whatsapp,
             u2.username as opponent_name, u2.efootball_id as opponent_efootball_id, u2.whatsapp as opponent_whatsapp,
             w.username as winner_name
      FROM matches m
      LEFT JOIN users u1 ON m.creator_id = u1.id
      LEFT JOIN users u2 ON m.opponent_id = u2.id
      LEFT JOIN users w ON m.winner_id = w.id
      WHERE m.id = ?
    `).get(id) as any;

    if (!match) {
      return NextResponse.json({ error: 'Match non trouvé' }, { status: 404 });
    }

    const messages = db.prepare(`
      SELECT * FROM match_messages WHERE match_id = ? ORDER BY created_at ASC
    `).all(id);

    return NextResponse.json({ match, messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { action, ...data } = await req.json();
    const db = getDb();

    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as any;
    if (!match) return NextResponse.json({ error: 'Match non trouvé' }, { status: 404 });

    const now = new Date().toISOString();

    // 1. JOIN MATCH
    if (action === 'join') {
      if (match.status !== 'OPEN') {
        return NextResponse.json({ error: 'Had l-match ma bqash disponible' }, { status: 400 });
      }
      if (match.creator_id === user.id) {
        return NextResponse.json({ error: 'Ma ymknch t-l3eb dhed rassek' }, { status: 400 });
      }

      const currentUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id) as any;
      if (!currentUser || currentUser.balance < match.stake) {
        return NextResponse.json({ error: `Rasid dyalk (${currentUser?.balance || 0} DH) ma kafich l had l-challenge (${match.stake} DH)` }, { status: 400 });
      }

      // Deduct stake from opponent (ESCROW)
      const newBalance = currentUser.balance - match.stake;
      db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, user.id);

      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, ?, 'MATCH_STAKE', ?, ?, ?, ?, ?)
      `).run('tx_' + Math.random().toString(36).substring(2, 9), user.id, -match.stake, newBalance, `Mise 1v1 Match #${match.id}`, match.id, now);

      db.prepare(`
        UPDATE matches 
        SET opponent_id = ?, status = 'PLAYING', updated_at = ?
        WHERE id = ?
      `).run(user.id, now, id);

      // System chat message
      db.prepare(`
        INSERT INTO match_messages (id, match_id, user_id, username, message, created_at)
        VALUES (?, ?, ?, 'System', ?, ?)
      `).run('msg_' + Math.random().toString(36).substring(2, 9), id, user.id, `${user.username} dkhul l l-match! Tbadlo l-room code daba.`, now);

      return NextResponse.json({ success: true, message: 'Dkhelti l l-match b naja7!' });
    }

    // 2. CANCEL MATCH (Creator only when OPEN)
    if (action === 'cancel') {
      if (match.creator_id !== user.id) {
        return NextResponse.json({ error: 'Ghir mol l-match li 3ndo l-haq y-annulih' }, { status: 403 });
      }
      if (match.status !== 'OPEN') {
        return NextResponse.json({ error: 'Ma ymknch t-annuli match bda' }, { status: 400 });
      }

      // Refund creator
      const currentUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id) as any;
      const newBalance = currentUser.balance + match.stake;
      db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBalance, user.id);

      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
        VALUES (?, ?, 'MATCH_REFUND', ?, ?, ?, ?, ?)
      `).run('tx_' + Math.random().toString(36).substring(2, 9), user.id, match.stake, newBalance, `Rjoo3 mise Match annulé #${match.id}`, match.id, now);

      db.prepare(`
        UPDATE matches SET status = 'CANCELLED', updated_at = ? WHERE id = ?
      `).run(now, id);

      return NextResponse.json({ success: true, message: 'Match annulé w rje3 lik l-rasid' });
    }

    // 3. SET ROOM CODE
    if (action === 'set_room_code') {
      const { room_code } = data;
      if (!room_code) return NextResponse.json({ error: 'Dakhel room code' }, { status: 400 });
      if (match.creator_id !== user.id && match.opponent_id !== user.id) {
        return NextResponse.json({ error: 'Khassek tkoun f l-match' }, { status: 403 });
      }

      db.prepare('UPDATE matches SET room_code = ?, updated_at = ? WHERE id = ?').run(room_code.trim(), now, id);

      db.prepare(`
        INSERT INTO match_messages (id, match_id, user_id, username, message, created_at)
        VALUES (?, ?, ?, 'System', ?, ?)
      `).run('msg_' + Math.random().toString(36).substring(2, 9), id, user.id, `Room Code dyal eFootball t-setta: ${room_code.trim()}`, now);

      return NextResponse.json({ success: true, room_code });
    }

    // 4. CHAT MESSAGE
    if (action === 'send_message') {
      const { message } = data;
      if (!message || !message.trim()) return NextResponse.json({ error: 'Message khawi' }, { status: 400 });

      db.prepare(`
        INSERT INTO match_messages (id, match_id, user_id, username, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('msg_' + Math.random().toString(36).substring(2, 9), id, user.id, user.username, message.trim(), now);

      return NextResponse.json({ success: true });
    }

    // 5. SUBMIT MATCH RESULT
    if (action === 'submit_result') {
      const { score, claimed_winner, proof } = data;
      const isCreator = match.creator_id === user.id;
      const isOpponent = match.opponent_id === user.id;

      if (!isCreator && !isOpponent) {
        return NextResponse.json({ error: 'Nta machi f had l-match' }, { status: 403 });
      }

      if (match.status !== 'PLAYING' && match.status !== 'PENDING_CONFIRMATION') {
        return NextResponse.json({ error: 'L-match machi f halat l3ib' }, { status: 400 });
      }

      // Update submitter's info
      if (isCreator) {
        db.prepare(`
          UPDATE matches 
          SET creator_score = ?, creator_claimed_winner = ?, creator_proof = ?, status = 'PENDING_CONFIRMATION', updated_at = ?
          WHERE id = ?
        `).run(parseInt(score) || 0, claimed_winner, proof || null, now, id);
      } else {
        db.prepare(`
          UPDATE matches 
          SET opponent_score = ?, opponent_claimed_winner = ?, opponent_proof = ?, status = 'PENDING_CONFIRMATION', updated_at = ?
          WHERE id = ?
        `).run(parseInt(score) || 0, claimed_winner, proof || null, now, id);
      }

      // Re-fetch match to check both submissions
      const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as any;

      if (updatedMatch.creator_claimed_winner && updatedMatch.opponent_claimed_winner) {
        // Both submitted!
        if (updatedMatch.creator_claimed_winner === updatedMatch.opponent_claimed_winner) {
          // AGREED ON WINNER!
          const winnerId = updatedMatch.creator_claimed_winner;
          const loserId = winnerId === match.creator_id ? match.opponent_id : match.creator_id;

          // Credit prize to winner
          const winnerUser = db.prepare('SELECT balance, wins FROM users WHERE id = ?').get(winnerId) as any;
          const newWinnerBal = winnerUser.balance + match.prize;
          db.prepare('UPDATE users SET balance = ?, wins = wins + 1 WHERE id = ?').run(newWinnerBal, winnerId);

          // Update loser losses
          db.prepare('UPDATE users SET losses = losses + 1 WHERE id = ?').run(loserId);

          // Record winning transaction
          db.prepare(`
            INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
            VALUES (?, ?, 'MATCH_WIN', ?, ?, ?, ?, ?)
          `).run('tx_' + Math.random().toString(36).substring(2, 9), winnerId, match.prize, newWinnerBal, `Jawa'iz rbeh 1v1 Match #${match.id}`, match.id, now);

          // Mark completed
          db.prepare(`
            UPDATE matches 
            SET status = 'COMPLETED', winner_id = ?, updated_at = ?
            WHERE id = ?
          `).run(winnerId, now, id);

          db.prepare(`
            INSERT INTO match_messages (id, match_id, user_id, username, message, created_at)
            VALUES (?, ?, ?, 'System', ?, ?)
          `).run('msg_' + Math.random().toString(36).substring(2, 9), id, user.id, `🎉 Match salat! L-fayez t-validat natija dyalo w khda ${match.prize} DH!`, now);

          return NextResponse.json({ success: true, status: 'COMPLETED', winnerId });
        } else {
          // DISPUTE!
          db.prepare(`
            UPDATE matches 
            SET status = 'DISPUTE', dispute_reason = 'Kola wahed claima rbeh. Khass tadakhol l-admin.', updated_at = ?
            WHERE id = ?
          `).run(now, id);

          db.prepare(`
            INSERT INTO match_messages (id, match_id, user_id, username, message, created_at)
            VALUES (?, ?, ?, 'System', ?, ?)
          `).run('msg_' + Math.random().toString(36).substring(2, 9), id, user.id, `⚠️ Khilaf (Dispute)! Bjouj claimed rbehto. L-Admin ghaychouf les captures d'écran daba bach y-tranchi.`, now);

          return NextResponse.json({ success: true, status: 'DISPUTE', message: 'Tkayyes, l-admin ghay-checké l-capture d écran' });
        }
      }

      return NextResponse.json({ success: true, status: 'PENDING_CONFIRMATION', message: 'Natija tsjlat, kan-tsenaw l-la3ib lakhor y-validé' });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
