// Scraper orchestrator — runs all enabled scrapers, dedups, embeds new jobs,
// matches against all user profiles, queues Telegram notifications.
//
// Called from /api/scan-sweep (Vercel hourly cron).
// Also runnable manually via: bun run scripts/run-scan.ts

import { db } from '@/lib/db'
import { embedBatch, embedText, matchJobs } from '@/lib/gemini'
import { sendMessage, formatJobMessage } from '@/lib/telegram'
import { Industry, WorkMode } from '@prisma/client'
import type { RawJob, ScraperResult } from './scrapers/_shared'
import { scrapeJobberman } from './scrapers/jobberman'
import { scrapeMyJobMag } from './scrapers/myjobmag'
import { scrapeAdzuna } from './scrapers/adzuna'
import { scrapeJooble } from './scrapers/jooble'
import { scrapeUsajobs } from './scrapers/usajobs'

interface ScanResult {
  scanId: string
  sourcesUsed: string[]
  sourcesSkipped: string[]
  jobsScraped: number
  jobsNew: number
  jobsMatched: number
  notificationsSent: number
  errors: string[]
  durationMs: number
}

export async function runScan(): Promise<ScanResult> {
  const start = Date.now()
  const errors: string[] = []
  const allJobs: { sourceSlug: string; jobs: RawJob[] }[] = []

  // Step 1: Run all scrapers in parallel
  console.log('[scan] Step 1: scraping sources…')
  const scraperFns = [
    { slug: 'jobberman-ng', fn: scrapeJobberman },
    { slug: 'myjobmag', fn: scrapeMyJobMag },
    { slug: 'adzuna', fn: () => scrapeAdzuna('gb', '', 50) },
    { slug: 'jooble', fn: () => scrapeJooble('', '', 1) },
    { slug: 'usajobs', fn: () => scrapeUsajobs('', '', 50) },
  ]
  const results: ScraperResult[] = await Promise.allSettled(
    scraperFns.map((s) => s.fn())
  ).then((r) => r.map((p, i) => p.status === 'fulfilled' ? p.value : { sourceSlug: scraperFns[i].slug, jobs: [], error: String(p.reason) }))

  const sourcesUsed: string[] = []
  const sourcesSkipped: string[] = []
  for (const r of results) {
    if (r.error) {
      errors.push(`${r.sourceSlug}: ${r.error}`)
      sourcesSkipped.push(r.sourceSlug)
      console.warn(`[scan] ${r.sourceSlug} errored: ${r.error}`)
    } else if (r.jobs.length === 0) {
      sourcesSkipped.push(r.sourceSlug)
    } else {
      sourcesUsed.push(r.sourceSlug)
      allJobs.push({ sourceSlug: r.sourceSlug, jobs: r.jobs })
    }
  }
  const scrapedCount = allJobs.reduce((n, s) => n + s.jobs.length, 0)
  console.log(`[scan] Scraped ${scrapedCount} jobs from ${sourcesUsed.length} sources`)

  if (scrapedCount === 0) {
    return finish({ sourcesUsed, sourcesSkipped, jobsScraped: 0, jobsNew: 0, jobsMatched: 0, notificationsSent: 0, errors, start })
  }

  // Step 2: Dedup against existing JobPosting table
  console.log('[scan] Step 2: deduplicating…')
  const newJobs: { sourceSlug: string; job: RawJob; sourceId: string }[] = []
  for (const { sourceSlug, jobs } of allJobs) {
    const source = await db.source.findUnique({ where: { slug: sourceSlug } })
    if (!source) continue
    for (const job of jobs) {
      const exists = await db.jobPosting.findUnique({
        where: { sourceId_externalId: { sourceId: source.id, externalId: job.externalId } },
        select: { id: true },
      })
      if (!exists) {
        newJobs.push({ sourceSlug, job, sourceId: source.id })
      }
    }
  }
  console.log(`[scan] ${newJobs.length} new jobs (${scrapedCount - newJobs.length} duplicates)`)

  if (newJobs.length === 0) {
    return finish({ sourcesUsed, sourcesSkipped, jobsScraped: scrapedCount, jobsNew: 0, jobsMatched: 0, notificationsSent: 0, errors, start })
  }

  // Step 3: Embed new jobs in batches of 100
  console.log('[scan] Step 3: embedding new jobs…')
  const BATCH = 100
  for (let i = 0; i < newJobs.length; i += BATCH) {
    const slice = newJobs.slice(i, i + BATCH)
    const texts = slice.map((j) => `${j.job.title} at ${j.job.company}. ${j.job.description}`)
    try {
      const embeddings = await embedBatch(texts)
      // Persist jobs + embeddings in one transaction
      await db.$transaction(
        slice.map((j, idx) =>
          db.jobPosting.create({
            data: {
              sourceId: j.sourceId,
              externalId: j.job.externalId,
              title: j.job.title,
              company: j.job.company,
              location: j.job.location,
              workMode: j.job.workMode,
              url: j.job.url,
              applyUrl: j.job.applyUrl,
              postedAt: j.job.postedAt,
              rawText: j.job.description,
              industries: j.job.industries,
              // pgvector embedding stored via raw SQL — Prisma doesn't support vector type directly
              // (separate write step below)
            },
          })
        )
      )
      // Write embeddings via raw SQL (pgvector)
      for (let k = 0; k < slice.length; k++) {
        const jobId = (await db.jobPosting.findUnique({
          where: {
            sourceId_externalId: {
              sourceId: slice[k].sourceId,
              externalId: slice[k].job.externalId,
            },
          },
          select: { id: true },
        }))?.id
        if (jobId && embeddings[k]) {
          await db.$executeRaw`
            UPDATE "JobPosting"
            SET embedding = ${embeddings[k]}::vector,
                "embeddingModel" = 'gemini-text-embedding-004',
                "embeddingUpdatedAt" = NOW()
            WHERE id = ${jobId}
          `
        }
      }
    } catch (e) {
      const msg = `Batch ${i}-${i + slice.length} embedding/persist failed: ${(e as Error).message}`
      errors.push(msg)
      console.error(`[scan] ${msg}`)
    }
  }
  console.log(`[scan] Embedded + persisted ${newJobs.length} jobs`)

  // Step 4: Match against all user profiles that have embeddings
  console.log('[scan] Step 4: matching against user profiles…')
  const profiles = await db.profile.findMany({
    where: { embeddingUpdatedAt: { not: null } },
    include: { user: { include: { telegram: true, preferences: true } } },
  })
  console.log(`[scan] Matching against ${profiles.length} user profiles`)

  let totalMatched = 0
  let totalNotifs = 0
  for (const profile of profiles) {
    try {
      const matched = await matchForProfile(profile, newJobs)
      totalMatched += matched.matchCount
      totalNotifs += matched.notifCount
    } catch (e) {
      errors.push(`Profile ${profile.userId} match failed: ${(e as Error).message}`)
    }
  }

  return finish({
    sourcesUsed, sourcesSkipped, jobsScraped: scrapedCount,
    jobsNew: newJobs.length, jobsMatched: totalMatched,
    notificationsSent: totalNotifs, errors, start,
  })
}

