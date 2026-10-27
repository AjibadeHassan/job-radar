# Job Radar — Architecture Brief v1.0

> Multi-tenant, multi-industry job intelligence service. Successor to the single-tenant `Job-scanner` repo. Africa-first geography, generalist industry coverage, free-tier AI stack.

**Status:** Pre-build specification
**Date:** 2026-10-28
**Owner:** Hassan (with senior engineering review)

---

## 1. Executive Summary

The original `Job-scanner` is a personal Next.js app: one GitHub user, one Telegram chat, one resume file path, hourly GitHub Actions cron, 28 mostly-tech scrapers writing to a JSON file. It works for one person. It cannot support a second user without forking the repo.

**Job Radar** is the production successor. It is built as a true multi-tenant SaaS: any user signs up, uploads a resume, picks an expertise profile from a taxonomy spanning eight industries, connects their Telegram account via a deep-link QR code, and starts receiving matched job notifications on their own schedule. The system runs on a single VPS, replaces GitHub Actions with a proper queue, replaces JSON storage with Postgres+pgvector, and replaces brittle LLM-score-everything matching with a two-stage embedding + structured-output pipeline.

### Three load-bearing decisions

1. **Africa-first geography.** Pan-African boards (Jobberman NG, MyJobMag NG, BrighterMonday KE/UG/TZ, Careers24 ZA) get primary weight; global remote aggregators serve as fallback. This is an underserved market where existing players (LinkedIn, Indeed) have weak local coverage.
2. **Generalism from day one.** Tech, Healthcare, Finance, Education, Creative, Sales, Legal, Operations — eight industries with a hierarchical `Industry → Function → Seniority → Specialization` taxonomy. GitHub OAuth and GitHub-repo-as-profile are dropped entirely; resume upload + LLM parsing is the only profile entry path.
3. **Email ingestion as a first-class source.** LinkedIn, Indeed, Glassdoor, and Otta all send email job alerts by design and industry-agnostically. Each user gets a unique inbound address (`user-abc123@radar.inbound`); emails are parsed into structured job postings. This is 100% ToS-compliant, 100% reliable, and replaces roughly 40% of what scraping used to do — with zero anti-bot risk.

### Cost ceiling

Free tier for everything except OpenAI matching. Estimated monthly burn at 100 active users: **$8 VPS + $5-15 OpenAI = $13-23/mo.** Profitable at $5/mo subscription with 5 paying users.

---

## 2. System Architecture

```
                          ┌──────────────────────────┐
                          │   Caddy (TLS, reverse    │
                          │   proxy, auto-HTTPS)     │
                          └────────────┬─────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                              │
                ▼                                              ▼
    ┌────────────────────┐                       ┌─────────────────────┐
    │  Next.js 16 app    │                       │  Telegram Bot      │
    │  (dashboard,       │                       │  (long-polling,    │
    │   onboarding, API) │                       │   per-user dispatch)│
    └─────────┬──────────┘                       └──────────┬──────────┘
              │                                              │
              │           ┌──────────────────────┐           │
              └──────────▶│  PostgreSQL 16       │◀──────────┘
                          │  + pgvector          │
                          │  + Prisma ORM        │
                          └──────────┬───────────┘
                                     │
                          ┌──────────┴───────────┐
                          │                      │
                          ▼                      ▼
              ┌────────────────────┐   ┌─────────────────────┐
              │  Redis 7           │   │  Worker process     │
              │  (BullMQ queue +   │   │  (scraper + AI     │
              │   rate limits)     │   │   + email ingest)  │
              └────────────────────┘   └─────────────────────┘
                          ▲                      ▲
                          │                      │
              ┌───────────┴──────────────────────┴───────────┐
              │           External services                  │
              │  Adzuna · Jooble · USAJobs · Reed · Muse     │
              │  Jobberman · BrighterMonday · Careers24      │
              │  Postmark inbound (email parse)              │
              │  Gemini (embeddings) · OpenAI (matching)     │
              │  Telegram Bot API                            │
              └──────────────────────────────────────────────┘
```

### Component responsibilities

