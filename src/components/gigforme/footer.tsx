import { Logo } from './logo'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-semibold">GigForMe</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Opportunities that fit you. GigForMe scans the market and pings your
              Telegram when the right role surfaces — for every profession.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</div>
            <ul className="space-y-1 text-xs">
              <li><a href="#dashboard" className="hover:text-primary">Dashboard</a></li>
              <li><a href="#sources" className="hover:text-primary">Sources</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">For every profession</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Technology</li>
              <li>Healthcare</li>
              <li>Finance</li>
              <li>Education</li>
              <li>Creative & Design</li>
              <li>Legal · Operations · Sales</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How it works</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>1. Upload your resume</li>
              <li>2. Pick your expertise</li>
              <li>3. Connect Telegram</li>
              <li>4. Get matched alerts</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span>GigForMe · {new Date().getFullYear()}</span>
          <span>Made for African professionals</span>
        </div>
      </div>
    </footer>
  )
}
