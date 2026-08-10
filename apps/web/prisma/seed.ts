// Demo seed for local development + submission screenshots.
// Run: pnpm --filter web db:seed
//
// Idempotent — safe to re-run. Wipes only the seeded records.

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

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- Demo accounts -------------------------------------------------------
const DEMO_PASSWORD = 'Demo@12345';
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 12);

const ADMIN = { email: 'admin@hirepilot.dev', name: 'Admin Adi', role: 'ADMIN' as const };
const RECRUITER_Riya = {
  email: 'recruiter@hirepilot.dev',
  name: 'Riya Sharma',
  role: 'RECRUITER' as const,
};
const RECRUITER_Rohan = {
  email: 'recruiter@acme.test',
  name: 'Rohan Iyer',
  role: 'RECRUITER' as const,
};
const HM = { email: 'hm@hirepilot.dev', name: 'Hema Krishnan', role: 'HIRING_MANAGER' as const };
const INTERVIEWER = {
  email: 'interviewer@hirepilot.dev',
  name: 'Ishaan Mehta',
  role: 'INTERVIEWER' as const,
};
const CANDIDATE_Arjun = {
  email: 'arjun.candidate@test.dev',
  name: 'Arjun Mehta',
  role: 'CANDIDATE' as const,
};
const CANDIDATE_Priya = {
  email: 'priya.candidate@test.dev',
  name: 'Priya Subramaniam',
  role: 'CANDIDATE' as const,
};

const USERS = [
  ADMIN,
  RECRUITER_Riya,
  RECRUITER_Rohan,
  HM,
  INTERVIEWER,
  CANDIDATE_Arjun,
  CANDIDATE_Priya,
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
];

// --- Demo jobs -------------------------------------------------------------
const JOBS = [
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE' as const,
    salaryMin: 90_000,
    salaryMax: 130_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'SENIOR' as const,
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
  },
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Product Designer',
    department: 'Design',
    location: 'Bengaluru, IN (Hybrid)',
    workMode: 'HYBRID' as const,
    salaryMin: 60_000,
    salaryMax: 85_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'MID' as const,
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
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Platform Engineer (Kubernetes)',
    department: 'Infrastructure',
    location: 'Berlin, DE (Hybrid)',
    workMode: 'HYBRID' as const,
    salaryMin: 80_000,
    salaryMax: 110_000,
    salaryCurrency: 'EUR',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'SENIOR' as const,
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
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Junior Backend Engineer (New Grad)',
    department: 'Engineering',
    location: 'Remote (EU timezones)',
    workMode: 'REMOTE' as const,
    salaryMin: 45_000,
    salaryMax: 60_000,
    salaryCurrency: 'EUR',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'ENTRY' as const,
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
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Senior Frontend Engineer (React)',
    department: 'Engineering',
    location: 'Remote (Americas)',
    workMode: 'REMOTE' as const,
    salaryMin: 120_000,
    salaryMax: 160_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'SENIOR' as const,
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
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Riya.email,
    title: 'Data Engineer',
    department: 'Data',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE' as const,
    salaryMin: 100_000,
    salaryMax: 140_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'SENIOR' as const,
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
  },
  {
    companySlug: 'acme-corp',
    postedByEmail: RECRUITER_Rohan.email,
    title: 'Engineering Manager — Tooling',
    department: 'Engineering',
    location: 'Bengaluru, IN (Onsite)',
    workMode: 'ONSITE' as const,
    salaryMin: 110_000,
    salaryMax: 150_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'LEAD' as const,
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
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Riya.email,
    title: 'DevRel Engineer',
    department: 'Marketing',
    location: 'Remote (Americas)',
    workMode: 'REMOTE' as const,
    salaryMin: 110_000,
    salaryMax: 140_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'SENIOR' as const,
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
  },
  {
    companySlug: 'hirepilot-demo',
    postedByEmail: RECRUITER_Riya.email,
    title: 'AI Engineer (NLP / Matching)',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    workMode: 'REMOTE' as const,
    salaryMin: 130_000,
    salaryMax: 180_000,
    salaryCurrency: 'USD',
    employmentType: 'FULL_TIME' as const,
    experienceLevel: 'LEAD' as const,
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
  },
  {
    companySlug: 'northwind-tech',
    postedByEmail: RECRUITER_Riya.email,
    title: 'QA Engineer (Contract)',
    department: 'Quality',
    location: 'Remote (EMEA)',
    workMode: 'REMOTE' as const,
    salaryMin: 50,
    salaryMax: 80,
    salaryCurrency: 'EUR',
    employmentType: 'CONTRACT' as const,
    experienceLevel: 'MID' as const,
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
  },
];

// --- Demo applications ---------------------------------------------------
// Each candidate applies to multiple roles across stages, so the Kanban has
// real data to show in the demo. Stages mirror the ApplicationStage enum.

const CANDIDATES_FOR_APPS = ['arjun.candidate@test.dev', 'priya.candidate@test.dev'];

