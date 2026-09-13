#!/usr/bin/env node
/**
 * Run Supabase Migration using pg client
 */

const { Client } = require('pg');
const { readFileSync } = require('fs');
const { resolve } = require('path');
require('dotenv').config();

async function runMigration() {
    console.log('📦 قراءة ملف الـ migration...\n');
    
    const migrationPath = resolve(__dirname, '..', 'supabase', 'migrations', '20260911_arena.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    // Decode URL-encoded password if needed
    let dbPassword = process.env.DATABASE_PASSWORD || '124578YOUNIx@1';
    
    const client = new Client({
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.xhcdrieliyjtzijvneug',
        password: dbPassword,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        console.log('🔌 الاتصال بقاعدة البيانات...');
        await client.connect();
        console.log('✅ الاتصال نجح!\n');
        
        // Split statements by semicolon
        const statements = sql.split(';').filter(s => s.trim());
        
        console.log(`📝 عدد الأوامر: ${statements.length}`);
        console.log('🚀 بدء التنفيذ...\n');
        
        let success = 0;
        let skipped = 0;
        let errors = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (!statement || statement.startsWith('--')) continue;
            
            const preview = statement.substring(0, 60).replace(/\n/g, ' ');
            process.stdout.write(`[${i+1}] ${preview}... `);
            
            try {
                await client.query(statement);
                console.log('✅');
                success++;
            } catch (e) {
                if (e.message.includes('already exists') || 
                    e.message.includes('duplicate') ||
                    e.message.includes('conflict')) {
                    console.log('⏭️ موجود');
                    skipped++;
                } else {
                    console.log(`❌ ${e.message.substring(0, 100)}`);
                    errors++;
                }
            }
        }
        
        console.log(`\n📊 النتيجة:`);
        console.log(`   ✅ نجح: ${success}`);
        console.log(`   ⏭️ موجود: ${skipped}`);
        console.log(`   ❌ أخطاء: ${errors}`);
        
    } catch (e) {
        console.error('❌ خطأ في الاتصال:', e.message);
        
        // Try with URL-encoded password
        console.log('\n🔄 جرب كلمة مرور مختلفة...');
        
        const variations = [
            '[124578YOUNIx@1]',
            '%5B124578YOUNIx%401%5D',
            '124578YOUNIx@1',
        ];
        
        for (const pwd of variations) {
            try {
                const altClient = new Client({
                    host: 'aws-1-eu-west-1.pooler.supabase.com',
                    port: 6543,
                    database: 'postgres',
                    user: 'postgres.xhcdrieliyjtzijvneug',
                    password: pwd,
                    ssl: { rejectUnauthorized: false }
                });
                await altClient.connect();
                console.log(`✅ اتصال ناجح بكلمة مرور: "${pwd}"`);
                await altClient.end();
                return;
            } catch (e2) {
                console.log(`❌ فشل مع: "${pwd}"`);
            }
        }
        
    } finally {
        await client.end();
    }
}

runMigration();