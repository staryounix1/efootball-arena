# Supabase Setup Guide for Efootball Arena

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and API keys:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: `eyJ...` (safe to expose in frontend)
   - **Service Role Key**: `eyJ...` (keep secret, backend only)

## 2. Apply Database Migration

### Option A: Via Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard > SQL Editor
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20260911_arena.sql`
4. Run the query

### Option B: Via Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Frontend (Vite) - safe to expose
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend/Server - KEEP SECRET
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

For Vercel deployment, add these in Vercel Dashboard > Settings > Environment Variables.

## 4. Create SuperAdmin User

Run the setup script:

```bash
# Install dependencies if needed
cd scripts && npm install @supabase/supabase-js dotenv

# Run setup
node setup-superadmin.js
```

This will create:
- Supabase Auth user with email `admin@efootball-arena.ma`
- Public user record with ADMIN role
- Default credentials (CHANGE AFTER FIRST LOGIN!):
  - Email: `admin@efootball-arena.ma`
  - Password: `SuperAdmin2024!@#`

## 5. Verify Setup

1. Go to Supabase Dashboard > Authentication > Users
2. Verify the superadmin user exists
3. Go to Table Editor > users table
4. Verify the user record exists with role='ADMIN'

## 6. Configure Supabase Auth Settings

In Supabase Dashboard > Authentication > Settings:

### Site URL
Set to your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### Redirect URLs
Add:
- `https://your-app.vercel.app/**`
- `http://localhost:5173/**` (for local development)

### Email Templates (Optional)
Customize email templates for:
- Confirm signup
- Reset password
- Magic link

## 7. Enable Realtime (Optional)

For real-time features (match chat, live updates):
1. Go to Database > Replication
2. Enable replication for tables: `matches`, `match_messages`, `tournaments`, `recharges`

## 8. Storage Setup (Optional)

For profile images, match screenshots:
1. Go to Storage > Create bucket: `avatars`, `match-screenshots`
2. Set bucket policies for authenticated users

## 9. Test the Application

```bash
# Install all dependencies
pnpm install

# Run development server
pnpm --filter @workspace/efootball-arena run dev
```

Visit `http://localhost:5173` and login with superadmin credentials.

## Database Schema Overview

The migration creates:

| Table | Purpose |
|-------|---------|
| `users` | Player/admin accounts, balances, stats |
| `matches` | 1v1 challenges with stakes |
| `match_messages` | Chat messages for matches |
| `tournaments` | Tournament definitions |
| `tournament_participants` | User-tournament relationships |
| `transactions` | Wallet transaction history |
| `recharges` | Recharge/withdrawal requests |
| `settings` | Platform configuration |

## Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only access their own data
- Match participants can access match data
- Admins have full access to everything

## Troubleshooting

### "Relation does not exist" errors
- Ensure migration ran successfully
- Check Table Editor in Supabase Dashboard

### Auth errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Site URL and Redirect URLs in Auth settings

### RLS policy errors
- Verify user is authenticated
- Check policies in Authentication > Policies

### SuperAdmin not working
- Run `node scripts/setup-superadmin.js` again
- Verify service role key is correct
- Check user exists in both auth.users and public.users