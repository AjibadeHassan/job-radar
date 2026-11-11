// Telegram connect endpoint
// Generates a one-time deep-link token, returns the QR URL the user scans.
// User scans QR → opens t.me/GigForMeBot?start=TOKEN → bot stores chatId → /api/telegram-poll processes it.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generateDeepLinkToken, buildDeepLink } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const token = generateDeepLinkToken()

  // Upsert TelegramLink record with the new token
  await db.telegramLink.upsert({
    where: { userId: auth.userId },
    update: { deepLinkToken: token, verifiedAt: null },
    create: {
      userId: auth.userId,
      deepLinkToken: token,
      chatId: `pending_${auth.userId}_${Date.now()}`,  // placeholder, replaced on /start
    },
  })

  return NextResponse.json({
    token,
    deepLink: buildDeepLink(token),
    qrUrl: buildDeepLink(token),
  })
}

// GET — check verification status
export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const link = await db.telegramLink.findUnique({
    where: { userId: auth.userId },
    select: { chatId: true, verifiedAt: true, deepLinkToken: true },
  })

  if (!link) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: !!link.verifiedAt,
    chatId: link.verifiedAt ? link.chatId : null,
    token: link.deepLinkToken,
  })
}
