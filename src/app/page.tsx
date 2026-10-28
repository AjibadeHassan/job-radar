'use client'

import { useState } from 'react'
import { Navbar } from '@/components/job-radar/navbar'
import { Hero } from '@/components/job-radar/hero'
import { Dashboard } from '@/components/job-radar/dashboard'
import { SourcesRegistry } from '@/components/job-radar/sources-registry'
import { Architecture } from '@/components/job-radar/architecture'
import { Footer } from '@/components/job-radar/footer'
import { OnboardingWizard } from '@/components/job-radar/onboarding-wizard'
import { toast } from 'sonner'

export default function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  const scrollTo = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleGetStarted = () => setOnboardingOpen(true)

  const handleOnboardingComplete = () => {
    setOnboardingOpen(false)
    toast.success('Onboarding complete — first scan starting now', {
      description: 'Expect a Telegram ping within minutes for high-score matches.',
    })
    setTimeout(() => scrollTo('dashboard'), 300)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onGetStarted={handleGetStarted} onScrollTo={scrollTo} />

      <main className="flex-1">
        <Hero
          onGetStarted={handleGetStarted}
          onViewDashboard={() => scrollTo('dashboard')}
        />

        <Dashboard />
        <SourcesRegistry />
        <Architecture />
      </main>

      <Footer />

      <OnboardingWizard
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  )
}
