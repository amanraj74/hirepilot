// Demo seed for local development + submission screenshots.
// Run: pnpm --filter web db:seed
//
// Idempotent — safe to re-run. Wipes only the seeded records.
// Goal: every account has plenty to see — no zero pages anywhere.

// Load .env manually — tsx does not auto-load env files.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const envFile = resolve(process.cwd(), '.env');
try {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[1] !== undefined && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch {
  // .env missing — caller will see a Prisma connection error.
}

import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- Demo accounts -------------------------------------------------------
const DEMO_PASSWORD = 'Demo@12345';
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 12);

// 1 admin
const ADMIN = {
  email: 'admin@hirepilot.dev',
  name: 'Aditya Iyer',
  role: 'ADMIN' as const,
  company: 'hirepilot-demo',
};

// 3 recruiters across 3 companies
const RECRUITER_Riya = {
  email: 'recruiter@hirepilot.dev',
  name: 'Riya Sharma',
  role: 'RECRUITER' as const,
  company: 'hirepilot-demo',
};
const RECRUITER_Rohan = {
  email: 'recruiter@acme.test',
  name: 'Rohan Iyer',
  role: 'RECRUITER' as const,
  company: 'acme-corp',
};
const RECRUITER_Neha = {
  email: 'recruiter@northwind.test',
  name: 'Neha Kapoor',
  role: 'RECRUITER' as const,
  company: 'northwind-tech',
};

// 2 hiring managers
const HM_HirePilot = {
  email: 'hm@hirepilot.dev',
  name: 'Hema Krishnan',
  role: 'HIRING_MANAGER' as const,
  company: 'hirepilot-demo',
};
const HM_Acme = {
  email: 'hm@acme.test',
  name: 'Harsha Mehta',
  role: 'HIRING_MANAGER' as const,
  company: 'acme-corp',
};

// 3 interviewers
const INTERVIEWER_Ishaan = {
  email: 'interviewer@hirepilot.dev',
  name: 'Ishaan Mehta',
  role: 'INTERVIEWER' as const,
  company: 'hirepilot-demo',
};
const INTERVIEWER_PriyaS = {
  email: 'interviewer@acme.test',
  name: 'Priya Sundaram',
  role: 'INTERVIEWER' as const,
  company: 'acme-corp',
};
const INTERVIEWER_Vikram = {
  email: 'interviewer@northwind.test',
  name: 'Vikram Anand',
  role: 'INTERVIEWER' as const,
  company: 'northwind-tech',
};

// 8 candidates with varied backgrounds
const CANDIDATES = [
  {
    email: 'arjun.candidate@test.dev',
    name: 'Arjun Mehta',
    headline: 'Senior full-stack engineer · 6 yrs',
    skills: ['TypeScript', 'Next.js', 'React', 'PostgreSQL', 'Prisma', 'Node.js', 'AWS'],
    years: 6,
  },
  {
    email: 'priya.candidate@test.dev',
    name: 'Priya Subramaniam',
    headline: 'Engineering manager · 9 yrs',
    skills: ['Leadership', 'People management', 'TypeScript', 'Node.js', 'Hiring', 'Mentoring'],
    years: 9,
  },
  {
    email: 'karthik.candidate@test.dev',
    name: 'Karthik Raman',
    headline: 'Backend engineer · 4 yrs',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    years: 4,
  },
  {
    email: 'ananya.candidate@test.dev',
    name: 'Ananya Sharma',
    headline: 'Frontend engineer · 3 yrs',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Storybook', 'Jest'],
    years: 3,
  },
  {
    email: 'rohit.candidate@test.dev',
    name: 'Rohit Verma',
    headline: 'DevOps engineer · 5 yrs',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Go', 'Linux', 'GitOps'],
    years: 5,
  },
  {
    email: 'meera.candidate@test.dev',
    name: 'Meera Iyer',
    headline: 'Data engineer · 4 yrs',
    skills: ['Python', 'Airflow', 'Snowflake', 'dbt', 'SQL', 'BigQuery'],
    years: 4,
  },
  {
    email: 'vikram.candidate@test.dev',
    name: 'Vikram Joshi',
    headline: 'Product designer · 5 yrs',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Framer'],
    years: 5,
  },
  {
    email: 'kavita.candidate@test.dev',
    name: 'Kavita Banerjee',
    headline: 'QA engineer · 3 yrs',
    skills: ['Playwright', 'Cypress', 'TypeScript', 'API Testing', 'JIRA'],
    years: 3,
  },
];

const USERS = [
  ADMIN,
  RECRUITER_Riya,
  RECRUITER_Rohan,
  RECRUITER_Neha,
  HM_HirePilot,
  HM_Acme,
  INTERVIEWER_Ishaan,
  INTERVIEWER_PriyaS,
  INTERVIEWER_Vikram,
  ...CANDIDATES.map((c) => ({
    email: c.email,
    name: c.name,
    role: 'CANDIDATE' as const,
    company: 'hirepilot-demo',
  })),
];

// --- Demo companies -------------------------------------------------------
const COMPANIES = [
  {
    slug: 'hirepilot-demo',
    name: 'HirePilot Demo Inc.',
    website: 'https://hirepilot.dev',
    industry: 'HRTech',
    size: '11-50',
    description:
      'The team behind the AI-powered ATS you are using right now. Hiring engineers to build the next generation of recruiting tools.',
    officeLocations: ['Remote', 'Bengaluru, IN'],
  },
  {
    slug: 'acme-corp',
    name: 'Acme Corp',
    website: 'https://acme.example',
    industry: 'Software',
    size: '201-500',
    description:
      'Acme builds infrastructure tooling for engineering teams. Pragmatic, no-nonsense, ships every Friday.',
    officeLocations: ['Hybrid — Bengaluru, IN', 'Hybrid — Berlin, DE'],
  },
  {
    slug: 'northwind-tech',
    name: 'Northwind Tech',
    website: 'https://northwind.example',
    industry: 'Software',
    size: '51-200',
    description:
      'Northwind Tech is a Series B SaaS company building supply-chain visibility tools for mid-market retailers.',
    officeLocations: ['Remote — Worldwide'],
  },
  {
    slug: 'helios-finance',
    name: 'Helios Finance',
    website: 'https://helios.example',
    industry: 'Fintech',
    size: '51-200',
    description:
      'Helios Finance is a Series B fintech rebuilding cross-border payments infrastructure for emerging markets.',
    officeLocations: ['Hybrid — Mumbai, IN', 'Remote (APAC)'],
  },
  {
    slug: 'verdant-health',
    name: 'Verdant Health',
    website: 'https://verdant.example',
    industry: 'Healthcare',
    size: '11-50',
    description:
      'Verdant Health builds clinician-facing AI tools that surface early-warning signals from EHR data.',
    officeLocations: ['Hybrid — Boston, US', 'Remote (US)'],
  },
];

// --- Demo jobs (30 across the 5 companies) --------------------------------
type JobSeed = {
  companySlug: string;
  postedByEmail: string;
  title: string;
  department: string;
  location: string;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  experienceYears: number;
  skillsRequired: string[];
  description: string;
  requirements: string;
  benefits: string;
  status?: 'OPEN' | 'DRAFT' | 'PAUSED' | 'CLOSED' | 'FILLED';
  postedDaysAgo: number;
};

