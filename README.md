# Job Radar

> AI-powered job intelligence for every profession. Multi-tenant, multi-industry, zero-cost. Africa-first. Successor to the single-tenant [`Job-scanner`](https://github.com/AjibadeHassan/Job-scanner) repo.

[![Live preview](https://img.shields.io/badge/preview-running-emerald)](https://preview-z.ai/) [![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![Cost: $0/mo](https://img.shields.io/badge/operating%20cost-%240%2Fmo-emerald)](ARCHITECTURE.md#8-vps-infrastructure-zero-cost)

## What is this?

A multi-tenant SaaS where any user — nurse, accountant, paralegal, designer, engineer — uploads their resume, picks an expertise profile from 8 industries, connects their Telegram account, and starts receiving matched job notifications when scrapers find new roles.

The system runs as a real backend with workers, not a GitHub Action cron. It replaces JSON-file storage with Postgres+pgvector, replaces fragile 0-100 LLM scoring with a two-stage embedding+structured-output pipeline, and replaces brittle proxy scraping with per-user authenticated Playwright sessions + Cloudflare email ingestion.

## Stack

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js 16 + TypeScript | $0 |
| Auth | Auth.js v5 (email magic + Google + Microsoft) | $0 |
| Database | PostgreSQL 16 + pgvector + Prisma | $0 (self-hosted on Oracle Cloud Always Free) |
| Cache / Queue | Redis 7 + BullMQ | $0 |
| AI | Gemini 1.5 Flash (embeddings + structured matching + cover letters) | $0 (free tier 1500 req/day) |
| Object storage | Cloudflare R2 (10GB free) | $0 |
| Email ingestion | Cloudflare Email Routing + Workers | $0 |
| Notifications | Telegram Bot API (reuses job-scanner bot token) | $0 |
| VPS | Oracle Cloud Always Free (4 ARM cores, 24GB RAM) | $0 |
| Monitoring | Sentry free + UptimeRobot free | $0 |
| **Total monthly operating cost** | | **$0** (until ~75 active users) |

## Project structure

```
job-radar/
├── prisma/
│   ├── schema.prisma              # SQLite-adapted (sandbox MVP)
│   └── schema.production.prisma   # Postgres + pgvector (production)
├── src/
│   ├── app/                       # Next.js 16 App Router
│   │   ├── page.tsx               # main entry — single visible route
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/                   # REST + webhooks (planned)
│   ├── components/
│   │   ├── ui/                    # shadcn/ui (pre-installed)
│   │   └── job-radar/             # custom components
│   │       ├── hero.tsx
│   │       ├── navbar.tsx
│   │       ├── dashboard.tsx
│   │       ├── onboarding-wizard.tsx
│   │       ├── job-card.tsx
│   │       ├── cover-letter-modal.tsx
│   │       ├── sources-registry.tsx
│   │       ├── architecture.tsx
│   │       ├── footer.tsx
│   │       └── logo.tsx
│   └── lib/
│       ├── mock-data.ts           # demo jobs, sources, taxonomy
│       ├── db.ts                  # Prisma client
│       └── utils.ts
├── ARCHITECTURE.md                # full v1.1 architecture brief
├── docker-compose.yml             # planned for Phase 0 production deploy
├── .env.example                   # all required env vars documented
└── package.json
```

## Sandbox vs Production

This repo contains a **sandbox preview** — a working Next.js app that demonstrates the entire Job Radar product end-to-end using mock data and an interactive onboarding wizard. The sandbox uses SQLite (no pgvector) and local memory caching (no Redis) per the sandbox constraints.

The **production** deploy uses:
- Postgres 16 + pgvector (swap `schema.prisma` for `schema.production.prisma`)
- Redis 7 + BullMQ (replace in-memory queue with real queue)
- Oracle Cloud Always Free VPS (instead of sandbox preview environment)
- Real scrapers (replace mock-data imports with Prisma queries)
- Per-user authenticated Playwright sessions for LinkedIn/Indeed/Glassdoor/Otta
- Cloudflare Email Routing for inbound job-alert parsing

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full v1.1 spec including the production Prisma schema, the 40-source registry, the two-stage AI pipeline, and the 12-day phased build plan.

## Run locally

```bash
# 1. Install dependencies
bun install

# 2. Set up the database (SQLite for sandbox)
cp .env.example .env
bun run db:push

# 3. Start dev server (runs on port 3000)
bun run dev
```

Open `http://localhost:3000` — you'll see the landing page, interactive onboarding wizard, dashboard with mock matched jobs, source registry, and architecture overview.

## Phased build plan

| Phase | Scope | Days |
|---|---|---|
| **0** | VPS setup, Docker Compose, Postgres+pgvector, Caddy, DNS, TLS | 0.5 |
| **1** | Auth.js v5, Prisma schema (production), migrations, seed taxonomy | 1.5 |
| **2** | Onboarding wizard: resume upload + parser, expertise picker, Telegram deep-link QR, preferences | 2.0 |
| **3** | Scraper engine v2: RSS+API sources for pan-African + generalist + 8 industry verticals. Source health tracking. | 2.0 |
| **4** | Email ingestion: Cloudflare Email Routing → Worker webhook, regex+LLM parser | 1.5 |
| **5** | AI matching v2: Gemini embeddings, pgvector cosine filter, Gemini 1.5 Flash structured matcher | 1.5 |
| **6** | BullMQ scheduler + per-user cron + worker pool (4 job types) | 1.0 |
| **7** | Dashboard v2: live job feed, filters, application tracker, source health page | 1.5 |
| **8** | Polish: Sentry, GDPR data export, rate limits, source health alerts | 1.0 |

**Status:** Sandbox preview complete. Production build is phased per the plan above.

## Sources (40 total)

- **Tier A · 25 sources** — RSS + JSON API. Free aggregators (Adzuna, Jooble, USAJobs, Reed, Muse), pan-African boards (Jobberman, MyJobMag, BrighterMonday, Careers24, JobWebGhana), and industry verticals (eFinancialCareers, NHS Jobs, Tes, HigherEdJobs, Behance, Dribbble, Law.com, SalesGravy, idealist, Rigzone, etc.)
- **Tier B · 5 sources** — Email ingestion. LinkedIn/Indeed/Glassdoor/Otta/Bayt alerts forwarded by user to their unique inbox.
- **Tier C · 4 sources** — Per-user authenticated Playwright sessions for LinkedIn/Indeed/Glassdoor/Otta personalized feeds.
- **Tier D · 6 sources** — Legacy tech-remote pool (RemoteOK, Remotive, WWR, HN, Working Nomads, Europe Remote). Demoted to ~10% weight.
- **Tier E · 4 sources** — Explicitly excluded with reason (Upwork, Freelancer, Wellfound, direct LinkedIn scraping).

Full source registry with health scores: see the Sources section in the live preview, or `src/lib/mock-data.ts`.

## What's different from the original Job-scanner

| Aspect | Job-scanner (original) | Job Radar (this repo) |
|---|---|---|
| Tenancy | Single-tenant (env-configured) | Multi-tenant (Postgres-backed) |
| Auth | None | Auth.js v5 (email + Google + Microsoft) |
| Profile | GitHub repos + resume | Resume upload + LLM-parsed structured profile |
| Industries | Tech only | 8 industries: Tech, Healthcare, Finance, Education, Creative, Sales, Legal, Operations |
| Geography | Global remote | Africa-first + global remote fallback |
| Sources | 28 mostly-broken scrapers | 40 sources across 5 tiers (RSS, API, Email, Session, Excluded) |
| Scraping method | HTTP + cheerio | RSS + API + email ingestion + per-user Playwright sessions |
| Proxy usage | None (silently failed for Cloudflare-protected sites) | None — uses user's own authenticated sessions instead |
| DB | `data/results.json` file | Postgres 16 + pgvector |
| AI matching | LLM scores each job 0-100 individually (expensive, non-deterministic) | Two-stage: pgvector cosine filter → Gemini structured-output batch match |
| Scheduler | GitHub Actions hourly cron | BullMQ per-user cron (every 1-24h, user-configurable) |
| Notifications | One Telegram chat (env-configured) | Per-user Telegram chat (deep-link QR onboarding) |
| Operating cost | $0 (but limited to 1 user) | $0 (scales to ~75 users before first paid tier) |

## License

MIT — see [LICENSE](LICENSE) (to be added).

## Acknowledgements

Built as the production successor to [AjibadeHassan/Job-scanner](https://github.com/AjibadeHassan/Job-scanner). Reuses the original Telegram bot token by design — existing users of the original bot can transition without changing anything on their end.
