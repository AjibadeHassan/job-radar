'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Rss, Code, Mail, Bot, Ban, Check, Search, Server, Globe2,
  Activity, AlertTriangle, ShieldCheck
} from 'lucide-react'
import { SOURCES, type SourceEntry, type SourceKind } from '@/lib/mock-data'

const TIER_LABELS: Record<SourceEntry['tier'], { label: string; color: string }> = {
  A: { label: 'Tier A · Free aggregators & RSS', color: 'text-emerald-700 dark:text-emerald-400' },
  B: { label: 'Tier B · Email ingestion', color: 'text-amber-700 dark:text-amber-400' },
  C: { label: 'Tier C · Per-user sessions', color: 'text-purple-700 dark:text-purple-400' },
  D: { label: 'Tier D · Tech / remote (legacy)', color: 'text-cyan-700 dark:text-cyan-400' },
  E: { label: 'Tier E · Excluded (with reason)', color: 'text-rose-700 dark:text-rose-400' },
}

const KIND_ICONS: Record<SourceKind, React.ElementType> = {
  RSS: Rss,
  API: Code,
  JSON: Code,
  EMAIL: Mail,
  SESSION: Bot,
}

const KIND_LABELS: Record<SourceKind, string> = {
  RSS: 'RSS feed',
  API: 'JSON API',
  JSON: 'JSON endpoint',
  EMAIL: 'Email parse',
  SESSION: 'Playwright session',
}

export function SourcesRegistry() {
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<SourceEntry['tier'] | 'ALL'>('ALL')
  const [kindFilter, setKindFilter] = useState<SourceKind | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    return SOURCES.filter((s) => {
      if (tierFilter !== 'ALL' && s.tier !== tierFilter) return false
      if (kindFilter !== 'ALL' && s.kind !== kindFilter) return false
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, tierFilter, kindFilter])

  const stats = useMemo(() => {
    const enabled = SOURCES.filter((s) => s.enabled)
    const byTier = (Object.keys(TIER_LABELS) as SourceEntry['tier'][]).map((t) => ({
      tier: t,
      count: enabled.filter((s) => s.tier === t).length,
    }))
    const avgHealth = enabled.reduce((a, s) => a + s.healthScore, 0) / enabled.length
    return { total: SOURCES.length, enabled: enabled.length, byTier, avgHealth }
  }, [])

  return (
    <section id="sources" className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Server className="h-3 w-3 text-primary" />
            <span>40 sources · 35 enabled · 5 excluded by policy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Source registry</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Every source has a measured health score (rolling avg of success rate).
            Auto-paused below 0.5. Email ingestion + per-user Playwright sessions
            replace fragile proxy scraping — zero cost, no ToS violations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Server className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Total sources</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Enabled</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.enabled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground">Avg health</span>
              </div>
              <div className="text-2xl font-bold">{(stats.avgHealth * 100).toFixed(0)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground">Email sources</span>
              </div>
              <div className="text-2xl font-bold">{stats.byTier.find(t => t.tier === 'B')?.count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-xs text-muted-foreground">Session sources</span>
              </div>
              <div className="text-2xl font-bold">{stats.byTier.find(t => t.tier === 'C')?.count}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search sources…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-1">
            {(['ALL', 'A', 'B', 'C', 'D', 'E'] as const).map((t) => (
              <Button
                key={t}
                variant={tierFilter === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTierFilter(t)}
                className="h-9 px-3"
              >
                {t === 'ALL' ? 'All tiers' : `Tier ${t}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Sources grouped by tier */}
        <ScrollArea className="max-h-[600px] scroll-thin pr-4">
          <div className="space-y-6">
            {(Object.keys(TIER_LABELS) as SourceEntry['tier'][])
              .filter((t) => tierFilter === 'ALL' || tierFilter === t)
              .map((tier) => {
                const tierSources = filtered.filter((s) => s.tier === tier)
                if (tierSources.length === 0) return null
                return (
                  <div key={tier} className="space-y-2">
                    <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                      <h3 className={`text-sm font-semibold ${TIER_LABELS[tier].color}`}>
                        {TIER_LABELS[tier].label}
                      </h3>
                      <Badge variant="outline" className="text-xs">{tierSources.length}</Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2">
                      {tierSources.map((source) => {
                        const Icon = KIND_ICONS[source.kind]
                        return (
                          <Card
                            key={source.slug}
                            className={`transition-colors ${
                              source.enabled
                                ? 'hover:border-primary/30'
                                : 'opacity-60 border-dashed'
                            }`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-start gap-2 min-w-0">
                                  <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center ${
                                    source.enabled
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    <Icon className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium truncate">{source.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{KIND_LABELS[source.kind]}</div>
                                  </div>
                                </div>
                                {source.enabled ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <Ban className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Globe2 className="h-2.5 w-2.5" />
                                  <span>{source.regions.join(', ')}</span>
                                </div>
                                {source.ratePerMin && (
                                  <span className="font-mono text-muted-foreground">{source.ratePerMin}/min</span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-0.5 mt-1.5">
                                {source.industries.slice(0, 4).map((i) => (
                                  <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                                    {i.slice(0, 4)}
                                  </span>
                                ))}
                                {source.industries.length > 4 && (
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                                    +{source.industries.length - 4}
                                  </span>
                                )}
                              </div>

                              {source.enabled && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        source.healthScore >= 0.9 ? 'bg-emerald-500'
                                        : source.healthScore >= 0.7 ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${source.healthScore * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {(source.healthScore * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )}

                              {!source.enabled && source.notes && (
                                <div className="mt-2 flex items-start gap-1 text-[10px] text-rose-600 dark:text-rose-400">
                                  <AlertTriangle className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                                  <span>{source.notes}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        </ScrollArea>

        {/* Trust footer */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5 flex flex-wrap items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <div className="font-medium">Zero-cost, ToS-compliant by design</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We never scrape LinkedIn directly. We never buy residential proxies.
                Account-required platforms are accessed via per-user authenticated Playwright sessions —
                the request IS the user. Email alerts from LinkedIn, Indeed, Glassdoor, Otta are forwarded
                by users to their unique inbox at <code className="font-mono text-foreground">user-{'{token}'}@radar.{'{your-domain}'}</code>{' '}
                and parsed by Cloudflare Email Routing + Workers. $0/month cost.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