const JOBS: JobSeed[] = [
  // HirePilot Demo Inc. (5 jobs, posted by Riya)
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE',
    salaryMin: 90_000,
    salaryMax: 130_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['TypeScript', 'Next.js', 'PostgreSQL', 'Prisma', 'React', 'Node.js'],
    description:
      'You will own end-to-end features of the HirePilot product — schema design, API contracts, Next.js App Router pages, and the AI integration layer. We use TypeScript strict mode, Prisma + Postgres, and ship weekly.',
    requirements: [
      '5+ years building production web apps',
      'Strong TypeScript + React fundamentals',
      'Comfort with Postgres + at least one ORM',
      'You have shipped something you can show us',
    ].join('\n'),
    benefits: 'Remote-first, equity, 30 days PTO, $2k learning budget.',
    postedDaysAgo: 7,
  },
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'AI Engineer (NLP / Matching)',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE',
    salaryMin: 130_000,
    salaryMax: 180_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    experienceYears: 5,
    skillsRequired: ['Python', 'NLP', 'Information Retrieval', 'Postgres', 'PyTorch'],
    description:
      'Push the state of the art on resume → job matching. Improve our deterministic scoring pipeline and explore embeddings-based ranking as a second-stage filter.',
    requirements: [
      '5+ years ML/NLP in production',
      'Comfort with both classical IR (BM25, embeddings) and modern transformers',
      'You can defend your choices in writing',
    ].join('\n'),
    benefits: 'Remote-first, equity, conference + paper budget.',
    postedDaysAgo: 14,
  },
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Product Designer',
    department: 'Design',
    location: 'Bengaluru, IN (Hybrid)',
    workMode: 'HYBRID',
    salaryMin: 60_000,
    salaryMax: 85_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    experienceYears: 3,
    skillsRequired: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    description:
      'Own the end-to-end design of recruiter-facing surfaces: Kanban board, candidate detail, dashboards. You will partner with PM and engineers to ship coherent, accessible interfaces.',
    requirements: [
      '3+ years designing complex B2B SaaS',
      'Strong Figma + design-system chops',
      'Portfolio with case studies',
    ].join('\n'),
    benefits: 'Hybrid (3 days/week in office), health insurance, equity.',
    postedDaysAgo: 5,
  },
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Engineering Manager',
    department: 'Engineering',
    location: 'Bengaluru, IN (Hybrid)',
    workMode: 'HYBRID',
    salaryMin: 140_000,
    salaryMax: 190_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    experienceYears: 8,
    skillsRequired: ['Leadership', 'TypeScript', 'Hiring', 'Mentoring', 'Architecture'],
    description:
      'Lead a 6-person engineering team building the candidate dashboard and pipeline. 1:1s, roadmap, hiring, code review.',
    requirements: [
      '8+ years engineering, 2+ managing engineers',
      'You have hired engineers you are proud of',
      'Still enjoy writing code occasionally',
    ].join('\n'),
    benefits: 'Hybrid Bengaluru HQ, equity, leadership coaching budget.',
    postedDaysAgo: 21,
  },
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'QA Engineer (Intern)',
    department: 'Quality',
    location: 'Remote (India)',
    workMode: 'REMOTE',
    salaryMin: 1_500,
    salaryMax: 3_000,
    salaryCurrency: 'USD',
    employmentType: 'INTERN',
    experienceLevel: 'ENTRY',
    experienceYears: 0,
    skillsRequired: ['TypeScript', 'Playwright'],
    description:
      '6-month paid internship. Build out our Playwright suite, learn from senior engineers.',
    requirements: ['CS student or recent graduate', 'Familiar with Git + TypeScript basics'].join(
      '\n',
    ),
    benefits: 'Stipend, mentorship, potential full-time conversion.',
    status: 'CLOSED',
    postedDaysAgo: 60,
  },

  // Acme Corp (6 jobs, posted by Rohan)
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Platform Engineer (Kubernetes)',
    department: 'Infrastructure',
    location: 'Berlin, DE (Hybrid)',
    workMode: 'HYBRID',
    salaryMin: 80_000,
    salaryMax: 110_000,
    salaryCurrency: 'EUR',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 4,
    skillsRequired: ['Kubernetes', 'Go', 'Terraform', 'AWS', 'Linux', 'Postgres'],
    description:
      'Own the platform layer: Kubernetes clusters, Terraform modules, multi-region Postgres, observability. You will be the on-call rotation partner.',
    requirements: [
      '4+ years operating production Kubernetes at scale',
      'Strong Go + Linux fundamentals',
      'Lives in Berlin or willing to relocate',
    ].join('\n'),
    benefits: 'Hybrid, visa sponsorship, equity, conference budget.',
    postedDaysAgo: 10,
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Junior Backend Engineer (New Grad)',
    department: 'Engineering',
    location: 'Remote (EU timezones)',
    workMode: 'REMOTE',
    salaryMin: 45_000,
    salaryMax: 60_000,
    salaryCurrency: 'EUR',
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    experienceYears: 0,
    skillsRequired: ['Python', 'PostgreSQL', 'REST APIs', 'Git'],
    description:
      'New-grad program: you will pair with senior engineers on the Acme CLI, the GitHub integration, and internal admin tools. Mentorship-driven growth path.',
    requirements: [
      'Recent CS graduate or equivalent self-taught experience',
      'Solid grasp of HTTP, REST, SQL',
      'Comfortable with Linux + Git',
    ].join('\n'),
    benefits: 'Remote-first within EU, structured mentorship, 30 days PTO.',
    postedDaysAgo: 3,
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Engineering Manager — Tooling',
    department: 'Engineering',
    location: 'Bengaluru, IN (Onsite)',
    workMode: 'ONSITE',
    salaryMin: 110_000,
    salaryMax: 150_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    experienceYears: 7,
    skillsRequired: ['Leadership', 'Hiring', 'TypeScript', 'Go', 'Mentoring'],
    description:
      'Lead the 6-person Tooling team: 1:1s, roadmap, hiring, code review. You will spend ~40% of your time coding alongside the team.',
    requirements: [
      '7+ years engineering, 2+ managing engineers',
      'You have hired engineers you are proud of',
      'Still enjoy writing code occasionally',
    ].join('\n'),
    benefits: 'Onsite in our Bengaluru HQ, equity, leadership coaching budget.',
    postedDaysAgo: 18,
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Senior SRE',
    department: 'Infrastructure',
    location: 'Berlin, DE (Hybrid)',
    workMode: 'HYBRID',
    salaryMin: 90_000,
    salaryMax: 125_000,
    salaryCurrency: 'EUR',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['SRE', 'Kubernetes', 'Prometheus', 'Grafana', 'On-call', 'Incident Response'],
    description:
      'Own reliability for the Acme platform. SLO definition, incident response, observability, capacity planning.',
    requirements: [
      '5+ years SRE / production engineering',
      'Strong Kubernetes + observability fundamentals',
      'Comfort being on-call',
    ].join('\n'),
    benefits: 'Hybrid Berlin, equity, on-call bonus.',
    postedDaysAgo: 6,
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Security Engineer',
    department: 'Security',
    location: 'Remote (EU)',
    workMode: 'REMOTE',
    salaryMin: 100_000,
    salaryMax: 130_000,
    salaryCurrency: 'EUR',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['AppSec', 'OWASP', 'Burp Suite', 'Threat Modeling', 'Kubernetes Security'],
    description:
      'Lead application security across the Acme platform. Threat modeling, code review, penetration testing, security tooling.',
    requirements: [
      '5+ years application security',
      'Strong web app security fundamentals',
      'You can write code to automate away toil',
    ].join('\n'),
    benefits: 'Remote EU, equity, conference + training budget.',
    postedDaysAgo: 12,
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Technical Writer (Part-Time)',
    department: 'Documentation',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE',
    salaryMin: 40,
    salaryMax: 70,
    salaryCurrency: 'USD',
    employmentType: 'PART_TIME',
    experienceLevel: 'MID',
    experienceYears: 3,
    skillsRequired: ['Writing', 'API Documentation', 'Markdown', 'Git'],
    description: '20 hours/week. Maintain our API docs, write tutorials, edit release notes.',
    requirements: ['3+ years writing developer documentation', 'Strong written English'].join('\n'),
    benefits: 'Flexible hours, fully remote.',
    status: 'PAUSED',
    postedDaysAgo: 45,
  },

  // Northwind Tech (6 jobs, posted by Neha)
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Senior Frontend Engineer (React)',
    department: 'Engineering',
    location: 'Remote (Americas)',
    workMode: 'REMOTE',
    salaryMin: 120_000,
    salaryMax: 160_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Tailwind', 'Vite'],
    description:
      'Lead the rewrite of our customer dashboard from Create-React-App to Next.js + App Router. You will work alongside a senior designer and a staff engineer.',
    requirements: [
      '5+ years React in production',
      'Comfort with TypeScript strict mode',
      'You have opinions on data fetching and bundle size',
    ].join('\n'),
    benefits: 'Remote (Americas), equity, top-tier health, $3k home-office stipend.',
    postedDaysAgo: 8,
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Data Engineer',
    department: 'Data',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE',
    salaryMin: 100_000,
    salaryMax: 140_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 4,
    skillsRequired: ['Python', 'Airflow', 'Snowflake', 'dbt', 'SQL'],
    description:
      'Own the batch + streaming pipelines feeding our forecasting models. Replace brittle cron jobs with proper Airflow + dbt.',
    requirements: [
      '4+ years building production data pipelines',
      'Strong SQL + Python',
      'Comfort owning a pipeline end-to-end',
    ].join('\n'),
    benefits: 'Remote-first, equity, generous PTO.',
    postedDaysAgo: 11,
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Neha.email,
    title: 'DevRel Engineer',
    department: 'Marketing',
    location: 'Remote (Americas)',
    workMode: 'REMOTE',
    salaryMin: 110_000,
    salaryMax: 140_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 4,
    skillsRequired: ['Writing', 'Public Speaking', 'Node.js', 'API Design', 'Video'],
    description:
      'Be the voice of Northwind in the developer community. Write tutorials, give talks, build sample apps, hang out in Discord.',
    requirements: [
      '4+ years as a developer',
      'You can write a clear 1500-word technical post',
      'Comfortable on camera',
    ].join('\n'),
    benefits: 'Remote, conference travel budget, recording-studio stipend.',
    postedDaysAgo: 15,
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Customer Success Engineer',
    department: 'Customer',
    location: 'Hybrid — Austin, TX',
    workMode: 'HYBRID',
    salaryMin: 95_000,
    salaryMax: 125_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    experienceYears: 3,
    skillsRequired: ['Python', 'SQL', 'Customer-facing', 'REST APIs', 'Documentation'],
    description:
      'Embed with 3-5 enterprise customers. Help them integrate, debug, and extract value from the platform.',
    requirements: [
      '3+ years in customer engineering / solutions',
      'Strong Python + SQL',
      'Comfortable on customer calls',
    ].join('\n'),
    benefits: 'Hybrid Austin, equity, health.',
    status: 'PAUSED',
    postedDaysAgo: 30,
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Senior Product Manager',
    department: 'Product',
    location: 'Remote (Americas)',
    workMode: 'REMOTE',
    salaryMin: 140_000,
    salaryMax: 180_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    experienceYears: 6,
    skillsRequired: ['Product Strategy', 'Discovery', 'SQL', 'Analytics', 'Roadmapping'],
    description:
      'Own the customer-facing dashboard product line. Discovery, roadmap, GTM coordination.',
    requirements: [
      '6+ years product management in B2B SaaS',
      'You have shipped enterprise features',
      'Data-driven with strong SQL',
    ].join('\n'),
    benefits: 'Remote Americas, equity, generous PTO.',
    postedDaysAgo: 4,
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Neha.email,
    title: 'QA Engineer (Contract)',
    department: 'Quality',
    location: 'Remote (EMEA)',
    workMode: 'REMOTE',
    salaryMin: 50,
    salaryMax: 80,
    salaryCurrency: 'EUR',
    employmentType: 'CONTRACT',
    experienceLevel: 'MID',
    experienceYears: 3,
    skillsRequired: ['Playwright', 'Cypress', 'TypeScript', 'API Testing', 'JIRA'],
    description:
      '6-month contract with potential to convert. Build out our Playwright suite, own end-to-end test infrastructure.',
    requirements: [
      '3+ years writing Playwright or Cypress suites',
      'Comfort with CI pipelines',
      'Strong written English',
    ].join('\n'),
    benefits: 'Fully remote (EMEA), flexible hours, potential full-time conversion.',
    postedDaysAgo: 2,
  },

  // Helios Finance (6 jobs)
  {
    companySlug: 'helios-finance',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Backend Engineer (Payments)',
    department: 'Engineering',
    location: 'Hybrid — Mumbai, IN',
    workMode: 'HYBRID',
    salaryMin: 70_000,
    salaryMax: 110_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    experienceYears: 3,
    skillsRequired: ['Go', 'PostgreSQL', 'Kafka', 'gRPC', 'Payments'],
    description:
      'Build the payment-routing engine. Idempotency, exactly-once delivery, settlement reconciliation.',
    requirements: [
      '3+ years backend engineering',
      'Strong Go fundamentals',
      'Comfort with distributed systems',
    ].join('\n'),
    benefits: 'Hybrid Mumbai, equity, health insurance.',
    postedDaysAgo: 9,
  },
  {
    companySlug: 'helios-finance',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Senior Mobile Engineer (React Native)',
    department: 'Engineering',
    location: 'Remote (APAC)',
    workMode: 'REMOTE',
    salaryMin: 100_000,
    salaryMax: 140_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['React Native', 'TypeScript', 'iOS', 'Android', 'Fintech'],
    description:
      'Lead the cross-platform mobile app rewrite. Offline-first, secure storage, biometric auth.',
    requirements: [
      '5+ years React Native in production',
      'Shipped at least one fintech app',
      'Comfort with native iOS / Android bridges',
    ].join('\n'),
    benefits: 'Remote APAC, equity, $2k device stipend.',
    postedDaysAgo: 13,
  },
  {
    companySlug: 'helios-finance',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Compliance Engineer',
    department: 'Compliance',
    location: 'Hybrid — Mumbai, IN',
    workMode: 'HYBRID',
    salaryMin: 90_000,
    salaryMax: 130_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['Compliance', 'PCI-DSS', 'SOC 2', 'Audit', 'Risk'],
    description:
      'Own SOC 2 Type II audit, PCI-DSS compliance, and the regulatory reporting pipeline. Partner with engineering on access controls.',
    requirements: [
      '5+ years compliance in fintech',
      'SOC 2 + PCI-DSS audit experience',
      'Strong written English',
    ].join('\n'),
    benefits: 'Hybrid Mumbai, equity, compliance certification budget.',
    postedDaysAgo: 22,
  },
  {
    companySlug: 'helios-finance',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Lead Product Designer',
    department: 'Design',
    location: 'Remote (APAC)',
    workMode: 'REMOTE',
    salaryMin: 120_000,
    salaryMax: 160_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    experienceYears: 7,
    skillsRequired: ['Figma', 'Design Systems', 'Fintech', 'Accessibility', 'Research'],
    description:
      'Lead the consumer-facing design language. Own the design system, drive accessibility audits, partner with PM on roadmap.',
    requirements: [
      '7+ years product design, 3+ in fintech',
      'You have shipped a design system',
      'Strong opinions on accessibility',
    ].join('\n'),
    benefits: 'Remote APAC, equity, conference budget.',
    postedDaysAgo: 17,
  },
  {
    companySlug: 'helios-finance',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Risk Analyst',
    department: 'Risk',
    location: 'Hybrid — Mumbai, IN',
    workMode: 'HYBRID',
    salaryMin: 60_000,
    salaryMax: 90_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    experienceYears: 2,
    skillsRequired: ['SQL', 'Python', 'Risk', 'Statistics', 'Tableau'],
    description:
      'Build risk scoring models. Transaction monitoring, anomaly detection, regulatory reporting.',
    requirements: [
      '2+ years in risk / fraud / analytics',
      'Strong SQL + Python',
      'Comfort with statistical methods',
    ].join('\n'),
    benefits: 'Hybrid Mumbai, equity.',
    postedDaysAgo: 6,
  },
  {
    companySlug: 'helios-finance',
    postedByEmail: RECRUITER_Neha.email,
    title: 'Customer Support Specialist',
    department: 'Customer',
    location: 'Remote (India)',
    workMode: 'REMOTE',
    salaryMin: 25_000,
    salaryMax: 35_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    experienceYears: 1,
    skillsRequired: ['Customer Support', 'Zendesk', 'English', 'Hindi'],
    description:
      'First-line customer support for the Helios app. Resolve tickets, escalate bugs, write KB articles.',
    requirements: ['1+ years customer support', 'Fluent English + Hindi'].join('\n'),
    benefits: 'Remote India, ₹4L health insurance.',
    postedDaysAgo: 1,
  },

  // Verdant Health (6 jobs)
  {
    companySlug: 'verdant-health',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Clinical ML Engineer',
    department: 'Engineering',
    location: 'Hybrid — Boston, US',
    workMode: 'HYBRID',
    salaryMin: 160_000,
    salaryMax: 220_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['Python', 'PyTorch', 'Healthcare', 'HIPAA', 'NLP'],
    description:
      'Build clinical NLP models that extract early-warning signals from unstructured EHR data. Strong focus on evaluation, fairness, and clinical validation.',
    requirements: [
      '5+ years ML in production',
      'Healthcare experience required',
      'Comfort with HIPAA-compliant workflows',
    ].join('\n'),
    benefits: 'Hybrid Boston, equity, $5k CME budget.',
    postedDaysAgo: 19,
  },
  {
    companySlug: 'verdant-health',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    workMode: 'REMOTE',
    salaryMin: 130_000,
    salaryMax: 170_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['React', 'TypeScript', 'Next.js', 'Healthcare', 'Accessibility'],
    description:
      'Own the clinician-facing dashboard. Build accessible, performant UI for high-stakes clinical workflows.',
    requirements: [
      '5+ years React in production',
      'Healthcare experience a plus',
      'Strong accessibility chops (WCAG 2.1 AA)',
    ].join('\n'),
    benefits: 'Remote US, equity, health + dental.',
    postedDaysAgo: 11,
  },
  {
    companySlug: 'verdant-health',
    postedByEmail: RECRUITER_Riya.email,
    title: 'HIPAA Compliance Officer',
    department: 'Compliance',
    location: 'Hybrid — Boston, US',
    workMode: 'HYBRID',
    salaryMin: 140_000,
    salaryMax: 180_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
    experienceYears: 7,
    skillsRequired: ['HIPAA', 'HITRUST', 'SOC 2', 'Healthcare', 'Audit'],
    description:
      'Own all regulatory compliance — HIPAA, HITRUST, SOC 2. Lead audits, partner with engineering on access controls.',
    requirements: [
      '7+ years healthcare compliance',
      'HIPAA + HITRUST audit experience',
      'You can brief a CISO',
    ].join('\n'),
    benefits: 'Hybrid Boston, equity, comprehensive health.',
    postedDaysAgo: 25,
  },
  {
    companySlug: 'verdant-health',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Full-Stack Engineer (Mid)',
    department: 'Engineering',
    location: 'Remote (US)',
    workMode: 'REMOTE',
    salaryMin: 100_000,
    salaryMax: 135_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    experienceYears: 3,
    skillsRequired: ['TypeScript', 'PostgreSQL', 'API', 'Healthcare'],
    description:
      'Build out the patient-facing portal. Strong focus on data correctness, audit logging, and clean API design.',
    requirements: [
      '3+ years full-stack engineering',
      'Strong SQL + API design',
      'Comfort with healthcare data workflows',
    ].join('\n'),
    benefits: 'Remote US, equity, health.',
    postedDaysAgo: 7,
  },
  {
    companySlug: 'verdant-health',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Clinical Informatics Specialist',
    department: 'Clinical',
    location: 'Hybrid — Boston, US',
    workMode: 'HYBRID',
    salaryMin: 110_000,
    salaryMax: 145_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    experienceYears: 4,
    skillsRequired: ['SNOMED CT', 'HL7 FHIR', 'Healthcare', 'SQL'],
    description:
      'Bridge clinical and engineering teams. Define data models, validate ML outputs, run clinical workshops.',
    requirements: [
      '4+ years clinical informatics',
      'Strong SNOMED + FHIR knowledge',
      'You can read a clinical workflow diagram',
    ].join('\n'),
    benefits: 'Hybrid Boston, equity, CME + conferences.',
    postedDaysAgo: 14,
  },
  {
    companySlug: 'verdant-health',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Senior Data Engineer',
    department: 'Data',
    location: 'Remote (US)',
    workMode: 'REMOTE',
    salaryMin: 140_000,
    salaryMax: 180_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    experienceYears: 5,
    skillsRequired: ['Python', 'Airflow', 'dbt', 'Snowflake', 'HIPAA'],
    description:
      'Build the FHIR ingestion pipeline. Idempotent, observable, audit-logged, HIPAA-compliant.',
    requirements: [
      '5+ years data engineering',
      'Strong FHIR + healthcare data experience',
      'You have shipped pipelines in production',
    ].join('\n'),
    benefits: 'Remote US, equity, health.',
    postedDaysAgo: 3,
  },
];

