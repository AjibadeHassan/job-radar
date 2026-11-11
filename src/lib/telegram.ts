// GigForMe — Telegram bot client + helpers
// Reuses the bot token from the job-scanner repo. Single bot, per-user dispatch by chatId.

import TelegramBot from 'node-telegram-bot-api'

let botInstance: TelegramBot | null = null

export function getBot(): TelegramBot {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set')

  if (!botInstance) {
    // Initialize without polling — we'll use sendMessage only from serverless
    // (polling requires a persistent process which Vercel can't do)
    botInstance = new TelegramBot(token, { polling: false })
  }
  return botInstance
}

export interface JobNotification {
  jobTitle: string
  companyName: string
  location: string
  workMode?: string
  matchScore: number
  matchReason: string
  redFlags: string[]
  salaryRange?: string
  postedAt: string
  jobId: string
  applyUrl?: string
}

export async function sendJobNotification(chatId: string, job: JobNotification): Promise<boolean> {
  const bot = getBot()

  const redFlagsText =
    job.redFlags.length > 0
      ? '\n\n⚠️ Red flags:\n' + job.redFlags.map((f) => `• ${f}`).join('\n')
      : ''

  const salaryText = job.salaryRange ? `\n💰 ${job.salaryRange}` : ''

  const message =
    `🎯 New match (${job.matchScore}/100) — ${job.jobTitle}\n\n` +
    `🏢 ${job.companyName}\n` +
    `📍 ${job.location}${job.workMode ? ` · ${job.workMode}` : ''}` +
    salaryText +
    `\n📅 Posted ${timeAgo(job.postedAt)}\n\n` +
    `💡 ${job.matchReason}` +
    redFlagsText +
    `\n\n👉 /view_${job.jobId} — View details\n` +
    `👉 /apply_${job.jobId} — Apply\n` +
    `👉 /cover_${job.jobId} — Generate cover letter`

  try {
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
    return true
  } catch (err: any) {
    console.error('Telegram send failed:', err.message)
    return false
  }
}

// Generate a deep-link token for onboarding
// Format: t.me/GigForMeBot?start=TOKEN
export function generateDeepLinkToken(): string {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
}

export function buildDeepLink(token: string): string {
  const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'GigForMeBot'
  return `https://t.me/${username}?start=${token}`
}

// Handle /start {token} — stores chatId against userId
// This runs as part of the getUpdates webhook (polled by Vercel cron)
export async function handleStartCommand(
  chatId: string,
  args: string
): Promise<{ userId: string } | null> {
  if (!args) return null  // No token — user just typed /start

  // Token format: TOKEN from generateDeepLinkToken()
  // Look up the TelegramLink record by deepLinkToken
  const { db } = await import('./db')
  const link = await db.telegramLink.findUnique({
    where: { deepLinkToken: args },
  })
  if (!link) return null  // Invalid or already-used token

  // Save chatId and mark verified
  await db.telegramLink.update({
    where: { userId: link.userId },
    data: {
      chatId,
      verifiedAt: new Date(),
    },
  })

  return { userId: link.userId }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / (1000 * 60 * 60))
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// Polling function — used by Vercel cron to process /start commands
// Returns the count of messages processed
export async function pollBotUpdates(): Promise<number> {
  const bot = getBot()
  // Use getUpdates manually — we don't want to enable polling on a serverless function
  try {
    const updates = await bot.getUpdates({ timeout: 0, limit: 50 })
    let processed = 0
    for (const update of updates) {
      const msg = update.message
      if (!msg?.text) continue
      const parts = msg.text.split(' ')
      if (parts[0] === '/start' && parts[1]) {
        const result = await handleStartCommand(String(msg.chat.id), parts[1])
        if (result) {
          await bot.sendMessage(
            msg.chat.id,
            '✅ Connected to GigForMe!\n\nYou\'ll now receive job matches here. ' +
              'Tap "Finish setup" on the website to complete your profile.'
          )
          processed++
        }
      }
    }
    return processed
  } catch (err) {
    console.error('pollBotUpdates error:', err)
    return 0
  }
}
