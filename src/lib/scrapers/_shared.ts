// Shared types + helpers for all scrapers.
// Each scraper returns RawJob[] — the orchestrator handles dedup + embedding + matching.

import { Industry, WorkMode } from '@prisma/client'

export interface RawJob {
  externalId: string
  title: string
  company: string
  location: string
  workMode?: WorkMode
  url: string
  applyUrl?: string
  postedAt: Date
  description: string
  industries: Industry[]
}

export interface ScraperResult {
  sourceSlug: string
  jobs: RawJob[]
  error?: string
}

// ── Helpers ──────────────────────────────────────────────────────

/** Extract industries from text — naive keyword match. Used as fallback
 *  when sources don't categorize. */
export function guessIndustries(text: string): Industry[] {
  const t = text.toLowerCase()
  const industries = new Set<Industry>()

  if (/react|typescript|node\.?js|python|java|golang|kubernetes|frontend|backend|full.?stack|engineer|developer|software|devops/.test(t)) {
    industries.add(Industry.TECH)
  }
  if (/nurse|nursing|medical|physician|doctor|clinical|patient|hospital|healthcare|pharma|pharmacy/.test(t)) {
    industries.add(Industry.HEALTHCARE)
  }
  if (/accountant|accounting|audit|finance|financial|treasury|banking|investment|cfa|acca|ican/.test(t)) {
    industries.add(Industry.FINANCE)
  }
  if (/teacher|teaching|professor|faculty|curriculum|education|lecturer|pedagogy/.test(t)) {
    industries.add(Industry.EDUCATION)
  }
  if (/design|designer|brand|creative|ux|ui|graphic|illustration|motion/.test(t)) {
    industries.add(Industry.CREATIVE)
  }
  if (/sales|account executive|business development|growth|marketing|seo|performance/.test(t)) {
    industries.add(Industry.SALES)
  }
  if (/lawyer|paralegal|legal|counsel|attorney|litigation|compliance/.test(t)) {
    industries.add(Industry.LEGAL)
  }
  if (/program manager|project manager|operations|supply chain|logistics|coordinator/.test(t)) {
    industries.add(Industry.OPERATIONS)
  }

  return Array.from(industries)
}

/** Parse a work mode string ("Remote", "Hybrid", "On-site") into the enum. */
export function parseWorkMode(text: string): WorkMode | undefined {
  const t = text.toLowerCase()
  if (/remote|work from home|wfh/.test(t)) return WorkMode.REMOTE
  if (/hybrid|flex/.test(t)) return WorkMode.HYBRID
  if (/on.?site|in.?office|office only/.test(t)) return WorkMode.ONSITE
  return undefined
}

/** Generate a stable externalId from source + url/title — used for dedup. */
export function makeExternalId(sourceSlug: string, url: string): string {
  // Take last 60 chars of URL — usually contains the unique slug
  return `${sourceSlug}:${url.slice(-60)}`
}

/** Truncate text to a max length, on word boundary. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

/** Sleep helper for rate limiting. */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
