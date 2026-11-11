// Resume upload endpoint
// Accepts a PDF/DOCX file, parses with pdf-parse, calls Gemini to extract structured profile,
// saves Resume record + Profile record (without embedding yet — that happens on first scan).

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseResume, embedText } from '@/lib/gemini'
import { requireAuth } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate file type
    const name = file.name.toLowerCase()
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex')

    // Extract text — for MVP, only PDF parsing is supported
    let rawText = ''
    if (name.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const result = await pdfParse(buffer)
      rawText = result.text
    } else {
      // DOCX — stub for now, will add mammoth.js later
      return NextResponse.json({ error: 'DOCX parsing coming soon — please upload PDF' }, { status: 400 })
    }

    if (rawText.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from file — please check the PDF' }, { status: 400 })
    }

    // Call Gemini to parse resume into structured profile
    const parsed = await parseResume(rawText)

    // Get the current resume version count
    const existingResumes = await db.resume.count({ where: { userId: auth.userId } })
    const version = existingResumes + 1

    // Save Resume record (file stored in R2 in production, stubbed for MVP)
    const resume = await db.resume.create({
      data: {
        userId: auth.userId,
        version,
        fileUrl: `uploads/${auth.userId}/resume-v${version}.pdf`,  // R2 path
        fileHash,
        rawText,
      },
    })

    // Generate embedding for the profile text
    const profileText = `Seniority: ${parsed.seniority}. Stack: ${parsed.primaryStack.join(', ')}. Domains: ${parsed.domains.join(', ')}. Work modes: ${parsed.workModes.join(', ')}.`
    const embedding = await embedText(profileText)
    const vectorStr = `[${embedding.join(',')}]`

    // Upsert Profile record
    await db.profile.upsert({
      where: { userId: auth.userId },
      update: {
        seniority: parsed.seniority as any,
        primaryStack: parsed.primaryStack,
        domains: parsed.domains,
        workModes: parsed.workModes as any,
        timezone: 'Africa/Lagos',  // default — user can change in onboarding
        redFlags: parsed.redFlags,
        greenFlags: parsed.greenFlags,
        embeddingModel: 'text-embedding-004',
        embeddingUpdatedAt: new Date(),
      },
      create: {
        userId: auth.userId,
        seniority: parsed.seniority as any,
        primaryStack: parsed.primaryStack,
        domains: parsed.domains,
        workModes: parsed.workModes as any,
        timezone: 'Africa/Lagos',
        redFlags: parsed.redFlags,
        greenFlags: parsed.greenFlags,
        embeddingModel: 'text-embedding-004',
        embeddingUpdatedAt: new Date(),
      },
    })

    // Save the embedding vector via raw SQL (Prisma can't write vector type directly)
    await db.$executeRaw`UPDATE "Profile" SET embedding = ${vectorStr}::vector WHERE "userId" = ${auth.userId}`

    // Create default UserPreferences if not present
    await db.userPreferences.upsert({
      where: { userId: auth.userId },
      update: {},
      create: {
        userId: auth.userId,
        scanCadenceHours: 6,
        minMatchScore: 60,
        maxNotificationsDay: 5,
        notifyWindowStart: '08:00',
        notifyWindowEnd: '21:00',
      },
    })

    return NextResponse.json({
      ok: true,
      resumeId: resume.id,
      parsed: {
        seniority: parsed.seniority,
        primaryStack: parsed.primaryStack,
        domains: parsed.domains,
        workModes: parsed.workModes,
        redFlags: parsed.redFlags,
        greenFlags: parsed.greenFlags,
        suggestedIndustries: parsed.suggestedIndustries,
        confidence: parsed.confidence,
      },
    })
  } catch (err: any) {
    console.error('Resume upload failed:', err)
    return NextResponse.json({ error: err.message || 'Resume parsing failed' }, { status: 500 })
  }
}
