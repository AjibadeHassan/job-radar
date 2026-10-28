'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Check, Mail, ExternalLink, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { MockJob } from '@/lib/mock-data'

interface CoverLetterModalProps {
  job: MockJob | null
  open: boolean
  onClose: () => void
}

export function CoverLetterModal({ job, open, onClose }: CoverLetterModalProps) {
  const [copied, setCopied] = useState(false)

  if (!job) return null

  const handleCopy = async () => {
    if (!job.coverLetter) return
    try {
      await navigator.clipboard.writeText(job.coverLetter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Cover Letter
              </DialogTitle>
              <DialogDescription className="mt-1">
                <span className="font-medium text-foreground">{job.title}</span> at{' '}
                <span className="font-medium text-foreground">{job.company}</span> · Score{' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-mono">{job.matchScore}/100</span>
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              Gemini-generated
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] scroll-thin">
          <div className="px-6 py-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
              {job.coverLetter || 'No cover letter generated yet. Click "Generate" to create one.'}
            </pre>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex flex-wrap gap-2">
          <Button onClick={handleCopy} className="flex-1 min-w-[140px] gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied to clipboard' : 'Copy letter'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`mailto:?subject=Application: ${encodeURIComponent(job.title)} at ${encodeURIComponent(job.company)}&body=${encodeURIComponent(job.coverLetter || '')}`)}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(job.applyUrl || job.url, '_blank', 'noopener')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
