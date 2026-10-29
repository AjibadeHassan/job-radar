'use client'

import { useState } from 'react'
import { Navbar } from '@/components/gigforme/navbar'
import { Hero } from '@/components/gigforme/hero'
import { Dashboard } from '@/components/gigforme/dashboard'
import { SourcesRegistry } from '@/components/gigforme/sources-registry'
import { Footer } from '@/components/gigforme/footer'
import { OnboardingWizard } from '@/components/gigforme/onboarding-wizard'
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
