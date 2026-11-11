// Adzuna — JSON API. Free tier: 1000 req/mo.
// Docs: https://developer.adzuna.com/docs
// Covers: most countries (US, UK, NG, ZA, KE, AU, DE, FR, BR, IN, etc.)
//
// Requires ADZUNA_APP_ID + ADZUNA_APP_KEY env vars.
// Free signup: https://developer.adzuna.com

import type { RawJob, ScraperResult } from './_shared'
import { guessIndustries, parseWorkMode, makeExternalId, truncate } from './_shared'

const BASE = 'https://api.adzuna.com/v1/api/jobs'

export async function scrapeAdzuna(country = 'gb', searchTerms = '', maxResults = 50): Promise<ScraperResult> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    return { sourceSlug: 'adzuna', jobs: [], error: 'ADZUNA_APP_ID/KEY not set' }
  }

  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: String(Math.min(maxResults, 50)),
      what: searchTerms,
      content_type: 'application/json',
    })
    const url = `${BASE}/${country}/search/1?${params}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GigForMeBot/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return { sourceSlug: 'adzuna', jobs: [], error: `HTTP ${res.status}` }
    }
    const data = await res.json()
    const jobs: RawJob[] = (data.results ?? []).map((r: AdzunaJob) => ({
      externalId: makeExternalId('adzuna', r.url || r.id),
      title: r.title?.trim() ?? 'Untitled',
      company: r.company?.display_name?.trim() ?? 'Unknown Company',
      location: r.location?.display_name?.trim() ?? 'Unknown',
      workMode: parseWorkMode(r.title || ''),
      url: r.redirect_url || r.url,
      applyUrl: r.redirect_url,
      postedAt: r.created ? new Date(r.created) : new Date(),
      description: truncate(r.description || '', 1500),
      industries: guessIndustries(`${r.title} ${r.description}`),
    }))
    return { sourceSlug: 'adzuna', jobs }
  } catch (e) {
    return { sourceSlug: 'adzuna', jobs: [], error: (e as Error).message }
  }
}

interface AdzunaJob {
  id: string
  title: string
  description: string
  created: string
  url: string
  redirect_url?: string
  company?: { display_name?: string }
  location?: { display_name?: string }
}
