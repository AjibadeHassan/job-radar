'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  RefreshCw, Search, TrendingUp, Bell, Clock, Filter,
  CheckCircle2, Activity, Zap, Scan
} from 'lucide-react'
import { MOCK_JOBS, SCAN_HISTORY, type MockJob } from '@/lib/mock-data'
import { JobCard } from './job-card'
import { CoverLetterModal } from './cover-letter-modal'

type Filter = 'all' | 'high' | 'mid' | 'low'
type StatusFilter = 'all' | 'new' | 'applied' | 'ignored'

export function Dashboard() {
  const [scanning, setScanning] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedJob, setSelectedJob] = useState<MockJob | null>(null)
  const [coverLetterOpen, setCoverLetterOpen] = useState(false)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set())

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 2500)
  }

  const showCoverLetter = (job: MockJob) => {
    setSelectedJob(job)
    setCoverLetterOpen(true)
  }

  const markApplied = (jobId: string) => {
    setAppliedIds((prev) => new Set(prev).add(jobId))
  }

  const markIgnored = (jobId: string) => {
    setIgnoredIds((prev) => new Set(prev).add(jobId))
  }

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      // Score filter
      if (filter === 'high' && job.matchScore < 80) return false
      if (filter === 'mid' && (job.matchScore < 60 || job.matchScore >= 80)) return false
      if (filter === 'low' && job.matchScore >= 60) return false

      // Status filter
      if (statusFilter === 'applied' && !appliedIds.has(job.id)) return false
      if (statusFilter === 'ignored' && !ignoredIds.has(job.id)) return false
      if (statusFilter === 'new' && (appliedIds.has(job.id) || ignoredIds.has(job.id))) return false
      if (statusFilter === 'all' && ignoredIds.has(job.id)) return false  // Hide ignored in "all"

      return true
    }).sort((a, b) => b.matchScore - a.matchScore)
  }, [filter, statusFilter, appliedIds, ignoredIds])

  const stats = useMemo(() => ({
    total: MOCK_JOBS.length,
    high: MOCK_JOBS.filter((j) => j.matchScore >= 80).length,
    mid: MOCK_JOBS.filter((j) => j.matchScore >= 60 && j.matchScore < 80).length,
    applied: appliedIds.size,
    new: MOCK_JOBS.length - appliedIds.size - ignoredIds.size,
  }), [appliedIds, ignoredIds])

  const lastScan = SCAN_HISTORY[0]

  return (
    <section id="dashboard" className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Activity className="h-3 w-3 text-violet-500 radar-dot" />
              <span>Last scan: {new Date(lastScan.startedAt).toLocaleString()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your job feed</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} matched jobs across {lastScan.sourcesUsed.length} sources · {stats.new} new since last visit
            </p>
          </div>
          <Button onClick={handleScan} disabled={scanning} className="gap-2" size="lg">
            {scanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Scanning 40 sources…
              </>
            ) : (
              <>
                <Scan className="h-4 w-4" />
                Scan now
              </>
            )}
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={Search} label="New jobs" value={stats.new} accent="emerald" />
          <StatCard icon={TrendingUp} label="High match" value={stats.high} accent="emerald" sub="≥80 score" />
          <StatCard icon={Activity} label="Good match" value={stats.mid} accent="amber" sub="60-79 score" />
          <StatCard icon={CheckCircle2} label="Applied" value={stats.applied} accent="emerald" />
          <StatCard icon={Zap} label="Sources" value={lastScan.sourcesUsed.length} accent="primary" sub="this scan" />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {([
            { k: 'all', l: 'All', c: stats.total },
            { k: 'high', l: 'High (80+)', c: stats.high },
            { k: 'mid', l: 'Good (60-79)', c: stats.mid },
            { k: 'low', l: 'Stretch (<60)', c: stats.total - stats.high - stats.mid },
          ] as const).map((f) => (
            <Button
              key={f.k}
              variant={filter === f.k ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.k)}
              className="gap-1.5 h-8"
            >
              {f.l}
              <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 h-4 min-w-[16px] flex items-center justify-center">
                {f.c}
              </Badge>
            </Button>
          ))}

          <div className="w-px h-8 bg-border mx-1" />

          {([
            { k: 'new', l: 'New', c: stats.new },
            { k: 'applied', l: 'Applied', c: stats.applied },
          ] as const).map((f) => (
            <Button
              key={f.k}
              variant={statusFilter === f.k ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(f.k)}
              className="gap-1.5 h-8"
            >
              {f.l}
              <span className="text-xs text-muted-foreground">{f.c}</span>
            </Button>
          ))}
          {statusFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="h-8 text-xs text-muted-foreground"
            >
              Clear status
            </Button>
          )}
        </div>

        {/* Scan activity bar */}
        <Card className="bg-secondary/30 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Clock className="h-3 w-3" />
              <span>Recent scans (last 5)</span>
            </div>
            <div className="flex items-end gap-1.5 h-12">
              {SCAN_HISTORY.slice(0, 5).reverse().map((s) => {
                const max = 60
                const h = Math.min(100, (s.jobsMatched / max) * 100)
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-primary/40 to-primary rounded-sm min-h-[8px] transition-all hover:from-primary hover:to-primary/80"
                      style={{ height: `${Math.max(h, 10)}%` }}
                      title={`${new Date(s.startedAt).toLocaleString()}: ${s.jobsMatched} matched`}
                    />
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Job feed */}
        {scanning ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No jobs match this filter. Try a different combination.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <motion.div
              key={`${filter}-${statusFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onShowCoverLetter={showCoverLetter}
                  onMarkApplied={markApplied}
                  onMarkIgnored={markIgnored}
                  applied={appliedIds.has(job.id)}
                />
              ))}
            </motion.div>
          </div>
        )}

        {/* Sources used in last scan */}
        <Card className="bg-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Activity className="h-3 w-3" />
              <span>Sources queried in last scan</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lastScan.sourcesUsed.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Scraped <span className="font-mono text-foreground">{lastScan.jobsScraped}</span> jobs ·
              {' '}<span className="font-mono text-foreground">{lastScan.jobsNew}</span> new ·
              {' '}<span className="font-mono text-foreground">{lastScan.jobsMatched}</span> matched ·
              {' '}AI: <span className="font-mono text-foreground">{lastScan.aiProvider}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CoverLetterModal
        job={selectedJob}
        open={coverLetterOpen}
        onClose={() => setCoverLetterOpen(false)}
      />
    </section>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: number
  accent: 'emerald' | 'amber' | 'rose' | 'primary'
  sub?: string
}) {
  const colorMap = {
    emerald: 'text-violet-600 dark:text-violet-400',
    amber: 'text-amber-600 dark:text-amber-400',
    rose: 'text-rose-600 dark:text-rose-400',
    primary: 'text-primary',
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <Icon className={`h-4 w-4 ${colorMap[accent]}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  )
}
