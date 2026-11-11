// USAJobs — JSON API. Free, US government, no key but requires User-Agent with email.
// Docs: https://developer.usajobs.gov/
// Covers: US federal jobs across TECH, HEALTHCARE, FINANCE, EDUCATION, LEGAL, OPERATIONS.

import type { RawJob, ScraperResult } from './_shared'
import { guessIndustries, parseWorkMode, makeExternalId, truncate } from './_shared'

const BASE = 'https://data.usajobs.gov/api/search'

export async function scrapeUsajobs(keyword = '', location = '', maxResults = 50): Promise<ScraperResult> {
  const userEmail = process.env.USAJOBS_USER_EMAIL
  const apiKey = process.env.USAJOBS_API_KEY
  if (!userEmail || !apiKey) {
    return { sourceSlug: 'usajobs', jobs: [], error: 'USAJOBS_USER_EMAIL/API_KEY not set' }
  }

  try {
    const params = new URLSearchParams({
      Keyword: keyword,
      LocationName: location,
      ResultsPerPage: String(Math.min(maxResults, 500)),
    })
    const res = await fetch(`${BASE}?${params}`, {
      headers: {
        'User-Agent': userEmail,
        'Authorization-Key': apiKey,
        'Host': 'data.usajobs.gov',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      return { sourceSlug: 'usajobs', jobs: [], error: `HTTP ${res.status}` }
    }
    const data = await res.json()
    const jobs: RawJob[] = (data.SearchResult?.SearchResultItems ?? []).map((r: UsajobsItem) => {
      const locationName = r.PositionLocation?.[0]?.LocationName ?? 'US'
      const desc = r.QualificationSummary || r.PositionSummary || ''
      return {
        externalId: makeExternalId('usajobs', r.PositionURI || r.PositionID),
        title: r.PositionTitle?.trim() ?? 'Untitled',
        company: r.OrganizationName?.trim() ?? 'US Government',
        location: locationName,
        workMode: parseWorkMode(r.PositionTitle || ''),
        url: r.PositionURI,
        applyUrl: r.ApplyURI?.[0] || r.PositionURI,
        postedAt: r.PositionStartDate ? new Date(r.PositionStartDate) : new Date(),
        description: truncate(desc, 1500),
        industries: guessIndustries(`${r.PositionTitle} ${desc}`),
      }
    })
    return { sourceSlug: 'usajobs', jobs }
  } catch (e) {
    return { sourceSlug: 'usajobs', jobs: [], error: (e as Error).message }
  }
}

interface UsajobsItem {
  PositionID: string
  PositionTitle: string
  PositionURI: string
  ApplyURI?: string[]
  PositionStartDate?: string
  OrganizationName?: string
  PositionLocation?: Array<{ LocationName?: string }>
  QualificationSummary?: string
  PositionSummary?: string
}
