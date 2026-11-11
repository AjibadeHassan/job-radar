// GigForMe — Gemini AI client wrapper
// Handles: text embeddings (768-dim), structured-output JSON matching, cover letter generation
// All calls go to Gemini 1.5 Flash (gemini-1.5-flash) on the free tier (1500 req/day).

import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy initialization — only throws if Gemini is actually called without the key
let genAI: GoogleGenerativeAI | null = null
function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI
}

// ── Models ──────────────────────────────────────────────────────────
const EMBED_MODEL = 'text-embedding-004'      // 768-dim, multilingual, free
const TEXT_MODEL = 'gemini-1.5-flash'         // 1M tokens/min, 1500 req/day free

// ── Embedding ───────────────────────────────────────────────────────

export async function embedText(text: string): Promise<number[]> {
  const model = getClient().getGenerativeModel({ model: EMBED_MODEL })
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text: text.slice(0, 8000) }] },  // truncate to safe limit
  })
  return result.embedding.values
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  // Gemini supports up to 100 texts per batch call
  const model = getClient().getGenerativeModel({ model: EMBED_MODEL })
  const batches: number[][][] = []
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100)
    const results = await Promise.all(
      batch.map((text) =>
        model.embedContent({
          content: { role: 'user', parts: [{ text: text.slice(0, 8000) }] },
        })
      )
    )
    batches.push(results.map((r) => r.embedding.values))
  }
  return batches.flat()
}

// ── Structured-output matching ──────────────────────────────────────

export interface MatchResult {
  score: number  // 0–100
  reason: string
  redFlags: string[]
  experienceFit: 'UNDERQUALIFIED' | 'FIT' | 'OVERQUALIFIED'
  coverLetterTone: 'FORMAL' | 'CONVERSATIONAL' | 'CONFIDENT'
}

const MATCH_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      jobId: { type: 'STRING' },
      score: { type: 'INTEGER', minimum: 0, maximum: 100 },
      reason: { type: 'STRING', maxLength: 280 },
      redFlags: { type: 'ARRAY', items: { type: 'STRING' } },
      experienceFit: { type: 'STRING', enum: ['UNDERQUALIFIED', 'FIT', 'OVERQUALIFIED'] },
      coverLetterTone: { type: 'STRING', enum: ['FORMAL', 'CONVERSATIONAL', 'CONFIDENT'] },
    },
    required: ['jobId', 'score', 'reason', 'experienceFit'],
  },
}

export async function matchJobs(
  jobs: Array<{ id: string; title: string; company: string; description: string }>,
  profile: {
    seniority: string
    primaryStack: string[]
    domains: string[]
    workModes: string[]
    redFlags: string[]
    greenFlags: string[]
  }
): Promise<MatchResult[]> {
  const model = getClient().getGenerativeModel({
    model: TEXT_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: MATCH_SCHEMA,
      temperature: 0.3,
    },
  })

  const profileText = `Seniority: ${profile.seniority}
Stack/skills: ${profile.primaryStack.join(', ')}
Domains: ${profile.domains.join(', ')}
Work modes: ${profile.workModes.join(', ')}
Red flags (avoid): ${profile.redFlags.join(', ') || 'none'}
Green flags (prefer): ${profile.greenFlags.join(', ') || 'none'}`

  const jobsText = jobs
    .map((j, i) => `JOB ${i + 1} (id: ${j.id})
Title: ${j.title}
Company: ${j.company}
Description: ${j.description.slice(0, 1200)}`)
    .join('\n\n')

  const prompt = `You are a career match evaluator. Score each job 0-100 against the candidate profile below.

CANDIDATE PROFILE:
${profileText}

JOBS TO EVALUATE:
${jobsText}

For each job, return:
- jobId: the job id provided
- score: 0-100 (use full range — 90+ means exceptional fit, 50-70 means partial, <40 means poor)
- reason: one-sentence explanation referencing specific skills/stack/domain alignment
- redFlags: array of concerns (e.g. ["on-call rotation", "crypto exposure"]) — empty array if none
- experienceFit: UNDERQUALIFIED if candidate lacks 2+ years of req experience, FIT if matches, OVERQUALIFIED if candidate is 2+ levels above
- coverLetterTone: FORMAL for traditional (finance/legal/healthcare), CONVERSATIONAL for startups, CONFIDENT for senior engineering`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  try {
    return JSON.parse(text)
  } catch {
    return []
  }
}

