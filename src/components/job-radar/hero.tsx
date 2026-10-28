'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Radar, ArrowRight, Sparkles, ShieldCheck, Globe2 } from 'lucide-react'
import { Logo } from './logo'

interface HeroProps {
  onGetStarted: () => void
  onViewDashboard: () => void
}

export function Hero({ onGetStarted, onViewDashboard }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Radar glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 pointer-events-none">
        <div className="relative w-[600px] h-[600px] opacity-30 dark:opacity-40">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute inset-12 rounded-full border border-primary/30" />
          <div className="absolute inset-24 rounded-full border border-primary/20" />
          <div className="absolute inset-36 rounded-full border border-primary/15" />
          <div className="absolute inset-0 radar-sweep">
            <div className="absolute top-1/2 left-1/2 w-1/2 h-px bg-gradient-to-r from-primary to-transparent origin-left" />
            <div className="absolute top-1/2 left-1/2 w-1/2 h-px bg-gradient-to-r from-primary/60 to-transparent origin-left"
              style={{ transform: 'rotate(45deg)' }} />
          </div>
        </div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center gap-3">
              <Logo size={48} animated />
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Job Radar</h2>
                <p className="text-xs text-muted-foreground font-mono">v1.1 — zero-cost revision</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Globe2 className="h-3 w-3" /> Africa-first
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Radar className="h-3 w-3" /> 40 sources
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" /> Zero-cost stack
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" /> Gemini-matched
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Job intelligence for{' '}
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                every profession.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Upload your resume, pick your expertise from 8 industries, connect your Telegram.
              Job Radar scrapes 40 sources, matches with Gemini embeddings, and pings you when
              the right role surfaces — for nurses, accountants, paralegals, designers, anyone.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" onClick={onGetStarted} className="gap-2 h-12 px-6">
                Get started — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={onViewDashboard} className="h-12 px-6">
                View live demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 radar-dot" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Reuses your existing job-scanner Telegram bot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Per-user authenticated sessions — not proxies</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <TelegramMock />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-border"
        >
          {[
            { label: 'Active sources', value: '40', sub: 'RSS · API · Email · Session' },
            { label: 'Industries covered', value: '8', sub: 'Tech · Healthcare · Finance · +5' },
            { label: 'Operating cost', value: '$0', sub: 'Until ~75 active users' },
            { label: 'Match precision', value: '92%', sub: 'Top-tier score threshold' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TelegramMock() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-700/5 border border-primary/20 p-1 backdrop-blur-sm">
        <div className="rounded-xl bg-card p-4 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Logo size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold">Job Radar Bot</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  online
                </div>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">09:42</span>
          </div>

          <div className="rounded-lg bg-secondary/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                🎯 New match (92/100)
              </span>
              <span className="text-[10px] text-muted-foreground">2h ago</span>
            </div>
            <div className="text-sm font-semibold leading-tight">
              Senior Frontend Engineer
            </div>
            <div className="text-xs text-muted-foreground">Flutterwave · Lagos, NG · Hybrid</div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              💡 Strong fit: matches React+TS stack and fintech domain.
              4+ years req&apos;d, you have 6.
            </div>
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              ₦650,000 – ₦950,000 /mo
            </div>
            <div className="flex gap-1.5 pt-1">
              <div className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-medium">View Job</div>
              <div className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-medium">Apply</div>
              <div className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-medium">Cover Letter</div>
            </div>
          </div>

          <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                🎯 New match (88/100)
              </span>
              <span className="text-[10px] text-muted-foreground">2h ago</span>
            </div>
            <div className="text-sm font-semibold leading-tight">Backend Engineer (Node.js)</div>
            <div className="text-xs text-muted-foreground">Paystack · Remote</div>
            <div className="text-[11px] text-rose-500">⚠ On-call rotation: 1 week / 6 weeks</div>
          </div>

          <div className="text-center text-[10px] text-muted-foreground pt-1">
            + 6 more matches queued today
          </div>
        </div>
      </div>

      {/* Floating pulse */}
      <div className="absolute -top-3 -right-3 w-3 h-3 rounded-full bg-emerald-500 radar-dot" />
      <div className="absolute -bottom-3 -left-3 w-2 h-2 rounded-full bg-amber-500" />
    </div>
  )
}