| Component | Responsibility |
|---|---|
| **Next.js 16 app** | Auth (Auth.js v5), onboarding wizard, dashboard, REST API for jobs/scans/preferences, Telegram deep-link capture |
| **PostgreSQL 16 + pgvector** | All relational data + vector embeddings in one DB. Multi-tenant via `userId` foreign key on every table. |
| **Redis 7** | BullMQ job queue, per-source rate-limit tokens, per-user notification counters |
| **Worker process** | Three job types: `scrape` (fetch from sources), `match` (embed + LLM score), `notify` (Telegram dispatch) |
| **Telegram Bot** | Long-polling via `getUpdates`. Receives `/start USER_TOKEN`, stores `chatId`, sends notifications with inline buttons |
| **Caddy** | Automatic HTTPS via Let's Encrypt, reverse proxy to Next.js |

### Data flow: a single user's scan

```
1. BullMQ cron fires for user U at their preferred cadence
2. Worker pulls U's Profile + ExpertiseTags + embedding vector
3. Worker scrapes U's preferred sources (filtered by industry + region)
4. New jobs deduplicated against JobPosting table (URL hash + title+company hash)
5. New jobs embedded via Gemini (batched, cached)
6. Cosine similarity vs U's profile embedding → filter < 0.55
7. Top 20 candidates sent to OpenAI gpt-4o-mini with JSON schema response
8. Jobs with score ≥ user's threshold saved as UserJobMatch
9. Top N (user-configurable, default 5) queued for Telegram notification
10. Notification worker respects timezone window + per-user daily cap
11. Telegram message sent with inline buttons: [View] [Apply] [Cover Letter] [Mute Source]
12. ScanRun record written with stats; UserJobMatch.status tracks lifecycle
```

---

## 3. Data Model (Prisma Schema)

