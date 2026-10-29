// Mock data for GigForMe sandbox preview.
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

// ─── Jobs feed (mock matches spanning 7 different industries) ───
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
[Your Name]`,
  },
  {
    id: 'job_002',
    title: 'Nurse Practitioner — ICU',
    company: 'Lagos University Teaching Hospital',
    location: 'Lagos, NG',
    workMode: 'ONSITE',
    url: 'https://luth.org.ng/careers/nurse-practitioner-icu',
    postedAt: '2026-10-28T04:22:00Z',
    source: 'MyJobMag',
    sourceKind: 'RSS',
    industries: ['HEALTHCARE'],
    matchScore: 88,
    matchReason: 'Strong fit for critical care specialization. Your advanced practice certification and 5 years ICU experience match the role requirements. Onsite Lagos.',
    redFlags: ['12-hour shift rotation'],
    experienceFit: 'FIT',
    salaryRange: '₦450,000 – ₦650,000 /mo',
    description: 'LUTH is seeking a Nurse Practitioner for our Intensive Care Unit. You will provide advanced nursing care to critically ill patients, manage ventilator protocols, and collaborate with the intensivist team. Current APRN license and BLS/ACLS required.',
  },
  {
    id: 'job_003',
    title: 'Senior Accountant — Audit Practice',
    company: 'KPMG Nigeria',
    location: 'Lagos, NG',
    workMode: 'HYBRID',
    url: 'https://kpmg.com/ng/careers/senior-accountant-audit',
    applyUrl: 'https://kpmg.com/ng/careers/senior-accountant-audit/apply',
    postedAt: '2026-10-27T22:18:00Z',
    source: 'Jobberman Nigeria',
    sourceKind: 'RSS',
    industries: ['FINANCE'],
    matchScore: 85,
    matchReason: 'Strong audit background match. Your IFRS experience and ACA qualification align directly. Hybrid Lagos — matches your work preference.',
    redFlags: ['Busy season: 55-hour weeks Jan–Mar'],
    experienceFit: 'FIT',
    salaryRange: '₦550,000 – ₦800,000 /mo',
    description: 'KPMG Nigeria is hiring a Senior Accountant for our Audit practice. You will lead audit engagements for mid-cap financial services clients, manage field teams, and own client deliverables under IFRS. ACA/ACCA qualification and 5+ years audit experience required.',
    coverLetter: `Dear KPMG Nigeria Hiring Team,

I am writing to express my interest in the Senior Accountant position within your Audit practice. With over seven years of experience in financial reporting and assurance — most recently managing the audit workstream for a portfolio of mid-cap financial services clients — I see strong alignment between my background and KPMG's standards of audit quality and client service.

In my current role I lead a team of four analysts delivering year-end audit engagements under IFRS for clients in the banking and insurance sectors. I have hands-on experience with the full audit lifecycle: planning, risk assessment, substantive testing, and partner-level review. My work has consistently improved engagement efficiency — most recently reducing review-cycle time by 22% through process automation and tighter documentation controls.

I hold an ACA qualification from ICAN and am currently completing my ACCA certification. I am comfortable working with international audit frameworks and have supported two cross-border engagements involving US GAAP reconciliations.

I would welcome the opportunity to discuss how my experience can contribute to KPMG's audit practice. Thank you for your consideration.

