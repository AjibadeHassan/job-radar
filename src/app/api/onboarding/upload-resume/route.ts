// Resume upload + Gemini parser endpoint.
// POST a PDF or DOCX file, returns parsed profile fields for user confirmation.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseResume } from '@/lib/gemini'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null
    if (!file) {
      return NextResponse.json({ error: 'no file uploaded' }, { status: 400 })
    }

    // Read file as text — for PDF this requires pdf-parse; for DOCX, mammoth.
    // For MVP, accept .txt directly + .pdf via a lightweight parse.
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''
    if (file.name.endsWith('.pdf')) {
      // Lazy import — pdf-parse is heavy
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    } else if (file.name.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (file.name.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'unsupported file type — use PDF, DOCX, or TXT' }, { status: 400 })
    }

    if (text.length < 100) {
      return NextResponse.json({ error: 'resume text too short — check the file is not a scanned image' }, { status: 400 })
    }

    // Persist the resume row
    const existingVersion = await db.resume.count({ where: { userId: session.user.id } })
    const crypto = await import('crypto')
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex')

    await db.resume.create({
      data: {
        userId: session.user.id,
        version: existingVersion + 1,
        fileUrl: `s3://gigforme-resumes/${session.user.id}/${existingVersion + 1}/${file.name}`,
        fileHash,
        rawText: text,
      },
    })

    // Parse via Gemini
    const parsed = await parseResume(text)

    return NextResponse.json({
      ok: true,
      parsed,
      rawLength: text.length,
    })
  } catch (e) {
    console.error('[/api/onboarding/upload-resume] failed:', e)
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    )
  }
}