```prisma
// schema.prisma — Job Radar v1

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

// ── Auth.js v5 standard models ──────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  resumes       Resume[]
  telegram      TelegramLink?
  matches       UserJobMatch[]
  scans         ScanRun[]
  notifications NotificationLog[]
  inbox         EmailInbox?
  preferences   UserPreferences?
}

model Account {
  // OAuth providers: email-magic, google, microsoft
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ── User profile (parsed from resume) ────────────────────────────

model Profile {
  userId            String   @id
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  seniority         Seniority
  primaryStack     String[] // ["TypeScript","React","Nursing","QuickBooks"] — field-agnostic
  domains          String[] // ["fintech","healthtech","audit"]
  workModes        WorkMode[]
  timezone         String   // "Africa/Lagos"
  salaryMin        Int?
  salaryCurrency   String?  @default("USD")
  redFlags         String[] // ["no crypto","no on-call-only"]
  greenFlags       String[] // ["4-day week ok","security clearance ok"]
  embedding        Unsupported("vector(768)")? // Gemini text-embedding-004 dim
  embeddingModel   String?  // "gemini-text-embedding-004"
  embeddingUpdatedAt DateTime?
  updatedAt        DateTime @updatedAt
}

model Resume {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  version   Int      // 1, 2, 3 — user can re-upload
  fileUrl   String   // S3-compatible URL
  fileHash  String   // sha256, for dedup
  rawText   String   @db.Text
  parsedAt  DateTime @default(now())

  @@unique([userId, version])
}

model UserPreferences {
  userId              String   @id
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scanCadenceHours    Int      @default(6)     // every 6 hours
  minMatchScore       Int      @default(60)     // 0-100
  maxNotificationsDay Int      @default(5)
  notifyWindowStart   String   @default("08:00") // local time HH:mm
  notifyWindowEnd     String   @default("21:00")
  mutedSources        String[] @default([])
  mutedIndustries     String[] @default([])
  preferredLanguages  String[] @default(["en"])
}

// ── Telegram link (per-user chat) ───────────────────────────────

model TelegramLink {
  userId     String   @id
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chatId     String   @unique
  botToken   String   // shared bot token, but link is per-user
  verifiedAt DateTime?
  deepLinkToken String @unique // one-time token from /start?start=TOKEN
  mutedUntil  DateTime?
  createdAt   DateTime @default(now())
}

// ── Expertise taxonomy (shared, seed data) ──────────────────────

model ExpertiseTag {
  id        String   @id @default(cuid())
  industry  Industry
  function  String   // "Nursing", "Frontend Engineering", "Audit"
  seniority Seniority?
  specialization String? // "ICU", "React", "SOX"
  label     String   // human-readable
  slug      String   @unique
}

// ── Job sources registry ────────────────────────────────────────

model Source {
  id            String   @id @default(cuid())
  name          String   @unique // "Jobberman Nigeria"
  slug          String   @unique
  kind          SourceKind // RSS, API, JSON, EMAIL
  region        String[] // ["NG"], ["GLOBAL"]
  industries    Industry[] // which industries it covers
  endpoint      String?  // RSS URL, API base, etc
  rateLimitPerMin Int?
  healthScore   Float    @default(1.0) // rolling avg of success rate
  lastScrapedAt DateTime?
  lastBrokeAt   DateTime?
  enabled       Boolean  @default(true)
  notes         String?
  createdAt     DateTime @default(now())
}

// ── Job postings (shared across users) ──────────────────────────

model JobPosting {
  id           String   @id @default(cuid())
  sourceId     String
  source       Source   @relation(fields: [sourceId], references: [id])
  externalId   String   // source-specific id (for dedup)
  title        String
  company      String
  location     String
  workMode     WorkMode?
  url          String
  applyUrl     String?
  postedAt     DateTime
  rawText      String   @db.Text
  embedding    Unsupported("vector(768)")?
  embeddingModel String?
  embeddingUpdatedAt DateTime?
  industries   Industry[]
  createdAt    DateTime @default(now())

  matches      UserJobMatch[]

  @@unique([sourceId, externalId])
  @@index([postedAt])
  @@index([industries])
}

// ── Per-user match state ─────────────────────────────────────────

model UserJobMatch {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobId        String
  job          JobPosting @relation(fields: [jobId], references: [id])
  matchScore   Int      // 0-100
  matchReason  String
  redFlags     String[]
  experienceFit String?
  coverLetter  String?  @db.Text
  coverLetterTone String?
  coverLetterHash String? // for cache invalidation
  status       MatchStatus @default(NEW)
  notifiedAt   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([userId, jobId])
  @@index([userId, status])
  @@index([userId, matchScore])
}

// ── Scan history + notifications ────────────────────────────────

model ScanRun {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startedAt    DateTime @default(now())
  finishedAt   DateTime?
  sourcesUsed  String[]
  jobsScraped  Int      @default(0)
  jobsNew      Int      @default(0)
  jobsMatched  Int      @default(0)
  aiProvider   String?
  error        String?
}

model NotificationLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobId     String?
  channel   NotificationChannel
  sentAt    DateTime @default(now())
  status    String   // "sent", "failed", "rate-limited"
  error     String?
}

// ── Email ingestion (Tier B) ────────────────────────────────────

model EmailInbox {
  userId    String   @id
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  address   String   @unique // "user-abc123@radar.inbound"
  createdAt DateTime @default(now())
}

model InboundEmail {
  id           String   @id @default(cuid())
  inboxId      String
  fromEmail    String
  fromDomain   String  // "linkedin.com", "indeed.com"
  subject      String
  rawBody      String  @db.Text
  parsedJobs   Json?    // [{title, company, url, location}]
  receivedAt   DateTime @default(now())
  processedAt  DateTime?
  status       String  @default("PENDING")

  @@index([inboxId, receivedAt])
}

// ── Enums ───────────────────────────────────────────────────────

enum Role {
  USER
  ADMIN
}

enum Seniority {
  INTERN
  JUNIOR
  MID
  SENIOR
  LEAD
  STAFF
  MANAGER
  DIRECTOR
}

enum WorkMode {
  REMOTE
  HYBRID
  ONSITE
}

enum Industry {
  TECH
  HEALTHCARE
  FINANCE
  EDUCATION
  CREATIVE
  SALES
  LEGAL
  OPERATIONS
}

enum SourceKind {
  RSS
  API
  JSON
  EMAIL
}

enum MatchStatus {
  NEW
  SEEN
  APPLYING
  APPLIED
  INTERVIEWING
  REJECTED
  IGNORED
}

enum NotificationChannel {
  TELEGRAM
  EMAIL
}
```

