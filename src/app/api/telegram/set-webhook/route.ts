// One-shot endpoint to register the webhook with Telegram.
// Visit https://your-domain.com/api/telegram/set-webhook once after deploy.
//
// After this, Telegram will POST all bot updates to /api/telegram/webhook.

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!token || !appUrl) {
    return NextResponse.json(
      { error: 'TELEGRAM_BOT_TOKEN or NEXT_PUBLIC_APP_URL not set' },
      { status: 500 }
    )
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`
  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
    }
  )
  const data = await res.json()

  if (!data.ok) {
    return NextResponse.json(
      { error: 'Telegram setWebhook failed', details: data },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    webhookUrl,
    message: `Webhook registered. Telegram will POST updates to ${webhookUrl}`,
  })
}
