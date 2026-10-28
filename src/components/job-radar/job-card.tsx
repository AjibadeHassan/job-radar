'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Building2, MapPin, Clock, ExternalLink, Mail, Copy, Check,
  AlertTriangle, Sparkles, Calendar
} from 'lucide-react'
import { useState } from 'react'
import type { MockJob } from '@/lib/mock-data'

interface JobCardProps {
  job: MockJob
  onShowCoverLetter: (job: MockJob) => void
  onMarkApplied?: (jobId: string) => void
  onMarkIgnored?: (jobId: string) => void
  applied?: boolean
}

export function JobCard({ job, onShowCoverLetter, onMarkApplied, onMarkIgnored, applied }: JobCardProps) {
  const [copied, setCopied] = useState(false)
  const [ignored, setIgnored] = useState(false)

  const scoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
    if (score >= 60) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
    return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
  }

  const fitColor = (fit: string) => {
    if (fit === 'FIT') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    if (fit === 'OVERQUALIFIED') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    return 'bg-muted text-muted-foreground'
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diffH = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
    if (diffH < 1) return 'just now'
    if (diffH < 24) return `${diffH}h ago`
    return `${Math.floor(diffH / 24)}d ago`
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (ignored) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:border-primary/30 transition-colors">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className={`text-xs ${scoreColor(job.matchScore)}`}>
                {job.matchScore}/100
              </Badge>
              <Badge variant="secondary" className={`text-xs ${fitColor(job.experienceFit)}`}>
                {job.experienceFit.toLowerCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">{job.source}</Badge>
              <Badge variant="secondary" className="text-xs">{job.sourceKind}</Badge>
              {job.workMode && (
                <Badge variant="outline" className="text-xs">{job.workMode}</Badge>
              )}
            </div>
            {job.redFlags.length > 0 && (
              <div className="flex gap-1.5">
                {job.redFlags.map((flag, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/5 gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {flag.length > 30 ? flag.slice(0, 30) + '…' : flag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold mb-1 leading-tight">{job.title}</h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(job.postedAt)}
            </span>
            {job.salaryRange && (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                {job.salaryRange}
              </span>
            )}
          </div>

          <div className="flex items-start gap-2 mb-3 p-2.5 rounded-md bg-primary/5 border border-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs leading-relaxed">{job.matchReason}</p>
          </div>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{job.description}</p>

          <Separator className="mb-3" />

          <div className="flex flex-wrap gap-1.5">
            {applied ? (
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 gap-1">
                <Check className="h-3 w-3" />
                Applied
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  window.open(job.applyUrl || job.url, '_blank', 'noopener')
                  onMarkApplied?.(job.id)
                }}
                className="gap-1.5 h-8"
              >
                Apply
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}

            {job.coverLetter && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShowCoverLetter(job)}
                className="gap-1.5 h-8"
              >
                <Mail className="h-3 w-3" />
                Cover Letter
              </Button>
            )}

            {job.coverLetter && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(job.coverLetter!)}
                className="gap-1.5 h-8"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}

            {!applied && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIgnored(true)
                  onMarkIgnored?.(job.id)
                }}
                className="h-8 text-muted-foreground hover:text-foreground"
              >
                Ignore
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(job.url, '_blank', 'noopener')}
              className="ml-auto h-8 text-muted-foreground hover:text-foreground"
            >
              View on {job.source.split(' ')[0]}
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
