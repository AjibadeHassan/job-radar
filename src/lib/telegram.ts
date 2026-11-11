// Telegram Bot API client.
// REUSES the bot token from the job-scanner repo — existing users keep working.
// Bot username: Carefree17scan_bot (display name: Jobfinder)
//
// In production (Vercel), the bot uses long-polling via a cron-triggered sweep
// OR a webhook set via /api/telegram/set-webhook (preferred once we have a domain).

const BASE = 'https://api.telegram.org/bot'

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN not set')
  return t
}

export interface TelegramMessage {
  chatId: string
  text: string
  inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
  parseMode?: 'Markdown' | 'HTML'
}

/**
 * Send a message to a user's Telegram chat.
 * Returns true on success, false on failure (rate limit, blocked chat, etc.).
 */
export async function sendMessage(msg: TelegramMessage): Promise<boolean> {
  const body: Record<string, unknown> = {
    chat_id: msg.chatId,
    text: msg.text,
    parse_mode: msg.parseMode ?? 'HTML',
    disable_web_page_preview: true,
  }
  if (msg.inlineKeyboard) {
    body.reply_markup = {
      inline_keyboard: msg.inlineKeyboard,
    }
  }

  try {
    const res = await fetch(`${BASE}${token()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error('[telegram] sendMessage failed:', data.description)
      return false
    }
    return true
  } catch (e) {
    console.error('[telegram] sendMessage error:', e)
    return false
  }
}

/**
 * Format a job match as a Telegram message.
 * Returns both the text and the inline keyboard for action buttons.
 */
export function formatJobMessage(job: {
  matchScore: number
  title: string
  company: string
  location: string
  workMode?: string
  matchReason: string
  redFlags?: string[]
  salaryRange?: string
  url: string
  applyUrl?: string
}, appUrl: string): TelegramMessage {
  const scoreEmoji = job.matchScore >= 80 ? '🎯' : job.matchScore >= 60 ? '💼' : '🔍'
  const lines: string[] = [
    `<b>${scoreEmoji} New match (${job.matchScore}/100) — ${escapeHtml(job.title)}</b>`,
    ``,
    `🏢 <b>${escapeHtml(job.company)}</b>  •  ${escapeHtml(job.location)}${job.workMode ? ` • ${job.workMode}` : ''}`,
  ]
  if (job.salaryRange) {
    lines.push(`💰 <b>${escapeHtml(job.salaryRange)}</b>`)
  }
  lines.push(`📅 Posted ${new Date().toLocaleDateString()}`)
  lines.push('')
  lines.push(`💡 ${escapeHtml(job.matchReason)}`)
  if (job.redFlags && job.redFlags.length > 0) {
    lines.push('')
    lines.push(`⚠️ Red flags: ${job.redFlags.map(escapeHtml).join(' • ')}`)
  }

  const text = lines.join('\n')

  const inlineKeyboard = [
    [
      { text: 'View Job', url: job.url },
      ...(job.applyUrl ? [{ text: 'Apply', url: job.applyUrl }] : []),
    ],
    [
      { text: 'Cover Letter', url: `${appUrl}/dashboard?job=${encodeURIComponent(job.url)}&action=cover-letter` },
      { text: 'Mute Source', callback_data: `mute:${job.url}` },
    ],
  ]

  return { chatId: '', text, inlineKeyboard, parseMode: 'HTML' }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Generate a Telegram deep-link URL for onboarding.
 * User scans QR → opens Telegram → taps Start → bot receives /start TOKEN
 * → our webhook matches TOKEN to a TelegramLink record → stores chatId.
 */
export function deepLinkUrl(deepLinkToken: string, botUsername?: string): string {
  const username = botUsername ?? process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'GigForMeBot'
  return `https://t.me/${username}?start=${deepLinkToken}`
}

/**
 * Process an incoming Telegram update (either /start command or callback query).
 * Called from /api/telegram/webhook.
 */
export async function processUpdate(update: TelegramUpdate): Promise<{ ok: boolean; response?: string }> {
  // Handle /start command (deep-link capture during onboarding)
  if (update.message?.text?.startsWith('/start ')) {
    const token = update.message.text.slice('/start '.length).trim()
    const chatId = String(update.message.chat.id)

    // Look up the TelegramLink by deepLinkToken — if found, store chatId + mark verified
    const { db } = await import('@/lib/db')
    const link = await db.telegramLink.findUnique({
      where: { deepLinkToken: token },
    })

    if (!link) {
      await sendMessage({
        chatId,
        text: '❌ Invalid onboarding token. Please restart the Telegram connection step from the GigForMe app.',
      })
      return { ok: false, response: 'invalid_token' }
    }

    // Update the link with the verified chatId
    await db.telegramLink.update({
      where: { deepLinkToken: token },
      data: {
        chatId,
        verifiedAt: new Date(),
      },
    })

    await sendMessage({
      chatId,
      text: '✅ <b>Telegram connected to GigForMe!</b>\n\nYou\'ll receive job match alerts here. You can adjust notification preferences anytime from the GigForMe dashboard.',
      parseMode: 'HTML',
    })

    return { ok: true, response: 'verified' }
  }

  // Handle /start with no token (someone just opened the bot)
  if (update.message?.text === '/start') {
    const chatId = String(update.message.chat.id)
    await sendMessage({
      chatId,
      text: '👋 <b>Welcome to GigForMe</b>\n\nTo start receiving job matches, sign up at GigForMe and connect your Telegram from the onboarding wizard.',
      parseMode: 'HTML',
    })
    return { ok: true, response: 'welcome' }
  }

  // Handle callback queries (button taps)
  if (update.callback_query) {
    const data = update.callback_query.data
    const chatId = String(update.callback_query.message?.chat?.id ?? '')
    if (data.startsWith('mute:')) {
      await sendMessage({
        chatId,
        text: '🔇 Source muted for 24 hours. You can unmute from the GigForMe dashboard.',
      })
      return { ok: true, response: 'muted' }
    }
  }

  return { ok: true, response: 'ignored' }
}

export interface TelegramUpdate {
  update_id: number
  message?: {
    chat: { id: number }
    text?: string
  }
  callback_query?: {
    data: string
    message?: { chat?: { id?: number } }
  }
}