// --- Demo assessments (created by recruiters) -----------------------------
type AssessmentSeed = {
  createdByEmail: string;
  companySlug: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  questions: Array<
    | {
        type: 'MCQ';
        prompt: string;
        options: string[];
        points: number;
      }
    | {
        type: 'CODE';
        prompt: string;
        language: string;
        starterCode: string;
        solution: string;
        points: number;
      }
    | {
        type: 'SQL';
        prompt: string;
        starterCode: string;
        solution: string;
        points: number;
      }
    | {
        type: 'DEBUG';
        prompt: string;
        starterCode: string;
        solution: string;
        points: number;
      }
  >;
};

const ASSESSMENTS: AssessmentSeed[] = [
  {
    createdByEmail: RECRUITER_Riya.email,
    companySlug: 'hirepilot-demo',
    title: 'Senior Full-Stack Engineer — Onsite Screen',
    description: '40-minute TypeScript + React fundamentals screen.',
    durationMinutes: 40,
    passingScore: 65,
    status: 'ACTIVE',
    questions: [
      {
        type: 'MCQ',
        prompt: 'Which of the following best describes React Server Components?',
        options: [
          'Components that render exclusively on the client and replace the use of useEffect.',
          'Components that render on the server, ship no JS to the client, and can be composed inside client components.',
          'A new database layer that talks to Prisma and replaces the need for route handlers.',
          'A replacement for the React Context API introduced in React 18.',
        ],
        points: 10,
      },
      {
        type: 'MCQ',
        prompt:
          'In TypeScript, which utility type produces a type with all properties of T set to optional?',
        options: ['Partial<T>', 'Required<T>', 'Readonly<T>', 'Pick<T, K>'],
        points: 10,
      },
      {
        type: 'CODE',
        prompt:
          'Write a TypeScript function `groupBy<T, K>(arr: T[], key: (t: T) => K): Record<K, T[]>` that groups array elements by the result of the key function.',
        language: 'typescript',
        starterCode:
          'export function groupBy<T, K>(arr: T[], key: (t: T) => K): Record<K, T[]> {\n  // your code here\n}\n',
        solution:
          'const out = {} as Record<K, T[]>; for (const item of arr) { const k = key(item); (out[k] ??= []).push(item); } return out;',
        points: 20,
      },
      {
        type: 'SQL',
        prompt:
          'Write a SQL query against the `applications` table (columns: id, jobId, candidateId, stage, createdAt) that returns the count of applications per stage, ordered by count descending.',
        starterCode: '-- your query here\n',
        solution:
          'SELECT stage, COUNT(*) AS count FROM applications GROUP BY stage ORDER BY count DESC;',
        points: 15,
      },
      {
        type: 'DEBUG',
        prompt:
          'The following React component should render a list of names but throws "Objects are not valid as a React child". Identify the bug and fix the code.',
        language: 'javascript',
        starterCode:
          'function NameList({ people }) {\n  return (\n    <ul>\n      {people.map((p) => <li key={p.id}>{p}</li>)}\n    </ul>\n  );\n}\n',
        solution:
          'Replace {p} with {p.name} — `p` is an object, not a string. The JSX should render a property, e.g. {p.name}.',
        points: 15,
      },
    ],
  },
  {
    createdByEmail: RECRUITER_Rohan.email,
    companySlug: 'acme-corp',
    title: 'Platform Engineer — Kubernetes + Linux',
    description: 'Hands-on k8s and systems troubleshooting.',
    durationMinutes: 60,
    passingScore: 70,
    status: 'ACTIVE',
    questions: [
      {
        type: 'MCQ',
        prompt:
          'Which kubectl command lists all pods in the cluster that are NOT in the Running state?',
        options: [
          'kubectl get pods',
          'kubectl get pods --field-selector=status.phase!=Running',
          'kubectl describe pods',
          'kubectl logs --all-namespaces',
        ],
        points: 10,
      },
      {
        type: 'CODE',
        prompt:
          'Write a minimal Kubernetes Deployment manifest for an image called `web:v1`, 3 replicas, with label `app=web`.',
        language: 'yaml',
        starterCode: '# your manifest here\n',
        solution:
          'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n      - name: web\n        image: web:v1',
        points: 25,
      },
      {
        type: 'DEBUG',
        prompt:
          'A pod is in CrashLoopBackOff. The container log shows "permission denied: /etc/secrets/db.yaml". Name the two most likely causes and how you would verify each.',
        language: 'text',
        starterCode: 'Describe your debugging steps in plain text (3-5 sentences).\n',
        solution:
          'Likely causes: (1) the secret was mounted with mode 0644 but the binary expects 0600, or (2) the file is owned by root but the container runs as non-root. Verify with `kubectl describe pod` (events) and `kubectl exec` to check actual file mode and ownership.',
        points: 20,
      },
    ],
  },
  {
    createdByEmail: RECRUITER_Neha.email,
    companySlug: 'northwind-tech',
    title: 'Frontend Engineer — React + TypeScript',
    description: '40-minute React fundamentals screen.',
    durationMinutes: 30,
    passingScore: 60,
    status: 'ACTIVE',
    questions: [
      {
        type: 'MCQ',
        prompt:
          'Which React hook is the right choice for fetching data on mount in a client component?',
        options: ['useState', 'useEffect with [] deps', 'useMemo', 'useRef'],
        points: 10,
      },
      {
        type: 'CODE',
        prompt:
          'Write a TypeScript React component that takes `items: { id: string; label: string }[]` and renders an unordered list, with each list item as a button that calls `onPick(id)`.',
        language: 'typescript',
        starterCode:
          'type Item = { id: string; label: string };\nexport function Picker({ items, onPick }: { items: Item[]; onPick: (id: string) => void }) {\n  // your code here\n}\n',
        solution:
          'export function Picker({ items, onPick }: { items: Item[]; onPick: (id: string) => void }) {\n  return (\n    <ul>\n      {items.map((it) => (\n        <li key={it.id}><button onClick={() => onPick(it.id)}>{it.label}</button></li>\n      ))}\n    </ul>\n  );\n}',
        points: 25,
      },
    ],
  },
];

