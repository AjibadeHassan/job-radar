'use client'

import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { Logo } from './logo'

interface NavbarProps {
  onGetStarted: () => void
  onScrollTo: (id: string) => void
}

export function Navbar({ onGetStarted, onScrollTo }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // Mark mounted after hydration to avoid theme mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'sources', label: 'Sources' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl h-14 flex items-center justify-between">
        <button
          onClick={() => onScrollTo('top')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo size={28} animated />
          <span className="font-semibold tracking-tight">GigForMe</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onScrollTo(item.id)}
              className="text-sm"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>
          )}

          <Button size="sm" onClick={onGetStarted} className="hidden sm:inline-flex h-8">
            Get started
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-3 max-w-6xl space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onScrollTo(item.id)
                  setMobileOpen(false)
                }}
                className="w-full justify-start"
              >
                {item.label}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={() => {
                onGetStarted()
                setMobileOpen(false)
              }}
              className="w-full"
            >
              Get started
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
