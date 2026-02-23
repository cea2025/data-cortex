# Data Cortex - Core Banking Knowledge Graph

מנוע ממשל נתונים ואמון – מקור האמת היחיד לגישור בין מבני מסדי נתונים של בנקאות ליבה.

## Stack

- **Framework:** Next.js 16 (App Router, React Server Components, Turbopack)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase Postgres + Prisma ORM v7
- **Auth:** Supabase Auth with Google Provider
- **UI:** Tailwind CSS v4 + shadcn/ui (RTL-native)
- **AI:** Anthropic Claude API
- **Search:** Full-text search with cmdk Omnibar (Ctrl+K)
- **State:** Zustand (UI) + TanStack Query v5 (server)
- **Deployment:** Vercel

## Features

- **Canonical Data Model** — Hierarchical asset tree: System → Schema → Table → Column
- **Bilingual Knowledge** — Hebrew (RTL) + English (LTR) content on every item
- **Knowledge Workflow** — Draft → Review → Approved/Rejected with owner notifications
- **AI Evidence Panel** — Claude-powered synthesis with clickable citations and confidence scores
- **Freshness Decay** — 12-month verification rule with visual indicators
- **Conflict Resolution** — Human > Integration > AI source weighting (ADR 4)
- **Immutable Audit Log** — Every mutation tracked, INSERT-only
- **Global Search** — Omnibar (Ctrl+K) across assets and knowledge items
- **Context Inspector** — Resizable split-pane: Schema Viewer (LTR) + Knowledge Tabs (RTL)

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- An Anthropic API key

### Setup

```bash
# Clone the repository
git clone https://github.com/cea2025/data-cortex.git
cd data-cortex

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `DATABASE_URL` | Postgres connection string (Transaction Pooler) |
| `DIRECT_URL` | Postgres direct connection (for migrations) |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build (includes Prisma generate) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample Core Banking data |
| `npm run db:studio` | Open Prisma Studio |

## Data Model

```
CoreBanking (System)
  └── dbo (Schema)
       ├── TBL_LN_CS (Loans) — 13 columns
       ├── TBL_CONTACTS (Contacts) — 13 columns
       └── TBL_PKDNOT (Deposits) — 8 columns
```

Each asset can have:
- **KnowledgeItems** — Business rules, warnings, deprecations, calculation logic
- **AIInsights** — AI-generated synthesis with source citations
- **AuditLogs** — Full change history

## Architecture Decisions

1. **Prisma over raw SQL** — Type-safe, migration-tracked, works with Supabase Postgres
2. **RTL root + LTR isolation** — Hebrew UI with English technical data
3. **Zustand + TanStack Query** — Ephemeral UI state + server state separation
4. **Conflict resolution** — Human knowledge > Integration data > AI-generated insights

## License

Private