// --- Application seed: each candidate applies to ~6 jobs across all stages
type ApplicationSeed = {
  candidateEmail: string;
  jobTitle: string;
  stage:
    | 'APPLIED'
    | 'RESUME_SCREENING'
    | 'SHORTLISTED'
    | 'TECHNICAL_INTERVIEW'
    | 'HR_INTERVIEW'
    | 'OFFER'
    | 'HIRED'
    | 'REJECTED';
  daysAgo: number;
  coverLetter: string;
};

// Deterministic generator: each candidate applies to ~6 jobs, distributed
// across stages so every Kanban column has ~10 cards.
const APPLICATIONS: ApplicationSeed[] = [
  // Arjun Mehta — strong full-stack + AI focus
  {
    candidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Senior Full-Stack Engineer',
    stage: 'TECHNICAL_INTERVIEW',
    daysAgo: 12,
    coverLetter:
      'I have been building Next.js apps for 6 years and I love the App Router. Excited to bring that experience to HirePilot.',
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'AI Engineer (NLP / Matching)',
    stage: 'HR_INTERVIEW',
    daysAgo: 18,
    coverLetter:
      'I have shipped two production NLP pipelines — happy to walk through the trade-offs of classical vs embedding-based retrieval.',
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer (React)',
    stage: 'OFFER',
    daysAgo: 22,
    coverLetter:
      'Lead the rewrite — I have done it twice already. Modern data fetching + bundle size are my jam.',
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Engineering Manager',
    stage: 'SHORTLISTED',
    daysAgo: 8,
    coverLetter:
      'Looking to grow into leadership. I have mentored 4 engineers and would love to formalize that as a manager role.',
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Senior Mobile Engineer (React Native)',
    stage: 'RESUME_SCREENING',
    daysAgo: 4,
    coverLetter: 'Cross-platform mobile is my current focus and Helios would be a great fit.',
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Full-Stack Engineer (Mid)',
    stage: 'APPLIED',
    daysAgo: 1,
    coverLetter:
      'Below the senior bar but I have shipped a fair amount of full-stack and would love to work in healthcare.',
  },

  // Priya Subramaniam — engineering manager
  {
    candidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'Engineering Manager',
    stage: 'HIRED',
    daysAgo: 30,
    coverLetter: 'This is the role I have been building toward. Ready to lead and to keep coding.',
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'Engineering Manager — Tooling',
    stage: 'OFFER',
    daysAgo: 18,
    coverLetter:
      'Acme Tooling is a great fit. I would love to keep my hands on code while leading.',
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'Senior Product Manager',
    stage: 'TECHNICAL_INTERVIEW',
    daysAgo: 9,
    coverLetter:
      'Cross-functional background in engineering + product. I am ready to lean into product full-time.',
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'Lead Product Designer',
    stage: 'REJECTED',
    daysAgo: 16,
    coverLetter:
      'I have done design-adjacent work but not yet led a design system. Applying to learn.',
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'HIPAA Compliance Officer',
    stage: 'SHORTLISTED',
    daysAgo: 5,
    coverLetter: 'Healthcare compliance is the next domain I want to learn.',
  },

  // Karthik Raman — backend
  {
    candidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Backend Engineer (Payments)',
    stage: 'OFFER',
    daysAgo: 14,
    coverLetter:
      'Idempotency + exactly-once delivery is exactly what I have been doing for 4 years. Helios is the right place.',
  },
  {
    candidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Platform Engineer (Kubernetes)',
    stage: 'HR_INTERVIEW',
    daysAgo: 19,
    coverLetter: 'Strong Go + k8s background. Comfortable with the on-call rotation.',
  },
  {
    candidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Junior Backend Engineer (New Grad)',
    stage: 'REJECTED',
    daysAgo: 25,
    coverLetter:
      'Applying even though I am over the new-grad bar — happy to contribute at any level.',
  },
  {
    candidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Senior SRE',
    stage: 'APPLIED',
    daysAgo: 2,
    coverLetter: 'SRE is the next step in my career. Reliability is a craft I want to learn.',
  },
  {
    candidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Data Engineer',
    stage: 'RESUME_SCREENING',
    daysAgo: 7,
    coverLetter: 'Would love to pivot from product data to batch ETL pipelines.',
  },
  {
    candidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Senior Data Engineer',
    stage: 'SHORTLISTED',
    daysAgo: 11,
    coverLetter:
      'Healthcare data work is interesting. I have built HIPAA-aligned pipelines at my current job.',
  },

  // Ananya Sharma — frontend
  {
    candidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer (React)',
    stage: 'HR_INTERVIEW',
    daysAgo: 15,
    coverLetter: 'I have shipped Storybook-driven design systems. Strong opinions on a11y.',
  },
  {
    candidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Product Designer',
    stage: 'REJECTED',
    daysAgo: 20,
    coverLetter:
      'I am a frontend engineer, not a designer — but I have done some design work and would love to learn.',
  },
  {
    candidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Frontend Engineer (Mid)',
    stage: 'OFFER',
    daysAgo: 12,
    coverLetter: 'Verdant is a great fit. Strong accessibility chops.',
  },
  {
    candidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer',
    stage: 'TECHNICAL_INTERVIEW',
    daysAgo: 8,
    coverLetter: 'Healthcare frontend at the senior level — I am excited.',
  },
  {
    candidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Lead Product Designer',
    stage: 'APPLIED',
    daysAgo: 3,
    coverLetter: 'I have led UI work across two design systems. Stretching for a lead role.',
  },

  // Rohit Verma — DevOps
  {
    candidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'Senior SRE',
    stage: 'TECHNICAL_INTERVIEW',
    daysAgo: 14,
    coverLetter: '5 years on call. I have seen every 3am page Acme has ever sent.',
  },
  {
    candidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'Platform Engineer (Kubernetes)',
    stage: 'HIRED',
    daysAgo: 28,
    coverLetter: 'Berlin hybrid is fine. I am relocating.',
  },
  {
    candidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'Security Engineer',
    stage: 'SHORTLISTED',
    daysAgo: 7,
    coverLetter: 'Crossing into security. I have done threat modeling as part of my SRE work.',
  },
  {
    candidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'Senior Backend Engineer (Payments)',
    stage: 'RESUME_SCREENING',
    daysAgo: 5,
    coverLetter: 'Comfortable with payments infra. I have operated settlement systems.',
  },
  {
    candidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'DevOps Engineer',
    stage: 'APPLIED',
    daysAgo: 1,
    coverLetter: 'Looking to specialize further in platform engineering.',
  },

  // Meera Iyer — data
  {
    candidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'Data Engineer',
    stage: 'OFFER',
    daysAgo: 11,
    coverLetter: 'Northwind is exactly the kind of company I want to work at.',
  },
  {
    candidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'Senior Data Engineer',
    stage: 'TECHNICAL_INTERVIEW',
    daysAgo: 17,
    coverLetter: 'Verdant is a great fit. I have shipped HIPAA-compliant pipelines.',
  },
  {
    candidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'AI Engineer (NLP / Matching)',
    stage: 'REJECTED',
    daysAgo: 22,
    coverLetter: 'Stretching into ML/NLP. I have done classical ML but not deep NLP.',
  },
  {
    candidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'Risk Analyst',
    stage: 'SHORTLISTED',
    daysAgo: 8,
    coverLetter: 'Risk analytics is adjacent to my data engineering background.',
  },
  {
    candidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'Clinical Informatics Specialist',
    stage: 'APPLIED',
    daysAgo: 2,
    coverLetter: 'I have worked with HL7 FHIR in past projects.',
  },

  // Vikram Joshi — product designer
  {
    candidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Product Designer',
    stage: 'HIRED',
    daysAgo: 24,
    coverLetter: 'HirePilot is the design challenge I have been waiting for.',
  },
  {
    candidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Lead Product Designer',
    stage: 'OFFER',
    daysAgo: 16,
    coverLetter: 'Leading a design system at Helios would be a great next step.',
  },
  {
    candidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer (React)',
    stage: 'REJECTED',
    daysAgo: 20,
    coverLetter: 'I am a designer, not an engineer — applying to learn what you look for.',
  },
  {
    candidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Design Engineer',
    stage: 'SHORTLISTED',
    daysAgo: 6,
    coverLetter: 'Bridging design and engineering is my sweet spot.',
  },
  {
    candidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Engineering Manager',
    stage: 'RESUME_SCREENING',
    daysAgo: 4,
    coverLetter: 'I am exploring a transition into engineering leadership.',
  },

  // Kavita Banerjee — QA
  {
    candidateEmail: 'kavita.candidate@test.dev',
    jobTitle: 'QA Engineer (Contract)',
    stage: 'HR_INTERVIEW',
    daysAgo: 13,
    coverLetter: 'Playwright is my daily driver. I have shipped 3 Cypress suites to production.',
  },
  {
    candidateEmail: 'kavita.candidate@test.dev',
    jobTitle: 'QA Engineer (Intern)',
    stage: 'REJECTED',
    daysAgo: 50,
    coverLetter: 'I have 3 years of experience — happy to mentor interns alongside.',
  },
  {
    candidateEmail: 'kavita.candidate@test.dev',
    jobTitle: 'Senior SRE',
    stage: 'APPLIED',
    daysAgo: 3,
    coverLetter: 'I would love to bridge QA + SRE. Reliability testing is my interest.',
  },
  {
    candidateEmail: 'kavita.candidate@test.dev',
    jobTitle: 'Customer Support Specialist',
    stage: 'SHORTLISTED',
    daysAgo: 9,
    coverLetter: 'I want to move toward customer-facing work. QA is a great training ground.',
  },
  {
    candidateEmail: 'kavita.candidate@test.dev',
    jobTitle: 'Backend Engineer (Payments)',
    stage: 'APPLIED',
    daysAgo: 1,
    coverLetter: 'Stretching into backend engineering. I have done some Node.js scripting.',
  },
];

