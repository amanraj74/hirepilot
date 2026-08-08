# HirePilot

> **AI-Powered Recruitment & Applicant Tracking System**
> Submission for **DevFusion 4.O — The Developers Hackathon** (IIT Bombay) · Round 3 · **Problem Statement 2**

HirePilot is a production-grade ATS where recruiters post jobs, candidates upload resumes, and deterministic AI parses the resume, scores the match against the job, explains strengths and gaps in plain language, and routes the candidate through a 7-stage pipeline on a draggable Kanban board. Every screen is keyboard-accessible, dark-mode-safe, and built to be operated by a real recruiter under deadline pressure.

> **Live demo:** _to be added before submission (see `BLUEPRINT.md` §15)_ > **Public repo:** _to be added before submission_

---

## Table of Contents

1. [Problem statement](#problem-statement)
2. [Highlights](#highlights)
3. [Architecture](#architecture)
4. [Tech stack](#tech-stack)
5. [Folder structure](#folder-structure)
6. [Quick start (local)](#quick-start-local)
7. [Environment variables](#environment-variables)
8. [Running locally](#running-locally)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [API overview](#api-overview)
12. [Demo credentials](#demo-credentials)
13. [Screenshots](#screenshots)
14. [Roadmap](#roadmap)
15. [Team](#team)
16. [Known bugs & limitations](#known-bugs--limitations)
17. [Contributing](#contributing)
18. [License](#license)

---

## Problem statement

Chosen problem: **PS-2 — AI-Powered Recruitment & Applicant Tracking System (ATS)**

> Recruitment today involves managing hundreds of applications, manually screening resumes, scheduling interviews, tracking candidate progress, collecting interviewer feedback, and communicating with applicants across multiple platforms. This process is often slow, repetitive, and inefficient.
>
> Build a production-ready AI-powered Applicant Tracking System that enables companies to manage the entire hiring lifecycle — from posting jobs to onboarding selected candidates — with secure authentication, role-based access, AI-assisted resume analysis, interview scheduling, coding assessments, and analytics.

Full problem statement: see `docs/ps-2.pdf` (or the original PDF in repo root).

## Highlights

- **AI resume parsing + matching without paid LLM APIs.** Deterministic pipeline: `pdf-parse` + `mammoth` → section detection → field extraction → fuzzy skill matching against a curated 1500-skill taxonomy → weighted match score with full breakdown (skill overlap, experience, education, location, salary).
- **7-stage Kanban pipeline** with drag-and-drop, audit trail, and automatic notifications on every transition.
- **5-role RBAC** (Candidate, Recruiter, Hiring Manager, Interviewer, Admin) with route-level enforcement.
- **Polished UI/UX** — dark + light themes, command palette (⌘K), skeleton loaders, empty states, toast notifications, keyboard shortcuts, accessible (WCAG 2.1 AA target).
- **Production deploy** on Vercel + Railway + Cloudinary + Resend. **Every service is free-tier with no credit card.**

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                     │
│                                                              │
│  /app/(marketing)   /app/(auth)   /app/(app)/dashboard       │
│  Landing, Pricing,  Login,        Role-aware dashboards,     │
│  Jobs public        Signup        Pipeline, Offers, etc.     │
│                                                              │
│  /app/api/*  ─►  Route Handlers (Node.js, serverless)        │
│                    │                                         │
│                    ▼                                         │
│       /server/services  (use cases)                          │
│                    │                                         │
│                    ▼                                         │
│       /server/repositories ──► Prisma ──► PostgreSQL 16      │
│                                                              │
│       /server/ai  ────────►  Deterministic AI pipeline       │
│                                                              │
│       /server/email ───────►  Resend (or console in dev)     │
│       /server/storage ─────►  Cloudinary (uploads)           │
│       /server/pdf ─────────►  @react-pdf/renderer            │
└──────────────────────────────────────────────────────────────┘
```

Full architecture in `docs/architecture/system-context.md` and data flow in `docs/architecture/data-flow.md`.

## Tech stack

| Layer          | Choice                              | License        |
| -------------- | ----------------------------------- | -------------- |
| Runtime        | Node.js 20.11 LTS                   | –              |
| Framework      | Next.js 15 (App Router)             | MIT            |
| Language       | TypeScript 5.6 (strict)             | Apache 2       |
| Styling        | Tailwind CSS v4 + shadcn/ui         | MIT            |
| Database       | PostgreSQL 16                       | PostgreSQL     |
| ORM            | Prisma 5                            | Apache 2       |
| Cache / queue  | Redis 7 + `graphile-worker`         | BSD / MIT      |
| Auth           | Auth.js v5 (NextAuth) + JWT cookies | MIT            |
| OAuth          | Google                              | –              |
| File storage   | Cloudinary                          | MIT SDK        |
| Email          | Resend                              | MIT SDK        |
| PDF read       | pdf-parse + mammoth                 | MIT / BSD      |
| PDF write      | @react-pdf/renderer                 | MIT            |
| Fuzzy match    | fuse.js                             | Apache 2       |
| NLP            | natural                             | MIT            |
| Forms          | React Hook Form + Zod               | MIT            |
| Drag-drop      | @dnd-kit                            | MIT            |
| Charts         | Recharts                            | MIT            |
| Test           | Vitest + Playwright                 | MIT / Apache 2 |
| Lint/format    | ESLint + Prettier                   | MIT            |
| CI             | GitHub Actions                      | –              |
| Hosting        | Vercel (web) + Railway (db)         | –              |
| **Total cost** | **$0** (all free tiers)             |                |

## Folder structure

```
HirePilot/
├── apps/
│   └── web/                  Next.js 15 app (UI + API routes)
│       ├── prisma/           Schema, migrations, seed
│       ├── src/
│       │   ├── app/          App Router (marketing + auth + app + api)
│       │   ├── components/   ui, layout, forms, kanban, resume, charts, ...
│       │   ├── lib/          api client, hooks, utils, validations
│       │   ├── server/       db, auth, services, ai, email, pdf, storage
│       │   ├── styles/       tokens, globals.css
│       │   └── types/        next-auth.d.ts
│       └── tests/            unit + integration + e2e
├── packages/
│   ├── shared/               Zod schemas + TS types (shared)
│   └── config/               eslint, tailwind, tsconfig presets
├── docs/
│   ├── adr/                  Architecture Decision Records
│   ├── architecture/         Diagrams
│   └── api/                  Generated OpenAPI
├── infra/
│   ├── docker/               docker-compose for local Postgres + Redis
│   └── railway/              Railway config templates
├── scripts/                  reset-db, seed helpers
├── .github/workflows/        ci.yml + deploy.yml
├── AGENT.md                  Engineering handbook
├── PRODUCT.md                Product specification
├── BLUEPRINT.md              How-to-build guide
├── PROJECT_STATUS.md         Live status
├── TODO.md                   Prioritized backlog
├── CHANGELOG.md              Version log
├── package.json              Root workspace
├── pnpm-workspace.yaml
├── turbo.json
└── Makefile
```

## Quick start (local)

### Prerequisites

- Node.js ≥ 20.11 (LTS)
- pnpm ≥ 9 (`npm i -g pnpm`)
- Docker Desktop (for local Postgres + Redis)

### Install

```bash
git clone <repo> hirepilot && cd hirepilot
pnpm install
cp apps/web/.env.example apps/web/.env
```

Start infra, migrate, run:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter web db:migrate
pnpm --filter web db:seed
pnpm --filter web dev
# → http://localhost:3000
```

## Environment variables

All env vars documented in `apps/web/.env.example`. The important ones:

| Var                     | Required | Description                               |
| ----------------------- | -------- | ----------------------------------------- |
| `DATABASE_URL`          | yes      | Postgres connection string                |
| `REDIS_URL`             | yes      | Redis connection string                   |
| `AUTH_SECRET`           | yes      | JWT signing secret (≥ 32 chars)           |
| `NEXTAUTH_URL`          | yes      | `http://localhost:3000` in dev            |
| `GOOGLE_CLIENT_ID`      | no       | Google OAuth (optional in dev)            |
| `GOOGLE_CLIENT_SECRET`  | no       | Google OAuth (optional in dev)            |
| `CLOUDINARY_CLOUD_NAME` | no       | File uploads (falls back to local in dev) |
| `CLOUDINARY_API_KEY`    | no       | –                                         |
| `CLOUDINARY_API_SECRET` | no       | –                                         |
| `RESEND_API_KEY`        | no       | Emails (falls back to console in dev)     |
| `EMAIL_FROM`            | no       | `noreply@hirepilot.dev`                   |
| `EMAIL_PROVIDER`        | no       | `console` (default) or `resend`           |
| `NEXT_PUBLIC_APP_URL`   | yes      | Public app URL                            |

For local-only development, leave `EMAIL_PROVIDER=console` and skip the OAuth / Cloudinary / Resend vars. Everything works.

## Running locally

| Command                        | Purpose                  |
| ------------------------------ | ------------------------ |
| `pnpm dev`                     | Run all apps in parallel |
| `pnpm --filter web dev`        | Run web only             |
| `pnpm --filter web build`      | Production build         |
| `pnpm lint`                    | Lint everything          |
| `pnpm typecheck`               | Type-check everything    |
| `pnpm test`                    | Run all tests            |
| `pnpm --filter web test:e2e`   | Playwright E2E suite     |
| `pnpm --filter web db:migrate` | Run Prisma migrations    |
| `pnpm --filter web db:seed`    | Load demo data           |
| `pnpm --filter web db:studio`  | Open Prisma Studio       |

## Testing

- **Unit:** Vitest — covers domain logic, AI parsers, match scorer, services.
- **Integration:** Vitest + Prisma test DB — covers API routes, RBAC, audit.
- **E2E:** Playwright — covers 4 critical flows (signup, apply, recruiter moves stage, candidate sees update).

Coverage targets:

- Domain logic: ≥ 90%
- Services: ≥ 80%
- API routes: ≥ 70%
- UI components: ≥ 70%

## Deployment

- **Web:** Vercel (Hobby free tier), auto-deploy on push to `main`, preview deploys on every PR.
- **Database:** Railway (Postgres + Redis), $5/mo free credit.
- **Storage:** Cloudinary free tier.
- **Email:** Resend free tier.

Detailed steps in `BLUEPRINT.md` §13.

## API overview

All routes under `/api/*`. Auth via Auth.js JWT in HTTP-only cookie.

| Endpoint group   | Examples                                                                             |
| ---------------- | ------------------------------------------------------------------------------------ |
| Auth             | `/api/auth/signup`, `/api/auth/login`, `/api/auth/[...nextauth]`                     |
| Jobs (public)    | `GET /api/jobs`, `GET /api/jobs/:id`                                                 |
| Jobs (recruiter) | `POST /api/recruiter/jobs`, `PATCH /api/recruiter/jobs/:id`                          |
| Candidates       | `GET /api/recruiter/candidates`, `GET /api/recruiter/candidates/:id`                 |
| Applications     | `POST /api/jobs/:id/apply`, `PATCH /api/recruiter/applications/:id/stage`            |
| Interviews       | `POST /api/recruiter/interviews`, `POST /api/interviewer/feedback`                   |
| Offers           | `POST /api/recruiter/offers`, `POST /api/offers/:id/accept`                          |
| AI               | `POST /api/me/resume` (parse pipeline), `POST /api/recruiter/applications/:id/match` |
| Upload           | `POST /api/upload/resume` (signed Cloudinary upload)                                 |
| Notifications    | `GET /api/me/notifications/stream` (SSE)                                             |
| Admin            | `/api/admin/users`, `/api/admin/companies`, `/api/admin/audit`                       |

OpenAPI spec (auto-generated) at `/api/docs` in dev mode.
Errors follow RFC 7807 `application/problem+json`.

## Demo credentials

Loaded by `pnpm --filter web db:seed`:

| Role                  | Email                      | Password      |
| --------------------- | -------------------------- | ------------- |
| Platform Admin        | `admin@hirepilot.dev`      | `Admin@12345` |
| Recruiter (Acme)      | `riya@acme.test`           | `Demo@12345`  |
| Recruiter (HirePilot) | `recruiter@hirepilot.dev`  | `Demo@12345`  |
| Hiring Manager        | `hema@acme.test`           | `Demo@12345`  |
| Interviewer           | `ishaan@acme.test`         | `Demo@12345`  |
| Candidate             | `arjun.candidate@test.dev` | `Demo@12345`  |
| Candidate             | `priya.candidate@test.dev` | `Demo@12345`  |

> These are demo accounts only. Do not use these passwords in any real deployment.

## Screenshots

> _Placeholders — added after UI lands._

| Screen                     | Status    |
| -------------------------- | --------- |
| Landing                    | _pending_ |
| Login / Signup             | _pending_ |
| Recruiter dashboard        | _pending_ |
| Kanban pipeline            | _pending_ |
| Candidate profile + resume | _pending_ |
| AI match card              | _pending_ |
| Interview scheduler        | _pending_ |
| Offer letter               | _pending_ |
| Dark mode                  | _pending_ |

## Roadmap

| Milestone                 | Target                                   | Status      |
| ------------------------- | ---------------------------------------- | ----------- |
| M-0 Foundations (Day 0)   | Monorepo, auth, schema, landing          | Not started |
| M-1 Runnable demo (Day 2) | Job post → resume parse → apply → Kanban | Not started |
| M-2 Polished MVP (Day 5)  | Dashboards, AI, interview, offer         | Not started |
| M-3 Submission (Day 6)    | Deploy, README, demo video, submit       | Not started |

Post-hackathon (Future):

- WebSocket-powered collaborative notes
- 2FA / OTP
- Calendar integration (Google / Microsoft)
- Multi-language UI (i18n)
- Mobile native (React Native)
- Public careers page builder
- Slack / GitHub / Zoom integrations

## Team

| Role                       | Name        | Responsibilities                      |
| -------------------------- | ----------- | ------------------------------------- |
| Lead engineer / Full-stack | _your name_ | Architecture, backend, deployment     |
| Frontend / Design          | _your name_ | UI/UX, components, accessibility      |
| AI / Data                  | _your name_ | Resume parser, match scorer, taxonomy |

(Update with actual team members before submission.)

## Known bugs & limitations

We are honest about what's real and what's scoped out, per the hackathon rules.

**Scoped out of v1 (intentional, see `PRODUCT.md` §13):**

- WebSocket-powered live collaborative notes (we use SSE for notifications instead)
- 2FA / OTP (schema hook reserved, UI not wired)
- Plagiarism detection in coding assessments
- Real-time chat between recruiter and candidate (in-app notifications only)
- Calendar sync (Google / Microsoft) — schema reserved
- Multi-language UI (English only)
- PWA / offline mode
- Mobile native (web responsive only)

**Known bugs (will fix before final submission):**

- _none yet — track as we find them_

**Limitations:**

- Resume parser is English-only
- Skill taxonomy covers ~1500 skills; niche tools may be missed
- Match scoring is deterministic (no LLM); judgments about "fit" beyond skills are not modeled

## Contributing

See `AGENT.md` for the engineering contract. PRs that violate the Definition of Done will be sent back.

## License

MIT — see `LICENSE`.

---

_Built for DevFusion 4.O Round 3 — IIT Bombay — August 2026._
