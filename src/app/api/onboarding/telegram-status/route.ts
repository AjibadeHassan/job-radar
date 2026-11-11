// Polling endpoint for the onboarding wizard Step 3 (Telegram connect).
// The wizard polls this every 2s to check if the user has tapped Start in Telegram.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }

  const link = await db.telegramLink.findUnique({
    where: { deepLinkToken: token },
    select: { chatId: true, verifiedAt: true, userId: true },
  })

  if (!link) {
    return NextResponse.json({ status: 'invalid_token' }, { status: 404 })
  }

  if (link.verifiedAt) {
    return NextResponse.json({
      status: 'verified',
      chatId: link.chatId,
      verifiedAt: link.verifiedAt.toISOString(),
    })
  }

  return NextResponse.json({ status: 'pending' })
}