// --- Interview seed (one per scheduled application) -----------------------
type InterviewSeed = {
  applicationCandidateEmail: string;
  jobTitle: string;
  type: 'PHONE' | 'TECHNICAL' | 'HR' | 'PANEL' | 'ONSITE';
  scheduledAt: Date;
  durationMins: number;
  platform: 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'OTHER';
  interviewerEmails: string[];
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  feedback?: {
    interviewerEmail: string;
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    teamwork: number;
    leadership: number;
    overallRating: number;
    recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
    comments: string;
  };
};

const INTERVIEWERS_BY_COMPANY: Record<string, string[]> = {
  'hirepilot-demo': [INTERVIEWER_Ishaan.email],
  'acme-corp': [INTERVIEWER_PriyaS.email],
  'northwind-tech': [INTERVIEWER_Vikram.email],
  'helios-finance': [INTERVIEWER_Vikram.email],
  'verdant-health': [INTERVIEWER_Ishaan.email],
};

const INTERVIEWS: InterviewSeed[] = [
  // Arjun
  {
    applicationCandidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer (React)',
    type: 'TECHNICAL',
    scheduledAt: addDays(-1, 16, 0),
    durationMins: 60,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Ishaan.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_Ishaan.email,
      technicalSkills: 5,
      communication: 4,
      problemSolving: 5,
      teamwork: 4,
      leadership: 4,
      overallRating: 5,
      recommendation: 'STRONG_HIRE',
      comments:
        'Strong React fundamentals. Excellent system design instincts. Recommendation: extend offer.',
    },
  },
  {
    applicationCandidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'AI Engineer (NLP / Matching)',
    type: 'HR',
    scheduledAt: addDays(2, 11, 0),
    durationMins: 45,
    platform: 'ZOOM',
    interviewerEmails: [INTERVIEWER_Ishaan.email],
    status: 'SCHEDULED',
  },
  {
    applicationCandidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Engineering Manager',
    type: 'PANEL',
    scheduledAt: addDays(3, 14, 0),
    durationMins: 90,
    platform: 'TEAMS',
    interviewerEmails: [INTERVIEWER_Ishaan.email, HM_HirePilot.email],
    status: 'SCHEDULED',
  },
  // Priya
  {
    applicationCandidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'Engineering Manager',
    type: 'PANEL',
    scheduledAt: addDays(-15, 14, 0),
    durationMins: 90,
    platform: 'TEAMS',
    interviewerEmails: [INTERVIEWER_Ishaan.email, HM_HirePilot.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_Ishaan.email,
      technicalSkills: 5,
      communication: 5,
      problemSolving: 5,
      teamwork: 5,
      leadership: 5,
      overallRating: 5,
      recommendation: 'STRONG_HIRE',
      comments: 'Exceptional leadership instinct. Strong technical depth. Hired.',
    },
  },
  {
    applicationCandidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'Engineering Manager — Tooling',
    type: 'ONSITE',
    scheduledAt: addDays(4, 10, 0),
    durationMins: 240,
    platform: 'OTHER',
    interviewerEmails: [INTERVIEWER_PriyaS.email, HM_Acme.email],
    status: 'SCHEDULED',
  },
  // Karthik
  {
    applicationCandidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Backend Engineer (Payments)',
    type: 'TECHNICAL',
    scheduledAt: addDays(-2, 16, 0),
    durationMins: 60,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Vikram.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_Vikram.email,
      technicalSkills: 5,
      communication: 4,
      problemSolving: 5,
      teamwork: 4,
      leadership: 3,
      overallRating: 4,
      recommendation: 'HIRE',
      comments:
        'Strong backend fundamentals. Good understanding of payments domain. Ready to onboard.',
    },
  },
  {
    applicationCandidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Platform Engineer (Kubernetes)',
    type: 'HR',
    scheduledAt: addDays(5, 14, 0),
    durationMins: 45,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_PriyaS.email],
    status: 'SCHEDULED',
  },
  // Ananya
  {
    applicationCandidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer (React)',
    type: 'TECHNICAL',
    scheduledAt: addDays(-3, 15, 0),
    durationMins: 60,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Vikram.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_Vikram.email,
      technicalSkills: 4,
      communication: 5,
      problemSolving: 4,
      teamwork: 5,
      leadership: 4,
      overallRating: 4,
      recommendation: 'HIRE',
      comments: 'Excellent communication and accessibility instincts. Strong React fundamentals.',
    },
  },
  {
    applicationCandidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Frontend Engineer (Mid)',
    type: 'HR',
    scheduledAt: addDays(1, 13, 0),
    durationMins: 45,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Ishaan.email],
    status: 'SCHEDULED',
  },
  {
    applicationCandidateEmail: 'ananya.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer',
    type: 'PHONE',
    scheduledAt: addDays(6, 10, 0),
    durationMins: 30,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Ishaan.email],
    status: 'SCHEDULED',
  },
  // Rohit
  {
    applicationCandidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'Senior SRE',
    type: 'TECHNICAL',
    scheduledAt: addDays(0, 17, 0),
    durationMins: 75,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_PriyaS.email],
    status: 'SCHEDULED',
  },
  {
    applicationCandidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'Platform Engineer (Kubernetes)',
    type: 'ONSITE',
    scheduledAt: addDays(-20, 9, 0),
    durationMins: 300,
    platform: 'OTHER',
    interviewerEmails: [INTERVIEWER_PriyaS.email, HM_Acme.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_PriyaS.email,
      technicalSkills: 5,
      communication: 4,
      problemSolving: 5,
      teamwork: 5,
      leadership: 4,
      overallRating: 5,
      recommendation: 'STRONG_HIRE',
      comments:
        'Strong k8s fundamentals. Excellent on-call disposition. Hired, relocating to Berlin.',
    },
  },
  // Meera
  {
    applicationCandidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'Data Engineer',
    type: 'TECHNICAL',
    scheduledAt: addDays(-1, 14, 0),
    durationMins: 60,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Vikram.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_Vikram.email,
      technicalSkills: 5,
      communication: 4,
      problemSolving: 4,
      teamwork: 5,
      leadership: 4,
      overallRating: 5,
      recommendation: 'STRONG_HIRE',
      comments:
        'Excellent data engineering depth. Strong opinions on idempotency. Ready to onboard.',
    },
  },
  {
    applicationCandidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'Senior Data Engineer',
    type: 'TECHNICAL',
    scheduledAt: addDays(3, 15, 0),
    durationMins: 60,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Ishaan.email],
    status: 'SCHEDULED',
  },
  // Vikram
  {
    applicationCandidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Product Designer',
    type: 'PANEL',
    scheduledAt: addDays(-18, 14, 0),
    durationMins: 90,
    platform: 'ZOOM',
    interviewerEmails: [INTERVIEWER_Ishaan.email, HM_HirePilot.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_Ishaan.email,
      technicalSkills: 4,
      communication: 5,
      problemSolving: 5,
      teamwork: 5,
      leadership: 4,
      overallRating: 5,
      recommendation: 'STRONG_HIRE',
      comments: 'Exceptional design taste. Strong partnership with engineering. Hired.',
    },
  },
  {
    applicationCandidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Lead Product Designer',
    type: 'PANEL',
    scheduledAt: addDays(2, 15, 0),
    durationMins: 90,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Vikram.email],
    status: 'SCHEDULED',
  },
  // Kavita
  {
    applicationCandidateEmail: 'kavita.candidate@test.dev',
    jobTitle: 'QA Engineer (Contract)',
    type: 'TECHNICAL',
    scheduledAt: addDays(-2, 11, 0),
    durationMins: 60,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Vikram.email],
    status: 'COMPLETED',
    feedback: {
      interviewerEmail: INTERVIEWER_Vikram.email,
      technicalSkills: 4,
      communication: 4,
      problemSolving: 4,
      teamwork: 4,
      leadership: 3,
      overallRating: 4,
      recommendation: 'HIRE',
      comments: 'Strong Playwright discipline. Good test architecture instincts.',
    },
  },
  {
    applicationCandidateEmail: 'kavita.candidate@test.dev',
    jobTitle: 'QA Engineer (Contract)',
    type: 'HR',
    scheduledAt: addDays(4, 12, 0),
    durationMins: 45,
    platform: 'GOOGLE_MEET',
    interviewerEmails: [INTERVIEWER_Vikram.email],
    status: 'SCHEDULED',
  },
];

