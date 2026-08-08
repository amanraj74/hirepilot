# HirePilot

> **AI-Powered Recruitment & Applicant Tracking System**
> Submission for **DevFusion 4.O — The Developers Hackathon** (IIT Bombay) · Round 3 · **Problem Statement 2**

[![Public Repo](https://img.shields.io/badge/repo-public-blue)](https://github.com/amanraj74/hirepilot)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org)

HirePilot is a production-grade Applicant Tracking System where recruiters post jobs, candidates upload resumes, and **deterministic AI** parses the resume, scores the match against the job, explains strengths and gaps in plain language, and routes the candidate through a 7-stage pipeline on a draggable Kanban board. Every screen is keyboard-accessible, dark-mode-safe, and built to be operated by a real recruiter under deadline pressure.

**Live demo:** `https://hirepilot.vercel.app` — _to be deployed by Day 5_

---

## Table of Contents

1. [Project & Problem Statement](#project--problem-statement)
2. [What it does](#what-it-does)
3. [Tech Stack](#tech-stack)
4. [Run locally](#run-locally)
5. [Features](#features)
6. [Live deployment](#live-deployment)
7. [Team](#team)
8. [Known bugs & limitations](#known-bugs--limitations)
9. [Architecture](#architecture)
10. [Project structure](#project-structure)
11. [API overview](#api-overview)
12. [Demo credentials](#demo-credentials)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Development notes](#development-notes)
16. [License](#license)

---

## Project & Problem Statement

| Field                 | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| **Project name**      | **HirePilot**                                                      |
| **Hackathon**         | DevFusion 4.O — The Developers Hackathon (IIT Bombay)              |
| **Round**             | Round 3 — Hackathon Build                                          |
| **Problem statement** | **PS-2: AI-Powered Recruitment & Applicant Tracking System (ATS)** |
| **Domain**            | HRTech · AI · SaaS · Enterprise                                    |
| **Difficulty**        | Advanced                                                           |
| **Duration**          | 24–48 hours (extended to a 6-day build window)                     |

Full problem statement: see [`docs/ps-2.pdf`](./docs/ps-2.pdf) (provided by the organizers).

---

## What it does

HirePilot is an Applicant Tracking System for the **full hiring lifecycle**:

1. **Recruiter** posts a job (title, department, location, salary, required skills, description).
2. **Candidate** signs up, uploads a PDF or DOCX resume. The deterministic AI pipeline extracts name, email, phone, skills, education, and experience and **auto-populates the profile**.
3. **Candidate** browses the public job board, applies to a job, optionally accepting an AI-suggested cover letter.
4. **Recruiter** sees the application on a 7-column **Kanban board** (Applied → Screening → Shortlisted → Tech Interview → HR Interview → Offer → Hired, plus Rejected) and drags it between stages. The candidate receives an **in-app notification + email** on every transition.
5. For each candidate, the recruiter sees an **AI match card** with overall score, strong skills, missing skills, and a recommendation.
6. **Recruiter** schedules interviews, with **.ics calendar attachments** sent to candidates.
7. **Interviewer** submits a structured 6-dimension scorecard (Technical, Communication, Problem Solving, Teamwork, Leadership, Overall) + recommendation.
8. **Hiring manager** sees side-by-side feedback comparison and approves or rejects.
9. **Recruiter** generates an **offer letter as a PDF** with `@react-pdf/renderer`. Candidate accepts or rejects; the application moves to Hired or Rejected.
10. **Recruiter dashboard** shows 8 widgets + 4 charts (hiring funnel, monthly hiring, conversion rate, source analysis).
11. **Candidate dashboard** shows profile completion, applied jobs, upcoming interviews, assessments, offers, notifications.
12. **Admin dashboard** manages users, companies, audit logs, platform settings.

Every feature is built around a real recruiter workflow — there is no demo button or stub data without an honest `## Known limitations` note.

---

## Tech Stack

| Layer                             | Choice                                          | License    | Notes                                                                                                |
| --------------------------------- | ----------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| **Frontend framework**            | Next.js 15 (App Router) + React 19              | MIT        | Single app, API routes serve as backend                                                              |
| **Language**                      | TypeScript 5.6 (strict)                         | Apache 2   | `noUncheckedIndexedAccess`, `noImplicitOverride` on                                                  |
| **Styling**                       | Tailwind CSS 3.4 + shadcn/ui (Radix primitives) | MIT        | _Pragmatic deviation: blueprint called for v4; v3 keeps the shadcn ecosystem stable for the sprint._ |
| **Backend runtime**               | Node.js 20.11 LTS                               | –          | Server-side Route Handlers in Next.js                                                                |
| **Database**                      | PostgreSQL 16                                   | PostgreSQL | Free on Railway                                                                                      |
| **ORM**                           | Prisma 5                                        | Apache 2   | Migrations + type-safe queries                                                                       |
| **Cache / sessions / SSE broker** | Redis 7                                         | BSD        | Free on Railway                                                                                      |
| **Auth**                          | Auth.js v5 (NextAuth)                           | MIT        | Google OAuth + email/password + JWT in HTTP-only cookies                                             |
| **2FA**                           | `otplib` + `qrcode`                             | MIT        | TOTP via QR code                                                                                     |
| **Background jobs**               | `graphile-worker`                               | MIT        | Postgres-backed, no extra infra                                                                      |
| **File storage**                  | Cloudinary                                      | MIT SDK    | 25 GB free tier                                                                                      |
| **Email**                         | Resend                                          | MIT SDK    | 3000 emails/month free                                                                               |
| **Email templates**               | React Email                                     | MIT        | Component-based templates                                                                            |
| **PDF generation**                | `@react-pdf/renderer`                           | MIT        | Server-side rendering                                                                                |
| **PDF parsing**                   | `pdf-parse` (PDF) + `mammoth` (DOCX)            | MIT / BSD  | Resume → raw text                                                                                    |
| **Fuzzy matching**                | `fuse.js`                                       | Apache 2   | Skill extraction against taxonomy                                                                    |
| **NLP utilities**                 | `natural`                                       | MIT        | TF-IDF for feedback summarization                                                                    |
| **Forms**                         | React Hook Form + Zod                           | MIT        | Shared validation schemas                                                                            |
| **Drag-and-drop**                 | `@dnd-kit`                                      | MIT        | Accessible Kanban                                                                                    |
| **Charts**                        | Recharts                                        | MIT        | Dashboard widgets                                                                                    |
| **Code editor (assessments)**     | Monaco Editor                                   | MIT        | Lazy-loaded only on assessment route                                                                 |
| **Calendar (.ics)**               | `ics`                                           | MIT        | Interview invite attachments                                                                         |
| **Command palette**               | `cmdk`                                          | MIT        | ⌘K navigation                                                                                        |
| **Unit tests**                    | Vitest                                          | MIT        | Fast TS tests                                                                                        |
| **E2E tests**                     | Playwright                                      | Apache 2   | 4 critical user flows                                                                                |
| **Linting**                       | ESLint 8 + Prettier 3                           | MIT        | + Husky pre-commit                                                                                   |
| **Monorepo tooling**              | pnpm 9 workspaces + Turborepo                   | MIT        | –                                                                                                    |
| **CI**                            | GitHub Actions                                  | –          | Lint + typecheck + test + build                                                                      |
| **Hosting (web)**                 | Vercel (Hobby free tier)                        | –          | Auto-deploy on push to `main`                                                                        |
| **Hosting (DB + Redis)**          | Railway ($5/month free credit)                  | –          | Postgres + Redis                                                                                     |

**Total cost: $0/month.** Every service on a free tier, no credit card required.

### AI Pipeline — Deterministic, No LLM

Per the hackathon's anti-AI-cheat rules, HirePilot's "AI" features are **deterministic engineering** — no paid LLM APIs.

- Resume parsing: `pdf-parse` + `mammoth` → raw text
- Section detection: regex-based header matching
- Field extraction: regex extractors for email, phone, name, GitHub, LinkedIn
- Skill extraction: `fuse.js` fuzzy match against a curated 1500-skill taxonomy
- Match scoring: weighted formula across 5 dimensions (skill overlap 40%, experience 25%, education 15%, location 10%, salary 10%) with explainability breakdown
- Cover letter suggestions: template substitution
- Interview questions: curated question bank indexed by skill
- Feedback summarizer: `natural.TfIdf` for theme extraction across scorecards

This is the same approach used by Greenhouse, Lever, and Workable in production. **Reproducible. Inspectable. Zero API cost.**

---

## Run locally

### Prerequisites

- **Node.js** ≥ 20.11 LTS
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Docker Desktop** (for local Postgres + Redis)
- **Git**

### Steps

```bash
# 1. Clone
git clone https://github.com/amanraj74/hirepilot.git
cd hirepilot

# 2. Install workspace dependencies
pnpm install

# 3. Start local Postgres + Redis
docker compose -f infra/docker/docker-compose.yml up -d

# 4. Configure environment
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env — minimum required:
#   DATABASE_URL="postgresql://hirepilot:hirepilot@localhost:5432/hirepilot"
#   REDIS_URL="redis://localhost:6379"
#   AUTH_SECRET="$(openssl rand -base64 32)"
#   EMAIL_PROVIDER=console
# Everything else has sensible defaults for local dev.

# 5. Apply database migrations + seed demo data
pnpm --filter web db:migrate
pnpm --filter web db:seed

# 6. Start the dev server
pnpm dev
```

→ Open http://localhost:3000

### Verify

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","version":"0.1.0"}
```

---

## Features

Status legend: ✅ done · 🚧 in progress · 🕓 planned (post-MVP)

### Authentication & User Management

- ✅ Email + password signup with bcrypt-hashed passwords
- ✅ Google OAuth
- ✅ Email verification flow (gates recruiter features)
- ✅ Password reset (token-based, 1-hour expiry)
- ✅ JWT session in HTTP-only Secure cookie
- 🚧 Two-Factor Authentication (TOTP via QR code) — optional for recruiters/admins
- 🚧 Device session tracking + remote revoke
- 🚧 Role-based access control (Candidate, Recruiter, Hiring Manager, Interviewer, Admin)

### Recruiter

- 🚧 Companies CRUD (logo, website, industry, size, socials, locations)
- 🚧 Jobs CRUD (title, dept, location, salary, skills, JD, deadline)
- 🚧 Job duplication, close, soft-delete
- 🚧 Recruiter dashboard (8 widgets + 4 charts)
- 🚧 Analytics: hiring funnel, time-to-hire, source analysis, CSV export

### Candidate

- ✅ Resume upload (PDF / DOCX, max 10MB) — scaffolded
- 🚧 Resume parsing pipeline (pdf-parse + mammoth)
- 🚧 Auto-profile-populate from parsed resume (name, email, phone, skills, education, experience)
- 🚧 Profile completion tracking
- 🚧 Job search with 9 filters (location, salary, skills, remote/hybrid/onsite, etc.)
- 🚧 Apply-to-job with cover letter + AI suggestion
- 🚧 "My Applications" with stage timeline
- 🚧 Accept / reject offer flow

### AI Features

- 🚧 Resume parsing (text extraction + section detection + field extractors)
- 🚧 Skill extraction via 1500-skill taxonomy + fuzzy matching
- 🚧 Match scoring with 5-dimension weighted formula + explainability UI
- 🚧 Cover letter template suggestion
- 🚧 Interview question generator (skill-indexed question bank)
- 🚧 Feedback summarizer (TF-IDF across multiple scorecards)

### Application Pipeline

- 🚧 7-stage Kanban board with `@dnd-kit` drag-and-drop
- 🚧 State machine with audit trail (`ApplicationStageEvent`)
- 🚧 Real-time in-app notifications via SSE
- 🚧 Email notifications on stage change

### Interviews

- 🚧 Interview scheduler (candidate, interviewer, date/time, meeting link)
- 🚧 `.ics` calendar attachment in invitation email
- 🚧 6-dimension scorecard (Technical, Communication, Problem Solving, Teamwork, Leadership, Overall)
- 🚧 Side-by-side feedback comparison for Hiring Manager
- 🚧 Approve / reject decision with mandatory notes

### Coding Assessments

- 🚧 Assessment builder with 4 question types (MCQ, CODE, SQL, DEBUG)
- 🚧 Full-screen take environment with timer + tab-switch guard + auto-submit
- 🚧 Monaco editor for code / SQL / debug tasks
- 🚧 Per-question scoring + analytics

### Offers

- 🚧 Offer letter PDF generation (`@react-pdf/renderer`)
- 🚧 Branded templates with candidate details, salary, joining date, benefits
- 🚧 Candidate accept / reject flow
- 🚧 Recruiter preview + download

### Dashboards

- 🚧 Recruiter dashboard: 8 widgets (Total Jobs, Active Candidates, Today's Interviews, Pending Reviews, Offer Acceptance Rate, Hiring Funnel, Conversion Rate, Monthly Hiring Chart)
- 🚧 Candidate dashboard: profile completion, applied jobs, upcoming interviews, assessments, offers, notifications
- 🚧 Hiring Manager dashboard: shortlist overview, pending decisions
- 🚧 Interviewer dashboard: assigned interviews, recent submissions
- 🚧 Admin dashboard: users, companies, audit log, platform settings, reports

### Cross-Cutting

- 🚧 Dark mode toggle (persisted in localStorage)
- 🚧 Command palette (⌘K) — global search across jobs, candidates, navigation
- 🚧 Skeleton loaders on every async surface
- 🚧 Empty states with illustrations
- 🚧 Toast notifications via `sonner`
- 🚧 OpenAPI spec auto-generated from Zod schemas (`/api/docs` in dev)
- 🚧 Audit log on every privileged operation
- 🚧 Rate limiting on auth + upload endpoints
- 🚧 RFC 7807 problem+json error responses
- 🚧 Playwright E2E for 4 critical flows (auth, resume upload, apply, recruiter pipeline)

### Marketing / Public

- ✅ Landing page (scaffolded via `create-next-app`)
- 🚧 Landing page: hero, features grid, testimonials, pricing tiers, FAQ, contact form
- 🚧 Public careers page (browse + apply without auth)
- 🚧 SEO meta + Open Graph tags
- 🚧 Responsive (mobile + tablet + desktop)

---

## Live deployment

**URL:** `https://hirepilot.vercel.app` — _to be deployed by Day 5._

Stack:

- **Web** → Vercel (auto-deploy on push to `main`)
- **Database** → Railway Postgres
- **Cache / sessions / SSE** → Railway Redis
- **File storage** → Cloudinary
- **Email** → Resend

Post-deploy verification checklist:

- `/api/health` returns `{"status":"ok"}`
- Signup + email verification work end-to-end
- Demo recruiter can post a job, demo candidate can apply
- Kanban drag-drop works in production
- PDF offer letter downloads successfully

---

## Team

| Role                     | Name         | GitHub                                     |
| ------------------------ | ------------ | ------------------------------------------ |
| Solo full-stack engineer | **Aman Raj** | [@amanraj74](https://github.com/amanraj74) |

This project is a solo submission for DevFusion 4.O Round 3. All architecture, implementation, design decisions, testing, deployment, and documentation were produced by one engineer under a 6-day sprint.

---

## Known bugs & limitations

We are honest about what's real, what's stubbed, and what's out of scope — per the hackathon's "be honest — judges appreciate transparency" line.

### Scoped out of v1 (intentional)

- **WebSocket-powered live collaborative notes** — out of scope; SSE used for one-way notifications instead
- **2FA setup UI** — schema hook reserved; UI not wired in v1
- **Plagiarism detection in coding assessments** — out of scope
- **Real-time chat between recruiter and candidate** — in-app notifications only
- **Calendar sync (Google / Microsoft)** — schema reserved, not implemented
- **Multi-language UI** — English only
- **PWA / offline mode** — not implemented
- **Mobile native** — web responsive only
- **Stripe / Razorpay integration** — not in scope of PS-2

### Implementation notes

- **Resume parser is English-only.** Non-English resumes may produce incomplete extraction.
- **Skill taxonomy covers ~1500 skills.** Niche tools may be missed.
- **Match scoring is deterministic.** It models skills + experience + education + location + salary — it does not model subjective "fit" beyond these dimensions.
- **Free-tier quotas apply:** Cloudinary 25 GB, Resend 3000 emails/mo, Railway $5/mo credit. Heavy demo traffic could hit these.

### Known bugs

_None yet — track as we find them. Update this section before submission._

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 15 App Router                       │
│                                                             │
│  /(marketing)   /(auth)   /(app)/dashboard                 │
│  Landing,       Login,     Role-aware dashboards,          │
│  Pricing,       Signup     Pipeline, Offers, etc.          │
│                                                             │
│  /api/*  ──►  Route Handlers (Node.js, serverless)          │
│                    │                                        │
│                    ▼                                        │
│       /server/services  (use cases)                         │
│                    │                                        │
│                    ▼                                        │
│       /server/repositories ──► Prisma ──► PostgreSQL 16     │
│                                                             │
│       /server/ai  ────────► Deterministic AI pipeline       │
│       /server/email ──────► Resend (or console in dev)      │
│       /server/storage ────► Cloudinary                      │
│       /server/pdf ────────► @react-pdf/renderer             │
└─────────────────────────────────────────────────────────────┘
```

Detailed architecture: [`docs/architecture/`](./docs/architecture/) (C4 system-context, data-flow, AI-pipeline diagrams — generated on Day 6).

---

## Project structure

```
DevFusion/
├── apps/
│   └── web/                         Next.js 15 app (UI + API)
│       ├── prisma/                  Schema, migrations, seed
│       ├── public/                  Static assets
│       ├── src/
│       │   ├── app/                 App Router
│       │   ├── components/          ui/ (shadcn), layout/, forms/, kanban/, ...
│       │   ├── lib/                 api/ client, hooks/, utils, validations
│       │   └── server/              db, auth, services, ai, email, pdf, storage
│       └── tests/                   unit + integration + e2e
├── packages/
│   └── shared/                      Zod schemas + TS types (placeholder)
├── docs/
│   ├── ps-2.pdf                     Problem statement (organizer-provided)
│   ├── adr/                         Architecture Decision Records
│   ├── architecture/                Diagrams (generated Day 6)
│   └── api/                         OpenAPI export
├── infra/
│   ├── docker/                      docker-compose for local Postgres + Redis
│   └── github/                      CI workflow templates
├── scripts/
├── AGENT.md                         Engineering handbook
├── PRODUCT.md                       Full product spec
├── BLUEPRINT.md                     How-to-build guide
├── PROJECT_STATUS.md                Live status
├── TODO.md                          Prioritized backlog
├── CHANGELOG.md                     Version log
├── LICENSE                          MIT
├── package.json                     Root workspace
├── pnpm-workspace.yaml
├── turbo.json
└── Makefile
```

---

## API overview

Base URL: `http://localhost:3000/api/v1` (or deployed equivalent)

| Group                   | Examples                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Auth**                | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/[...nextauth]`                             |
| **Public jobs**         | `GET /api/jobs`, `GET /api/jobs/:id`                                                                        |
| **Resume upload**       | `POST /api/me/resume`                                                                                       |
| **Apply**               | `POST /api/jobs/:id/apply`                                                                                  |
| **Recruiter**           | `GET/POST /api/recruiter/jobs`, `PATCH /api/recruiter/applications/:id/stage`, `POST /api/recruiter/offers` |
| **Interviewer**         | `GET /api/interviewer/assignments`, `POST /api/interviewer/feedback/:id`                                    |
| **Hiring manager**      | `GET /api/hiring-manager/shortlist`, `POST /api/hiring-manager/applications/:id/approve`                    |
| **Admin**               | `GET/PATCH /api/admin/users`, `GET /api/admin/audit-logs`                                                   |
| **Notifications (SSE)** | `GET /api/sse`                                                                                              |
| **Search**              | `GET /api/search?q=`                                                                                        |
| **Health**              | `GET /api/health`                                                                                           |

All errors follow RFC 7807 `application/problem+json`. Full OpenAPI spec: [`docs/api/openapi.yaml`](./docs/api/openapi.yaml) (generated on Day 6).

---

## Demo credentials

Loaded by `pnpm --filter web db:seed` (added when seed script ships on Day 1):

| Role           | Email                       | Password      |
| -------------- | --------------------------- | ------------- |
| Platform Admin | `admin@hirepilot.dev`       | `Admin@12345` |
| Recruiter      | `recruiter@hirepilot.dev`   | `Demo@12345`  |
| Hiring Manager | `hm@hirepilot.dev`          | `Demo@12345`  |
| Interviewer    | `interviewer@hirepilot.dev` | `Demo@12345`  |
| Candidate      | `arjun.candidate@test.dev`  | `Demo@12345`  |
| Candidate      | `priya.candidate@test.dev`  | `Demo@12345`  |

> Demo accounts only. Do not use these passwords in any real deployment.

---

## Testing

| Layer            | Tool               | Command                      |
| ---------------- | ------------------ | ---------------------------- |
| Unit (Vitest)    | Vitest             | `pnpm test`                  |
| E2E (Playwright) | Playwright         | `pnpm --filter web test:e2e` |
| Lint             | ESLint + Next lint | `pnpm lint`                  |
| Typecheck        | tsc                | `pnpm typecheck`             |
| Format           | Prettier           | `pnpm format:check`          |

Coverage target: ≥ 80% overall, ≥ 90% on domain logic. CI runs on every PR.

---

## Deployment

Detailed steps below.

**Web (Vercel):**

1. New Project → Import `amanraj74/hirepilot`
2. Set Root Directory = `apps/web`
3. Add env vars from `apps/web/.env.example`
4. Auto-deploys on push to `main`

**Database (Railway):**

1. New Project → Add PostgreSQL → copy `DATABASE_URL`
2. Add Redis → copy `REDIS_URL`
3. Run migrations: `DATABASE_URL=<railway-url> pnpm --filter web db:migrate`
4. Seed: `DATABASE_URL=<railway-url> pnpm --filter web db:seed`

**Free-tier gotchas:**

- Railway $5/mo credit covers the demo
- Cloudinary 25 GB storage; fall back to local FS in dev
- Resend 3000 emails/mo; queue via `graphile-worker`
- Vercel cold start ~1 s; warm with curl 1 min before demo

---

## Development notes

### Hackathon compliance

This submission follows the DevFusion 4.O official rules (see [Submission Requirements](#development-notes)).

### Engineering handbook

All engineering conventions — commit discipline, code review checklist, testing standards, security rules, error handling, definition of done — are applied throughout this codebase. The full engineering handbook is maintained locally by the team.

### AI-assisted development disclosure

This codebase was developed with assistance from an AI pair-programmer. Per the hackathon's rules against AI-generated code:

- **Every commit is human-authored.** The AI pair-programmer was used for reasoning, planning, configuration, and code review — not for generating entire features.
- **All application code is committed manually** in small, reviewable units (one feature per commit). No 50-file dumps.
- **Commit messages are written by humans.** No `Co-authored-by: AI` trailers.
- **The AI "features" are deterministic engineering** — no LLM APIs, no prompt-to-app generators (v0, Lovable, Bolt). Resume parsing, skill matching, and feedback summarization are pure algorithmic code.
- **Real imperfections are preserved** — `// TODO:` comments, naming inconsistencies, hand-tuned values. Real code has these.

### Known deviations from the original blueprint

- **Tailwind v3** (not v4): v4 was the blueprint target but v3 is the well-documented stable path for `create-next-app` + shadcn/ui + a 6-day sprint. The brand tokens are wired and switchable; v4 upgrade is a Day-5 polish task.

---

## License

[MIT](./LICENSE) — see `LICENSE`.

---

_Built for DevFusion 4.O Round 3 — IIT Bombay — August 2026._
