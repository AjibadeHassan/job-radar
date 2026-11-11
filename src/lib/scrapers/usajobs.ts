// USAJobs — JSON API scraper
// Free, US government. No auth required beyond User-Agent + Authorization header.
// https://developer.usajobs.gov/

interface USJobsResponse {
  SearchResult: {
    SearchResultCount: number
    SearchResultItems: Array<{
      MatchedObjectId: string
      MatchedObjectDescriptor: {
        PositionTitle: string
        OrganizationName: string
        PositionLocation: Array<{ LocationName: string; CountryCode: string }>
        PositionURI: string
        PositionStartDate: string
        PositionEndDate: string
        QualificationSummary: string
        JobCategory: Array<{ Code: string; Name: string }>
        PositionSchedule: Array<{ Name: string }>
        PositionRemuneration: { MinimumRange: string; MaximumRange: string; RateIntervalCode: string }
        TeleworkEligible?: boolean
      }
    }>
  }
}

const BASE_URL = 'https://data.usajobs.gov/api/search'

export async function scrapeUSJobs() {
  const EMAIL = process.env.USAJOBS_EMAIL
  const KEY = process.env.USAJOBS_KEY

  if (!EMAIL || !KEY) {
    console.warn('USAJobs: USAJOBS_EMAIL / USAJOBS_KEY not set, skipping')
    return []
  }

  const queries = [
    { keyword: 'IT Specialist', industry: 'TECH' },
    { keyword: 'Nurse', industry: 'HEALTHCARE' },
    { keyword: 'Accountant', industry: 'FINANCE' },
    { keyword: 'Attorney', industry: 'LEGAL' },
    { keyword: 'Program Manager', industry: 'OPERATIONS' },
  ]

  const jobs: any[] = []

  for (const q of queries) {
    try {
      const url = `${BASE_URL}?Keyword=${encodeURIComponent(q.keyword)}&ResultsPerPage=50`
      const res = await fetch(url, {
        headers: {
          'User-Agent': EMAIL,
          'Authorization-Key': KEY,
          'Host': 'data.usajobs.gov',
        },
      })
      if (!res.ok) continue
      const data: USJobsResponse = await res.json()

      for (const r of data.SearchResult.SearchResultItems) {
        const d = r.MatchedObjectDescriptor
        const location = d.PositionLocation[0]?.LocationName || 'US'
        const workMode = d.TeleworkEligible ? 'REMOTE' : 'ONSITE'

        jobs.push({
          externalId: r.MatchedObjectId,
          title: d.PositionTitle,
          company: d.OrganizationName,
          location,
          url: d.PositionURI,
          postedAt: d.PositionStartDate ? new Date(d.PositionStartDate) : new Date(),
          rawText: `${d.PositionTitle} at ${d.OrganizationName}. ${d.QualificationSummary.slice(0, 8000)}`,
          industries: [q.industry],
          sourceSlug: 'usajobs',
        })
      }
    } catch (err: any) {
      console.error(`USAJobs ${q.keyword} failed:`, err.message)
    }
  }

  return jobs
}
