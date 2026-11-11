// Jooble — JSON API. Free partner program, no hard cap.
// Docs: https://jooble.org/api/about
// Covers: global (most countries)

import type { RawJob, ScraperResult } from './_shared'
import { guessIndustries, parseWorkMode, makeExternalId, truncate } from './_shared'

export async function scrapeJooble(searchTerms = '', location = '', page = 1): Promise<ScraperResult> {
  const apiKey = process.env.JOOBLE_API_KEY
  if (!apiKey) {
    return { sourceSlug: 'jooble', jobs: [], error: 'JOOBLE_API_KEY not set' }
  }

  try {
    const url = `https://jooble.org/api/${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: searchTerms,
        location,
        page,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return { sourceSlug: 'jooble', jobs: [], error: `HTTP ${res.status}` }
    }
    const data = await res.json()
    const jobs: RawJob[] = (data.jobs ?? []).map((r: JoobleJob) => ({
      externalId: makeExternalId('jooble', r.link || r.id),
      title: r.title?.trim() ?? 'Untitled',
      company: r.company?.trim() ?? 'Unknown Company',
      location: r.location?.trim() ?? 'Unknown',
      workMode: parseWorkMode(r.title || ''),
      url: r.link,
      applyUrl: r.link,
      postedAt: r.updated ? new Date(r.updated) : new Date(),
      description: truncate(r.snippet || r.title || '', 1500),
      industries: guessIndustries(`${r.title} ${r.snippet}`),
    }))
    return { sourceSlug: 'jooble', jobs }
  } catch (e) {
    return { sourceSlug: 'jooble', jobs: [], error: (e as Error).message }
  }
}

interface JoobleJob {
  id: string
  title: string
  snippet?: string
  company?: string
  location?: string
  link: string
  updated?: string
}