const APPLICATIONS = [
  // Arjun (Senior Full-Stack Engineer focus)
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'hirepilot-demo',
    jobTitle: 'Senior Full-Stack Engineer',
    stage: 'APPLIED' as const,
    daysAgo: 1,
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'acme-corp',
    jobTitle: 'Platform Engineer (Kubernetes)',
    stage: 'RESUME_SCREENING' as const,
    daysAgo: 4,
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'northwind-tech',
    jobTitle: 'Senior Frontend Engineer (React)',
    stage: 'SHORTLISTED' as const,
    daysAgo: 6,
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'hirepilot-demo',
    jobTitle: 'AI Engineer (NLP / Matching)',
    stage: 'TECHNICAL_INTERVIEW' as const,
    daysAgo: 10,
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'northwind-tech',
    jobTitle: 'Data Engineer',
    stage: 'HR_INTERVIEW' as const,
    daysAgo: 12,
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'hirepilot-demo',
    jobTitle: 'Product Designer',
    stage: 'OFFER' as const,
    daysAgo: 16,
  },
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'acme-corp',
    jobTitle: 'Junior Backend Engineer (New Grad)',
    stage: 'REJECTED' as const,
    daysAgo: 20,
  },
  // Priya
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'acme-corp',
    jobTitle: 'Senior Full-Stack Engineer (Equiv)',
    stage: 'APPLIED' as const,
    daysAgo: 1,
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'northwind-tech',
    jobTitle: 'Senior Frontend Engineer (React)',
    stage: 'APPLIED' as const,
    daysAgo: 2,
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'hirepilot-demo',
    jobTitle: 'AI Engineer (NLP / Matching)',
    stage: 'RESUME_SCREENING' as const,
    daysAgo: 5,
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'acme-corp',
    jobTitle: 'Platform Engineer (Kubernetes)',
    stage: 'SHORTLISTED' as const,
    daysAgo: 8,
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'northwind-tech',
    jobTitle: 'DevRel Engineer',
    stage: 'TECHNICAL_INTERVIEW' as const,
    daysAgo: 11,
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'acme-corp',
    jobTitle: 'Engineering Manager — Tooling',
    stage: 'OFFER' as const,
    daysAgo: 14,
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'hirepilot-demo',
    jobTitle: 'Product Designer',
    stage: 'HIRED' as const,
    daysAgo: 25,
  },
  // A couple extras for visual density
  {
    candidateEmail: 'arjun.candidate@test.dev',
    companySlug: 'northwind-tech',
    jobTitle: 'DevRel Engineer',
    stage: 'APPLIED' as const,
    daysAgo: 1,
  },
  {
    candidateEmail: 'priya.candidate@test.dev',
    companySlug: 'northwind-tech',
    jobTitle: 'QA Engineer (Contract)',
    stage: 'APPLIED' as const,
    daysAgo: 2,
  },
];

// --- Run -----------------------------------------------------------------

async function main() {
  console.warn('⚙️  Seeding HirePilot demo data…');

  // Wipe existing demo data (idempotent re-runs)
  await prisma.job.deleteMany({
    where: { company: { slug: { in: COMPANIES.map((c) => c.slug) } } },
  });
  await prisma.company.deleteMany({ where: { slug: { in: COMPANIES.map((c) => c.slug) } } });
  await prisma.user.deleteMany({ where: { email: { in: USERS.map((u) => u.email) } } });

  // Users
  for (const u of USERS) {
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: new Date(),
      },
    });
    console.warn(`  • user  ${u.email}  (${u.role})`);
  }

  // Companies
  const companyBySlug = new Map<string, string>();
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
    companyBySlug.set(c.slug, created.id);
    console.warn(`  • co    ${c.name}`);
  }

  // Recruiter profiles (1 per recruiter)
  for (const u of [RECRUITER_Riya, RECRUITER_Rohan]) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: u.email } });
    await prisma.recruiterProfile.create({
      data: {
        userId: user.id,
        title: 'Senior Technical Recruiter',
        department: 'People',
        seniority: 'Senior',
      },
    });
  }

  // Jobs
  const postedByByEmail = new Map<string, string>();
  const jobsByTitle = new Map<string, string>();
  for (const j of JOBS) {
    if (!postedByByEmail.has(j.postedByEmail)) {
      const user = await prisma.user.findUniqueOrThrow({ where: { email: j.postedByEmail } });
      postedByByEmail.set(j.postedByEmail, user.id);
    }

    const postedById = postedByByEmail.get(j.postedByEmail)!;
    const companyId = companyBySlug.get(j.companySlug)!;

    const created = await prisma.job.create({
      data: {
        companyId,
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
        status: 'OPEN',
        publishedAt: new Date(),
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      },
    });
    jobsByTitle.set(j.title, created.id);
    console.warn(`  • job   ${created.title}  @ ${j.companySlug}`);
  }

  // Applications (for Kanban demo data)
  // First delete any existing applications tied to our seeded users/jobs.
  await prisma.application.deleteMany({
    where: {
      candidate: { email: { in: CANDIDATES_FOR_APPS } },
      jobId: { in: Array.from(jobsByTitle.values()) },
    },
  });

  for (const app of APPLICATIONS) {
    const candidate = await prisma.user.findUniqueOrThrow({ where: { email: app.candidateEmail } });
    const jobId = jobsByTitle.get(app.jobTitle);
    if (!jobId) continue;

    const appliedAt = new Date(Date.now() - app.daysAgo * 24 * 60 * 60 * 1000);
    await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        stage: app.stage,
        appliedAt,
        updatedAt: appliedAt,
        // Set a deterministic cover letter
        coverLetter: `Hi team,\n\nI'm excited to apply for the ${app.jobTitle} role. My background aligns well with what you're looking for, and I'd love to discuss how I can contribute.\n\nBest,\n${candidate.name}`,
        source: 'public_board',
      },
    });
    console.warn(`  • app   ${app.candidateEmail.split('@')[0]} -> ${app.jobTitle} (${app.stage})`);
  }

  console.warn(`\n✅ Done. Demo password for all accounts: ${DEMO_PASSWORD}`);
  console.warn('   Login as recruiter: recruiter@hirepilot.dev');
  console.warn('   Login as candidate: arjun.candidate@test.dev');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
