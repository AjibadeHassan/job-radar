// Scan sweep endpoint — runs the full scraper pipeline + matches against user profiles.
//
// Triggers:
//   1. Vercel daily cron (configured in vercel.json — runs at 08:00 UTC daily)
//      Vercel auto-sets x-vercel-cron: 1 header for these calls.
//
//   2. External cron service (cron-job.org, EasyCron, UptimeRobot, etc.) — for
//      sub-daily frequency (hourly is the recommended MVP cadence).
//      Set CRON_SECRET env var, then external cron hits:
//        https://YOUR-URL/api/scan-sweep?secret=YOUR_CRON_SECRET
//
//   3. Manual trigger from dashboard "Scan now" button (requires user auth).
//      Calls this same endpoint with the user's session cookie.
//
//   4. Dev/local: curl http://localhost:3000/api/scan-sweep?secret=dev

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runScan } from '@/lib/scrapers/orchestrator'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel Hobby tier max — Pro is 300

export async function GET(req: NextRequest) {
  // ── Auth check: accept any of 4 trigger sources ───────────────
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  const urlSecret = req.nextUrl.searchParams.get('secret')
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // 1. Vercel's own cron — auto-trusted via x-vercel-cron header
  if (isVercelCron) {
    return runScanAndRespond(req)
  }

  // 2. External cron service — must include ?secret=CRON_SECRET
  if (cronSecret && urlSecret === cronSecret) {
    return runScanAndRespond(req)
  }

  // 3. Authenticated user (Scan now button) — must have valid session
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return runScanAndRespond(req, session.user.id)
  }

  // 4. Dev fallback — only if CRON_SECRET is unset AND urlSecret === 'dev'
  if (!cronSecret && urlSecret === 'dev') {
    return runScanAndRespond(req)
  }

  return NextResponse.json(
    { error: 'unauthorized', hint: 'include ?secret=YOUR_CRON_SECRET, signed-in session, or hit via Vercel cron' },
    { status: 401 }
  )
}

async function runScanAndRespond(_req: NextRequest, userId?: string) {
  try {
    const result = await runScan()

    // Log to DB
    await db.scanRun.create({
      data: {
        userId: userId ?? 'cron',
        finishedAt: new Date(),
        sourcesUsed: result.sourcesUsed,
        jobsScraped: result.jobsScraped,
        jobsNew: result.jobsNew,
        jobsMatched: result.jobsMatched,
        aiProvider: 'gemini-1.5-flash',
        error: result.errors.length > 0 ? result.errors.join('; ') : null,
      },
    }).catch(() => {})

    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[/api/scan-sweep] failed:', e)
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    )
  }
}