Warm regards,
[Your Name]`,
  },
  {
    id: 'job_004',
    title: 'Mathematics Teacher (Senior School)',
    company: 'British Council School Lagos',
    location: 'Lagos, NG',
    workMode: 'ONSITE',
    url: 'https://britishcouncilschool.ng/careers/math-teacher-senior',
    postedAt: '2026-10-27T19:05:00Z',
    source: 'Tes.com',
    sourceKind: 'RSS',
    industries: ['EDUCATION'],
    matchScore: 80,
    matchReason: 'Teaching certification and prior IGCSE experience match well. Strong subject mastery demonstrated. Onsite Lagos — matches your location.',
    redFlags: [],
    experienceFit: 'FIT',
    salaryRange: '₦400,000 – ₦600,000 /mo',
    description: 'British Council School is hiring a Senior School Mathematics Teacher to deliver IGCSE and A-Level Mathematics. You will plan and deliver lessons aligned to the Cambridge curriculum, assess student progress, and contribute to departmental development. PGDE and 3+ years teaching experience required.',
  },
  {
    id: 'job_005',
    title: 'Brand Designer',
    company: 'Andela',
    location: 'Remote (Africa)',
    workMode: 'REMOTE',
    url: 'https://andela.com/careers/brand-designer',
    postedAt: '2026-10-27T15:42:00Z',
    source: 'Behance jobs',
    sourceKind: 'JSON',
    industries: ['CREATIVE'],
    matchScore: 76,
    matchReason: 'Brand systems experience matches. Your portfolio shows strength in identity work and design tokens. Remote — matches your work preference.',
    redFlags: [],
    experienceFit: 'FIT',
    salaryRange: '$3,000 – $5,000 /mo',
    description: 'Andela is looking for a Brand Designer to evolve our visual identity across talent, partner, and customer touchpoints. You will own design tokens, partner with marketing on campaign work, and produce brand guidelines. Strong portfolio in identity systems and 4+ years experience required.',
  },
  {
    id: 'job_006',
    title: 'Solutions Engineer (EMEA)',
    company: 'Stripe',
    location: 'Remote (EMEA)',
    workMode: 'REMOTE',
    url: 'https://stripe.com/jobs/listing/solutions-engineer-emea',
    postedAt: '2026-10-27T11:08:00Z',
    source: 'Adzuna',
    sourceKind: 'API',
    industries: ['TECH', 'SALES'],
    matchScore: 78,
    matchReason: 'Stripe Solutions Engineer = code + customer-facing work. Matches your stack and your side-project experience with payments integrations.',
    redFlags: ['Quarterly travel within EMEA region'],
    experienceFit: 'FIT',
    salaryRange: '$6,000 – $9,000 /mo',
    description: 'Stripe is hiring a Solutions Engineer for our EMEA team. You will partner with sales to architect Stripe integrations for our largest merchants, write reference code, and feed customer insights back to product.',
  },
  {
    id: 'job_007',
    title: 'Corporate Paralegal',
    company: 'AELEX Legal',
    location: 'Lagos, NG',
    workMode: 'ONSITE',
    url: 'https://aelex.com/careers/corporate-paralegal',
    postedAt: '2026-10-26T14:55:00Z',
    source: 'Jobberman Nigeria',
    sourceKind: 'RSS',
    industries: ['LEGAL'],
    matchScore: 74,
    matchReason: 'Corporate law exposure and document review experience align. Your BL qualification and prior firm internship match the role profile.',
    redFlags: ['Billable hours target: 1,800/yr'],
    experienceFit: 'FIT',
    salaryRange: '₦350,000 – ₦500,000 /mo',
    description: 'AELEX is hiring a Corporate Paralegal to support our M&A and corporate finance practice. You will draft transaction documents, manage due diligence workstreams, and coordinate with regulatory counsel. BL qualification and 2+ years experience required.',
  },
  {
    id: 'job_008',
    title: 'Program Manager — Sustainable Development',
    company: 'UNDP Nigeria',
    location: 'Abuja, NG',
    workMode: 'HYBRID',
    url: 'https://undp.org/nigeria/careers/program-manager',
    postedAt: '2026-10-26T08:30:00Z',
    source: 'idealist.org',
    sourceKind: 'RSS',
    industries: ['OPERATIONS'],
    matchScore: 72,
    matchReason: 'Program management experience and stakeholder work match. Your background in cross-functional coordination aligns well with UNDP project structure.',
    redFlags: ['Quarterly travel to field offices required'],
    experienceFit: 'FIT',
    salaryRange: '$4,000 – $6,000 /mo',
    description: 'UNDP Nigeria is seeking a Program Manager to lead our sustainable development portfolio in the Northeast region. You will manage a multi-disciplinary team, coordinate with government and NGO partners, and oversee $4M in active program funding. PMP and 5+ years experience required.',
  },
]

// ─── Source registry ───
export interface SourceEntry {
  name: string
  slug: string
  kind: SourceKind
  regions: string[]
  industries: Industry[]
  healthScore: number
  enabled: boolean
  tier: 'A' | 'B' | 'C' | 'D' | 'E'
  ratePerMin?: number
}

export const SOURCES: SourceEntry[] = [
  // Tier A — Pan-African (primary)
  { name: 'Jobberman Nigeria', slug: 'jobberman-ng', kind: 'RSS', regions: ['NG'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.94, enabled: true, tier: 'A' },
  { name: 'MyJobMag', slug: 'myjobmag', kind: 'RSS', regions: ['NG'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.91, enabled: true, tier: 'A' },
  { name: 'BrighterMonday', slug: 'brightermonday', kind: 'RSS', regions: ['KE','UG','TZ'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.93, enabled: true, tier: 'A' },
  { name: 'Careers24', slug: 'careers24', kind: 'API', regions: ['ZA'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.89, enabled: true, tier: 'A', ratePerMin: 30 },
  { name: 'JobWebGhana', slug: 'jobwebghana', kind: 'RSS', regions: ['GH'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','OPERATIONS'], healthScore: 0.78, enabled: true, tier: 'A' },

  // Tier A — Generalist aggregators
  { name: 'Adzuna', slug: 'adzuna', kind: 'API', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.96, enabled: true, tier: 'A', ratePerMin: 15 },
  { name: 'Jooble', slug: 'jooble', kind: 'API', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.92, enabled: true, tier: 'A', ratePerMin: 60 },
  { name: 'USAJobs', slug: 'usajobs', kind: 'API', regions: ['US'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','LEGAL','OPERATIONS'], healthScore: 0.99, enabled: true, tier: 'A', ratePerMin: 60 },
  { name: 'Reed.co.uk', slug: 'reed', kind: 'API', regions: ['UK'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.95, enabled: true, tier: 'A' },
  { name: 'The Muse', slug: 'muse', kind: 'API', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.93, enabled: true, tier: 'A' },

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

  // Tier B — Email ingestion
  { name: 'LinkedIn (via email alerts)', slug: 'linkedin-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.99, enabled: true, tier: 'B' },
  { name: 'Indeed (via email alerts)', slug: 'indeed-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.99, enabled: true, tier: 'B' },
  { name: 'Glassdoor (via email alerts)', slug: 'glassdoor-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.97, enabled: true, tier: 'B' },
  { name: 'Otta (via email alerts)', slug: 'otta-email', kind: 'EMAIL', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.95, enabled: true, tier: 'B' },
  { name: 'Bayt (via email alerts)', slug: 'bayt-email', kind: 'EMAIL', regions: ['MENA'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.93, enabled: true, tier: 'B' },

  // Tier C — Per-user authenticated sessions
  { name: 'LinkedIn (your account)', slug: 'linkedin-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.91, enabled: true, tier: 'C' },
  { name: 'Indeed (your account)', slug: 'indeed-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.90, enabled: true, tier: 'C' },
  { name: 'Glassdoor (your account)', slug: 'glassdoor-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH','HEALTHCARE','FINANCE','EDUCATION','CREATIVE','SALES','LEGAL','OPERATIONS'], healthScore: 0.88, enabled: true, tier: 'C' },
  { name: 'Otta (your account)', slug: 'otta-session', kind: 'SESSION', regions: ['GLOBAL'], industries: ['TECH'], healthScore: 0.87, enabled: true, tier: 'C' },
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

// ─── User profile mock (cross-industry professional) ───
export const MOCK_PROFILE = {
  seniority: 'SENIOR',
  primaryStack: ['Analysis', 'Strategy', 'Communication', 'Project Management', 'Reporting', 'Stakeholder Management'],
  domains: ['professional services', 'operations'],
  workModes: ['REMOTE', 'HYBRID', 'ONSITE'],
  timezone: 'Africa/Lagos',
  salaryMin: 4000,
  salaryCurrency: 'USD',
  redFlags: ['No commission-only roles'],
  greenFlags: ['Cross-functional teams', 'Learning budget'],
  expertiseTags: [
    { industry: 'TECH', function: 'Frontend Engineering', seniority: 'Senior' },
    { industry: 'FINANCE', function: 'Audit', seniority: 'Senior' },
    { industry: 'HEALTHCARE', function: 'Health Informatics', seniority: 'Senior' },
    { industry: 'OPERATIONS', function: 'Program Management', seniority: 'Senior' },
  ],
}
