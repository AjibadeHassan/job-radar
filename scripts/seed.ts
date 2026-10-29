// Seed GigForMe database with:
//   1. Expertise taxonomy (8 industries × functions × seniorities)
//   2. Source registry (40 sources across 5 tiers)
//   3. Admin user placeholder (no OAuth yet — user will sign up via Google later)
//
// Run: bun --env-file=.env scripts/seed.ts

import { PrismaClient, Industry, Seniority, SourceKind } from '@prisma/client'

const prisma = new PrismaClient()

// ── Industry taxonomy ──────────────────────────────────────────────
const TAXONOMY: Array<{
  industry: Industry
  functions: Array<{ name: string; seniorities: Seniority[] }>
}> = [
  {
    industry: Industry.TECH,
    functions: [
      { name: 'Frontend Engineering', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.STAFF, Seniority.MANAGER] },
      { name: 'Backend Engineering', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.STAFF, Seniority.MANAGER] },
      { name: 'Full-Stack Engineering', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.STAFF] },
      { name: 'DevOps / SRE', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.STAFF] },
      { name: 'Data Engineering', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.STAFF] },
      { name: 'ML / AI Engineering', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.STAFF] },
    ],
  },
  {
    industry: Industry.HEALTHCARE,
    functions: [
      { name: 'Nursing', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
      { name: 'Medical Practice', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'Pharmacy', seniorities: [Seniority.JUNIOR, Seniority.SENIOR, Seniority.LEAD] },
      { name: 'Public Health', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'Health Informatics', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
    ],
  },
  {
    industry: Industry.FINANCE,
    functions: [
      { name: 'Accounting', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.MANAGER, Seniority.DIRECTOR] },
      { name: 'Investment Banking', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'Audit', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.MANAGER] },
      { name: 'Risk Management', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'Treasury', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
    ],
  },
  {
    industry: Industry.EDUCATION,
    functions: [
      { name: 'Teaching (K-12)', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
      { name: 'Higher Education Faculty', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR] },
      { name: 'Curriculum Design', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR] },
      { name: 'Educational Administration', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'EdTech Product', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
    ],
  },
  {
    industry: Industry.CREATIVE,
    functions: [
      { name: 'Product Design', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.STAFF, Seniority.MANAGER] },
      { name: 'Graphic Design', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR] },
      { name: 'Brand Design', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
      { name: 'Motion Design', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR] },
      { name: 'UX Research', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
    ],
  },
  {
    industry: Industry.SALES,
    functions: [
      { name: 'Account Executive', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
      { name: 'Sales Engineering', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.STAFF] },
      { name: 'Growth Marketing', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
      { name: 'Content Marketing', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR] },
      { name: 'Performance Marketing', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
    ],
  },
  {
    industry: Industry.LEGAL,
    functions: [
      { name: 'Corporate Law', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'Litigation', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'In-House Counsel', seniorities: [Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'Compliance', seniorities: [Seniority.JUNIOR, Seniority.MANAGER, Seniority.DIRECTOR] },
      { name: 'IP Law', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
    ],
  },
  {
    industry: Industry.OPERATIONS,
    functions: [
      { name: 'Program Management', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.DIRECTOR] },
      { name: 'Supply Chain', seniorities: [Seniority.JUNIOR, Seniority.MANAGER, Seniority.DIRECTOR] },
      { name: 'People Operations', seniorities: [Seniority.MID, Seniority.MANAGER, Seniority.DIRECTOR] },
      { name: 'Project Management', seniorities: [Seniority.JUNIOR, Seniority.MID, Seniority.SENIOR, Seniority.LEAD] },
      { name: 'Operations Management', seniorities: [Seniority.MANAGER, Seniority.DIRECTOR, Seniority.STAFF] },
    ],
  },
]

// ── Source registry ────────────────────────────────────────────────
type SourceSeed = {
  name: string
  slug: string
  kind: SourceKind
  regions: string[]
  industries: Industry[]
  endpoint?: string
  rateLimitPerMin?: number
  healthScore?: number
  notes?: string
  enabled?: boolean
}

const SOURCES: SourceSeed[] = [
  // Tier A — Pan-African (primary)
  { name: 'Jobberman Nigeria', slug: 'jobberman-ng', kind: SourceKind.RSS, regions: ['NG'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://www.jobberman.com/jobs/feed.rss', healthScore: 0.94 },
  { name: 'MyJobMag', slug: 'myjobmag', kind: SourceKind.RSS, regions: ['NG'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://www.myjobmag.com/jobs/feed', healthScore: 0.91 },
  { name: 'BrighterMonday', slug: 'brightermonday', kind: SourceKind.RSS, regions: ['KE', 'UG', 'TZ'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://www.brightermonday.com/feed', healthScore: 0.93 },
  { name: 'Careers24', slug: 'careers24', kind: SourceKind.API, regions: ['ZA'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://api.careers24.com/v1/jobs', rateLimitPerMin: 30, healthScore: 0.89 },
  { name: 'JobWebGhana', slug: 'jobwebghana', kind: SourceKind.RSS, regions: ['GH'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.OPERATIONS], healthScore: 0.78 },

  // Tier A — Generalist aggregators
  { name: 'Adzuna', slug: 'adzuna', kind: SourceKind.API, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://api.adzuna.com/v1/api', rateLimitPerMin: 15, healthScore: 0.96 },
  { name: 'Jooble', slug: 'jooble', kind: SourceKind.API, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://jooble.org/api/', rateLimitPerMin: 60, healthScore: 0.92 },
  { name: 'USAJobs', slug: 'usajobs', kind: SourceKind.API, regions: ['US'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://data.usajobs.gov/api/search', rateLimitPerMin: 60, healthScore: 0.99 },
  { name: 'Reed.co.uk', slug: 'reed', kind: SourceKind.API, regions: ['UK'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://www.reed.co.uk/api/1.0/search', healthScore: 0.95 },
  { name: 'The Muse', slug: 'muse', kind: SourceKind.API, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], endpoint: 'https://www.themuse.com/api/public/jobs', healthScore: 0.93 },

  // Tier A — Industry verticals
  { name: 'eFinancialCareers', slug: 'efinancialcareers', kind: SourceKind.RSS, regions: ['GLOBAL'], industries: [Industry.FINANCE], endpoint: 'https://www.efinancialcareers.com/feed', healthScore: 0.88 },
  { name: 'NHS Jobs', slug: 'nhs-jobs', kind: SourceKind.RSS, regions: ['UK'], industries: [Industry.HEALTHCARE], endpoint: 'https://www.jobs.nhs.uk/xml/rss/uk', healthScore: 0.98 },
  { name: 'Health eCareers', slug: 'health-ecareers', kind: SourceKind.RSS, regions: ['US'], industries: [Industry.HEALTHCARE], healthScore: 0.92 },
  { name: 'Tes.com', slug: 'tes', kind: SourceKind.RSS, regions: ['UK', 'GLOBAL'], industries: [Industry.EDUCATION], endpoint: 'https://www.tes.com/jobs/rss', healthScore: 0.94 },
  { name: 'HigherEdJobs', slug: 'higheredjobs', kind: SourceKind.RSS, regions: ['US'], industries: [Industry.EDUCATION], healthScore: 0.95 },
  { name: 'Behance jobs', slug: 'behance', kind: SourceKind.JSON, regions: ['GLOBAL'], industries: [Industry.CREATIVE], endpoint: 'https://www.behance.net/v2/jobs', healthScore: 0.90 },
  { name: 'Dribbble jobs', slug: 'dribbble', kind: SourceKind.RSS, regions: ['GLOBAL'], industries: [Industry.CREATIVE], healthScore: 0.87 },
  { name: 'Law.com', slug: 'lawcom', kind: SourceKind.RSS, regions: ['US', 'UK'], industries: [Industry.LEGAL], healthScore: 0.85 },
  { name: 'SalesGravy', slug: 'salesgravy', kind: SourceKind.RSS, regions: ['US'], industries: [Industry.SALES], healthScore: 0.79 },
  { name: 'MarketingWeek', slug: 'marketingweek', kind: SourceKind.RSS, regions: ['UK'], industries: [Industry.SALES], healthScore: 0.82 },
  { name: 'idealist.org', slug: 'idealist', kind: SourceKind.RSS, regions: ['GLOBAL'], industries: [Industry.OPERATIONS], healthScore: 0.93 },
  { name: 'Rigzone', slug: 'rigzone', kind: SourceKind.RSS, regions: ['GLOBAL'], industries: [Industry.OPERATIONS], healthScore: 0.86 },

  // Tier D — Tech / remote (legacy pool, demoted to ~10% weight)
  { name: 'RemoteOK', slug: 'remoteok', kind: SourceKind.JSON, regions: ['GLOBAL'], industries: [Industry.TECH], endpoint: 'https://remoteok.com/api', healthScore: 0.96 },
  { name: 'Remotive', slug: 'remotive', kind: SourceKind.JSON, regions: ['GLOBAL'], industries: [Industry.TECH], endpoint: 'https://remotive.com/api/remote-jobs', healthScore: 0.94 },
  { name: 'WeWorkRemotely', slug: 'wwr', kind: SourceKind.RSS, regions: ['GLOBAL'], industries: [Industry.TECH], endpoint: 'https://weworkremotely.com/categories/remote-programming.rss', healthScore: 0.97 },
  { name: 'Hacker News (monthly thread)', slug: 'hn-whoishiring', kind: SourceKind.API, regions: ['GLOBAL'], industries: [Industry.TECH], endpoint: 'https://hn.algolia.com/api/v1/search', healthScore: 0.91 },
  { name: 'Working Nomads', slug: 'working-nomads', kind: SourceKind.RSS, regions: ['GLOBAL'], industries: [Industry.TECH], healthScore: 0.85 },
  { name: 'Europe Remote', slug: 'europe-remote', kind: SourceKind.RSS, regions: ['EU'], industries: [Industry.TECH], healthScore: 0.83 },

  // Tier B — Email ingestion (via Cloudflare Email Routing)
  { name: 'LinkedIn (via email alerts)', slug: 'linkedin-email', kind: SourceKind.EMAIL, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], healthScore: 0.99 },
  { name: 'Indeed (via email alerts)', slug: 'indeed-email', kind: SourceKind.EMAIL, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], healthScore: 0.99 },
  { name: 'Glassdoor (via email alerts)', slug: 'glassdoor-email', kind: SourceKind.EMAIL, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], healthScore: 0.97 },
  { name: 'Otta (via email alerts)', slug: 'otta-email', kind: SourceKind.EMAIL, regions: ['GLOBAL'], industries: [Industry.TECH], healthScore: 0.95 },
  { name: 'Bayt (via email alerts)', slug: 'bayt-email', kind: SourceKind.EMAIL, regions: ['MENA'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], healthScore: 0.93 },

  // Tier C — Per-user authenticated sessions (Playwright)
  { name: 'LinkedIn (your account)', slug: 'linkedin-session', kind: SourceKind.SESSION, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], healthScore: 0.91 },
  { name: 'Indeed (your account)', slug: 'indeed-session', kind: SourceKind.SESSION, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], healthScore: 0.90 },
  { name: 'Glassdoor (your account)', slug: 'glassdoor-session', kind: SourceKind.SESSION, regions: ['GLOBAL'], industries: [Industry.TECH, Industry.HEALTHCARE, Industry.FINANCE, Industry.EDUCATION, Industry.CREATIVE, Industry.SALES, Industry.LEGAL, Industry.OPERATIONS], healthScore: 0.88 },
  { name: 'Otta (your account)', slug: 'otta-session', kind: SourceKind.SESSION, regions: ['GLOBAL'], industries: [Industry.TECH], healthScore: 0.87 },
]

async function main() {
  console.log('=== Seeding GigForMe database ===\n')

  // ── 1. Expertise taxonomy ──────────────────────────────────────
  console.log('1. Seeding expertise taxonomy...')
  let tagCount = 0
  for (const t of TAXONOMY) {
    for (const f of t.functions) {
      // Create one ExpertiseTag per (industry, function) — seniority is
      // a separate user-selected dimension, not a tag of its own.
      const label = `${f.name} (${t.industry})`
      const slug = `${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${t.industry.toLowerCase()}`
      await prisma.expertiseTag.upsert({
        where: { slug },
        update: { label, function: f.name, industry: t.industry },
        create: { slug, label, function: f.name, industry: t.industry, seniority: null, specialization: null },
      })
      tagCount++
    }
  }
  console.log(`   ✓ Created ${tagCount} expertise tags`)

  // ── 2. Source registry ─────────────────────────────────────────
  console.log('\n2. Seeding source registry...')
  let sourceCount = 0
  for (const s of SOURCES) {
    await prisma.source.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        kind: s.kind,
        region: s.regions,
        industries: s.industries,
        endpoint: s.endpoint,
        rateLimitPerMin: s.rateLimitPerMin,
        healthScore: s.healthScore ?? 1.0,
        enabled: s.enabled ?? true,
        notes: s.notes,
      },
      create: {
        name: s.name,
        slug: s.slug,
        kind: s.kind,
        region: s.regions,
        industries: s.industries,
        endpoint: s.endpoint,
        rateLimitPerMin: s.rateLimitPerMin,
        healthScore: s.healthScore ?? 1.0,
        enabled: s.enabled ?? true,
        notes: s.notes,
      },
    })
    sourceCount++
  }
  console.log(`   ✓ Created ${sourceCount} sources`)

  // ── 3. Verify ─────────────────────────────────────────────────
  console.log('\n3. Verification:')
  const tagByIndustry = await prisma.expertiseTag.groupBy({
    by: ['industry'],
    _count: { _all: true },
    orderBy: { industry: 'asc' },
  })
  console.log('   Expertise tags by industry:')
  tagByIndustry.forEach((t) => console.log(`     ${t.industry}: ${t._count}`))

  const sourceByKind = await prisma.source.groupBy({
    by: ['kind'],
    _count: { _all: true },
    orderBy: { kind: 'asc' },
  })
  console.log('   Sources by kind:')
  sourceByKind.forEach((s) => console.log(`     ${s.kind}: ${s._count}`))

  console.log('\n=== Seed complete ===')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