---

## 4. Source Registry

Categorized. Each source has a Prisma `Source` record with measured `healthScore` (rolling avg of success rate). Sources below 0.5 are auto-disabled and alert the admin.

### 4.1 Pan-African (primary tier, MVP)

| Source | Region | Industries | Method | Notes |
|---|---|---|---|---|
| Jobberman | NG | All 8 | RSS (verify) + JSON scrape | Largest Nigerian board; check RSS availability |
| MyJobMag | NG | All 8 | RSS | Confirmed RSS feeds per category |
| BrighterMonday | KE, UG, TZ | All 8 | RSS | Standard RSS, well-maintained |
| Careers24 | ZA | All 8 | RSS + API | South Africa's largest; partner API available |
| JobWebGhana | GH | All 8 | RSS | Verify |
| LinkedIn Africa (via email) | All African | All 8 | Email ingestion | User's own LinkedIn alerts forwarded |

### 4.2 Generalist aggregators (free APIs / RSS)

| Source | Region | Industries | Method | Rate limit |
|---|---|---|---|---|
| Adzuna | Global (most countries) | All | JSON API | 1k req/mo free |
| Jooble | Global | All | JSON API | Partner program, free |
| USAJobs | US | All | JSON API | Free, US gov |
| Reed.co.uk | UK | All | JSON API | Free |
| The Muse | Global | All 8 | JSON API | Free |
| Arbeitsagentur | DE | All | API | Free, German |
| EURES | EU | All | API | Free |
| dev.to jobs | Global remote | TECH | JSON API | Free |

### 4.3 Industry verticals

| Source | Industry | Region | Method |
|---|---|---|---|
| eFinancialCareers | FINANCE | Global | RSS |
| NHS Jobs | HEALTHCARE | UK | RSS |
| Health eCareers | HEALTHCARE | US | RSS |
| Tes.com | EDUCATION | UK/global | RSS |
| HigherEdJobs | EDUCATION | US | RSS |
| Behance jobs | CREATIVE | Global | JSON |
| Dribbble jobs | CREATIVE | Global | RSS |
| Law.com | LEGAL | US/UK | RSS |
| SalesGravy | SALES | US | RSS |
| MarketingWeek | SALES/MKTG | UK | RSS |
| idealist.org | OPERATIONS (nonprofit) | Global | RSS |
| Rigzone | OPERATIONS (oil/gas) | Global | RSS |

### 4.4 Tech / Remote (legacy pool, demoted to ~10% weight)

| Source | Method |
|---|---|
| RemoteOK | JSON API |
| Remotive | JSON API |
| WeWorkRemotely | RSS |
| Hacker News "Who's hiring" | HN Algolia API |
| Working Nomads | RSS |
| Europe Remote | RSS |

### 4.5 Email ingestion (Tier B — strategic for generalism)

Each user gets `user-{token}@radar.inbound`. They forward their existing alert emails from:

- **LinkedIn** job alerts (any industry, any region)
- **Indeed** email alerts
- **Glassdoor** job alerts
- **Otta** daily digest
- **Bayt** alerts (MENA)
- **Naukri** alerts (India)
- **Company career pages** that offer "email me new jobs" (most do)

Postmark Inbound Parse receives the email, posts raw body to our `/api/inbound-email` webhook, worker parses with a regex+LLM hybrid (regex for structured alert emails, LLM for messy ones), creates `InboundEmail` + linked `JobPosting` records.

### 4.6 Sources explicitly excluded

- **Upwork, Freelancer, Guru, Crossover, Wellfound** — all use Cloudflare/login walls. Scraping is brittle and ToS-violating. Email alerts cover them if needed.
- **LinkedIn direct scraping** — cease-and-desist risk. Email ingestion only.
- **Otta direct scraping** — same. Email ingestion only.

---

## 5. AI Pipeline

### 5.1 Resume parsing (one-shot at upload)

