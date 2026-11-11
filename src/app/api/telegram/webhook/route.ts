// Telegram webhook receiver.
// Bot sends updates here when users tap /start (deep-link capture during onboarding)
// or tap inline buttons (Cover Letter, Mute, etc.).
//
// Set up: visit /api/telegram/set-webhook once after deploy to register the webhook
// with Telegram. After that, all bot updates arrive here.

import { NextRequest, NextResponse } from 'next/server'
import { processUpdate, type TelegramUpdate } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Optional: verify secret_token header if we set one when registering the webhook
  const update: TelegramUpdate = await req.json()

  try {
    const result = await processUpdate(update)
    return NextResponse.json(result)
  } catch (e) {
    console.error('[/api/telegram/webhook] failed:', e)
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    )
  }
}

// Telegram periodically sends GET to verify the webhook is alive
export async function GET() {
  return NextResponse.json({ ok: true, status: 'alive' })
}
