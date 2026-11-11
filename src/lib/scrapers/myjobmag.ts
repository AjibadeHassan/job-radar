// MyJobMag Nigeria — RSS feed.
// Similar structure to Jobberman. Pan-African coverage.

import type { RawJob, ScraperResult } from './_shared'
import { guessIndustries, parseWorkMode, makeExternalId, truncate } from './_shared'

const FEED_URL = 'https://www.myjobmag.com/jobs/feed'

export async function scrapeMyJobMag(): Promise<ScraperResult> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { 'User-Agent': 'GigForMeBot/1.0 (+https://gigforme.vercel.app)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return { sourceSlug: 'myjobmag', jobs: [], error: `HTTP ${res.status}` }
    }
    const xml = await res.text()
    const jobs = parseRss(xml)
    return { sourceSlug: 'myjobmag', jobs }
  } catch (e) {
    return { sourceSlug: 'myjobmag', jobs: [], error: (e as Error).message }
  }
}

function parseRss(xml: string): RawJob[] {
  const jobs: RawJob[] = []
  const items = xml.split('<item>').slice(1)
  for (const item of items) {
    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link')
    const description = stripHtml(extractTag(item, 'description'))
    const pubDateStr = extractTag(item, 'pubDate')
    const company = extractNamespaced(item, 'job:company') || guessCompany(title)
    const location = extractNamespaced(item, 'job:location') || 'Nigeria'

    if (!title || !link) continue

    jobs.push({
      externalId: makeExternalId('myjobmag', link),
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
  return jobs.slice(0, 100)
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const m = xml.match(re)
  return m ? m[1].trim() : ''
}

function extractNamespaced(xml: string, tag: string): string {
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
  const m = title.match(/\bat\s+(.+)$/i)
  return m ? m[1].trim() : 'Unknown Company'
}