**Input:** PDF/DOCX → `pdf-parse` extracts text → sent to OpenAI gpt-4o-mini with structured JSON schema response.

**Output schema:**
```json
{
  "seniority": "SENIOR",
  "primaryStack": ["TypeScript", "React", "Node.js", "PostgreSQL"],
  "domains": ["fintech", "developer-tools"],
  "workModes": ["REMOTE", "HYBRID"],
  "redFlags": [],
  "greenFlags": ["4-day-week-ok"],
  "suggestedIndustries": ["TECH", "FINANCE"],
  "confidence": 0.85
}
```

User confirms/edits the parsed fields in the onboarding wizard before saving. Cost: ~$0.001 per resume.

### 5.2 Profile embedding

Profile is serialized into a single text block:
```
Senior: Senior Software Engineer. Stack: TypeScript, React, Node.js, PostgreSQL.
Domains: fintech, developer-tools. Mode: remote/hybrid. Wants: 4-day week.
Avoids: crypto, on-call-only roles.
```

Embedded via **Gemini `text-embedding-004`** (free, 768-dim, multilingual). Stored in `Profile.embedding`. Re-embedded when profile changes.

### 5.3 Job embedding

Each `JobPosting.rawText` (truncated to 8k tokens) is embedded via Gemini, batched (max 100 per API call). Embeddings cached in `JobPosting.embedding`. Re-embedded only if `rawText` changes (which it doesn't, since postings are immutable).

### 5.4 Stage 1 — Semantic filter

Postgres + pgvector query:
```sql
SELECT id, title, company,
       1 - (embedding <=> $profile_embedding) AS similarity
FROM "JobPosting"
WHERE industries && $user_industries
  AND embedding IS NOT NULL
  AND posted_at > NOW() - INTERVAL '7 days'
  AND id NOT IN (SELECT "jobId" FROM "UserJobMatch" WHERE "userId" = $user_id)
ORDER BY embedding <=> $profile_embedding
LIMIT 50;
```

Returns top 50 candidates. Filter `similarity < 0.55`. Cost: $0 (in-DB operation).

### 5.5 Stage 2 — Structured-output matching

Top ~20 candidates sent to OpenAI gpt-4o-mini with `response_format=json_schema`:

```json
{
  "type": "object",
  "properties": {
    "score": {"type": "integer", "minimum": 0, "maximum": 100},
    "reason": {"type": "string", "maxLength": 280},
    "redFlags": {"type": "array", "items": {"type": "string"}},
    "experienceFit": {"type": "string", "enum": ["UNDERQUALIFIED","FIT","OVERQUALIFIED"]},
    "coverLetterTone": {"type": "string", "enum": ["FORMAL","CONVERSATIONAL","CONFIDENT"]}
  },
  "required": ["score", "reason", "experienceFit"]
}
```

Batched: 5 jobs per prompt to amortize tokens. Cost: ~$0.0003 per batch → ~$0.0015 per scan for 20 jobs.

### 5.6 Cover letter generation

Lazy-generated when user clicks "Cover Letter" in dashboard OR when score ≥ 80 (auto-generated for top matches). Cached by hash of `(userId, jobId, tone)` — never regenerated for the same triple. Cost: ~$0.005 per letter.

### 5.7 Total AI cost per user per scan

| Step | Cost |
|---|---|
| Resume parse (one-time) | $0.001 |
| Profile embed (one-time + on edits) | $0 (Gemini free) |
| Job embeds (per new job) | $0 (Gemini free, batched) |
| Stage 2 matching (20 jobs) | $0.0015 |
| Cover letter (top 5, on-demand) | $0.025 |
| **Per scan** | **~$0.027** |
| **Per user per day** (4 scans) | **~$0.11** |
| **Per user per month** | **~$3.30** |

At 100 active users: **$330/mo** AI cost. Manageable with $5/mo subscriptions.

---

## 6. Onboarding Wizard

Four-step pop-up modal. User cannot reach the dashboard until complete. State persisted in `UserPreferences` + `Profile` + `TelegramLink` progressively.

### Step 1 — Resume upload
- Drag-drop PDF/DOCX
- Live parse: shows extracted `{seniority, stack, domains, workModes}` for user confirmation
- Editable fields with typeahead from the ExpertiseTag taxonomy
- "Save & continue" persists Resume record + Profile record

### Step 2 — Expertise picker
- Hierarchical combobox: `Industry → Function → Seniority → Specialization`
- Multi-select for specialization
- Free-text "Other skills" field
- Updates `Profile.primaryStack`, `Profile.domains`, links `ExpertiseTag` records

### Step 3 — Connect Telegram
- QR code on screen: `https://t.me/JobRadarBot?start={deepLinkToken}`
- User scans → opens Telegram → taps Start
- Bot receives `/start {token}` → matches `TelegramLink.deepLinkToken` → stores `chatId` → marks `verifiedAt = now()`
- Wizard polls `/api/onboarding/telegram-status?token={token}` every 2s
- On verified: green check, advance to step 4

### Step 4 — Preferences
- Scan cadence slider (1h / 3h / 6h / 12h / 24h)
- Minimum match score slider (40-90)
- Max notifications/day (1-10)
- Notification window (timezone-aware, default 8am-9pm local)
- Muted sources multi-select
- "Finish" → set `UserPreferences` → redirect to dashboard

---

## 7. Telegram Integration

### 7.1 Bot setup

Single bot `@JobRadarBot`. Token stored in env. Bot uses **long-polling** (`getUpdates` with `timeout=30`) — no public webhook needed, works behind NAT/firewalls, simpler to operate on a VPS.

### 7.2 Per-user dispatch

All notifications go through one bot, dispatched by `chatId`. The `NotificationLog` table tracks every send + status. Per-user rate limit enforced by Redis key `notify:ratelimit:{userId}:{date}` — increment on send, reject if > daily cap.

### 7.3 Message format

```
🎯 New match (87/100) — Senior Frontend Engineer

🏢 Flutterwave  •  Lagos, NG (Hybrid)
💼 Stack: React, TypeScript, Next.js
💰 ₦450,000 - ₦650,000 /mo
📅 Posted 2h ago

💡 Strong fit: matches your React+TS stack and
fintech domain. 4+ years req'd, you have 6.

[View Job] [Apply] [Cover Letter] [Mute Source]
```

Inline keyboard buttons deep-link back to the dashboard with appropriate query params (e.g. `/jobs/{jobId}?action=cover-letter`).

### 7.4 Anti-spam

- Max 5 notifications/user/day (configurable)
- Notification window enforced (timezone-aware)
- Same job never notified twice (checked via `NotificationLog`)
- "Mute source" button immediately excludes from future scans via `UserPreferences.mutedSources`
- "Mute for 24h" pauses all notifications

---

## 8. VPS Infrastructure

### 8.1 Hardware

**Hetzner CX22** (2 vCPU, 4GB RAM, 40GB SSD) — €4.51/mo. Or DigitalOcean droplet ($6/mo) if Hetzner is unavailable in target region.

Recommended region: Falkenstein (EU-central) for cost, or Ashburn (US-east) if US users dominate.

### 8.2 Stack — Docker Compose

```yaml
# docker-compose.yml (simplified)
services:
  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes: ["./Caddyfile:/etc/caddy/Caddyfile", "caddy_data:/data"]

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: jobradar
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes: ["pg_data:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

  app:
    build: .
    command: pnpm start
    depends_on: [postgres, redis]
    env_file: .env

  worker:
    build: .
    command: pnpm worker
    depends_on: [postgres, redis]

  telegram-bot:
    build: .
    command: pnpm telegram-bot
    depends_on: [postgres, redis]

volumes:
  caddy_data:
  pg_data:
```

### 8.3 Backups

- Nightly `pg_dump` to Backblaze B2 S3-compatible bucket (~$0.005/GB)
- 30-day retention
- Resume files stored in B2 (not on VPS disk)

### 8.4 Monitoring

- **Sentry** for error tracking (free tier: 5k errors/mo)
- **UptimeRobot** for HTTP health checks (free)
- **BullMQ dashboard** exposed at `/admin/queue` behind admin auth

---

## 9. Phased Build Plan

12 working days total. Each phase is independently shippable.

| Phase | Scope | Days |
|---|---|---|
| **0** | VPS setup, Docker Compose, Postgres+pgvector, Caddy, DNS, TLS | 0.5 |
| **1** | Auth.js v5 (email magic + Google + Microsoft), Prisma schema, migrations, seed taxonomy | 1.5 |
| **2** | Onboarding wizard (4 steps): resume upload + parser, expertise picker, Telegram deep-link QR, preferences | 2.0 |
| **3** | Scraper engine v2: RSS+API sources for pan-African + generalist + 8 industry verticals. Source health tracking. | 2.0 |
| **4** | Email ingestion (Tier B): Postmark inbound webhook, regex+LLM parser, InboundEmail → JobPosting pipeline | 1.5 |
| **5** | AI matching v2: Gemini embeddings, pgvector cosine filter, OpenAI structured-output matcher, cover-letter cache | 1.5 |
| **6** | BullMQ scheduler + per-user cron jobs + worker pool (3 job types: scrape, match, notify) | 1.0 |
| **7** | Dashboard v2: live job feed, filters, application tracker, source health page, "mute source" controls | 1.5 |
| **8** | Polish: Sentry, GDPR data export, rate limits, source health alerts, onboarding analytics | 1.0 |

**Critical path:** Phases 0→1→2→5→6→7. Phases 3, 4, 8 can be parallelized once Phase 1 lands.

---

## 10. Open Questions & Risks

### 10.1 Risks

| Risk | Mitigation |
|---|---|
| Adzuna free tier (1k req/mo) is tight at scale | Switch to Jooble (free, no hard cap) as primary; Adzuna as secondary |
| Pan-African boards may not have RSS — scraping is ToS-risky | Email ingestion covers them via user-forwarded alerts |
| Resume parser accuracy across non-English resumes | Start English-only, add i18n in Phase 9 (post-MVP) |
| OpenAI cost spike if matching volume grows | Hard daily cap per user (e.g. max 100 matches/day), fallback to Gemini free tier if exceeded |
| Telegram bot rate limits (30/sec global) | Fine at MVP scale; if 1k+ users, add per-user delay queue |
| Postmark inbound email cost ($0.10/100 inbound) | User-funded: free for first 100/mo per user, then $0.001/email |
| Single VPS = single point of failure | Daily backups + 30-min recovery SLA; multi-region is post-MVP |

### 10.2 Explicit non-goals for v1

- No mobile app (responsive PWA is enough)
- No ATS integrations (Greenhouse, Lever, etc.) — too much variability
- No paywalled premium sources (LinkedIn Recruiter, Ladders)
- No multi-language UI (English only; job descriptions stay in source language)
- No real-time push (Telegram + dashboard polling is fine)
- No team accounts / multi-user collaboration

### 10.3 Open questions for the build phase

1. **Adzuna partner key** — do we apply now (1-2 week approval) or skip and rely on Jooble?
2. **Telegram bot name** — `@JobRadarBot` is taken. Suggestions: `@JobRadarHQBot`, `@RadarJobsBot`, `@HireRadarBot`?
3. **Domain** — `jobradar.app`? `hireradar.io`? Need to register before deploy.
4. **Resume file storage** — B2 ($0.005/GB) vs Cloudflare R2 (10GB free)?

---

## 11. What I need from you before Phase 0

1. **Domain name** — pick one and register it
2. **Telegram bot** — create via `@BotFather`, share the token
3. **VPS provider choice** — Hetzner vs DigitalOcean vs Vultr (default: Hetzner, cheapest)
4. **Postmark account** — for email ingestion (free 100 inbound/mo, then $0.10/100)
5. **OpenAI API key** — for matching (prepay $10 to start)
6. **Google OAuth credentials** — for sign-in
7. **Microsoft Entra app registration** — for Microsoft sign-in

Once these are in hand, Phase 0 (VPS setup) takes half a day and we're into Phase 1 (auth + DB schema) immediately after.

---

*End of architecture brief. Next step: confirm or revise, then begin Phase 0.*
