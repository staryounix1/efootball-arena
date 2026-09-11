import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    const db = getDb();

    const tournaments = db.prepare(`
      SELECT t.*, 
             (SELECT COUNT(*) FROM tournament_participants tp WHERE tp.tournament_id = t.id) as participant_count
      FROM tournaments t
      ORDER BY t.created_at DESC
    `).all() as any[];

    // If logged in, check which tournaments user joined
    let joinedIds: string[] = [];
    if (user) {
      const userJoined = db.prepare('SELECT tournament_id FROM tournament_participants WHERE user_id = ?').all(user.id) as any[];
      joinedIds = userJoined.map(j => j.tournament_id);
    }

    const results = tournaments.map(t => ({
      ...t,
      isJoined: joinedIds.includes(t.id)
    }));

    return NextResponse.json({ tournaments: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tournamentId } = await req.json();
    if (!tournamentId) return NextResponse.json({ error: 'Tournament ID manquant' }, { status: 400 });

    const db = getDb();
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId) as any;
    if (!tournament) return NextResponse.json({ error: 'Botola non trouvée' }, { status: 404 });

    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json({ error: 'Tasjil f had l-botola mssdod' }, { status: 400 });
    }

    // Check count
    const countRow = db.prepare('SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ?').get(tournamentId) as any;
    if (countRow.count >= tournament.max_players) {
      return NextResponse.json({ error: 'L-botola 3amrat' }, { status: 400 });
    }

    // Check already joined
    const already = db.prepare('SELECT id FROM tournament_participants WHERE tournament_id = ? AND user_id = ?').get(tournamentId, user.id);
    if (already) {
      return NextResponse.json({ error: 'Derti tasjil deja f had l-botola' }, { status: 400 });
    }

    // Check user balance
    const currentUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(user.id) as any;
    if (currentUser.balance < tournament.entry_fee) {
      return NextResponse.json({ error: `Rasid dyalk (${currentUser.balance} DH) ma kafich l frais d'inscription (${tournament.entry_fee} DH)` }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newBal = currentUser.balance - tournament.entry_fee;

    // Deduct fee
    db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(newBal, user.id);

    // Record transaction
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description, reference_id, created_at)
      VALUES (?, ?, 'TOURNAMENT_FEE', ?, ?, ?, ?, ?)
    `).run('tx_' + Math.random().toString(36).substring(2, 9), user.id, -tournament.entry_fee, newBal, `Frais d inscription f ${tournament.title}`, tournament.id, now);

    // Register participant
    db.prepare(`
      INSERT INTO tournament_participants (id, tournament_id, user_id, joined_at)
      VALUES (?, ?, ?, ?)
    `).run('tp_' + Math.random().toString(36).substring(2, 9), tournamentId, user.id, now);

    return NextResponse.json({ success: true, message: 'Tsjelti b naja7 f l-botola!', newBalance: newBal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