async function matchForProfile(
  profile: any,
  newJobs: { sourceSlug: string; job: RawJob; sourceId: string }[]
): Promise<{ matchCount: number; notifCount: number }> {
  const profileEmbedding = await db.$queryRaw<number[]>`
    SELECT embedding::text FROM "Profile" WHERE "userId" = ${profile.userId}
  `.then((r: any) => {
    if (!r.length) return null
    // pgvector returns text like "[0.1,0.2,...]"
    return JSON.parse(r[0].embedding.replace(/^\[/, '[').replace(/\]$/, ']'))
  })

  if (!profileEmbedding) return { matchCount: 0, notifCount: 0 }

  // Cosine similarity query — top 50 candidates from new jobs
  // Filter by industries the user is interested in
  const userIndustries = profile.user?.expertiseTags?.map((t: any) => t.industry) ?? []
  const candidates: any[] = await db.$queryRaw`
    SELECT id, title, company, location, "rawText", "matchScore" IS NULL as needs_match,
           1 - (embedding <=> ${profileEmbedding}::vector) as similarity
    FROM "JobPosting"
    WHERE "embeddingUpdatedAt" IS NOT NULL
      AND id NOT IN (
        SELECT "jobId" FROM "UserJobMatch" WHERE "userId" = ${profile.userId}
      )
      AND "postedAt" > NOW() - INTERVAL '7 days'
    ORDER BY embedding <=> ${profileEmbedding}::vector
    LIMIT 50
  `

  const filtered = candidates.filter((c) => c.similarity >= 0.55).slice(0, 20)
  if (filtered.length === 0) return { matchCount: 0, notifCount: 0 }

  // Send top 20 to Gemini for structured-output scoring
  const matchResults = await matchJobs(
    filtered.map((c) => ({
      id: c.id,
      title: c.title,
      company: c.company,
      location: c.location,
      description: c.rawText,
    })),
    {
      seniority: profile.seniority,
      primaryStack: profile.primaryStack,
      domains: profile.domains,
      workModes: profile.workModes,
      redFlags: profile.redFlags,
      greenFlags: profile.greenFlags,
    }
  )

  // Persist matches + send notifications for top N
  const minScore = profile.user?.preferences?.minMatchScore ?? 60
  const maxNotifs = profile.user?.preferences?.maxNotificationsDay ?? 5
  let notifCount = 0
  const todayNotifs = await db.notificationLog.count({
    where: {
      userId: profile.userId,
      sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  })

  const sortedMatches = Object.entries(matchResults)
    .map(([jobId, r]) => ({ jobId, ...r }))
    .sort((a, b) => b.score - a.score)

  for (const m of sortedMatches) {
    if (m.score < minScore) continue
    // Persist the match
    await db.userJobMatch.create({
      data: {
        userId: profile.userId,
        jobId: m.jobId,
        matchScore: m.score,
        matchReason: m.reason,
        redFlags: m.redFlags,
        experienceFit: m.experienceFit,
        status: 'NEW',
      },
    }).catch(() => {}) // ignore unique constraint violations

    // Send Telegram notification if user is connected + has quota + in timezone window
    if (
      profile.user?.telegram?.chatId &&
      profile.user?.telegram?.verifiedAt &&
      todayNotifs + notifCount < maxNotifs &&
      isInNotifyWindow(profile.user?.preferences?.notifyWindowStart, profile.user?.preferences?.notifyWindowEnd, profile.timezone)
    ) {
      const job = filtered.find((c) => c.id === m.jobId)
      if (job) {
        const msg = formatJobMessage({
          matchScore: m.score,
          title: job.title,
          company: job.company,
          location: job.location,
          matchReason: m.reason,
          redFlags: m.redFlags,
          url: job.url,
          applyUrl: job.applyUrl,
        }, process.env.NEXT_PUBLIC_APP_URL ?? 'https://gigforme.vercel.app')
        msg.chatId = profile.user.telegram.chatId
        const sent = await sendMessage(msg)
        await db.notificationLog.create({
          data: {
            userId: profile.userId,
            jobId: m.jobId,
            channel: 'TELEGRAM',
            status: sent ? 'sent' : 'failed',
          },
        })
        if (sent) notifCount++
      }
    }
  }

  return { matchCount: sortedMatches.length, notifCount: notifCount }
}

function isInNotifyWindow(start: string | undefined, end: string | undefined, timezone: string): boolean {
  if (!start || !end) return true // default open
  try {
    const now = new Date()
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: timezone || 'UTC',
    })
    const nowStr = fmt.format(now)
    return nowStr >= start && nowStr <= end
  } catch {
    return true
  }
}

async function finish(data: {
  sourcesUsed: string[]; sourcesSkipped: string[]; jobsScraped: number; jobsNew: number;
  jobsMatched: number; notificationsSent: number; errors: string[]; start: number
}): Promise<ScanResult> {
  const durationMs = Date.now() - data.start
  const scanId = `scan_${Date.now()}`
  console.log(`[scan] Complete in ${durationMs}ms: ${data.jobsNew} new, ${data.jobsMatched} matched, ${data.notificationsSent} notifs`)
  return {
    scanId,
    sourcesUsed: data.sourcesUsed,
    sourcesSkipped: data.sourcesSkipped,
    jobsScraped: data.jobsScraped,
    jobsNew: data.jobsNew,
    jobsMatched: data.jobsMatched,
    notificationsSent: data.notificationsSent,
    errors: data.errors,
    durationMs,
  }
}
