import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import crypto from 'node:crypto';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Khassek t-connecta qbel' }, { status: 401 });
    }

    const { amount, payment_method, whatsapp, notes } = await req.json();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Dakhel mablgh s7i7 (Invalid amount)' }, { status: 400 });
    }

    if (!payment_method || !whatsapp) {
      return NextResponse.json({ error: 'Khtar tariqat l-khalas w dkhl raqm WhatsApp' }, { status: 400 });
    }

    const db = getDb();
    const requestId = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO recharge_requests (id, user_id, amount, payment_method, whatsapp, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
    `);

    insert.run(requestId, user.id, numericAmount, payment_method, whatsapp.trim(), notes?.trim() || null, createdAt);

    // Get Admin whatsapp number from settings
    const adminPhoneSetting = db.prepare("SELECT value FROM platform_settings WHERE key = 'admin_whatsapp'").get() as any;
    const adminPhone = adminPhoneSetting?.value || '+212600000000';

    // Format phone for wa.me link (remove +, spaces, etc.)
    const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
    const defaultMsg = encodeURIComponent(
      `Salam Admin! Dert talab chahn rasid:\n` +
      `- Raqm l-talab: #${requestId}\n` +
      `- L-Mablagh: ${numericAmount} DH\n` +
      `- Tariqa: ${payment_method}\n` +
      `- ID eFootball: ${user.efootball_id}\n` +
      `- Pseudo: ${user.username}`
    );

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${defaultMsg}`;

    return NextResponse.json({
      success: true,
      request: {
        id: requestId,
        amount: numericAmount,
        payment_method,
        whatsapp,
        status: 'PENDING',
        created_at: createdAt
      },
      adminWhatsapp: adminPhone,
      whatsappUrl
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Mochkil f l-server' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const requests = db.prepare(`
      SELECT * FROM recharge_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(user.id);

    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
