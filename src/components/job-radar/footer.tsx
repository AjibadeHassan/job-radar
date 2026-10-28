import { Logo } from './logo'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-semibold">Job Radar</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Multi-tenant, multi-industry job intelligence service. Africa-first.
              Generalist. Zero-cost. Successor to the job-scanner repo.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</div>
            <ul className="space-y-1 text-xs">
              <li><a href="#dashboard" className="hover:text-primary">Live dashboard</a></li>
              <li><a href="#sources" className="hover:text-primary">Source registry</a></li>
              <li><a href="#architecture" className="hover:text-primary">Architecture</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stack</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Next.js 16 · TypeScript</li>
              <li>PostgreSQL + pgvector</li>
              <li>Prisma · BullMQ · Redis</li>
              <li>Gemini 1.5 Flash</li>
              <li>Cloudflare R2 · Email Routing</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Repo</div>
            <a
              href="https://github.com/AjibadeHassan/job-radar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:text-primary inline-flex items-center gap-1"
            >
              github.com/AjibadeHassan/job-radar →
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              Reuses the Telegram bot token from the original job-scanner repo.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span>Built for African professionals · v1.1 zero-cost revision · {new Date().getFullYear()}</span>
          <span className="font-mono">$0/mo until ~75 active users</span>
        </div>
      </div>
    </footer>
  )
}
