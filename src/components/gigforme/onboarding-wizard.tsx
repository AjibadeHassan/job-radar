'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Upload, FileText, Check, ChevronRight, ChevronLeft, QrCode,
  Bot, RefreshCw, ShieldCheck, Sparkles, MapPin, Briefcase, Clock, Bell
} from 'lucide-react'
import { INDUSTRY_TAXONOMY, type Industry } from '@/lib/mock-data'

interface OnboardingWizardProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

const STEPS = [
  { id: 1, name: 'Resume', icon: FileText },
  { id: 2, name: 'Expertise', icon: Briefcase },
  { id: 3, name: 'Telegram', icon: Bot },
  { id: 4, name: 'Preferences', icon: Bell },
] as const

export function OnboardingWizard({ open, onClose, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [resumeName, setResumeName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState(false)
  const [parsedData, setParsedData] = useState<{ seniority: string; stack: string[]; domains: string[] } | null>(null)
  const [selectedIndustries, setSelectedIndustries] = useState<Set<Industry>>(new Set(['TECH', 'FINANCE']))
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(['Frontend Engineering', 'Full-Stack Engineering'])
  const [seniority, setSeniority] = useState('Senior')
  const [tgConnected, setTgConnected] = useState(false)
  const [cadence, setCadence] = useState(6)
  const [minScore, setMinScore] = useState(60)
  const [maxNotifs, setMaxNotifs] = useState(5)
  const [windowStart, setWindowStart] = useState('08:00')
  const [windowEnd, setWindowEnd] = useState('21:00')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeName(file.name)
    setResumeUploaded(true)
    setParsing(true)
    setParsed(false)
    // Simulate AI resume parse
    setTimeout(() => {
      setParsing(false)
      setParsed(true)
      setParsedData({
        seniority: 'Senior',
                        stack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Analysis', 'Stakeholder Management'],
        domains: ['fintech', 'developer-tools'],
      })
    }, 1800)
  }

  const reset = () => {
    setStep(1)
    setResumeUploaded(false)
    setResumeName('')
    setParsing(false)
    setParsed(false)
    setParsedData(null)
    setSelectedIndustries(new Set(['TECH', 'FINANCE']))
    setSelectedFunctions(['Frontend Engineering', 'Full-Stack Engineering'])
    setSeniority('Senior')
    setTgConnected(false)
    setCadence(6)
    setMinScore(60)
    setMaxNotifs(5)
  }

  const next = () => setStep((s) => Math.min(4, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const canProceed = () => {
    if (step === 1) return parsed
    if (step === 2) return selectedIndustries.size > 0 && selectedFunctions.length > 0
    if (step === 3) return tgConnected
    return true
  }

  const finish = () => {
    onComplete()
    reset()
  }

  const toggleIndustry = (i: Industry) => {
    setSelectedIndustries((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const toggleFunction = (f: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            Set up your GigForMe
          </DialogTitle>
          <DialogDescription className="text-xs">
            Four steps. Takes about 90 seconds. You can change everything later.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isDone = step > s.id
              return (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.name}
                    </div>
                  </div>
                  {s.id < 4 && <div className={`h-px flex-1 mx-2 ${isDone ? 'bg-emerald-500' : 'bg-border'}`} />}
                </div>
              )
            })}
          </div>
          <Progress value={(step / 4) * 100} className="h-1" />
        </div>

        <ScrollArea className="max-h-[55vh] scroll-thin">
          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              {/* STEP 1 — Resume upload */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-base font-semibold mb-1">Upload your resume</h3>
                    <p className="text-sm text-muted-foreground">
                      PDF or DOCX. We parse it into a structured profile in seconds.
                      You can confirm or edit any field afterward.
                    </p>
                  </div>

                  {!resumeUploaded ? (
                    <label className="block">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFile}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary hover:bg-secondary/30 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <div className="text-sm font-medium mb-1">Drop your resume here</div>
                        <div className="text-xs text-muted-foreground">or click to browse · PDF or DOCX · max 10MB</div>
                      </div>
                    </label>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                        <div className="w-10 h-10 rounded bg-rose-500/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{resumeName}</div>
                          <div className="text-xs text-muted-foreground">
                            {parsing ? 'Parsing your resume…' : parsed ? 'Parsed successfully' : 'Uploaded'}
                          </div>
                        </div>
                        {parsing && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {parsed && <Check className="h-4 w-4 text-emerald-500" />}
                      </div>

                      {parsing && (
                        <div className="space-y-2">
                          <div className="space-y-1.5">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-3 rounded bg-muted animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">Extracting seniority, skills, domains…</div>
                        </div>
                      )}

                      {parsed && parsedData && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            <Check className="h-4 w-4" />
                            Parsed profile — review &amp; edit
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Seniority</div>
                              <Input defaultValue={parsedData.seniority} className="h-8" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Domains</div>
                              <Input defaultValue={parsedData.domains.join(', ')} className="h-8" />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Primary stack</div>
                            <div className="flex flex-wrap gap-1.5">
                              {parsedData.stack.map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2 — Expertise picker */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-base font-semibold mb-1">Pick your expertise</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose industries and functions. Filters which sources we scan and which jobs reach you.
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Seniority target</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Junior', 'Mid', 'Senior', 'Lead', 'Staff', 'Manager'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSeniority(s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            seniority === s
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Industries ({selectedIndustries.size} selected)</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {INDUSTRY_TAXONOMY.map((t) => {
                        const selected = selectedIndustries.has(t.industry)
                        return (
                          <button
                            key={t.industry}
                            onClick={() => toggleIndustry(t.industry)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              selected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                            }`}
                          >
                            {t.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Functions</Label>
                    <div className="border border-border rounded-lg max-h-48 overflow-y-auto scroll-thin">
                      {INDUSTRY_TAXONOMY
                        .filter((t) => selectedIndustries.has(t.industry))
                        .map((t) => (
                          <div key={t.industry} className="border-b border-border last:border-0">
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-secondary/30">{t.label}</div>
                            {t.functions.map((f) => {
                              const selected = selectedFunctions.includes(f.name)
                              return (
                                <button
                                  key={f.name}
                                  onClick={() => toggleFunction(f.name)}
                                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary/30 transition-colors"
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    selected ? 'bg-primary border-primary' : 'border-border'
                                  }`}>
                                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                                  </div>
                                  <span className="text-sm flex-1">{f.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{f.seniorities.join(' · ')}</span>
                                </button>
                              )
                            })}
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Telegram connect */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-base font-semibold mb-1">Connect your Telegram</h3>
                    <p className="text-sm text-muted-foreground">
                      We reuse the bot from your job-scanner repo. Scan the QR with your phone, tap Start, done.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 items-center">
                    <div className="relative">
                      <div className="aspect-square w-full max-w-[220px] mx-auto rounded-xl bg-white p-4 shadow-sm">
                        <QrCodeDisplay />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-xs text-muted-foreground">
                          Or visit{' '}
                          <code className="text-xs px-1 py-0.5 rounded bg-muted font-mono">
                            t.me/GigForMeBot?start=t7K2x9
                          </code>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {!tgConnected ? (
                        <>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-xs flex items-center justify-center font-medium">1</span>
                              <span>Open Telegram on your phone</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-xs flex items-center justify-center font-medium">2</span>
                              <span>Scan this QR code</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-xs flex items-center justify-center font-medium">3</span>
                              <span>Tap <span className="font-medium">Start</span> in the chat</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-xs flex items-center justify-center font-medium">4</span>
                              <span>Wait for the green confirmation here</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => setTgConnected(true)}
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Simulate connect (demo)
                          </Button>
                          <p className="text-[10px] text-muted-foreground text-center">
                            In production, this polls <code className="font-mono">/api/onboarding/telegram-status</code> every 2s
                          </p>
                        </>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            <ShieldCheck className="h-4 w-4" />
                            Telegram connected
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Bot className="h-3 w-3" />
                              <span>Chat ID: <code className="font-mono">784129456</code></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bell className="h-3 w-3" />
                              <span>Verified at <code className="font-mono">{new Date().toLocaleTimeString()}</code></span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Preferences */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-base font-semibold mb-1">Tune your preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      All of this is editable later from Settings. Sensible defaults are pre-set.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Scan cadence</Label>
                        <span className="text-xs text-muted-foreground font-mono">every {cadence}h</span>
                      </div>
                      <Slider
                        value={[cadence]}
                        onValueChange={(v) => setCadence(v[0])}
                        min={1}
                        max={24}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>1h (aggressive)</span>
                        <span>24h (relaxed)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Minimum match score</Label>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{minScore}/100</span>
                      </div>
                      <Slider
                        value={[minScore]}
                        onValueChange={(v) => setMinScore(v[0])}
                        min={40}
                        max={90}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>40 (broad)</span>
                        <span>90 (strict)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Max notifications per day</Label>
                        <span className="text-xs font-mono">{maxNotifs}</span>
                      </div>
                      <Slider
                        value={[maxNotifs]}
                        onValueChange={(v) => setMaxNotifs(v[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Notify from
                        </Label>
                        <Input
                          type="time"
                          value={windowStart}
                          onChange={(e) => setWindowStart(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Until
                        </Label>
                        <Input
                          type="time"
                          value={windowEnd}
                          onChange={(e) => setWindowEnd(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">Timezone</span>
                        </div>
                        <span className="text-xs font-mono">Africa/Lagos</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Notification window respects your local time. We won&apos;t ping at 3am.
                      </div>
                    </div>

                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-medium mb-0.5">You&apos;re all set</div>
                        <div className="text-muted-foreground">
                          First scan runs immediately after onboarding. Expect a Telegram ping within minutes.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer with navigation */}
        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={prev} disabled={step === 1} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-xs text-muted-foreground font-mono">Step {step} of 4</div>
          {step < 4 ? (
            <Button size="sm" onClick={next} disabled={!canProceed()} className="gap-1">
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={finish} className="gap-1">
              <Check className="h-4 w-4" />
              Finish setup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function QrCodeDisplay() {
  // Stylized QR-like grid (decorative)
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21
    const y = Math.floor(i / 21)
    // Position detection patterns at corners
    const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    const cornerBorder = corner && ((x === 0 || x === 6 || y === 0 || y === 6) || (x > 13 && (x === 14 || x === 20)) || (y > 13 && (y === 14 || y === 20)))
    const cornerCenter = corner && ((x >= 2 && x <= 4 && y >= 2 && y <= 4) || (x >= 16 && x <= 18 && y >= 2 && y <= 4) || (x >= 2 && x <= 4 && y >= 16 && y <= 18))
    if (cornerBorder || cornerCenter) return true
    // Pseudo-random pattern
    return (x * 7 + y * 13) % 3 === 0 && !corner
  })

  return (
    <div className="grid grid-cols-21 gap-px w-full h-full" style={{ gridTemplateColumns: 'repeat(21, 1fr)' }}>
      {cells.map((on, i) => (
        <div key={i} className={on ? 'bg-black' : 'bg-white'} />
      ))}
    </div>
  )
}
