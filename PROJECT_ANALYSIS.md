# Efootball Arena - Project Analysis & Architecture

## Overview
Efootball Arena is a competitive Moroccan eFootball platform for paid 1v1 challenges, tournaments, rankings, and wallet management. Built as a full-stack TypeScript application with React frontend and Express backend.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7, Wouter (routing), TailwindCSS 4 |
| **State Management** | React Context + localStorage (demo) / Supabase (production) |
| **UI Components** | Radix UI primitives, shadcn/ui patterns |
| **Backend** | Express 5, Node.js 24 |
| **Database** | PostgreSQL (Supabase), Drizzle ORM |
| **Validation** | Zod v4, drizzle-zod |
| **API Codegen** | Orval (from OpenAPI spec) |
| **Build** | esbuild, TypeScript 5.9 |
| **Package Manager** | pnpm workspaces |

---

## Project Structure

```
efootball-arena/
├── artifacts/
│   ├── efootball-arena/          # Main React SPA (Vercel deployment)
│   │   ├── src/
│   │   │   ├── App.tsx           # Main app with all routes & logic
│   │   │   ├── main.tsx          # Entry point
│   │   │   ├── index.css         # Global styles + Tailwind
│   │   │   ├── components/ui/    # Reusable UI components
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   ├── lib/utils.ts      # Utility functions
│   │   │   └── pages/            # Page components
│   │   ├── vite.config.ts        # Vite configuration
│   │   ├── tsconfig.json         # TypeScript config
│   │   └── package.json
│   ├── api-server/               # Express API server
│   │   ├── src/
│   │   │   ├── index.ts          # Server entry
│   │   │   ├── app.ts            # Express app setup
│   │   │   ├── routes/           # API routes
│   │   │   └── lib/              # Logger, utilities
│   │   ├── build.mjs             # esbuild config
│   │   └── package.json
│   └── mockup-sandbox/           # UI component sandbox
├── lib/
│   ├── db/                       # Database layer (Drizzle)
│   │   ├── src/
│   │   │   ├── index.ts          # DB connection
│   │   │   └── schema/           # Table schemas
│   │   ├── drizzle.config.ts     # Drizzle config
│   │   └── package.json
│   ├── api-client-react/         # React Query API client
│   │   ├── src/
│   │   │   ├── index.ts          # Exports
│   │   │   ├── custom-fetch.ts   # Custom fetch wrapper
│   │   │   └── generated/        # Orval-generated API
│   │   └── package.json
│   ├── api-zod/                  # Zod schemas from OpenAPI
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── generated/
│   │   └── package.json
│   └── api-spec/                 # OpenAPI spec & Orval config
│       ├── openapi.yaml
│       ├── orval.config.ts
│       └── package.json
├── scripts/                      # Utility scripts
│   ├── src/hello.ts
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 20260911_arena.sql    # Database schema
├── package.json                  # Root package.json
├── pnpm-workspace.yaml           # pnpm workspace config
├── tsconfig.base.json            # Base TypeScript config
├── vercel.json                   # Vercel deployment config
└── replit.md                     # Project documentation
```

---

## Core Features

### 1. **Authentication & User Management**
- Email/password registration & login
- Role-based access: `PLAYER` | `ADMIN`
- Supabase Auth integration (production)
- localStorage fallback (demo mode)
- Arabic/Darija language support with RTL

### 2. **Match System (1v1 Challenges)**
- Create challenges with stake amount
- Platform selection: Mobile, PlayStation, Xbox/PC
- Escrow system: stakes held until match completion
- Match statuses: OPEN → PLAYING → COMPLETED/DISPUTE
- Room code sharing for match coordination
- Chat system within matches
- Result submission with winner declaration

### 3. **Tournament System**
- Knockout tournaments with entry fees
- Prize pool distribution
- Participant management
- Join/leave functionality
- Tournament status tracking

### 4. **Wallet & Financial System**
- User balance management
- Recharge requests (CIH Bank, Cash Plus)
- Admin approval workflow
- Transaction history
- Escrow for match stakes
- Commission system (10% default)

### 5. **Leaderboard & Rankings**
- Win/loss tracking
- Win rate calculation
- Top player rankings

### 6. **Admin Panel**
- Recharge request management
- Dispute resolution
- User management
- Platform settings configuration
- Financial adjustments

---

## Data Models (from App.tsx)

### User
```typescript
{
  id: string;
  username: string;
  email: string;
  password: string;           // Hashed in production
  role: 'PLAYER' | 'ADMIN';
  balance: number;            // In DH (Moroccan Dirham)
  efootball_id: string;       // eFootball game ID
  whatsapp: string;           // Contact for payments
  wins: number;
  losses: number;
}
```

### Match
```typescript
{
  id: string;
  title: string;
  creator_id: string;
  creator_name: string;
  creator_efootball_id: string;
  opponent_id?: string;
  opponent_name?: string;
  opponent_efootball_id?: string;
  platform: string;           // Mobile, PlayStation, Xbox/PC
  stake: number;              // Entry fee per player
  prize: number;              // Winner takes (stake * 2 * 0.9)
  status: 'OPEN' | 'PLAYING' | 'DISPUTE' | 'COMPLETED';
  room_code?: string;
  winner_id?: string;
  winner_name?: string;
  messages: Message[];
}
```