// ── Resume parsing (one-shot, structured output) ──────────────────

export interface ParsedProfile {
  seniority: 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'STAFF' | 'MANAGER' | 'DIRECTOR'
  primaryStack: string[]
  domains: string[]
  workModes: ('REMOTE' | 'HYBRID' | 'ONSITE')[]
  redFlags: string[]
  greenFlags: string[]
  suggestedIndustries: string[]
  confidence: number
}

const RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    seniority: { type: 'STRING', enum: ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'STAFF', 'MANAGER', 'DIRECTOR'] },
    primaryStack: { type: 'ARRAY', items: { type: 'STRING' } },
    domains: { type: 'ARRAY', items: { type: 'STRING' } },
    workModes: { type: 'ARRAY', items: { type: 'STRING', enum: ['REMOTE', 'HYBRID', 'ONSITE'] } },
    redFlags: { type: 'ARRAY', items: { type: 'STRING' } },
    greenFlags: { type: 'ARRAY', items: { type: 'STRING' } },
    suggestedIndustries: { type: 'ARRAY', items: { type: 'STRING' } },
    confidence: { type: 'NUMBER', minimum: 0, maximum: 1 },
  },
  required: ['seniority', 'primaryStack', 'domains', 'workModes', 'suggestedIndustries', 'confidence'],
}

export async function parseResume(resumeText: string): Promise<ParsedProfile> {
  const model = getClient().getGenerativeModel({
    model: TEXT_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESUME_SCHEMA,
      temperature: 0.2,
    },
  })

  const prompt = `Extract the candidate profile from this resume. Be conservative — only include skills/tools/domains that are clearly demonstrated by work experience, not just mentioned.

Industries to consider: TECH, HEALTHCARE, FINANCE, EDUCATION, CREATIVE, SALES, LEGAL, OPERATIONS.

Work modes: infer from the resume's stated preferences or current role's nature. Default to ['REMOTE', 'HYBRID'] if unclear.

Seniority: pick the level that matches the candidate's most recent role. SENIOR = 5-8 years experience, LEAD = 8-12 years, STAFF = 10+ years, MANAGER = people management, MID = 2-5 years, JUNIOR = 0-2 years.

RESUME TEXT:
${resumeText.slice(0, 30000)}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return JSON.parse(text)
}

// ── Cover letter generation ────────────────────────────────────────

export async function generateCoverLetter(
  job: { title: string; company: string; description: string },
  profile: { seniority: string; primaryStack: string[]; domains: string[] },
  tone: 'FORMAL' | 'CONVERSATIONAL' | 'CONFIDENT' = 'FORMAL'
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: TEXT_MODEL,
    generationConfig: { temperature: 0.7 },
  })

  const toneInstructions = {
    FORMAL: 'Use traditional business letter formality. Suitable for finance, legal, healthcare, or enterprise roles.',
    CONVERSATIONAL: 'Use a warm, professional but approachable tone. Suitable for startups and modern companies.',
    CONFIDENT: 'Use a direct, achievement-focused tone. Suitable for senior engineering or leadership roles.',
  }

  const prompt = `Write a cover letter for the following job application.

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description.slice(0, 1500)}

CANDIDATE:
Seniority: ${profile.seniority}
Stack/skills: ${profile.primaryStack.join(', ')}
Domains: ${profile.domains.join(', ')}

TONE: ${toneInstructions[tone]}

Requirements:
- 250-350 words, 4 paragraphs
- Open with a specific reason for interest in this company/role (not "I am writing to apply")
- Body paragraphs must reference concrete experience that matches the job requirements
- Close with a forward-looking sentence, not a generic "thank you"
- Do not invent specific metrics or company names not in the candidate profile
- Use [Your Name] as the sign-off placeholder
- No headers, no date, no address block — just the letter body`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
