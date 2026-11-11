// GigForMe — Matching pipeline
// Stage 1: pgvector cosine similarity filter (cheap, in-DB)
// Stage 2: Gemini structured-output LLM match (top candidates only)

import { db } from './db'
import { embedText, matchJobs, type MatchResult } from './gemini'

// ── Run a full scan for one user ───────────────────────────────────
export async function runScanForUser(userId: string): Promise<{
  jobsScraped: number
  jobsNew: number
  jobsMatched: number
  notified: number
  aiProvider: string
}> {
  console.log(`\n=== Scan starting for user ${userId} ===`)

  // 1. Get user profile
  const profile = await db.profile.findUnique({
    where: { userId },
    include: { user: { include: { preferences: true } } },
  })
  if (!profile) {
    console.log('No profile — skipping')
    return { jobsScraped: 0, jobsNew: 0, jobsMatched: 0, notified: 0, aiProvider: 'none' }
  }

  // 2. Run all scrapers in parallel (RSS feeds only for now — no API keys needed)
  const { scrapeJobberman } = await import('./scrapers/jobberman')
  const { scrapeMyJobMag } = await import('./scrapers/myjobmag')
  const scraped = (await Promise.all([scrapeJobberman(), scrapeMyJobMag()])).flat()
  console.log(`✓ Scraped ${scraped.length} jobs from 2 RSS sources`)

  if (scraped.length === 0) {
    return { jobsScraped: 0, jobsNew: 0, jobsMatched: 0, notified: 0, aiProvider: 'none' }
  }

  // 3. Dedup against existing JobPosting records (URL hash)
  const existingUrls = await db.jobPosting.findMany({
    where: { source: { slug: { in: ['jobberman-ng', 'myjobmag'] } } },
    select: { externalId: true },
  })
  const existingSet = new Set(existingUrls.map((j) => j.externalId))
  const newScraped = scraped.filter((j) => !existingSet.has(j.externalId))
  console.log(`✓ ${newScraped.length} new jobs (${scraped.length - newScraped.length} duplicates filtered)`)

  if (newScraped.length === 0) {
    return {
      jobsScraped: scraped.length,
      jobsNew: 0,
      jobsMatched: 0,
      notified: 0,
      aiProvider: 'gemini-1.5-flash',
    }
  }

  // 4. Save new jobs to DB (without embeddings yet)
  const createdJobs = []
  for (const job of newScraped) {
    const source = await db.source.findUnique({ where: { slug: job.sourceSlug } })
    if (!source) continue

    const created = await db.jobPosting.create({
      data: {
        sourceId: source.id,
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        postedAt: job.postedAt,
        rawText: job.rawText,
        industries: job.industries as any,
      },
    })
    createdJobs.push({ ...created, _industries: job.industries })
  }
  console.log(`✓ Saved ${createdJobs.length} new jobs to DB`)

  // 5. Generate embeddings for new jobs (batched, cached on JobPosting)
  if (createdJobs.length > 0) {
    console.log('Generating embeddings for new jobs...')
    const embeddings = await embedBatch(createdJobs.map((j) => j.rawText))
    for (let i = 0; i < createdJobs.length; i++) {
      const embedding = embeddings[i]
      // Convert array to pgvector string format
      const vectorStr = `[${embedding.join(',')}]`
      await db.$executeRaw`UPDATE "JobPosting" SET embedding = ${vectorStr}::vector, "embeddingModel" = 'text-embedding-004', "embeddingUpdatedAt" = NOW() WHERE id = ${createdJobs[i].id}`
    }
    console.log(`✓ Embedded ${createdJobs.length} jobs`)
  }

  // 6. Stage 1 — pgvector cosine similarity filter
  let profileEmbedding = profile.embedding as unknown as number[] | null
  let profileEmbeddingModel = profile.embeddingModel

  if (!profileEmbedding || profileEmbeddingModel !== 'text-embedding-004') {
    console.log('Re-embedding user profile...')
    const profileText = `Seniority: ${profile.seniority}. Stack: ${(profile.primaryStack as string[]).join(', ')}. Domains: ${(profile.domains as string[]).join(', ')}. Work modes: ${(profile.workModes as string[]).join(', ')}. Avoids: ${(profile.redFlags as string[]).join(', ') || 'none'}. Prefers: ${(profile.greenFlags as string[]).join(', ') || 'none'}.`
    profileEmbedding = await embedText(profileText)
    profileEmbeddingModel = 'text-embedding-004'
    const vectorStr = `[${profileEmbedding.join(',')}]`
    await db.$executeRaw`UPDATE "Profile" SET embedding = ${vectorStr}::vector, "embeddingModel" = 'text-embedding-004', "embeddingUpdatedAt" = NOW() WHERE "userId" = ${userId}`
  }

  // pgvector cosine similarity query
  const profileVectorStr = `[${profileEmbedding!.join(',')}]`
  const candidates = await db.$queryRaw<Array<{ id: string; title: string; company: string; description: string; similarity: number }>>`
    SELECT
      j.id, j.title, j.company, j."rawText" as description,
      1 - (j.embedding <=> ${profileVectorStr}::vector) as similarity
    FROM "JobPosting" j
    WHERE j.embedding IS NOT NULL
      AND j.id NOT IN (
        SELECT "jobId" FROM "UserJobMatch" WHERE "userId" = ${userId}
      )
    ORDER BY j.embedding <=> ${profileVectorStr}::vector
    LIMIT 50
  `

  // Filter by similarity threshold
  const filtered = candidates.filter((c) => c.similarity >= 0.55)
  console.log(`✓ Stage 1: ${filtered.length} candidates passed similarity filter (of ${candidates.length} total)`)

  if (filtered.length === 0) {
    return {
      jobsScraped: scraped.length,
      jobsNew: newScraped.length,
      jobsMatched: 0,
      notified: 0,
      aiProvider: 'gemini-1.5-flash',
    }
  }

  // 7. Stage 2 — Gemini structured-output matching (top 20)
  const topCandidates = filtered.slice(0, 20)
  console.log(`✓ Stage 2: sending ${topCandidates.length} candidates to Gemini 1.5 Flash`)

  const matchResults: MatchResult[] = await matchJobs(
    topCandidates.map((c) => ({ id: c.id, title: c.title, company: c.company, description: c.description })),
    {
      seniority: profile.seniority,
      primaryStack: profile.primaryStack as string[],
      domains: profile.domains as string[],
      workModes: profile.workModes as string[],
      redFlags: profile.redFlags as string[],
      greenFlags: profile.greenFlags as string[],
    }
  )
  console.log(`✓ Gemini returned ${matchResults.length} match results`)

  // 8. Save matches above threshold
  const minScore = profile.user.preferences?.minMatchScore ?? 60
  const matchedJobs = []
  for (const result of matchResults) {
    if (result.score < minScore) continue

    const match = await db.userJobMatch.create({
      data: {
        userId,
        jobId: result.jobId,
        matchScore: result.score,
        matchReason: result.reason,
        redFlags: result.redFlags,
        experienceFit: result.experienceFit,
        coverLetterTone: result.coverLetterTone,
        status: 'NEW',
      },
    })
    matchedJobs.push(match)
  }
  console.log(`✓ Saved ${matchedJobs.length} matches above score ${minScore}`)

  // 9. Send Telegram notifications for top matches (respecting daily cap)
  const prefs = profile.user.preferences
  const maxNotifs = prefs?.maxNotificationsDay ?? 5
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sentToday = await db.notificationLog.count({
    where: { userId, sentAt: { gte: today }, status: 'sent' },
  })

  const telegram = await db.telegramLink.findUnique({ where: { userId } })
  let notified = 0

  if (telegram?.chatId && sentToday < maxNotifs) {
    const { sendJobNotification } = await import('./telegram')
    const toNotify = matchedJobs.slice(0, maxNotifs - sentToday)

    for (const match of toNotify) {
      const job = await db.jobPosting.findUnique({ where: { id: match.jobId } })
      if (!job) continue

      const success = await sendJobNotification(telegram.chatId, {
        jobTitle: job.title,
        companyName: job.company,
        location: job.location,
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        redFlags: match.redFlags as string[],
        postedAt: job.postedAt.toISOString(),
        jobId: job.id,
        applyUrl: job.applyUrl || job.url,
      })

      await db.notificationLog.create({
        data: {
          userId,
          jobId: job.id,
          channel: 'TELEGRAM',
          status: success ? 'sent' : 'failed',
        },
      })
      if (success) notified++
    }
    console.log(`✓ Sent ${notified} Telegram notifications`)
  } else {
    console.log(`✓ Skipped notifications (no Telegram or daily cap hit)`)
  }

  return {
    jobsScraped: scraped.length,
    jobsNew: newScraped.length,
    jobsMatched: matchedJobs.length,
    notified,
    aiProvider: 'gemini-1.5-flash',
  }
}
