// Mock data for Job Radar sandbox preview.
// In production these come from Prisma + real scrapers + Gemini.

export type Industry = 'TECH' | 'HEALTHCARE' | 'FINANCE' | 'EDUCATION' | 'CREATIVE' | 'SALES' | 'LEGAL' | 'OPERATIONS'
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE'
export type SourceKind = 'RSS' | 'API' | 'JSON' | 'EMAIL' | 'SESSION'

export interface MockJob {
  id: string
  title: string
  company: string
  location: string
  workMode: WorkMode
  url: string
  applyUrl?: string
  postedAt: string
  source: string
  sourceKind: SourceKind
  industries: Industry[]
  matchScore: number
  matchReason: string
  redFlags: string[]
  experienceFit: 'UNDERQUALIFIED' | 'FIT' | 'OVERQUALIFIED'
  salaryRange?: string
  description: string
  coverLetter?: string
}

// ─── Jobs feed (mock matches for a Senior Software Engineer profile) ───
export const MOCK_JOBS: MockJob[] = [
  {
    id: 'job_001',
    title: 'Senior Frontend Engineer',
    company: 'Flutterwave',
    location: 'Lagos, NG',
    workMode: 'HYBRID',
    url: 'https://flutterwave.com/careers/senior-frontend-engineer',
    applyUrl: 'https://flutterwave.com/careers/senior-frontend-engineer/apply',
    postedAt: '2026-10-28T06:14:00Z',
    source: 'Jobberman Nigeria',
    sourceKind: 'RSS',
    industries: ['TECH', 'FINANCE'],
    matchScore: 92,
    matchReason: 'Strong fit: matches React+TypeScript stack and fintech domain. 4+ years required, you have 6. Hybrid Lagos — your timezone.',
    redFlags: [],
    experienceFit: 'FIT',
    salaryRange: '₦650,000 – ₦950,000 /mo',
    description: 'Join the team building payments infrastructure for Africa. You will own the merchant dashboard React app, drive performance work, and partner with design on the next generation of money movement UIs. Strong TypeScript, React 19, and Next.js 16 experience required.',
    coverLetter: `Dear Flutterwave Hiring Team,

I am writing to apply for the Senior Frontend Engineer position. As an engineer with six years of experience building production React applications — most recently on a merchant-facing payments dashboard processing $4M/month — I see direct alignment between my background and the work your team is doing to expand financial access across Africa.

In my current role I led the migration of a legacy Redux codebase to React Server Components on Next.js 16, cutting our largest page bundle by 63% and improving First Contentful Paint by 1.4 seconds. I am comfortable owning performance budgets, instrumenting with Sentry + Web Vitals, and pairing with design on a token-driven component system.

I would welcome the chance to discuss how my experience can accelerate your merchant dashboard work. Thank you for your consideration.

Warm regards,
Hassan`,
  },
  {
    id: 'job_002',
    title: 'Backend Engineer (Node.js)',
    company: 'Paystack',
    location: 'Lagos, NG (Remote)',
    workMode: 'REMOTE',
    url: 'https://paystack.com/careers/backend-engineer',
    applyUrl: 'https://paystack.com/careers/backend-engineer/apply',
    postedAt: '2026-10-28T04:22:00Z',
    source: 'Jobberman Nigeria',
    sourceKind: 'RSS',
    industries: ['TECH', 'FINANCE'],
    matchScore: 88,
    matchReason: 'Backend Node.js + Postgres match. Paystack uses a stack similar to yours. Remote-friendly in your timezone.',
    redFlags: ['On-call rotation: 1 week / 6 weeks'],
    experienceFit: 'FIT',
    salaryRange: '₦700,000 – ₦1,100,000 /mo',
    description: 'Paystack is hiring a Backend Engineer to build the next generation of payment APIs serving millions of merchants across Africa. You will work with Node.js, PostgreSQL, and Go, building services that process tens of thousands of transactions per minute.',
  },
  {
    id: 'job_003',
    title: 'Full-Stack Engineer',
    company: 'Andela',
    location: 'Remote (Africa)',
    workMode: 'REMOTE',
    url: 'https://andela.com/careers/full-stack-engineer',
    postedAt: '2026-10-27T22:18:00Z',
    source: 'Remotive',
    sourceKind: 'JSON',
    industries: ['TECH'],
    matchScore: 81,
    matchReason: 'Full-stack TypeScript role. Andela serves distributed teams across Africa — matches your remote-first preference.',
    redFlags: [],
    experienceFit: 'FIT',
    salaryRange: '$3,000 – $5,000 /mo',
    description: 'Andela is looking for a Full-Stack Engineer to build internal tools for our talent cloud platform. You will work across the stack: Next.js on the frontend, NestJS on the backend, and Prisma + Postgres for data.',
  },
  {
    id: 'job_004',
    title: 'Senior Product Designer',
    company: 'Kuda Bank',
    location: 'Lagos, NG',
    workMode: 'HYBRID',
    url: 'https://kuda.com/careers/senior-product-designer',
    postedAt: '2026-10-27T19:05:00Z',
    source: 'MyJobMag',
    sourceKind: 'RSS',
    industries: ['CREATIVE', 'FINANCE'],
    matchScore: 67,
    matchReason: 'Adjacent to your profile — design + fintech. Could be a stretch role if you want to pivot toward design leadership.',
    redFlags: ['No engineering responsibilities — pure design role'],
    experienceFit: 'UNDERQUALIFIED',
    salaryRange: '₦550,000 – ₦800,000 /mo',
    description: 'Kuda is hiring a Senior Product Designer to own the design of our savings and lending flows. You will work closely with PM and engineering to ship beautiful, accessible, mobile-first banking experiences.',
  },
  {
    id: 'job_005',
    title: 'DevOps Engineer',
    company: 'Yellow Card',
    location: 'Remote (Africa)',
    workMode: 'REMOTE',
    url: 'https://yellowcard.io/careers/devops-engineer',
    postedAt: '2026-10-27T15:42:00Z',
    source: 'Remotive',
    sourceKind: 'JSON',
    industries: ['TECH', 'FINANCE'],
    matchScore: 58,
    matchReason: 'DevOps with Kubernetes, Terraform, AWS. Some stack overlap (Docker, CI/CD) but core responsibility is infrastructure, not application code.',
    redFlags: ['Crypto exposure (Yellow Card is a crypto exchange)'],
    experienceFit: 'UNDERQUALIFIED',
    salaryRange: '$4,000 – $6,500 /mo',
    description: 'Yellow Card is hiring a DevOps Engineer to build and maintain our cloud infrastructure across multiple regions. Strong Kubernetes, Terraform, and observability experience required.',
  },
  {
    id: 'job_006',
    title: 'Engineering Manager',
    company: 'Chipper Cash',
    location: 'Remote (Africa + US)',
    workMode: 'REMOTE',
    url: 'https://chippercash.com/careers/engineering-manager',
    postedAt: '2026-10-26T11:08:00Z',
    source: 'LinkedIn',
    sourceKind: 'SESSION',
    industries: ['TECH', 'FINANCE'],
    matchScore: 73,
    matchReason: 'EM role at a fintech with strong African presence. You have the technical depth; people-management is the question.',
    redFlags: ['4 direct reports', 'Quarterly travel to SF required'],
    experienceFit: 'OVERQUALIFIED',
    salaryRange: '$8,000 – $12,000 /mo',
    description: 'Chipper Cash is looking for an Engineering Manager to lead our cross-border payments team. You will manage 4-6 engineers, partner with PM and design, and own the roadmap for our flagship send-money product.',
  },
  {
    id: 'job_007',
    title: 'Senior Data Analyst',
    company: 'Jumia',
    location: 'Lagos, NG',
    workMode: 'ONSITE',
    url: 'https://jumia.com/careers/senior-data-analyst',
    postedAt: '2026-10-26T08:30:00Z',
    source: 'BrighterMonday',
    sourceKind: 'RSS',
    industries: ['TECH', 'OPERATIONS'],
    matchScore: 44,
    matchReason: 'SQL + analytics role. Strong adjacent fit on data thinking, but primary stack mismatch (analytics vs engineering).',
    redFlags: ['Onsite only — no remote option', 'Weekend on-call during sales events'],
    experienceFit: 'UNDERQUALIFIED',
    salaryRange: '₦450,000 – ₦650,000 /mo',
    description: 'Jumia is hiring a Senior Data Analyst to drive insights for our marketplace team. Strong SQL, Python, and dashboarding experience required. You will work with stakeholders across product, marketing, and operations.',
  },
  {
    id: 'job_008',
    title: 'Solutions Engineer',
    company: 'Stripe',
    location: 'Remote (EMEA)',
    workMode: 'REMOTE',
    url: 'https://stripe.com/jobs/listing/solutions-engineer-emea',
    postedAt: '2026-10-25T14:55:00Z',
    source: 'Adzuna',
    sourceKind: 'API',
    industries: ['TECH', 'FINANCE', 'SALES'],
    matchScore: 76,
    matchReason: 'Stripe Solutions Engineer = code + customer-facing work. Matches your stack and your side-project experience with payments integrations.',
    redFlags: ['50% travel within EMEA region'],
    experienceFit: 'FIT',
    salaryRange: '$6,000 – $9,000 /mo',
    description: 'Stripe is hiring a Solutions Engineer for our EMEA team. You will partner with sales to architect Stripe integrations for our largest merchants, write reference code, and feed customer insights back to product.',
  },
]

