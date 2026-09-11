import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Mamnoo3' }, { status: 403 });
    }

    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM platform_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Mamnoo3' }, { status: 403 });
    }

    const body = await req.json();
    const db = getDb();

    const upsert = db.prepare(`
      INSERT INTO platform_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        upsert.run(key, value);
      }
    }

    return NextResponse.json({ success: true, message: 'Les paramètres t-sauvegardawe b naja7' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
