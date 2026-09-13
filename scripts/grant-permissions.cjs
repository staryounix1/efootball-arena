#!/usr/bin/env node
/**
 * Grant permissions to all tables
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
    console.log('✅ متصل\n');

    const tables = ['users', 'matches', 'match_messages', 'tournaments', 'tournament_participants', 'transactions', 'recharges', 'settings'];
    
    console.log('🔧 منح صلاحيات...');
    
    for (const table of tables) {
        // Grant all permissions to authenticated and anon roles
        await client.query(`GRANT ALL ON TABLE public.${table} TO authenticated, anon;`);
        await client.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;`);
        console.log(`   ✅ ${table}`);
    }
    
    // Also grant function permissions
    console.log('\n🔧 منح صلاحيات الدوال...');
    await client.query(`GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated, anon;`);
    console.log('   ✅ update_updated_at_column');

    console.log('\n✅ تم!');

    await client.end();
}

main().catch(console.error);