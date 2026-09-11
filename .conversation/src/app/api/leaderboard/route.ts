import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const players = db.prepare(`
      SELECT id, username, efootball_id, wins, losses, balance,
             CASE WHEN (wins + losses) > 0 
                  THEN ROUND((CAST(wins AS REAL) / (wins + losses)) * 100, 1) 
                  ELSE 0.0 END as win_rate
      FROM users
      WHERE role = 'USER'
      ORDER BY wins DESC, win_rate DESC
      LIMIT 50
    `).all();

    return NextResponse.json({ players });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
