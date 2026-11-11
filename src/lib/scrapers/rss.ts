// GigForMe — RSS feed scraper (generic)
// Parses any RSS 2.0 / Atom feed into normalized JobPosting records.
// Used by: Jobberman, MyJobMag, BrighterMonday, WeWorkRemotely, NHS, etc.

import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'GigForMe/1.0 (+https://gigforme.app)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
})

export interface ScrapedJob {
  externalId: string
  title: string
  company: string
  location: string
  url: string
  postedAt: Date
  rawText: string
  industries: string[]
  sourceSlug: string
}

export interface RssJobItem {
  title?: string
  link?: string
  pubDate?: string
  content?: string
  contentSnippet?: string
  creator?: string
  categories?: string[]
}

export async function scrapeRss(
  feedUrl: string,
  sourceSlug: string,
  options?: {
    defaultCompany?: string
    defaultLocation?: string
    industryMap?: Record<string, string>
    defaultIndustry?: string
  }
): Promise<ScrapedJob[]> {
  try {
    const feed = await parser.parseURL(feedUrl)
    const jobs: ScrapedJob[] = []

    for (const item of feed.items as RssJobItem[]) {
      const title = item.title?.trim()
      const url = item.link?.trim()
      if (!title || !url) continue

      const rawText = (item.content || item.contentSnippet || '').replace(/<[^>]+>/g, ' ').trim()

      // Extract company: look in title (often "Job at Company"), or use default
      let company = options?.defaultCompany || 'Unknown'
      if (title.includes(' at ')) {
        company = title.split(' at ').pop() || company
      } else if (item.creator) {
        company = item.creator
      }

      const postedAt = item.pubDate ? new Date(item.pubDate) : new Date()

      // Map categories to industries if mapping provided
      const industries: string[] = []
      if (options?.industryMap && item.categories) {
        for (const cat of item.categories) {
          const lowerCat = cat.toLowerCase()
          for (const [key, industry] of Object.entries(options.industryMap)) {
            if (lowerCat.includes(key)) {
              if (!industries.includes(industry)) industries.push(industry)
            }
          }
        }
      }
      if (industries.length === 0 && options?.defaultIndustry) {
        industries.push(options.defaultIndustry)
      }

      jobs.push({
        externalId: url,  // use URL as external id (unique per source)
        title,
        company,
        location: options?.defaultLocation || 'Unspecified',
        url,
        postedAt,
        rawText: `${title} at ${company}. ${rawText}`.slice(0, 8000),
        industries,
        sourceSlug,
      })
    }

    return jobs
  } catch (err: any) {
    console.error(`RSS scrape failed for ${sourceSlug} (${feedUrl}):`, err.message)
    return []
  }
}
