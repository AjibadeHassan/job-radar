// MyJobMag — RSS feed scraper
import { scrapeRss } from './rss'

const FEED_URL = 'https://www.myjobmag.com/jobs/feed'

export async function scrapeMyJobMag() {
  return scrapeRss(FEED_URL, 'myjobmag', {
    defaultLocation: 'Nigeria',
    defaultIndustry: 'OPERATIONS',
    industryMap: {
      tech: 'TECH',
      software: 'TECH',
      developer: 'TECH',
      engineering: 'TECH',
      health: 'HEALTHCARE',
      medical: 'HEALTHCARE',
      finance: 'FINANCE',
      accounting: 'FINANCE',
      audit: 'FINANCE',
      education: 'EDUCATION',
      teacher: 'EDUCATION',
      design: 'CREATIVE',
      marketing: 'SALES',
      sales: 'SALES',
      legal: 'LEGAL',
      operations: 'OPERATIONS',
      project: 'OPERATIONS',
    },
  })
}
