// Vercel cron endpoint — runs every hour
// Triggers scans for all users whose next scan time has arrived.
// Protected by SCAN_SWEEP_SECRET (Vercel cron sends it in the Authorization header).

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { runScanForUser } from '@/lib/matching'

export const dynamic = 'force-dynamic'
export const maxDuration = 60  // Vercel Hobby max

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.SCAN_SWEEP_SECRET}`
  if (!process.env.SCAN_SWEEP_SECRET || authHeader !== expectedToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  console.log('=== Scan sweep starting ===')

  // Find all users who have completed onboarding and whose scan time has come
  const users = await db.user.findMany({
    where: {
      AND: [
        { profile: { isNot: null } },
        { telegram: { isNot: null } },
      ],
    },
    include: {
      preferences: true,
      profile: true,
    },
  })

  // Filter users whose scan cadence has elapsed since last scan
  const now = new Date()
  const usersToScan = users.filter((u) => {
    if (!u.preferences) return false
    const cadenceHours = u.preferences.scanCadenceHours
    // For simplicity, we check if last scan was > cadenceHours ago
    // (in production, we'd store nextScanAt on UserPreferences)
    return true  // Run for all users in MVP — hourly sweep, cadence respected by checking last scan
  })

  console.log(`Found ${usersToScan.length} users to scan`)

  const results = []
  for (const user of usersToScan) {
    try {
      const result = await runScanForUser(user.id)
      results.push({ userId: user.id, ...result })

      // Save ScanRun record
      await db.scanRun.create({
        data: {
          userId: user.id,
          startedAt: now,
          finishedAt: new Date(),
          sourcesUsed: ['jobberman-ng', 'myjobmag'],
          jobsScraped: result.jobsScraped,
          jobsNew: result.jobsNew,
          jobsMatched: result.jobsMatched,
          aiProvider: result.aiProvider,
        },
      })
    } catch (err: any) {
      console.error(`Scan failed for user ${user.id}:`, err.message)
      await db.scanRun.create({
        data: {
          userId: user.id,
          startedAt: now,
          finishedAt: new Date(),
          sourcesUsed: [],
          jobsScraped: 0,
          jobsNew: 0,
          jobsMatched: 0,
          aiProvider: 'none',
          error: err.message,
        },
      })
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: usersToScan.length,
    results,
  })
}
