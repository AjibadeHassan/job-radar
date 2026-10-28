'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Server, Database, Cpu, Bot, Globe, ShieldCheck,
  Cloud, Zap, Layers, GitBranch, ArrowDown
} from 'lucide-react'

export function Architecture() {
  return (
    <section id="architecture" className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Layers className="h-3 w-3 text-primary" />
            <span>v1.1 — zero-cost revision · Oracle Cloud Always Free</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">System architecture</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Multi-tenant SaaS. Postgres + pgvector in production, SQLite for this sandbox preview.
            BullMQ on Redis for the queue, per-user Playwright sessions for account-required platforms.
          </p>
        </div>

        {/* Diagram */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Edge layer */}
              <Layer label="Edge" badge="Caddy · auto-HTTPS · Let's Encrypt">
                <Block icon={Globe} title="Caddy reverse proxy" sub="TLS termination · HTTP/3" />
              </Layer>

              <Arrow />

              {/* App layer */}
              <Layer label="Application" badge="Next.js 16 · Auth.js v5 · TypeScript">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Block icon={Server} title="Next.js 16 app" sub="Dashboard · Onboarding wizard · REST API · Playwright session capture flow" />
                  <Block icon={Bot} title="Telegram Bot" sub="Long-polling · Reuses job-scanner bot token · Per-user dispatch" />
                </div>
              </Layer>

              <Arrow />

              {/* Data layer */}
              <Layer label="Data" badge="PostgreSQL 16 + pgvector · Prisma · Redis 7">
                <div className="grid sm:grid-cols-3 gap-3">
                  <Block icon={Database} title="PostgreSQL" sub="+ pgvector ext · Multi-tenant via userId" />
                  <Block icon={Database} title="Cloudflare R2" sub="10GB free · Resume files + session blobs · AES-256-GCM at rest" />
                  <Block icon={Zap} title="Redis 7" sub="BullMQ queue · Per-user rate limits · Source health counters" />
                </div>
              </Layer>

              <Arrow />

              {/* Worker layer */}
              <Layer label="Workers" badge="BullMQ · 4 job types · Cron-driven">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Block icon={Server} title="scrape" sub="RSS · API · JSON sources · Health-tracked" />
                  <Block icon={Bot} title="scrape-auth" sub="Per-user Playwright sessions · LinkedIn · Indeed · Glassdoor · Otta" />
                  <Block icon={Cpu} title="match" sub="Gemini embed + structured output · pgvector cosine filter" />
                  <Block icon={Bot} title="notify" sub="Telegram dispatch · Timezone-aware · Daily caps" />
                </div>
              </Layer>

              <Arrow />

              {/* External services */}
              <Layer label="External services (all free tier)" badge="$0/month until ~75 active users">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Block icon={Globe} title="Adzuna · Jooble · USAJobs · Reed · Muse" sub="Free job-board APIs · rate-limited" small />
                  <Block icon={Globe} title="Jobberman · MyJobMag · BrighterMonday · Careers24" sub="Pan-African RSS feeds" small />
                  <Block icon={Cloud} title="Cloudflare Email Routing" sub="Inbound parse → Worker → /api/inbound-email" small />
                  <Block icon={Cpu} title="Gemini 1.5 Flash" sub="1500 req/day free · Embeddings + matching + cover letters" small />
                </div>
              </Layer>
            </div>
          </CardContent>
        </Card>

        {/* AI pipeline */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Two-stage AI matching</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Cheap semantic filter first, expensive LLM only for candidates that pass.
              </p>
              <div className="space-y-2">
                <PipelineStage
                  stage="1"
                  title="Embed (one-time)"
                  detail="Resume → Gemini text-embedding-004 → 768-dim vector. Stored in Profile.embedding."
                  cost="$0"
                />
                <PipelineStage
                  stage="2"
                  title="Vector filter"
                  detail="pgvector cosine similarity vs all new job embeddings. Keep top 50, drop <0.55."
                  cost="$0"
                />
                <PipelineStage
                  stage="3"
                  title="Structured match"
                  detail="Top 20 → Gemini 1.5 Flash JSON schema. Returns score, reason, redFlags, experienceFit."
                  cost="$0"
                />
                <PipelineStage
                  stage="4"
                  title="Cover letter"
                  detail="Lazy-generated on user click. Cached by (userId, jobId, tone) hash."
                  cost="$0"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Per-user scan flow</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                BullMQ cron fires per user at their preferred cadence (default 6h).
              </p>
              <ol className="space-y-1.5 text-xs">
                {[
                  'BullMQ cron fires for user U at their preferred cadence',
                  'Worker pulls U\'s Profile + embedding vector',
                  'Worker scrapes U\'s preferred RSS/API sources (filtered by industry + region)',
                  'Worker loads U\'s encrypted platform sessions (LinkedIn, Indeed, Glassdoor, Otta)',
                  'For each connected platform, restore Playwright context + read personalized feed',
                  'New jobs deduplicated against JobPosting table (URL hash + title+company hash)',
                  'New jobs embedded via Gemini (batched, cached)',
                  'Cosine similarity vs U\'s profile embedding → filter <0.55',
                  'Top 20 candidates → Gemini 1.5 Flash with JSON schema response',
                  'Jobs with score ≥ threshold saved as UserJobMatch',
                  'Top N queued for Telegram notification (respects timezone + daily cap)',
                  'ScanRun record written with stats',
                ].map((step, i) => (
                  <li key={i} className="flex gap-2 text-muted-foreground">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-secondary text-[10px] flex items-center justify-center font-mono text-foreground">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Cost ceiling */}
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Operating cost: $0/month
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <CostRow item="Oracle Cloud Always Free (4 ARM cores, 24GB RAM)" cost="$0" />
                <CostRow item="Cloudflare R2 (10GB free, no egress)" cost="$0" />
                <CostRow item="Cloudflare Email Routing + Workers (100k req/day)" cost="$0" />
                <CostRow item="Gemini 1.5 Flash (1500 req/day)" cost="$0" />
                <CostRow item="Telegram Bot API (reused from job-scanner)" cost="$0" />
                <CostRow item="Google + Microsoft OAuth" cost="$0" />
                <CostRow item="Sentry free tier (5k errors/mo)" cost="$0" />
                <CostRow item="UptimeRobot free tier (50 monitors)" cost="$0" />
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">First ceiling</div>
                <CostRow item="Gemini 1500 req/day hit at ~75 active users scanning 4x/day" cost="rotate" />
                <CostRow item="Paid Gemini tier ($0.075 per 1M input tokens)" cost="~$0.001/scan" />
                <CostRow item="Domain registration (~$10/yr)" cost="~$0.83/mo" />
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide pt-2">Projection at 100 users</div>
                <CostRow item="AI matching" cost="~$30/mo" />
                <CostRow item="Total" cost="~$30/mo" highlight />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function Layer({ label, badge, children }: { label: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">{label}</span>
        <Badge variant="outline" className="text-[10px]">{badge}</Badge>
      </div>
      {children}
    </div>
  )
}

function Block({ icon: Icon, title, sub, small }: {
  icon: React.ElementType
  title: string
  sub: string
  small?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`flex-shrink-0 text-primary ${small ? 'h-3 w-3' : 'h-4 w-4'}`} />
        <span className={`font-medium ${small ? 'text-xs' : 'text-sm'} leading-tight`}>{title}</span>
      </div>
      <p className={`text-[10px] text-muted-foreground leading-snug ${small ? 'truncate' : ''}`}>{sub}</p>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex justify-center py-1">
      <ArrowDown className="h-3 w-3 text-muted-foreground" />
    </div>
  )
}

function PipelineStage({ stage, title, detail, cost }: {
  stage: string
  title: string
  detail: string
  cost: string
}) {
  return (
    <div className="flex gap-2 p-2 rounded-md bg-secondary/30">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-mono">
        {stage}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium">{title}</span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{cost}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{detail}</p>
      </div>
    </div>
  )
}

function CostRow({ item, cost, highlight }: { item: string; cost: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-muted-foreground ${highlight ? 'font-medium text-foreground' : ''}`}>{item}</span>
      <span className={`font-mono ${highlight ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
        {cost}
      </span>
    </div>
  )
}
