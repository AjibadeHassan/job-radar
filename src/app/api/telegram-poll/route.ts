// Telegram bot poll endpoint — processes /start {token} messages
// Called by Vercel cron every minute (or as frequently as Vercel cron allows)

import { NextRequest, NextResponse } from 'next/server'
import { pollBotUpdates } from '@/lib/telegram'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.SCAN_SWEEP_SECRET}`
  if (!process.env.SCAN_SWEEP_SECRET || authHeader !== expectedToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const processed = await pollBotUpdates()
  return NextResponse.json({ ok: true, processed })
}
