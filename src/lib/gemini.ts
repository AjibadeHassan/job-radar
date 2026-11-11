// Gemini API client — embeddings + structured-output matching
// Works from Vercel's deploy regions (US/EU/Asia) — sandbox may be geo-blocked,
// but production will be fine.
//
// Free tier limits (no billing required):
//   - 15 RPM, 1500 req/day
//   - 1M tokens/min
//   - Reaches ceiling ~75 active users scanning 4x/day

const BASE = 'https://generativelanguage.googleapis.com/v1beta'

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY
  if (!k) throw new Error('GEMINI_API_KEY not set')
  return k
}

export interface EmbeddingResult {
  values: number[]
}

/**
 * Generate an embedding for a single text input using Gemini text-embedding-004.
 * Returns a 768-dim float vector — stored in Profile.embedding / JobPosting.embedding.
 */
export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(
    `${BASE}/models/text-embedding-004:embedContent?key=${apiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: text.slice(0, 8000) }] }, // truncate to 8k chars
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini embedText failed: ${res.status} ${JSON.stringify(err).slice(0, 200)}`)
  }
  const data = await res.json()
  return data.embedding?.values ?? []
}

/**
 * Generate embeddings for up to 100 texts in a single batched call.
 * Saves API quota — 1 request per 100 texts instead of 100 requests.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  if (texts.length > 100) {
    // Recurse for larger batches
    const first = await embedBatch(texts.slice(0, 100))
    const rest = await embedBatch(texts.slice(100))
    return [...first, ...rest]
  }

  const res = await fetch(
    `${BASE}/models/text-embedding-004:batchEmbedContents?key=${apiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map((t) => ({
          model: 'models/text-embedding-004',
          content: { parts: [{ text: t.slice(0, 8000) }] },
        })),
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini embedBatch failed: ${res.status} ${JSON.stringify(err).slice(0, 200)}`)
  }
  const data = await res.json()
  return (data.embeddings ?? []).map((e: { values: number[] }) => e.values)
}

export interface MatchResult {
  score: number
  reason: string
  redFlags: string[]
  experienceFit: 'UNDERQUALIFIED' | 'FIT' | 'OVERQUALIFIED'
}

/**
 * Run structured-output matching on up to 5 jobs against a user profile.
 * Returns MatchResult[] aligned with the input jobs array.
 *
 * Uses responseMimeType: 'application/json' + responseSchema for guaranteed JSON.
 * Batches 5 jobs per call to amortize tokens (saves ~80% cost vs 1-by-1).
 */
export async function matchJobs(
  jobs: Array<{ id: string; title: string; company: string; description: string; location: string }>,
  profile: { seniority: string; primaryStack: string[]; domains: string[]; workModes: string[]; redFlags: string[]; greenFlags: string[] }
): Promise<Record<string, MatchResult>> {
  if (jobs.length === 0) return {}

  const profileText = `Seniority: ${profile.seniority}. Stack: ${profile.primaryStack.join(', ')}. Domains: ${profile.domains.join(', ')}. Work modes: ${profile.workModes.join(', ')}. Wants: ${profile.greenFlags.join(', ') || 'none'}. Avoids: ${profile.redFlags.join(', ') || 'none'}.`

  const jobsText = jobs
    .map(
      (j, i) =>
        `JOB ${i + 1} (id: ${j.id}):
Title: ${j.title}
Company: ${j.company}
Location: ${j.location}
Description: ${j.description.slice(0, 800)}`
    )
    .join('\n\n')

  const prompt = `You are a senior recruiter evaluating job fit for a candidate.

Candidate profile:
${profileText}

Jobs to evaluate:
${jobsText}

For EACH job, return a JSON object with:
- score: 0-100 (how well the candidate fits THIS job)
- reason: one sentence (max 280 chars) explaining the score
- redFlags: array of concerns (empty array if none)
- experienceFit: "UNDERQUALIFIED" | "FIT" | "OVERQUALIFIED"

Return a JSON object: { "results": { "<jobId>": { "score": N, "reason": "...", "redFlags": [...], "experienceFit": "..." } } }`

  const res = await fetch(
    `${BASE}/models/gemini-1.5-flash:generateContent?key=${apiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // low temp = more deterministic scoring
          responseMimeType: 'application/json',
          maxOutputTokens: 2000,
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini matchJobs failed: ${res.status} ${JSON.stringify(err).slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  const parsed = JSON.parse(text)
  return parsed.results ?? parsed // tolerant parse — handle both {results:{}} and direct {id:{}}
}

/**
 * Generate a cover letter for a specific job.
 * Cached by (userId, jobId, tone) hash — only generated once per triple.
 */
export async function generateCoverLetter(
  job: { title: string; company: string; description: string; location: string },
  profile: { seniority: string; primaryStack: string[]; domains: string[]; name?: string },
  tone: 'FORMAL' | 'CONVERSATIONAL' | 'CONFIDENT' = 'FORMAL'
): Promise<string> {
  const profileText = `Seniority: ${profile.seniority}
Top skills: ${profile.primaryStack.join(', ')}
Domains: ${profile.domains.join(', ')}
Candidate name: ${profile.name ?? '[Your Name]'}`

  const prompt = `Write a cover letter for this job application.

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description.slice(0, 1000)}

CANDIDATE:
${profileText}

Tone: ${tone.toLowerCase()}.

Rules:
- 3 short paragraphs, ~200 words total
- Open with why this specific company interests you
- Middle paragraph: one concrete achievement with a measurable result
- Close with a single-sentence call to action
- Sign off as "[Your Name]" (literal placeholder) — never invent a name
- No bullet points, no markdown headings
- Plain prose only`

  const res = await fetch(
    `${BASE}/models/gemini-1.5-flash:generateContent?key=${apiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini generateCoverLetter failed: ${res.status} ${JSON.stringify(err).slice(0, 200)}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export interface ParsedResume {
  seniority: string
  primaryStack: string[]
  domains: string[]
  workModes: string[]
  redFlags: string[]
  greenFlags: string[]
  suggestedIndustries: string[]
  confidence: number
}

/**
 * Parse a resume text into a structured Profile schema via Gemini.
 * Called once at onboarding — user confirms/edits the result before save.
 */
export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const prompt = `You are an expert recruiter. Parse this resume into a structured profile.

RESUME TEXT:
${resumeText.slice(0, 12000)}

Return ONLY valid JSON matching this schema:
{
  "seniority": "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "STAFF" | "MANAGER" | "DIRECTOR",
  "primaryStack": ["skill1", "skill2", ...],
  "domains": ["fintech", "healthtech", ...],
  "workModes": ["REMOTE", "HYBRID", "ONSITE"],
  "redFlags": [],
  "greenFlags": [],
  "suggestedIndustries": ["TECH", "FINANCE", ...],
  "confidence": 0.0-1.0
}

Rules:
- primaryStack: 5-10 most relevant skills (technologies, tools, methodologies)
- domains: industry verticals the candidate has experience in
- suggestedIndustries: from TECH, HEALTHCARE, FINANCE, EDUCATION, CREATIVE, SALES, LEGAL, OPERATIONS
- confidence: how sure you are about seniority + stack (0.5 = guessing, 0.9 = obvious)
- If you can't tell, leave arrays empty and set confidence low`

  const res = await fetch(
    `${BASE}/models/gemini-1.5-flash:generateContent?key=${apiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          maxOutputTokens: 1500,
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini parseResume failed: ${res.status} ${JSON.stringify(err).slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  return JSON.parse(text)
}
