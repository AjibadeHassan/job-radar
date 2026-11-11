// Jobberman Nigeria — RSS feed scraper
import { scrapeRss } from './rss'

const FEED_URL = 'https://www.jobberman.com/jobs/feed.rss'

export async function scrapeJobberman() {
  return scrapeRss(FEED_URL, 'jobberman-ng', {
    defaultLocation: 'Nigeria',
    defaultIndustry: 'TECH',
    industryMap: {
      tech: 'TECH',
      software: 'TECH',
      developer: 'TECH',
      engineering: 'TECH',
      health: 'HEALTHCARE',
      medical: 'HEALTHCARE',
      nurse: 'HEALTHCARE',
      finance: 'FINANCE',
      accounting: 'FINANCE',
      audit: 'FINANCE',
      bank: 'FINANCE',
      education: 'EDUCATION',
      teacher: 'EDUCATION',
      lecturer: 'EDUCATION',
      design: 'CREATIVE',
      creative: 'CREATIVE',
      marketing: 'SALES',
      sales: 'SALES',
      legal: 'LEGAL',
      lawyer: 'LEGAL',
      counsel: 'LEGAL',
      operations: 'OPERATIONS',
      project: 'OPERATIONS',
      program: 'OPERATIONS',
    },
  })
}