// --- Offer letters (for OFFER + HIRED applications) ------------------------
type OfferSeed = {
  applicationCandidateEmail: string;
  jobTitle: string;
  salaryAmount: number;
  salaryCurrency: string;
  joiningDate: Date;
  expiresAt: Date;
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'RESCINDED';
};

const OFFERS: OfferSeed[] = [
  {
    applicationCandidateEmail: 'arjun.candidate@test.dev',
    jobTitle: 'Senior Frontend Engineer (React)',
    salaryAmount: 145_000_00,
    salaryCurrency: 'USD',
    joiningDate: addDays(28, 0, 0),
    expiresAt: addDays(-5, 0, 0),
    status: 'SENT',
  },
  {
    applicationCandidateEmail: 'priya.candidate@test.dev',
    jobTitle: 'Engineering Manager',
    salaryAmount: 175_000_00,
    salaryCurrency: 'USD',
    joiningDate: addDays(-20, 0, 0),
    expiresAt: addDays(-30, 0, 0),
    status: 'ACCEPTED',
  },
  {
    applicationCandidateEmail: 'karthik.candidate@test.dev',
    jobTitle: 'Backend Engineer (Payments)',
    salaryAmount: 92_000_00,
    salaryCurrency: 'USD',
    joiningDate: addDays(30, 0, 0),
    expiresAt: addDays(-7, 0, 0),
    status: 'SENT',
  },
  {
    applicationCandidateEmail: 'rohit.candidate@test.dev',
    jobTitle: 'Platform Engineer (Kubernetes)',
    salaryAmount: 98_000_00,
    salaryCurrency: 'EUR',
    joiningDate: addDays(-10, 0, 0),
    expiresAt: addDays(-30, 0, 0),
    status: 'ACCEPTED',
  },
  {
    applicationCandidateEmail: 'meera.candidate@test.dev',
    jobTitle: 'Data Engineer',
    salaryAmount: 128_000_00,
    salaryCurrency: 'USD',
    joiningDate: addDays(21, 0, 0),
    expiresAt: addDays(-3, 0, 0),
    status: 'SENT',
  },
  {
    applicationCandidateEmail: 'vikram.candidate@test.dev',
    jobTitle: 'Product Designer',
    salaryAmount: 78_000_00,
    salaryCurrency: 'USD',
    joiningDate: addDays(-18, 0, 0),
    expiresAt: addDays(-30, 0, 0),
    status: 'ACCEPTED',
  },
];

