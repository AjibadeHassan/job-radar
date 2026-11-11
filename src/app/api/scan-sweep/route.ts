// Vercel Cron endpoint — runs hourly scan sweep.
// Configured in vercel.json. Protected by CRON_SECRET bearer header (auto-set by Vercel).
//
// In development: hit manually with `curl -H "Authorization: Bearer dev" http://localhost:3000/api/scan-sweep`

import { NextRequest, NextResponse } from 'next/server'
import { runScan } from '@/lib/scrapers/orchestrator'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel Hobby tier max — Pro is 300

export async function GET(req: NextRequest) {
  // Auth: Vercel sets CRON_SECRET header automatically for cron-triggered calls.
  // Manual calls must include ?secret=dev to bypass in development.
  const authHeader = req.headers.get('authorization')
  const urlSecret = req.nextUrl.searchParams.get('secret')
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}` && urlSecret !== 'dev') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await runScan()

    // Log to DB
    await db.scanRun.create({
      data: {
        userId: 'cron', // system-run scan — not tied to a specific user
        finishedAt: new Date(),
        sourcesUsed: result.sourcesUsed,
        jobsScraped: result.jobsScraped,
        jobsNew: result.jobsNew,
        jobsMatched: result.jobsMatched,
        aiProvider: 'gemini-1.5-flash',
        error: result.errors.length > 0 ? result.errors.join('; ') : null,
      },
    }).catch(() => {}) // don't fail the response if DB log fails

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (e) {
    console.error('[/api/scan-sweep] failed:', e)
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    )
  }
}
