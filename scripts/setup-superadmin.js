#!/usr/bin/env node
/**
 * SuperAdmin Setup Script for Efootball Arena
 * 
 * This script creates a superadmin user in Supabase Auth and the users table.
 * Run this after creating your Supabase project and applying the migration.
 * 
 * Usage:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Apply the migration: supabase/migrations/20260911_arena.sql
 * 3. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 4. Run: node scripts/setup-superadmin.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease set these in your .env file or environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const SUPERADMIN = {
    email: 'admin@efootball-arena.ma',
    password: 'SuperAdmin2024!@#',
    username: 'superadmin',
    efootball_id: 'ADMIN-001',
    whatsapp: '+212600000000',
    role: 'ADMIN'
};

async function setupSuperAdmin() {
    console.log('🚀 Setting up SuperAdmin for Efootball Arena...\n');

    try {
        // 1. Create auth user
        console.log('1️⃣ Creating Supabase Auth user...');
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: SUPERADMIN.email,
            password: SUPERADMIN.password,
            email_confirm: true,
            user_metadata: {
                username: SUPERADMIN.username,
                role: SUPERADMIN.role
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('   ℹ️ Auth user already exists, retrieving...');
                const { data: existingUser } = await supabase.auth.admin.listUsers();
                const user = existingUser.users.find(u => u.email === SUPERADMIN.email);
                if (user) {
                    SUPERADMIN.id = user.id;
                    console.log(`   ✅ Found existing user: ${user.id}`);
                }
            } else {
                throw authError;
            }
        } else {
            SUPERADMIN.id = authData.user.id;
            console.log(`   ✅ Auth user created: ${authData.user.id}`);
        }

        // 2. Create/update user in public.users table
        console.log('\n2️⃣ Creating/updating user in public.users table...');
        
        // Hash password for storage (using bcrypt would be better in production)
        // For now, we'll store a placeholder since Supabase Auth handles authentication
        const passwordHash = 'supabase_auth_managed';

        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: SUPERADMIN.id,
                username: SUPERADMIN.username,
                email: SUPERADMIN.email,
                password_hash: passwordHash,
                role: SUPERADMIN.role,
                balance: 0,
                efootball_id: SUPERADMIN.efootball_id,
                whatsapp: SUPERADMIN.whatsapp,
                wins: 0,
                losses: 0
            }, {
                onConflict: 'id'
            });

        if (userError) throw userError;
        console.log(`   ✅ User record created/updated in public.users`);

        // 3. Verify the user
        console.log('\n3️⃣ Verifying setup...');
        const { data: user, error: verifyError } = await supabase
            .from('users')
            .select('*')
            .eq('id', SUPERADMIN.id)
            .single();

        if (verifyError) throw verifyError;

        console.log('\n✅ SuperAdmin setup complete!');
        console.log('\n📋 SuperAdmin Credentials:');
        console.log('   Email:    ', SUPERADMIN.email);
        console.log('   Password: ', SUPERADMIN.password);
        console.log('   Username: ', SUPERADMIN.username);
        console.log('   Role:     ', SUPERADMIN.role);
        console.log('   User ID:  ', SUPERADMIN.id);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        console.log('   You can do this from the Supabase Dashboard > Authentication > Users');

    } catch (error) {
        console.error('\n❌ Error setting up SuperAdmin:', error.message);
        process.exit(1);
    }
}

setupSuperAdmin();