### Tournament
```typescript
{
  id: string;
  title: string;
  prize_pool: number;
  entry_fee: number;
  max_players: number;
  participant_count: number;
  start_date: string;
  rules: string;
  joined?: boolean;
}
```

### Transaction
```typescript
{
  id: string;
  type: string;               // MATCH, TOURNAMENT, RECHARGE, WITHDRAWAL, ADJUSTMENT
  description: string;
  amount: number;             // Positive = credit, Negative = debit
  balance_after: number;
  created_at: string;
}
```

### Recharge
```typescript
{
  id: string;
  username: string;
  userId: string;
  amount: number;
  payment_method: string;     // CIH Bank, Cash Plus
  whatsapp: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}
```

---

## Architecture Decisions

### Client-First Approach
- Initial version uses localStorage for demo data
- Supabase integration for production auth & data
- Easy transition from demo to production

### State Management
- React Context (`ArenaProvider`) for global state
- `useStored` hook for localStorage persistence
- All mutations go through context methods

### Routing
- Wouter for lightweight client-side routing
- Routes: `/`, `/matches`, `/matches/:id`, `/tournaments`, `/leaderboard`, `/profile`, `/login`, `/register`, `/admin`

### Styling
- TailwindCSS 4 with custom design system
- Dark theme with emerald/teal/cyan accents
- RTL support for Arabic languages
- CSS variables for theming

### Internationalization
- Three languages: Darija (Latin), Darija (Arabic), Arabic (Fusha)
- Context-based translation system
- Dynamic direction switching (LTR/RTL)

---

## API Layer

### Generated from OpenAPI Spec
- `@workspace/api-spec/openapi.yaml` defines the API
- Orval generates:
  - React Query hooks (`@workspace/api-client-react`)
  - Zod validation schemas (`@workspace/api-zod`)

### Custom Fetch
- `custom-fetch.ts` handles:
  - Base URL configuration
  - Auth token attachment
  - Error parsing
  - Response type inference

---

## Database Schema (Supabase)

See `supabase/migrations/20260911_arena.sql` for full schema.

Key tables:
- `users` - Core user data
- `matches` - 1v1 challenges
- `match_messages` - Match chat
- `tournaments` - Tournament definitions
- `tournament_participants` - Many-to-many
- `transactions` - Wallet history
- `recharges` - Payment requests
- `settings` - Platform config

### Security
- Row Level Security (RLS) on all tables
- Policies enforce data isolation
- Admin bypass via role check

---

## Deployment

### Vercel (Frontend)
- `vercel.json` configures build
- Output: `artifacts/efootball-arena/dist/public`
- SPA rewrites for client-side routing
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Backend (Separate)
- Express server deployable to any Node.js host
- Requires: `DATABASE_URL`, `PORT`
- Health check at `/api/healthz`

### Supabase
- Hosted PostgreSQL with Auth, Realtime, Storage
- Run migration: `supabase/migrations/20260911_arena.sql`
- Configure Auth settings (Site URL, Redirect URLs)

---

## Development Workflow

```bash
# Install dependencies
pnpm install

# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run frontend dev server
pnpm --filter @workspace/efootball-arena run dev

# Run API server
pnpm --filter @workspace/api-server run dev

# Regenerate API from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push

# Setup superadmin (after Supabase setup)
node scripts/setup-superadmin.js
```

---

## Environment Variables

### Frontend (Vite)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |

### Backend (API Server)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Yes | Server port (default 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `LOG_LEVEL` | No | Log level (debug/info/warn/error) |

### SuperAdmin Setup Script
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (secret) |

---

## Key Files to Understand

1. **`artifacts/efootball-arena/src/App.tsx`** - Complete application logic, state, routes, components
2. **`supabase/migrations/20260911_arena.sql`** - Database schema with RLS policies
3. **`lib/db/src/schema/index.ts`** - Drizzle schema definitions (when implemented)
4. **`lib/api-spec/openapi.yaml`** - API contract
5. **`vercel.json`** - Deployment configuration
6. **`pnpm-workspace.yaml`** - Monorepo configuration

---

## Security Considerations

- Passwords hashed via Supabase Auth (not stored in DB)
- Service role key only used in secure backend/scripts
- RLS policies prevent unauthorized data access
- Input validation via Zod schemas
- HTTPS enforced in production
- CORS configured for API

---

## Future Enhancements

- [ ] Real-time match updates via Supabase Realtime
- [ ] Push notifications for match events
- [ ] Payment gateway integration (CIH, Cash Plus APIs)
- [ ] Match replay/screenshot verification system
- [ ] Mobile app (React Native/Expo)
- [ ] Advanced tournament formats (Swiss, Round Robin)
- [ ] Referral/affiliate system
- [ ] Admin audit logs