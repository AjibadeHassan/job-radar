// Jooble — JSON API scraper
// Free partner program: https://jooble.org/api/about
// Get API key from your Jooble partner account.

interface JoobleResponse {
  jobs: Array<{
    id: string
    title: string
    snippet: string
    company: string
    location: string
    link: string
    updated: string
    type?: string
    salary?: string
  }>
  totalCount: number
}

const BASE_URL = 'https://jooble.org/api/'

export async function scrapeJooble() {
  const API_KEY = process.env.JOOBLE_API_KEY
  if (!API_KEY) {
    console.warn('Jooble: JOOBLE_API_KEY not set, skipping')
    return []
  }

  // 4 search queries across different industries
  const queries = [
    { keywords: 'software engineer', industry: 'TECH' },
    { keywords: 'accountant', industry: 'FINANCE' },
    { keywords: 'nurse', industry: 'HEALTHCARE' },
    { keywords: 'teacher', industry: 'EDUCATION' },
  ]

  const jobs: any[] = []

  for (const q of queries) {
    try {
      const res = await fetch(`${BASE_URL}${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: q.keywords,
          page: 1,
          location: 'africa',
        }),
      })
      if (!res.ok) continue
      const data: JoobleResponse = await res.json()

      for (const r of data.jobs) {
        jobs.push({
          externalId: r.id,
          title: r.title,
          company: r.company || 'Unknown',
          location: r.location || 'Unspecified',
          url: r.link,
          postedAt: r.updated ? new Date(r.updated) : new Date(),
          rawText: `${r.title} at ${r.company}. ${r.snippet.replace(/<[^>]+>/g, ' ').slice(0, 8000)}`,
          industries: [q.industry],
          sourceSlug: 'jooble',
        })
      }
    } catch (err: any) {
      console.error(`Jooble ${q.keywords} failed:`, err.message)
    }
  }

  return jobs
}
