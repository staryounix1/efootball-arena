#!/usr/bin/env node
/**
 * Fix RLS policies - using correct catalog
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

    // Get all policy names from pg_policy
    console.log('🔧 حذف جميع سياسات RLS...');
    
    const { rows } = await client.query(`
        SELECT polname, polrelid::regclass as tablename 
        FROM pg_policy
    `);
    
    const tables = ['users', 'matches', 'match_messages', 'tournaments', 'tournament_participants', 'transactions', 'recharges', 'settings'];
    
    for (const table of tables) {
        const tablePolicies = rows.filter(r => r.tablename === table);
        for (const p of tablePolicies) {
            await client.query(`DROP POLICY IF EXISTS "${p.polname}" ON public.${table};`);
            console.log(`   ⏭️ ${table}.${p.polname}`);
        }
    }

    // Recreate simple policies for users table
    console.log('\n🔧 إعادة إنشاء سياسات users...');
    
    const userPolicies = [
        { name: 'view_own', sql: `CREATE POLICY view_own ON users FOR SELECT USING (auth.uid() = id)` },
        { name: 'update_own', sql: `CREATE POLICY update_own ON users FOR UPDATE USING (auth.uid() = id)` },
        { name: 'admin_select', sql: `CREATE POLICY admin_select ON users FOR SELECT USING (role = 'ADMIN')` },
        { name: 'admin_update', sql: `CREATE POLICY admin_update ON users FOR UPDATE USING (role = 'ADMIN')` },
        { name: 'admin_insert', sql: `CREATE POLICY admin_insert ON users FOR INSERT WITH CHECK (role = 'ADMIN')` },
    ];
    
    for (const p of userPolicies) {
        try {
            await client.query(p.sql);
            console.log(`   ✅ ${p.name}`);
        } catch (e) {
            console.log(`   ❌ ${p.name}: ${e.message.substring(0, 100)}`);
        }
    }

    console.log('\n✅ تم!');

    await client.end();
}

main().catch(console.error);