// ─── Source registry (full 40-source production list) ───
export interface SourceEntry {
  name: string
  slug: string
  kind: SourceKind
  regions: string[]
  industries: Industry[]
  healthScore: number
  enabled: boolean
  tier: 'A' | 'B' | 'C' | 'D' | 'E'  // A=RSS/API, B=Email, C=Session, D=Legacy tech, E=Excluded
  ratePerMin?: number
}

export const SOURCES: SourceEntry[] = [
  // Tier A — Pan-African (primary)
  { name: 'Jobberman Nigeria', slug: 'jobberman-ng', kind: 'RSS', regions: ['NG'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.94, enabled: true, tier: 'A' },
  { name: 'MyJobMag', slug: 'myjobmag', kind: 'RSS', regions: ['NG'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.91, enabled: true, tier: 'A' },
  { name: 'BrighterMonday', slug: 'brightermonday', kind: 'RSS', regions: ['KE','UG','TZ'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.93, enabled: true, tier: 'A' },
  { name: 'Careers24', slug: 'careers24', kind: 'API', regions: ['ZA'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.89, enabled: true, tier: 'A', ratePerMin: 30 },
  { name: 'JobWebGhana', slug: 'jobwebghana', kind: 'RSS', regions: ['GH'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','OPERATIONS'], healthScore: 0.78, enabled: true, tier: 'A' },

  // Tier A — Generalist aggregators (free APIs / RSS)
  { name: 'Adzuna', slug: 'adzuna', kind: 'API', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.96, enabled: true, tier: 'A', ratePerMin: 15 },
  { name: 'Jooble', slug: 'jooble', kind: 'API', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.92, enabled: true, tier: 'A', ratePerMin: 60 },
  { name: 'USAJobs', slug: 'usajobs', kind: 'API', regions: ['US'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','LEGAL','OPERATIONS'], healthScore: 0.99, enabled: true, tier: 'A', ratePerMin: 60 },
  { name: 'Reed.co.uk', slug: 'reed', kind: 'API', regions: ['UK'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.95, enabled: true, tier: 'A' },
  { name: 'The Muse', slug: 'muse', kind: 'API', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.93, enabled: true, tier: 'A' },
  { name: 'Arbeitsagentur', slug: 'arbeitsagentur', kind: 'API', regions: ['DE'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.94, enabled: true, tier: 'A' },
  { name: 'EURES', slug: 'eures', kind: 'API', regions: ['EU'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.90, enabled: true, tier: 'A' },
  { name: 'dev.to jobs', slug: 'devto-jobs', kind: 'JSON', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.97, enabled: true, tier: 'A' },

  // Tier A — Industry verticals
  { name: 'eFinancialCareers', slug: 'efinancialcareers', kind: 'RSS', regions: ['GLOBAL'], industries: ['FINANCE'], healthScore: 0.88, enabled: true, tier: 'A' },
  { name: 'NHS Jobs', slug: 'nhs-jobs', kind: 'RSS', regions: ['UK'], industries: ['HEALTHCARE'], healthScore: 0.98, enabled: true, tier: 'A' },
  { name: 'Health eCareers', slug: 'health-ecareers', kind: 'RSS', regions: ['US'], industries: ['HEALTHCARE'], healthScore: 0.92, enabled: true, tier: 'A' },
  { name: 'Tes.com', slug: 'tes', kind: 'RSS', regions: ['UK','GLOBAL'], industries: ['EDUCATION'], healthScore: 0.94, enabled: true, tier: 'A' },
  { name: 'HigherEdJobs', slug: 'higheredjobs', kind: 'RSS', regions: ['US'], industries: ['EDUCATION'], healthScore: 0.95, enabled: true, tier: 'A' },
  { name: 'Behance jobs', slug: 'behance', kind: 'JSON', regions: ['GLOBAL'], industries: ['CREATIVE'], healthScore: 0.90, enabled: true, tier: 'A' },
  { name: 'Dribbble jobs', slug: 'dribbble', kind: 'RSS', regions: ['GLOBAL'], industries: ['CREATIVE'], healthScore: 0.87, enabled: true, tier: 'A' },
  { name: 'Law.com', slug: 'lawcom', kind: 'RSS', regions: ['US','UK'], industries: ['LEGAL'], healthScore: 0.85, enabled: true, tier: 'A' },
  { name: 'SalesGravy', slug: 'salesgravy', kind: 'RSS', regions: ['US'], industries: ['SALES'], healthScore: 0.79, enabled: true, tier: 'A' },
  { name: 'MarketingWeek', slug: 'marketingweek', kind: 'RSS', regions: ['UK'], industries: ['SALES'], healthScore: 0.82, enabled: true, tier: 'A' },
  { name: 'idealist.org', slug: 'idealist', kind: 'RSS', regions: ['GLOBAL'], industries: ['OPERATIONS'], healthScore: 0.93, enabled: true, tier: 'A' },
  { name: 'Rigzone', slug: 'rigzone', kind: 'RSS', regions: ['GLOBAL'], industries: ['OPERATIONS'], healthScore: 0.86, enabled: true, tier: 'A' },

  // Tier D — Tech / Remote (legacy pool, demoted to ~10% weight)
  { name: 'RemoteOK', slug: 'remoteok', kind: 'JSON', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.96, enabled: true, tier: 'D' },
  { name: 'Remotive', slug: 'remotive', kind: 'JSON', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.94, enabled: true, tier: 'D' },
  { name: 'WeWorkRemotely', slug: 'wwr', kind: 'RSS', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.97, enabled: true, tier: 'D' },
  { name: 'Hacker News (monthly thread)', slug: 'hn-whoishiring', kind: 'API', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.91, enabled: true, tier: 'D' },
  { name: 'Working Nomads', slug: 'working-nomads', kind: 'RSS', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.85, enabled: true, tier: 'D' },
  { name: 'Europe Remote', slug: 'europe-remote', kind: 'RSS', regions: ['EU'], industries: ['TECH'], healthScore: 0.83, enabled: true, tier: 'D' },

  // Tier B — Email ingestion (via Cloudflare Email Routing)
  { name: 'LinkedIn (via email alerts)', slug: 'linkedin-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.99, enabled: true, tier: 'B' },
  { name: 'Indeed (via email alerts)', slug: 'indeed-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.99, enabled: true, tier: 'B' },
  { name: 'Glassdoor (via email alerts)', slug: 'glassdoor-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.97, enabled: true, tier: 'B' },
  { name: 'Otta (via email alerts)', slug: 'otta-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.95, enabled: true, tier: 'B' },
  { name: 'Bayt (via email alerts)', slug: 'bayt-email', kind: 'EMAIL', regions: ['MENA'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.93, enabled: true, tier: 'B' },

  // Tier C — Per-user authenticated sessions (Playwright)
  { name: 'LinkedIn (per-user session)', slug: 'linkedin-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.91, enabled: true, tier: 'C' },
  { name: 'Indeed (per-user session)', slug: 'indeed-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.90, enabled: true, tier: 'C' },
  { name: 'Glassdoor (per-user session)', slug: 'glassdoor-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.88, enabled: true, tier: 'C' },
  { name: 'Otta (per-user session)', slug: 'otta-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.87, enabled: true, tier: 'C' },

  // Tier E — Excluded (displayed for transparency)
  { name: 'Upwork (excluded — Cloudflare wall)', slug: 'upwork', kind: 'RSS', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0, enabled: false, tier: 'E' },
  { name: 'Freelancer (excluded — Cloudflare wall)', slug: 'freelancer', kind: 'RSS', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0, enabled: false, tier: 'E' },
  { name: 'Wellfound (excluded — login wall)', slug: 'wellfound', kind: 'RSS', regions: ['US'], industries: ['TECH'], healthScore: 0, enabled: false, tier: 'E' },
  { name: 'LinkedIn direct scraping (excluded — ToS)', slug: 'linkedin-scrape', kind: 'RSS', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0, enabled: false, tier: 'E' },
]

// ─── Industry taxonomy (8 industries × functions × seniorities) ───
export const INDUSTRY_TAXONOMY: { industry: Industry; label: string; functions: { name: string; seniorities: string[] }[] }[] = [
  {
    industry: 'TECH',
    label: 'Technology',
    functions: [
      { name: 'Frontend Engineering', seniorities: ['Junior', 'Mid', 'Senior', 'Staff', 'Manager'] },
      { name: 'Backend Engineering', seniorities: ['Junior', 'Mid', 'Senior', 'Staff', 'Manager'] },
      { name: 'Full-Stack Engineering', seniorities: ['Junior', 'Mid', 'Senior', 'Staff'] },
      { name: 'DevOps / SRE', seniorities: ['Mid', 'Senior', 'Staff'] },
      { name: 'Data Engineering', seniorities: ['Mid', 'Senior', 'Staff'] },
      { name: 'ML / AI Engineering', seniorities: ['Mid', 'Senior', 'Staff'] },
    ],
  },
  {
    industry: 'HEALTHCARE',
    label: 'Healthcare',
    functions: [
      { name: 'Nursing', seniorities: ['Junior', 'Mid', 'Senior', 'Charge'] },
      { name: 'Medical Practice', seniorities: ['Resident', 'Attending', 'Chief'] },
      { name: 'Pharmacy', seniorities: ['Junior', 'Senior', 'Lead'] },
      { name: 'Public Health', seniorities: ['Junior', 'Mid', 'Senior', 'Director'] },
      { name: 'Health Informatics', seniorities: ['Mid', 'Senior', 'Lead'] },
    ],
  },
  {
    industry: 'FINANCE',
    label: 'Finance',
    functions: [
      { name: 'Accounting', seniorities: ['Junior', 'Mid', 'Senior', 'Manager', 'Director'] },
      { name: 'Investment Banking', seniorities: ['Analyst', 'Associate', 'VP', 'Director'] },
      { name: 'Audit', seniorities: ['Junior', 'Mid', 'Senior', 'Manager'] },
      { name: 'Risk Management', seniorities: ['Mid', 'Senior', 'Director'] },
      { name: 'Treasury', seniorities: ['Mid', 'Senior', 'Director'] },
    ],
  },
  {
    industry: 'EDUCATION',
    label: 'Education',
    functions: [
      { name: 'Teaching (K-12)', seniorities: ['Junior', 'Mid', 'Senior', 'Lead'] },
      { name: 'Higher Education Faculty', seniorities: ['Assistant', 'Associate', 'Full'] },
      { name: 'Curriculum Design', seniorities: ['Junior', 'Mid', 'Senior'] },
      { name: 'Educational Administration', seniorities: ['Mid', 'Senior', 'Director'] },
      { name: 'EdTech Product', seniorities: ['Junior', 'Mid', 'Senior', 'Lead'] },
    ],
  },
  {
    industry: 'CREATIVE',
    label: 'Creative & Design',
    functions: [
      { name: 'Product Design', seniorities: ['Junior', 'Mid', 'Senior', 'Staff', 'Manager'] },
      { name: 'Graphic Design', seniorities: ['Junior', 'Mid', 'Senior'] },
      { name: 'Brand Design', seniorities: ['Mid', 'Senior', 'Lead'] },
      { name: 'Motion Design', seniorities: ['Junior', 'Mid', 'Senior'] },
      { name: 'UX Research', seniorities: ['Junior', 'Mid', 'Senior', 'Lead'] },
    ],
  },
  {
    industry: 'SALES',
    label: 'Sales & Marketing',
    functions: [
      { name: 'Account Executive', seniorities: ['Junior', 'Mid', 'Senior', 'Enterprise'] },
      { name: 'Sales Engineering', seniorities: ['Junior', 'Mid', 'Senior', 'Staff'] },
      { name: 'Growth Marketing', seniorities: ['Junior', 'Mid', 'Senior', 'Lead'] },
      { name: 'Content Marketing', seniorities: ['Junior', 'Mid', 'Senior'] },
      { name: 'Performance Marketing', seniorities: ['Mid', 'Senior', 'Lead'] },
    ],
  },
  {
    industry: 'LEGAL',
    label: 'Legal',
    functions: [
      { name: 'Corporate Law', seniorities: ['Associate', 'Senior Associate', 'Partner'] },
      { name: 'Litigation', seniorities: ['Associate', 'Senior Associate', 'Partner'] },
      { name: 'In-House Counsel', seniorities: ['Counsel', 'Senior Counsel', 'General Counsel'] },
      { name: 'Compliance', seniorities: ['Analyst', 'Manager', 'Director'] },
      { name: 'IP Law', seniorities: ['Associate', 'Senior Associate', 'Partner'] },
    ],
  },
  {
    industry: 'OPERATIONS',
    label: 'Operations',
    functions: [
      { name: 'Program Management', seniorities: ['Junior', 'Mid', 'Senior', 'Director'] },
      { name: 'Supply Chain', seniorities: ['Analyst', 'Manager', 'Director'] },
      { name: 'People Operations', seniorities: ['Generalist', 'Manager', 'Director'] },
      { name: 'Project Management', seniorities: ['Junior', 'Mid', 'Senior', 'Lead'] },
      { name: 'Operations Management', seniorities: ['Manager', 'Director', 'VP'] },
    ],
  },
]

// ─── Scan history (last 5 scans) ───
export const SCAN_HISTORY = [
  { id: 'scan_001', startedAt: '2026-10-28T08:00:00Z', finishedAt: '2026-10-28T08:01:23Z', sourcesUsed: ['Jobberman Nigeria','MyJobMag','BrighterMonday','Adzuna','Jooble'], jobsScraped: 312, jobsNew: 47, jobsMatched: 8, aiProvider: 'gemini-1.5-flash' },
  { id: 'scan_002', startedAt: '2026-10-28T02:00:00Z', finishedAt: '2026-10-28T02:01:18Z', sourcesUsed: ['Jobberman Nigeria','Careers24','Adzuna','USAJobs'], jobsScraped: 284, jobsNew: 31, jobsMatched: 5, aiProvider: 'gemini-1.5-flash' },
  { id: 'scan_003', startedAt: '2026-10-27T20:00:00Z', finishedAt: '2026-10-27T20:00:54Z', sourcesUsed: ['MyJobMag','BrighterMonday','Reed','Muse'], jobsScraped: 198, jobsNew: 22, jobsMatched: 4, aiProvider: 'gemini-1.5-flash' },
  { id: 'scan_004', startedAt: '2026-10-27T14:00:00Z', finishedAt: '2026-10-27T14:01:02Z', sourcesUsed: ['Jobberman Nigeria','Adzuna','Jooble'], jobsScraped: 256, jobsNew: 38, jobsMatched: 6, aiProvider: 'gemini-1.5-flash' },
  { id: 'scan_005', startedAt: '2026-10-27T08:00:00Z', finishedAt: '2026-10-27T08:00:47Z', sourcesUsed: ['MyJobMag','BrighterMonday','Careers24','RemoteOK','Remotive'], jobsScraped: 341, jobsNew: 52, jobsMatched: 9, aiProvider: 'gemini-1.5-flash' },
]

// ─── User profile mock (parsed from a hypothetical resume) ───
export const MOCK_PROFILE = {
  seniority: 'SENIOR',
  primaryStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Prisma'],
  domains: ['fintech', 'developer-tools'],
  workModes: ['REMOTE', 'HYBRID'],
  timezone: 'Africa/Lagos',
  salaryMin: 4000,
  salaryCurrency: 'USD',
  redFlags: ['No crypto-only companies'],
  greenFlags: ['4-day week ok', 'Async-friendly'],
  expertiseTags: [
    { industry: 'TECH', function: 'Frontend Engineering', seniority: 'Senior' },
    { industry: 'TECH', function: 'Full-Stack Engineering', seniority: 'Senior' },
    { industry: 'FINANCE', function: 'Audit', seniority: 'Mid' },
  ],
}