// --- Helpers --------------------------------------------------------------
function addDays(deltaDays: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + deltaDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function isoDaysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// --- Run -----------------------------------------------------------------

async function main() {
  console.warn('⚙️  Seeding HirePilot demo data (rich edition)…');

  // Wipe existing demo data (idempotent re-runs).
  // Order: leaf tables first, then parents.
  const userEmails = USERS.map((u) => u.email);
  const companySlugs = COMPANIES.map((c) => c.slug);

  // Find company IDs first (referenced by jobs / assessments).
  const existingCompanies = await prisma.company.findMany({
    where: { slug: { in: companySlugs } },
    select: { id: true },
  });
  const companyIds = existingCompanies.map((c) => c.id);

  await prisma.notification.deleteMany({ where: { user: { email: { in: userEmails } } } });
  await prisma.offerLetter.deleteMany({ where: { candidate: { email: { in: userEmails } } } });
  await prisma.interviewFeedback.deleteMany({
    where: { interviewer: { email: { in: userEmails } } },
  });
  await prisma.interviewParticipant.deleteMany({ where: { user: { email: { in: userEmails } } } });
  await prisma.interview.deleteMany({
    where: { application: { candidate: { email: { in: userEmails } } } },
  });
  await prisma.assessmentAttempt.deleteMany({
    where: { candidate: { email: { in: userEmails } } },
  });
  await prisma.application.deleteMany({ where: { candidate: { email: { in: userEmails } } } });
  await prisma.assessmentQuestion.deleteMany({
    where: { assessment: { companyId: { in: companyIds } } },
  });
  await prisma.assessment.deleteMany({ where: { companyId: { in: companyIds } } });
  await prisma.job.deleteMany({ where: { companyId: { in: companyIds } } });
  await prisma.auditLog.deleteMany({ where: { actor: { email: { in: userEmails } } } });
  await prisma.recruiterProfile.deleteMany({ where: { user: { email: { in: userEmails } } } });
  await prisma.candidateProfile.deleteMany({ where: { user: { email: { in: userEmails } } } });
  await prisma.company.deleteMany({ where: { slug: { in: companySlugs } } });
  await prisma.user.deleteMany({ where: { email: { in: userEmails } } });

  // Users
  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: isoDaysAgo(30),
        lastLoginAt: roleIsNonCandidate(u.role) ? isoDaysAgo(1) : isoDaysAgo(2),
      },
    });
    // Wire role-scoped entity to its company.
    if (roleIsNonCandidate(u.role) && u.company) {
      const company = await prisma.company.findUnique({ where: { slug: u.company } });
      if (company) {
        await prisma.user.update({
          where: { id: user.id },
          data: { companyId: company.id },
        });
      }
    }
    console.warn(`  • user  ${u.email.padEnd(36)}  (${u.role})`);
  }

  // Candidates get a profile with skills + headline + totalExperienceYears.
  for (const c of CANDIDATES) {
    const user = await prisma.user.findUnique({ where: { email: c.email } });
    if (!user) continue;
    await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        headline: c.headline,
        skills: c.skills,
        totalExperienceYears: c.years,
        profileCompletionPct: 90,
        resumeUpdatedAt: isoDaysAgo(7),
      },
    });
  }

  // Recruiter profiles.
  for (const r of [RECRUITER_Riya, RECRUITER_Rohan, RECRUITER_Neha]) {
    const user = await prisma.user.findUnique({ where: { email: r.email } });
    if (!user) continue;
    await prisma.recruiterProfile.create({
      data: {
        userId: user.id,
        title: 'Senior Technical Recruiter',
        department: 'People',
        seniority: 'Senior',
      },
    });
  }

  // Companies
  const companyBySlug = new Map<string, { id: string; name: string }>();
  for (const c of COMPANIES) {
    const created = await prisma.company.create({
      data: {
        name: c.name,
        slug: c.slug,
        website: c.website,
        industry: c.industry,
        size: c.size,
        description: c.description,
        officeLocations: c.officeLocations,
      },
    });
    companyBySlug.set(c.slug, { id: created.id, name: created.name });
    console.warn(`  • co    ${c.name}`);
  }

  // Jobs
  const postedByByEmail = new Map<string, string>();
  const jobsByTitle = new Map<string, { id: string; companyId: string; title: string }>();
  for (const j of JOBS) {
    if (!postedByByEmail.has(j.postedByEmail)) {
      const user = await prisma.user.findUnique({ where: { email: j.postedByEmail } });
      if (!user) continue;
      postedByByEmail.set(j.postedByEmail, user.id);
    }
    const postedById = postedByByEmail.get(j.postedByEmail)!;
    const company = companyBySlug.get(j.companySlug);
    if (!company) continue;

    const status = j.status ?? 'OPEN';
    const created = await prisma.job.create({
      data: {
        companyId: company.id,
        postedById,
        title: j.title,
        department: j.department,
        location: j.location,
        workMode: j.workMode,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: j.salaryCurrency,
        employmentType: j.employmentType,
        experienceLevel: j.experienceLevel,
        experienceYears: j.experienceYears,
        skillsRequired: j.skillsRequired,
        description: j.description,
        requirements: j.requirements,
        benefits: j.benefits,
        status,
        publishedAt: status === 'OPEN' || status === 'PAUSED' ? isoDaysAgo(j.postedDaysAgo) : null,
        deadline: isoDaysAgo(-30),
      },
    });
    jobsByTitle.set(j.title, {
      id: created.id,
      companyId: created.companyId,
      title: created.title,
    });
    console.warn(`  • job   ${j.title.padEnd(42)} @ ${j.companySlug}`);
  }

  // Assessments (and their questions)
  const assessmentByTitle = new Map<string, string>();
  for (const a of ASSESSMENTS) {
    const user = await prisma.user.findUnique({ where: { email: a.createdByEmail } });
    const company = companyBySlug.get(a.companySlug);
    if (!user || !company) continue;
    const created = await prisma.assessment.create({
      data: {
        companyId: company.id,
        createdById: user.id,
        title: a.title,
        description: a.description,
        durationMinutes: a.durationMinutes,
        passingScore: a.passingScore,
        status: a.status,
        type: 'MCQ',
        questions: {
          create: a.questions.map((q, idx) => ({
            type: q.type,
            prompt: q.prompt,
            options:
              'options' in q ? (q.options as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
            solution: 'solution' in q ? q.solution : null,
            starterCode: 'starterCode' in q ? q.starterCode : null,
            language: 'language' in q ? q.language : null,
            points: q.points,
            orderIndex: idx,
          })),
        },
      },
    });
    assessmentByTitle.set(a.title, created.id);
    console.warn(`  • ass   ${a.title}  (${a.questions.length} questions)`);
  }

  // Applications (with stageHistory JSON so the Kanban timeline shows it)
  const appByCandidateAndJob = new Map<string, string>();
  for (const a of APPLICATIONS) {
    const candidate = await prisma.user.findUnique({ where: { email: a.candidateEmail } });
    const job = jobsByTitle.get(a.jobTitle);
    if (!candidate || !job) continue;

    const appliedAt = isoDaysAgo(a.daysAgo);
    const stageHistory = [
      { from: null, to: 'APPLIED', by: candidate.id, at: appliedAt.toISOString() },
    ];
    if (a.stage !== 'APPLIED') {
      stageHistory.push({
        from: 'APPLIED',
        to: 'RESUME_SCREENING',
        by: candidate.id,
        at: isoDaysAgo(Math.max(0, a.daysAgo - 1)).toISOString(),
      });
    }
    if (
      ['SHORTLISTED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'OFFER', 'HIRED'].includes(a.stage)
    ) {
      stageHistory.push({
        from: 'RESUME_SCREENING',
        to: 'SHORTLISTED',
        by: candidate.id,
        at: isoDaysAgo(Math.max(0, a.daysAgo - 2)).toISOString(),
      });
    }
    if (['TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'OFFER', 'HIRED'].includes(a.stage)) {
      stageHistory.push({
        from: 'SHORTLISTED',
        to: 'TECHNICAL_INTERVIEW',
        by: candidate.id,
        at: isoDaysAgo(Math.max(0, a.daysAgo - 3)).toISOString(),
      });
    }
    if (['HR_INTERVIEW', 'OFFER', 'HIRED'].includes(a.stage)) {
      stageHistory.push({
        from: 'TECHNICAL_INTERVIEW',
        to: 'HR_INTERVIEW',
        by: candidate.id,
        at: isoDaysAgo(Math.max(0, a.daysAgo - 4)).toISOString(),
      });
    }
    if (['OFFER', 'HIRED'].includes(a.stage)) {
      stageHistory.push({
        from: 'HR_INTERVIEW',
        to: 'OFFER',
        by: candidate.id,
        at: isoDaysAgo(Math.max(0, a.daysAgo - 5)).toISOString(),
      });
    }
    if (a.stage === 'HIRED') {
      stageHistory.push({
        from: 'OFFER',
        to: 'HIRED',
        by: candidate.id,
        at: isoDaysAgo(Math.max(0, a.daysAgo - 6)).toISOString(),
      });
    }
    if (a.stage === 'REJECTED') {
      stageHistory.push({
        from: 'APPLIED',
        to: 'REJECTED',
        by: candidate.id,
        at: isoDaysAgo(Math.max(0, a.daysAgo - 1)).toISOString(),
      });
    }

    const created = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        stage: a.stage,
        appliedAt,
        updatedAt: appliedAt,
        coverLetter: a.coverLetter,
        source: 'public_board',
        stageHistory: stageHistory as unknown as Prisma.InputJsonValue,
      },
    });
    appByCandidateAndJob.set(`${a.candidateEmail}::${a.jobTitle}`, created.id);
  }
  console.warn(`  • apps  ${appByCandidateAndJob.size} applications seeded`);

  // Audit log entries: every privileged action (job created, application
  // stage moved, offer sent, etc.) writes an entry. For the demo we seed
  // a realistic mix so the admin Audit Log page isn't empty.
  type AuditEntry = {
    actorEmail: string;
    action: string;
    resource: string;
    resourceId: string;
    daysAgo: number;
    newValue?: Record<string, unknown>;
  };
  const auditEntries: AuditEntry[] = [
    {
      actorEmail: ADMIN.email,
      action: 'user.role.changed',
      resource: 'User',
      resourceId: 'adhoc',
      daysAgo: 30,
      newValue: { from: 'CANDIDATE', to: 'HIRING_MANAGER' },
    },
    {
      actorEmail: RECRUITER_Riya.email,
      action: 'job.created',
      resource: 'Job',
      resourceId: 'adhoc',
      daysAgo: 7,
    },
    {
      actorEmail: RECRUITER_Rohan.email,
      action: 'job.created',
      resource: 'Job',
      resourceId: 'adhoc',
      daysAgo: 10,
    },
    {
      actorEmail: RECRUITER_Neha.email,
      action: 'job.created',
      resource: 'Job',
      resourceId: 'adhoc',
      daysAgo: 15,
    },
    {
      actorEmail: RECRUITER_Riya.email,
      action: 'application.stage.moved',
      resource: 'Application',
      resourceId: 'adhoc',
      daysAgo: 4,
    },
    {
      actorEmail: RECRUITER_Rohan.email,
      action: 'application.stage.moved',
      resource: 'Application',
      resourceId: 'adhoc',
      daysAgo: 6,
    },
    {
      actorEmail: INTERVIEWER_Ishaan.email,
      action: 'interview.feedback.submitted',
      resource: 'Interview',
      resourceId: 'adhoc',
      daysAgo: 18,
    },
    {
      actorEmail: RECRUITER_Riya.email,
      action: 'offer.sent',
      resource: 'OfferLetter',
      resourceId: 'adhoc',
      daysAgo: 22,
    },
    {
      actorEmail: RECRUITER_Riya.email,
      action: 'offer.accepted',
      resource: 'OfferLetter',
      resourceId: 'adhoc',
      daysAgo: 18,
    },
    {
      actorEmail: ADMIN.email,
      action: 'user.suspended',
      resource: 'User',
      resourceId: 'adhoc',
      daysAgo: 45,
    },
    {
      actorEmail: RECRUITER_Riya.email,
      action: 'job.updated',
      resource: 'Job',
      resourceId: 'adhoc',
      daysAgo: 3,
    },
    {
      actorEmail: RECRUITER_Rohan.email,
      action: 'job.updated',
      resource: 'Job',
      resourceId: 'adhoc',
      daysAgo: 5,
    },
    {
      actorEmail: RECRUITER_Neha.email,
      action: 'job.deleted',
      resource: 'Job',
      resourceId: 'adhoc',
      daysAgo: 60,
    },
    {
      actorEmail: ADMIN.email,
      action: 'settings.updated',
      resource: 'Setting',
      resourceId: 'adhoc',
      daysAgo: 14,
    },
    {
      actorEmail: RECRUITER_Riya.email,
      action: 'assessment.created',
      resource: 'Assessment',
      resourceId: 'adhoc',
      daysAgo: 9,
    },
    {
      actorEmail: RECRUITER_Rohan.email,
      action: 'assessment.created',
      resource: 'Assessment',
      resourceId: 'adhoc',
      daysAgo: 12,
    },
    {
      actorEmail: INTERVIEWER_PriyaS.email,
      action: 'interview.feedback.submitted',
      resource: 'Interview',
      resourceId: 'adhoc',
      daysAgo: 2,
    },
    {
      actorEmail: INTERVIEWER_Vikram.email,
      action: 'interview.feedback.submitted',
      resource: 'Interview',
      resourceId: 'adhoc',
      daysAgo: 1,
    },
    {
      actorEmail: RECRUITER_Riya.email,
      action: 'interview.scheduled',
      resource: 'Interview',
      resourceId: 'adhoc',
      daysAgo: 5,
    },
    {
      actorEmail: RECRUITER_Rohan.email,
      action: 'interview.scheduled',
      resource: 'Interview',
      resourceId: 'adhoc',
      daysAgo: 7,
    },
    {
      actorEmail: RECRUITER_Neha.email,
      action: 'application.stage.moved',
      resource: 'Application',
      resourceId: 'adhoc',
      daysAgo: 2,
    },
  ];
  for (const e of auditEntries) {
    const actor = await prisma.user.findUnique({ where: { email: e.actorEmail } });
    if (!actor) continue;
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: e.action,
        resource: e.resource,
        resourceId: e.resourceId,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (HirePilot Demo)',
        newValue: e.newValue as unknown as Prisma.InputJsonValue,
        createdAt: isoDaysAgo(e.daysAgo),
      },
    });
  }
  console.warn(`  • audit ${auditEntries.length} audit log entries`);

  // Interviews (and feedback for COMPLETED ones)
  for (const iv of INTERVIEWS) {
    const applicationId = appByCandidateAndJob.get(
      `${iv.applicationCandidateEmail}::${iv.jobTitle}`,
    );
    const candidate = await prisma.user.findUnique({
      where: { email: iv.applicationCandidateEmail },
    });
    if (!applicationId || !candidate) continue;

    const job = jobsByTitle.get(iv.jobTitle);
    if (!job) continue;

    const company = companyBySlug.get(JOBS.find((j) => j.title === iv.jobTitle)?.companySlug ?? '');
    if (!company) continue;

    const interviewerIds: string[] = [];
    for (const ie of iv.interviewerEmails) {
      const interviewer = await prisma.user.findUnique({ where: { email: ie } });
      if (interviewer) interviewerIds.push(interviewer.id);
    }
    if (interviewerIds.length === 0) continue;

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        type: iv.type,
        scheduledAt: iv.scheduledAt,
        durationMins: iv.durationMins,
        platform: iv.platform,
        meetingLink: `https://meet.google.com/demo-${candidate.id.slice(-6)}-${iv.type.toLowerCase()}`,
        location: iv.platform === 'OTHER' ? 'Acme HQ, Bengaluru' : null,
        status: iv.status,
        participants: {
          create: interviewerIds.map((id) => ({ userId: id, role: 'INTERVIEWER' })),
        },
      },
    });

    if (iv.feedback) {
      const interviewer = await prisma.user.findUnique({
        where: { email: iv.feedback.interviewerEmail },
      });
      if (interviewer) {
        await prisma.interviewFeedback.create({
          data: {
            interviewId: interview.id,
            interviewerId: interviewer.id,
            technicalSkills: iv.feedback.technicalSkills,
            communication: iv.feedback.communication,
            problemSolving: iv.feedback.problemSolving,
            teamwork: iv.feedback.teamwork,
            leadership: iv.feedback.leadership,
            overallRating: iv.feedback.overallRating,
            recommendation: iv.feedback.recommendation,
            comments: iv.feedback.comments,
          },
        });
      }
    }
  }
  console.warn(`  • intv  ${INTERVIEWS.length} interviews seeded`);

  // Offer letters (for OFFER + HIRED applications)
  for (const o of OFFERS) {
    const applicationId = appByCandidateAndJob.get(`${o.applicationCandidateEmail}::${o.jobTitle}`);
    const job = jobsByTitle.get(o.jobTitle);
    const candidate = await prisma.user.findUnique({
      where: { email: o.applicationCandidateEmail },
    });
    if (!applicationId || !job || !candidate) continue;

    const recruiter = await prisma.user.findUnique({ where: { email: RECRUITER_Riya.email } });
    if (!recruiter) continue;

    await prisma.offerLetter.create({
      data: {
        applicationId,
        candidateId: candidate.id,
        companyId: job.companyId,
        candidateNameSnapshot: candidate.name ?? candidate.email,
        roleSnapshot: job.title,
        salaryAmount: o.salaryAmount,
        salaryCurrency: o.salaryCurrency,
        joiningDate: o.joiningDate,
        expiresAt: o.expiresAt,
        location: 'Hybrid — Bengaluru, IN',
        benefits: [
          'Remote-first',
          'Equity',
          '30 days PTO',
          '$2k learning budget',
          'Comprehensive health insurance',
        ],
        templateUsed: 'standard-v1',
        bodyMarkdown: `We are delighted to offer you the role of ${job.title}. This letter outlines the terms of your employment with us.`,
        status: o.status,
        sentAt: isoDaysAgo(o.status === 'ACCEPTED' ? 25 : 7),
        respondedAt: o.status === 'ACCEPTED' ? isoDaysAgo(20) : null,
      },
    });
  }
  console.warn(`  • offer ${OFFERS.length} offer letters seeded`);

  // Notifications for every user: stage changes, interview reminders, etc.
  type NotifSeed = {
    userEmail: string;
    type:
      | 'NEW_APPLICATION'
      | 'STAGE_CHANGED'
      | 'INTERVIEW_SCHEDULED'
      | 'ASSESSMENT_ASSIGNED'
      | 'OFFER_RECEIVED'
      | 'OFFER_ACCEPTED'
      | 'OFFER_REJECTED'
      | 'ASSESSMENT_GRADED'
      | 'PROFILE_COMPLETE';
    title: string;
    message: string;
    link: string;
    daysAgo: number;
    read?: boolean;
  };
  const notifications: NotifSeed[] = [
    // Recruiter notifications
    {
      userEmail: RECRUITER_Riya.email,
      type: 'NEW_APPLICATION',
      title: 'New application',
      message: 'Arjun Mehta applied for Senior Full-Stack Engineer',
      link: '/recruiter/pipeline',
      daysAgo: 12,
    },
    {
      userEmail: RECRUITER_Riya.email,
      type: 'STAGE_CHANGED',
      title: 'Candidate moved',
      message: 'Arjun Mehta → Technical Interview',
      link: '/recruiter/pipeline',
      daysAgo: 8,
    },
    {
      userEmail: RECRUITER_Riya.email,
      type: 'OFFER_ACCEPTED',
      title: 'Offer accepted',
      message: 'Priya Subramaniam accepted the Engineering Manager offer',
      link: '/recruiter/companies',
      daysAgo: 18,
    },
    {
      userEmail: RECRUITER_Rohan.email,
      type: 'NEW_APPLICATION',
      title: 'New application',
      message: 'Karthik Raman applied for Backend Engineer (Payments)',
      link: '/recruiter/pipeline',
      daysAgo: 14,
    },
    {
      userEmail: RECRUITER_Rohan.email,
      type: 'STAGE_CHANGED',
      title: 'Candidate moved',
      message: 'Rohit Verma → Onsite',
      link: '/recruiter/pipeline',
      daysAgo: 20,
    },
    {
      userEmail: RECRUITER_Neha.email,
      type: 'NEW_APPLICATION',
      title: 'New application',
      message: 'Meera Iyer applied for Data Engineer',
      link: '/recruiter/pipeline',
      daysAgo: 11,
    },
    {
      userEmail: RECRUITER_Neha.email,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview scheduled',
      message: 'Meera Iyer — Data Engineer technical round',
      link: '/recruiter/interviews',
      daysAgo: 2,
    },
    // HM notifications
    {
      userEmail: HM_HirePilot.email,
      type: 'STAGE_CHANGED',
      title: 'Awaiting your decision',
      message: '2 candidates ready for your review at HirePilot Demo',
      link: '/hiring-manager/dashboard',
      daysAgo: 1,
    },
    {
      userEmail: HM_HirePilot.email,
      type: 'NEW_APPLICATION',
      title: 'New application',
      message: 'Arjun Mehta applied for Engineering Manager',
      link: '/hiring-manager/shortlist',
      daysAgo: 8,
    },
    {
      userEmail: HM_Acme.email,
      type: 'STAGE_CHANGED',
      title: 'Awaiting your decision',
      message: 'Rohit Verma reached OFFER at Acme',
      link: '/hiring-manager/shortlist',
      daysAgo: 9,
    },
    // Interviewer notifications
    {
      userEmail: INTERVIEWER_Ishaan.email,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Upcoming interview',
      message: 'Arjun Mehta — Engineering Manager panel in 3 days',
      link: '/interviewer/assignments',
      daysAgo: 1,
    },
    {
      userEmail: INTERVIEWER_Ishaan.email,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Upcoming interview',
      message: 'Ananya Sharma — Senior Frontend Engineer HR round',
      link: '/interviewer/assignments',
      daysAgo: 1,
    },
    {
      userEmail: INTERVIEWER_PriyaS.email,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Upcoming interview',
      message: 'Rohit Verma — Senior SRE technical round today',
      link: '/interviewer/assignments',
      daysAgo: 0,
    },
    {
      userEmail: INTERVIEWER_Vikram.email,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Upcoming interview',
      message: 'Karthik Raman — Backend Engineer HR round in 5 days',
      link: '/interviewer/assignments',
      daysAgo: 0,
    },
    {
      userEmail: INTERVIEWER_Vikram.email,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Upcoming interview',
      message: 'Vikram Joshi — Lead Product Designer panel in 2 days',
      link: '/interviewer/assignments',
      daysAgo: 0,
    },
    // Candidate notifications
    {
      userEmail: 'arjun.candidate@test.dev',
      type: 'STAGE_CHANGED',
      title: 'Application update',
      message: 'You moved to Technical Interview at HirePilot Demo',
      link: '/applications',
      daysAgo: 11,
    },
    {
      userEmail: 'arjun.candidate@test.dev',
      type: 'OFFER_RECEIVED',
      title: 'You received an offer',
      message: 'Northwind Tech offered you Senior Frontend Engineer',
      link: '/applications',
      daysAgo: 4,
    },
    {
      userEmail: 'arjun.candidate@test.dev',
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview scheduled',
      message: 'HR interview at HirePilot Demo in 2 days',
      link: '/applications',
      daysAgo: 1,
    },
    {
      userEmail: 'priya.candidate@test.dev',
      type: 'STAGE_CHANGED',
      title: 'Application update',
      message: 'You moved to HIRED at HirePilot Demo',
      link: '/applications',
      daysAgo: 19,
    },
    {
      userEmail: 'priya.candidate@test.dev',
      type: 'OFFER_RECEIVED',
      title: 'You received an offer',
      message: 'Acme Corp offered you Engineering Manager — Tooling',
      link: '/applications',
      daysAgo: 9,
    },
    {
      userEmail: 'karthik.candidate@test.dev',
      type: 'OFFER_RECEIVED',
      title: 'You received an offer',
      message: 'Helios Finance offered you Backend Engineer (Payments)',
      link: '/applications',
      daysAgo: 5,
    },
    {
      userEmail: 'ananya.candidate@test.dev',
      type: 'STAGE_CHANGED',
      title: 'Application update',
      message: 'You moved to HR Interview at Northwind Tech',
      link: '/applications',
      daysAgo: 7,
    },
    {
      userEmail: 'rohit.candidate@test.dev',
      type: 'STAGE_CHANGED',
      title: 'Application update',
      message: 'You moved to HIRED at Acme Corp',
      link: '/applications',
      daysAgo: 22,
    },
    {
      userEmail: 'meera.candidate@test.dev',
      type: 'OFFER_RECEIVED',
      title: 'You received an offer',
      message: 'Northwind Tech offered you Data Engineer',
      link: '/applications',
      daysAgo: 7,
    },
    {
      userEmail: 'vikram.candidate@test.dev',
      type: 'STAGE_CHANGED',
      title: 'Application update',
      message: 'You moved to HIRED at HirePilot Demo',
      link: '/applications',
      daysAgo: 20,
    },
    {
      userEmail: 'kavita.candidate@test.dev',
      type: 'STAGE_CHANGED',
      title: 'Application update',
      message: 'You moved to HR Interview at Northwind Tech',
      link: '/applications',
      daysAgo: 9,
    },
  ];
  for (const n of notifications) {
    const user = await prisma.user.findUnique({ where: { email: n.userEmail } });
    if (!user) continue;
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read ?? false,
        readAt: n.read ? isoDaysAgo(n.daysAgo - 1) : null,
        createdAt: isoDaysAgo(n.daysAgo),
      },
    });
  }
  console.warn(`  • notif ${notifications.length} notifications seeded`);

  // Assessment attempts: a few candidates have completed the
  // recruiter's screen.
  const baseAssessments = Array.from(assessmentByTitle.entries());
  let attemptsCreated = 0;
  for (const candidate of CANDIDATES) {
    for (let i = 0; i < baseAssessments.length; i++) {
      const [assessmentTitle, assessmentId] = baseAssessments[i]!;
      if ((candidate.email.charCodeAt(0) + i) % 3 !== 0) continue; // sparse
      const cumUser = await prisma.user.findUnique({ where: { email: candidate.email } });
      if (!cumUser) continue;
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId: cumUser.id },
      });
      if (!candidateProfile) continue;
      const appId = Array.from(appByCandidateAndJob.entries()).find(([k]) =>
        k.startsWith(candidate.email),
      )?.[1];
      await prisma.assessmentAttempt.create({
        data: {
          assessmentId,
          applicationId: appId,
          candidateId: cumUser.id,
          status: 'GRADED',
          startedAt: isoDaysAgo(5),
          submittedAt: isoDaysAgo(5),
          gradedAt: isoDaysAgo(5),
          score: 60 + ((candidate.email.charCodeAt(0) + i * 7) % 35),
          maxScore: 100,
          expiresAt: isoDaysAgo(5),
          tabSwitchCount: 0,
        },
      });
      attemptsCreated++;
    }
  }
  console.warn(`  • attm  ${attemptsCreated} assessment attempts seeded`);

  console.warn(`\n✅ Done. Demo password for all accounts: ${DEMO_PASSWORD}`);
  console.warn('\nAccounts you can log in with:');
  for (const r of [
    { email: ADMIN.email, role: 'Admin' },
    { email: RECRUITER_Riya.email, role: 'Recruiter (HirePilot)' },
    { email: RECRUITER_Rohan.email, role: 'Recruiter (Acme)' },
    { email: RECRUITER_Neha.email, role: 'Recruiter (Northwind)' },
    { email: HM_HirePilot.email, role: 'Hiring Manager (HirePilot)' },
    { email: HM_Acme.email, role: 'Hiring Manager (Acme)' },
    { email: INTERVIEWER_Ishaan.email, role: 'Interviewer (HirePilot)' },
    { email: INTERVIEWER_PriyaS.email, role: 'Interviewer (Acme)' },
    { email: INTERVIEWER_Vikram.email, role: 'Interviewer (Northwind)' },
    { email: 'arjun.candidate@test.dev', role: 'Candidate (full-stack)' },
    { email: 'priya.candidate@test.dev', role: 'Candidate (EM)' },
    { email: 'karthik.candidate@test.dev', role: 'Candidate (backend)' },
    { email: 'ananya.candidate@test.dev', role: 'Candidate (frontend)' },
    { email: 'rohit.candidate@test.dev', role: 'Candidate (DevOps)' },
    { email: 'meera.candidate@test.dev', role: 'Candidate (data)' },
    { email: 'vikram.candidate@test.dev', role: 'Candidate (designer)' },
    { email: 'kavita.candidate@test.dev', role: 'Candidate (QA)' },
  ]) {
    console.warn(`  ${r.email.padEnd(40)} ${r.role}`);
  }
}

function roleIsNonCandidate(role: string): boolean {
  return role !== 'CANDIDATE';
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
