#!/usr/bin/env node
/**
 * Disable RLS temporarily and create SuperAdmin
 */

const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.xhcdrieliyjtzijvneug',
        password: '124578YOUNIx@1',
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ متصل بقاعدة البيانات\n');

    // Disable RLS on all tables temporarily
    console.log('🔧 تعطيل RLS مؤقتاً...');
    const tables = ['users', 'matches', 'match_messages', 'tournaments', 'tournament_participants', 'transactions', 'recharges', 'settings'];
    
    for (const table of tables) {
        await client.query(`ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`);
        console.log(`   ⏭️ ${table} - RLS معطل`);
    }
    console.log('');

    // Create SuperAdmin user record directly
    console.log('👤 إنشاء حساب SuperAdmin...');
    
    const userId = '4155fecb-8df4-47eb-a53f-55abfb1e0ee8';
    
    try {
        await client.query(`INSERT INTO public.users (id, username, email, password_hash, role, balance, efootball_id, whatsapp, wins, losses, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING`, [
            userId,
            'superadmin',
            'admin@efootball-arena.ma',
            'supabase_auth_managed',
            'ADMIN',
            0,
            'ADMIN-001',
            '+212600000000',
            0,
            0
        ]);
        console.log('✅ تم إنشاء سجل المستخدم');
    } catch (e) {
        if (e.message.includes('duplicate')) {
            console.log('⏭️ المستخدم موجود بالفعل');
        } else {
            console.log(`❌ خطأ: ${e.message}`);
        }
    }

    // Verify
    console.log('\n🔍 التحقق من المستخدم...');
    const { rows } = await client.query('SELECT * FROM public.users WHERE email = $1', ['admin@efootball-arena.ma']);
    
    if (rows.length > 0) {
        const user = rows[0];
        console.log('✅ تم التحقق:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Balance: ${user.balance}`);
        console.log(`   eFootball ID: ${user.efootball_id}`);
        console.log(`   WhatsApp: ${user.whatsapp}`);
    }

    // Re-enable RLS
    console.log('\n🔧 إعادة تفعيل RLS...');
    for (const table of tables) {
        await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
        console.log(`   ✅ ${table} - RLS مفعّل`);
    }
    console.log('');

    // Grant permissions to the authenticated user
    console.log('🔧 منح صلاحيات RLS...');
    await client.query(`
        CREATE POLICY "Authenticated users can access own data" ON users
            FOR ALL USING (auth.uid() = id);
    `);
    
    console.log('✅ تم!');

    await client.end();
}

main().catch(console.error);