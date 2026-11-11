// Adzuna — JSON API scraper
// Free tier: 1k req/mo. Get APP_ID and APP_KEY from https://developer.adzuna.com/
// Per-call: returns ~10-50 jobs across multiple categories.

import { db } from '../db'

interface AdzunaResponse {
  count: number
  results: Array<{
    id: string
    title: string
    description: string
    company?: { display_name: string }
    location?: { display_name: string; area?: string[] }
    contract_time?: string
    contract_type?: string
    salary_min?: number
    salary_max?: number
    salary_is_predicted?: boolean
    redirect_url?: string
    created?: string
    category?: { label: string; tag: string }
  }>
}

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs'

export async function scrapeAdzuna() {
  const APP_ID = process.env.ADZUNA_APP_ID
  const APP_KEY = process.env.ADZUNA_APP_KEY

  if (!APP_ID || !APP_KEY) {
    console.warn('Adzuna: ADZUNA_APP_ID / ADZUNA_APP_KEY not set, skipping')
    return []
  }

  // Search across 5 African + global regions per call to maximize coverage
  const queries = [
    { country: 'ng', what: 'engineer', industry: 'TECH' },
    { country: 'ng', what: 'accountant', industry: 'FINANCE' },
    { country: 'ng', what: 'nurse', industry: 'HEALTHCARE' },
    { country: 'za', what: 'developer', industry: 'TECH' },
    { country: 'gb', what: 'remote', industry: 'TECH' },
  ]

  const jobs: any[] = []

  for (const q of queries) {
    try {
      const url = `${BASE_URL}/${q.country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&what=${encodeURIComponent(q.what)}&results_per_page=50`
      const res = await fetch(url)
      if (!res.ok) continue
      const data: AdzunaResponse = await res.json()

      for (const r of data.results) {
        jobs.push({
          externalId: r.id,
          title: r.title,
          company: r.company?.display_name || 'Unknown',
          location: r.location?.display_name || 'Unspecified',
          url: r.redirect_url || '',
          postedAt: r.created ? new Date(r.created) : new Date(),
          rawText: `${r.title} at ${r.company?.display_name}. ${(r.description || '').replace(/<[^>]+>/g, ' ').slice(0, 8000)}`,
          industries: [q.industry],
          sourceSlug: 'adzuna',
        })
      }
    } catch (err: any) {
      console.error(`Adzuna ${q.country}/${q.what} failed:`, err.message)
    }
  }

  return jobs
}
