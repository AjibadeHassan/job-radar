// Jobberman Nigeria — RSS feed.
// Feed URL verified: https://www.jobberman.com/jobs/feed.rss
// Largest Nigerian job board, covers all 8 industries.

import { db } from '@/lib/db'
import { Industry } from '@prisma/client'
import type { RawJob, ScraperResult } from './_shared'
import { guessIndustries, parseWorkMode, makeExternalId, truncate } from './_shared'

const FEED_URL = 'https://www.jobberman.com/jobs/feed.rss'

export async function scrapeJobberman(): Promise<ScraperResult> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'GigForMeBot/1.0 (+https://gigforme.vercel.app)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return { sourceSlug: 'jobberman-ng', jobs: [], error: `HTTP ${res.status}` }
    }
    const xml = await res.text()
    const jobs = parseRss(xml)
    return { sourceSlug: 'jobberman-ng', jobs }
  } catch (e) {
    return { sourceSlug: 'jobberman-ng', jobs: [], error: (e as Error).message }
  }
}

function parseRss(xml: string): RawJob[] {
  const jobs: RawJob[] = []
  // Lightweight RSS parser — uses regex to avoid pulling in a full XML lib.
  // Jobberman RSS uses standard <item> structure with <title>, <link>, <description>,
  // <pubDate>. Custom fields may include <job:type>, <job:location>, <job:company>.
  const items = xml.split('<item>').slice(1)
  for (const item of items) {
    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link')
    const description = stripHtml(extractTag(item, 'description'))
    const pubDateStr = extractTag(item, 'pubDate')
    const company = extractNamespaced(item, 'job:company') || extractNamespaced(item, 'company') || guessCompany(title)
    const location = extractNamespaced(item, 'job:location') || extractNamespaced(item, 'location') || 'Nigeria'

    if (!title || !link) continue

    jobs.push({
      externalId: makeExternalId('jobberman-ng', link),
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      workMode: parseWorkMode(`${title} ${description}`),
      url: link.trim(),
      postedAt: pubDateStr ? new Date(pubDateStr) : new Date(),
      description: truncate(description, 1500),
      industries: guessIndustries(`${title} ${description}`),
    })
  }
  return jobs.slice(0, 100) // cap at 100 per source per scan
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const m = xml.match(re)
  return m ? m[1].trim() : ''
}

function extractNamespaced(xml: string, tag: string): string {
  // handles <job:company> and similar namespaced tags
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const m = xml.match(re)
  return m ? m[1].trim() : ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function guessCompany(title: string): string {
  // Sometimes RSS title is "Senior Engineer at Acme Corp"
  const m = title.match(/\bat\s+(.+)$/i)
  return m ? m[1].trim() : 'Unknown Company'
}
